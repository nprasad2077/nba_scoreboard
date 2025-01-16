import asyncio
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict, Set
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


class GameStateManager:
    def __init__(self):
        self.game_states = {}

    def update_game_state(
        self, game_id: str, period: int, clock: str, status: int
    ) -> dict:
        current_state = self.game_states.get(
            game_id,
            {"period": 0, "clock": "", "status": 1, "minutes": 12, "seconds": 0},
        )

        if status == 2:  # Game in progress
            if period > 0:  # Valid period
                if period >= current_state["period"]:
                    current_state["period"] = period

                if clock and self.is_valid_clock(clock):
                    current_state["clock"] = clock
                    # Parse clock into minutes and seconds
                    match = re.match(r"PT(\d+)M(\d+\.\d+)S", clock)
                    if match:
                        current_state["minutes"] = int(match.group(1))
                        current_state["seconds"] = int(float(match.group(2)))

        if status > current_state["status"]:
            current_state["status"] = status

        self.game_states[game_id] = current_state
        return current_state

    def is_valid_clock(self, clock: str) -> bool:
        if not clock:
            return False
        return bool(re.match(r"PT\d+M\d+\.\d+S", clock))

    def get_game_state(self, game_id: str) -> dict:
        return self.game_states.get(
            game_id,
            {"period": 0, "clock": "", "status": 1, "minutes": 12, "seconds": 0},
        )


# Create a global instance
game_state_manager = GameStateManager()


def format_time(game) -> str:
    """Format game time based on game status and period"""
    game_id = game.get("gameId")
    status = game.get("gameStatus", 1)

    if status == 1:
        # Game hasn't started - format start time
        game_time_utc = game.get("gameTimeUTC")
        if game_time_utc:
            try:
                utc_time = parser.parse(game_time_utc)
                et_time = utc_time.astimezone(pytz.timezone("America/New_York"))
                return f"Start: {et_time.strftime('%I:%M %p')}"
            except Exception:
                return "Start: TBD"
    elif status == 2:
        # Get current state and update with new data
        state = game_state_manager.update_game_state(
            game_id, game.get("period", 0), game.get("gameClock", ""), status
        )

        period = state["period"]
        minutes = state["minutes"]
        seconds = state["seconds"]

        # Handle period-specific cases
        if period > 4:
            period_display = "OT" if period == 5 else f"{period-4}OT"
        else:
            period_display = f"{period}Q"

        return f"{period_display} {minutes}:{seconds:02d}"
    elif status == 3:
        # Game finished
        return "Final"

    return "0Q 0:00"


def format_game_data(games: List[Dict]) -> List[Dict]:
    """Format games data into required structure"""
    formatted_games = []

    for game in games:
        home_team = game.get("homeTeam", {})
        away_team = game.get("awayTeam", {})
        status = game.get("gameStatus", 1)
        game_id = game.get("gameId", "")  # Get the game ID

        # Get scores based on game status
        if status in [2, 3]:  # Game in progress or finished
            home_score = str(home_team.get("score", 0))
            away_score = str(away_team.get("score", 0))
        else:
            home_score = "0"
            away_score = "0"

        formatted_game = {
            "away_team": f"{away_team.get('teamCity', '')} {away_team.get('teamName', '')}".strip(),
            "away_tricode": away_team.get("teamTricode", ""),
            "score": f"{away_score} - {home_score}",
            "home_team": f"{home_team.get('teamCity', '')} {home_team.get('teamName', '')}".strip(),
            "home_tricode": home_team.get("teamTricode", ""),
            "time": format_time(game),
            "gameId": game_id  # Add the game ID to the response
        }
        formatted_games.append(formatted_game)

    # Sort games: In Progress -> Not Started -> Final
    def sort_key(game):
        time = game["time"]
        if time == "Final":
            return (2, time)
        if "Q" in time or "OT" in time:
            return (0, time)
        return (1, time)

    return sorted(formatted_games, key=sort_key)


app = FastAPI()

# Add CORS middleware
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
            self.active_connections.remove(websocket)

    async def broadcast(self, data: List[Dict]):
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
    """Background task to fetch and broadcast updates"""
    while True:
        try:
            board = scoreboard.ScoreBoard()
            games_data = board.games.get_dict()

            if games_data:
                formatted_data = format_game_data(games_data)
                await manager.broadcast(formatted_data)

            await asyncio.sleep(1)

        except Exception as e:
            logger.error(f"Error in update loop: {e}")
            await asyncio.sleep(5)


def get_box_score(game_id: str) -> GameBoxScore:
    """
    Fetch detailed box score data for a specific game_id using nba_api.
    """
    try:
        box = boxscore.BoxScore(game_id)

        # Process home team players
        home_players = []
        for player in box.home_team_player_stats.get_dict():
            home_players.append(
                PlayerData(
                    name=player.get("name", ""),
                    position=player.get("position", ""),
                    starter=player.get("starter", False),
                    oncourt=player.get("oncourt", False),
                    jerseyNum=player.get("jerseyNum", ""),
                    status=player.get("status", ""),
                    statistics=PlayerStatistics(**player.get("statistics", {})),
                )
            )

        # Process away team players
        away_players = []
        for player in box.away_team_player_stats.get_dict():
            away_players.append(
                PlayerData(
                    name=player.get("name", ""),
                    position=player.get("position", ""),
                    starter=player.get("starter", False),
                    oncourt=player.get("oncourt", False),
                    jerseyNum=player.get("jerseyNum", ""),
                    status=player.get("status", ""),
                    statistics=PlayerStatistics(**player.get("statistics", {})),
                )
            )

        # Get team-level stats/dict
        home_team = box.home_team_stats.get_dict()
        away_team = box.away_team_stats.get_dict()

        return GameBoxScore(
            gameId=game_id,
            home_team=TeamBoxScore(
                teamName=home_team["teamName"],
                teamCity=home_team["teamCity"],
                teamTricode=home_team["teamTricode"],
                players=home_players,
            ),
            away_team=TeamBoxScore(
                teamName=away_team["teamName"],
                teamCity=away_team["teamCity"],
                teamTricode=away_team["teamTricode"],
                players=away_players,
            ),
        )

    except Exception as e:
        # Use FastAPI's HTTPException to return an error
        raise HTTPException(status_code=500, detail=str(e))


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        # Send initial data
        board = scoreboard.ScoreBoard()
        games_data = board.games.get_dict()
        if games_data:
            formatted_data = format_game_data(games_data)
            await websocket.send_json(formatted_data)

        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        await manager.disconnect(websocket)
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        await manager.disconnect(websocket)


@app.get("/boxscore/{game_id}", response_model=GameBoxScore)
async def read_box_score(game_id: str):
    """
    Get box score for a specific game.

    Parameters:
        game_id: The ID of the game (e.g., '0022400551').

    Returns:
        GameBoxScore: Detailed box score statistics for the specified game.
    """
    return get_box_score(game_id)


@app.on_event("startup")
async def startup_event():
    asyncio.create_task(fetch_and_broadcast_updates())


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
