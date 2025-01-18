import asyncio
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict, Set, Optional
from datetime import datetime
import pytz
from nba_api.live.nba.endpoints import scoreboard, boxscore
import json
import logging
from dateutil import parser
import re

from models import PlayerStatistics, PlayerData, TeamBoxScore, GameBoxScore

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Global variable for tracking previous scoreboard state
previous_scoreboard_data: List[Dict] = []


class GameStateManager:
    """
    Tracks minimal local state for period/clock/status but uses an async lock
    and updates on each call. This allows going “backwards” in period or
    status if the data feed changes unexpectedly.
    """
    def __init__(self):
        self.game_states = {}
        self._lock = asyncio.Lock()

    async def update_game_state(
        self, game_id: str, period: int, clock: str, status: int
    ) -> dict:
        """Safely update the local game state for one game."""
        async with self._lock:
            current_state = self.game_states.get(
                game_id,
                {"period": 0, "clock": "", "status": 1, "minutes": 12, "seconds": 0},
            )

            # Always allow status to update
            if status != current_state["status"]:
                current_state["status"] = status

            # Always allow period to update
            current_state["period"] = period

            # If in progress, parse the clock if it's valid
            if status == 2 and clock and self.is_valid_clock(clock):
                current_state["clock"] = clock
                match = re.match(r"PT(\d+)M(\d+(?:\.\d+)?)S", clock)
                if match:
                    try:
                        current_state["minutes"] = int(match.group(1))
                        current_state["seconds"] = int(float(match.group(2)))
                    except ValueError:
                        logger.error(f"Invalid clock format: {clock}")
            else:
                # If not in progress or no valid clock => reset or keep existing
                if status == 3:
                    # Final => we can zero out
                    current_state["clock"] = ""
                    current_state["minutes"] = 0
                    current_state["seconds"] = 0

            self.game_states[game_id] = current_state
            return current_state

    def is_valid_clock(self, clock: str) -> bool:
        """Allow both decimal and non-decimal seconds."""
        if not clock:
            return False
        return bool(re.match(r"PT(\d+)M(\d+(?:\.\d+)?)S", clock))

    def get_game_state(self, game_id: str) -> dict:
        """Retrieve current local state for one game."""
        return self.game_states.get(
            game_id,
            {"period": 0, "clock": "", "status": 1, "minutes": 12, "seconds": 0},
        )


# Create a global instance
game_state_manager = GameStateManager()


def safe_get_score(team_dict: Optional[Dict]) -> str:
    """Safely get team score with proper type checking."""
    if not isinstance(team_dict, dict):
        return "0"

    score = team_dict.get("score")
    if isinstance(score, (int, float)):
        return str(score)
    return "0"


def format_time(game: Dict) -> str:
    """
    Format game time based on game status, using local manager for
    in-progress updates but only if the data is valid.
    """
    if not isinstance(game, dict):
        return "0Q 0:00"

    game_id = game.get("gameId", "")
    status = game.get("gameStatus", 1)
    period = game.get("period", 0)
    game_clock = game.get("gameClock", "")

    # Pregame
    if status == 1:
        game_time_utc = game.get("gameTimeUTC")
        if game_time_utc:
            try:
                utc_time = parser.parse(game_time_utc)
                et_time = utc_time.astimezone(pytz.timezone("America/New_York"))
                return f"Start: {et_time.strftime('%I:%M %p')}"
            except Exception as e:
                logger.error(f"Error parsing game time: {e}")
                return "Start: TBD"
        return "Start: TBD"

    # In-progress
    elif status == 2:
        if period < 1:
            return "0Q 0:00"

        # Get or update local state
        # (You may choose to call "update_game_state" here if you want to forcibly sync it.)
        # But we only do "get_game_state" because we rely on the background loop to call update.
        state = game_state_manager.get_game_state(game_id)

        # If feed has a valid clock, parse it on the fly:
        if game_clock and game_state_manager.is_valid_clock(game_clock):
            match = re.match(r"PT(\d+)M(\d+(?:\.\d+)?)S", game_clock)
            if match:
                try:
                    minutes = int(match.group(1))
                    seconds = int(float(match.group(2)))

                    if period > 4:
                        # OT logic
                        if period == 5:
                            period_display = "OT"
                        else:
                            period_display = f"{period - 4}OT"
                    else:
                        period_display = f"{period}Q"

                    return f"{period_display} {minutes}:{seconds:02d}"
                except ValueError:
                    logger.error(f"Invalid clock values: {game_clock}")

        # If clock not valid or parse failed => use local stored time
        if period > 4:
            if period == 5:
                period_display = "OT"
            else:
                period_display = f"{period - 4}OT"
        else:
            period_display = f"{period}Q"

        return f"{period_display} {state['minutes']}:{state['seconds']:02d}"

    # Final
    elif status == 3:
        return "Final"

    # Fallback
    return "0Q 0:00"


def format_game_data(games: Optional[List[Dict]]) -> List[Dict]:
    """Format games data into the required structure with proper error handling."""
    if not games:
        return []

    formatted_games = []

    for game in games:
        if not isinstance(game, dict):
            continue

        home_team = game.get("homeTeam", {})
        away_team = game.get("awayTeam", {})
        status = game.get("gameStatus", 1)
        game_id = game.get("gameId", "")

        if not game_id:
            continue

        # Get scores with proper error handling
        home_score = safe_get_score(home_team)
        away_score = safe_get_score(away_team)

        formatted_game = {
            "away_team": f"{away_team.get('teamCity', '')} {away_team.get('teamName', '')}".strip(),
            "away_tricode": away_team.get("teamTricode", ""),
            "score": f"{away_score} - {home_score}",
            "home_team": f"{home_team.get('teamCity', '')} {home_team.get('teamName', '')}".strip(),
            "home_tricode": home_team.get("teamTricode", ""),
            "time": format_time(game),
            "gameId": game_id,
        }
        formatted_games.append(formatted_game)

    # Sort games: In Progress -> Not Started -> Final
    def sort_key(g):
        time_str = g["time"]
        if time_str == "Final":
            return (2, time_str)
        if "Q" in time_str or "OT" in time_str:
            return (0, time_str)
        return (1, time_str)

    return sorted(formatted_games, key=sort_key)


def scoreboard_changed(old_data: List[Dict], new_data: List[Dict]) -> bool:
    """Return True if there's a meaningful difference in the data."""
    if not old_data and not new_data:
        return False

    if len(old_data) != len(new_data):
        return True

    old_map = {g["gameId"]: g for g in old_data}

    for new_game in new_data:
        new_id = new_game["gameId"]
        old_game = old_map.get(new_id)

        # A new or missing game means a change
        if not old_game:
            return True

        if (
            old_game["time"] != new_game["time"]
            or old_game["score"] != new_game["score"]
            or old_game["away_team"] != new_game["away_team"]
            or old_game["home_team"] != new_game["home_team"]
            or old_game["away_tricode"] != new_game["away_tricode"]
            or old_game["home_tricode"] != new_game["home_tricode"]
        ):
            return True

    return False


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ConnectionManager:
    def __init__(self):
        self.active_connections: Set[WebSocket] = set()
        self._lock = asyncio.Lock()

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        async with self._lock:
            self.active_connections.add(websocket)

    async def disconnect(self, websocket: WebSocket):
        async with self._lock:
            if websocket in self.active_connections:
                self.active_connections.remove(websocket)

    async def broadcast(self, data: List[Dict]):
        """Broadcast data to all active websocket connections."""
        if not data:
            return

        async with self._lock:
            dead_connections = set()
            for connection in self.active_connections:
                try:
                    await connection.send_json(data)
                except WebSocketDisconnect:
                    dead_connections.add(connection)
                except Exception as e:
                    logger.error(f"Error broadcasting to client: {e}")
                    dead_connections.add(connection)

            self.active_connections -= dead_connections


manager = ConnectionManager()


async def fetch_and_broadcast_updates():
    """
    Background task to fetch and broadcast scoreboard updates.
    Runs every 0.1s for faster updates.
    """
    global previous_scoreboard_data

    while True:
        try:
            # Pull live scoreboard
            board = scoreboard.ScoreBoard()
            games_data = board.games.get_dict()

            # Update local GameState if game is in progress
            # (This ensures the local clock/period stay in sync)
            if games_data:
                for game_dict in games_data:
                    game_id = game_dict.get("gameId", "")
                    status = game_dict.get("gameStatus", 1)
                    period = game_dict.get("period", 0)
                    clock = game_dict.get("gameClock", "")
                    # Fire off an async update (no need to block one by one if we wanted concurrency)
                    await game_state_manager.update_game_state(game_id, period, clock, status)

                # Now format data for broadcast
                formatted_data = format_game_data(games_data)

                # Only broadcast if changed
                if formatted_data and (
                    not previous_scoreboard_data
                    or scoreboard_changed(previous_scoreboard_data, formatted_data)
                ):
                    await manager.broadcast(formatted_data)
                    previous_scoreboard_data = formatted_data
                    logger.info("Broadcast update")

            # Sleep 0.1 seconds for faster updates
            await asyncio.sleep(0.2)

        except Exception as e:
            logger.error(f"Error in update loop: {e}")
            # Slightly longer sleep after an error
            await asyncio.sleep(1)


def get_box_score(game_id: str) -> GameBoxScore:
    """Fetch and format box score data for a specific game."""
    try:
        b = boxscore.BoxScore(game_id)
        # b is an object; typically it won't be None, but let's be cautious
        if not b:
            raise HTTPException(status_code=404, detail="Box score not found")

        # Process home team players
        home_players = []
        for player in b.home_team_player_stats.get_dict() or []:
            if isinstance(player, dict):
                home_players.append(
                    PlayerData(
                        name=player.get("name", ""),
                        position=player.get("position", ""),
                        starter=player.get("starter", False),
                        oncourt=player.get("oncourt", False),
                        jerseyNum=player.get("jerseyNum", ""),
                        status=player.get("status", ""),
                        statistics=PlayerStatistics(**(player.get("statistics", {}) or {})),
                    )
                )

        # Process away team players
        away_players = []
        for player in b.away_team_player_stats.get_dict() or []:
            if isinstance(player, dict):
                away_players.append(
                    PlayerData(
                        name=player.get("name", ""),
                        position=player.get("position", ""),
                        starter=player.get("starter", False),
                        oncourt=player.get("oncourt", False),
                        jerseyNum=player.get("jerseyNum", ""),
                        status=player.get("status", ""),
                        statistics=PlayerStatistics(**(player.get("statistics", {}) or {})),
                    )
                )

        # Get team stats
        home_team = b.home_team_stats.get_dict() or {}
        away_team = b.away_team_stats.get_dict() or {}

        return GameBoxScore(
            gameId=game_id,
            home_team=TeamBoxScore(
                teamName=home_team.get("teamName", ""),
                teamCity=home_team.get("teamCity", ""),
                teamTricode=home_team.get("teamTricode", ""),
                players=home_players,
            ),
            away_team=TeamBoxScore(
                teamName=away_team.get("teamName", ""),
                teamCity=away_team.get("teamCity", ""),
                teamTricode=away_team.get("teamTricode", ""),
                players=away_players,
            ),
        )

    except Exception as e:
        logger.error(f"Error fetching box score: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """
    WebSocket endpoint that streams scoreboard updates to connected clients.
    """
    await manager.connect(websocket)
    try:
        # Send initial snapshot
        board = scoreboard.ScoreBoard()
        games_data = board.games.get_dict()
        if games_data:
            formatted_data = format_game_data(games_data)
            if formatted_data:
                await websocket.send_json(formatted_data)

        # Keep connection open; just wait for any client pings
        while True:
            await websocket.receive_text()

    except WebSocketDisconnect:
        await manager.disconnect(websocket)
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        await manager.disconnect(websocket)


@app.get("/boxscore/{game_id}", response_model=GameBoxScore)
async def read_box_score(game_id: str):
    """Get box score for a specific game."""
    return get_box_score(game_id)


@app.on_event("startup")
async def startup_event():
    """
    When the server starts, launch the background task that fetches
    scoreboard updates and broadcasts them if changed.
    """
    asyncio.create_task(fetch_and_broadcast_updates())


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
