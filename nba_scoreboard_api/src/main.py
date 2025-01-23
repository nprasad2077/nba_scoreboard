import asyncio
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict, Set, Optional
from datetime import datetime, timedelta
import pytz
from nba_api.live.nba.endpoints import scoreboard, boxscore
from nba_api.stats.endpoints import leaguegamefinder
import json
import logging
from dateutil import parser
import re
import os
from dotenv import load_dotenv
from fastapi.responses import RedirectResponse, JSONResponse
from fastapi import status


load_dotenv()

from src.models import PlayerStatistics, PlayerData, TeamBoxScore, GameBoxScore

timeout = int(os.getenv('NBA_API_TIMEOUT', 120))
retries = int(os.getenv('NBA_API_RETRIES', 3))

custom_headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Accept': 'application/json',
    'Accept-Language': 'en-US,en;q=0.9',
    'Origin': 'https://stats.nba.com',
    'Referer': 'https://stats.nba.com'
}



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
                    await game_state_manager.update_game_state(
                        game_id, period, clock, status
                    )

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
            await asyncio.sleep(2)

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
                        statistics=PlayerStatistics(
                            **(player.get("statistics", {}) or {})
                        ),
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
                        statistics=PlayerStatistics(
                            **(player.get("statistics", {}) or {})
                        ),
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


# Root endpoint
@app.get("/", response_class=RedirectResponse, status_code=status.HTTP_302_FOUND)
async def root():
    return "/docs"

# Health check endpoint
@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}


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


@app.get("/scoreboard/past")
async def get_past_scoreboard(date: Optional[str] = Query(None)):
    """
    Return scoreboard data (final scores) for a given past date.
    Args:
        date: Optional date string in MM/DD/YYYY or YYYY-MM-DD format. Defaults to yesterday.
    Returns:
        List of game results with scores and team information.
    """
    try:
        # 1. Date handling with timezone awareness
        if date is None:
            # Default to yesterday using Eastern TZ
            eastern_tz = pytz.timezone('America/New_York')
            date_str = (datetime.now(eastern_tz) - timedelta(days=1)).strftime("%m/%d/%Y")
            logger.info(f"No date provided, using yesterday in Eastern Time: {date_str}")
        else:
            # Parse provided date
            try:
                # Try YYYY-MM-DD format first
                dt_obj = datetime.strptime(date, "%Y-%m-%d")
                date_str = dt_obj.strftime("%m/%d/%Y")
                logger.info(f"Parsed YYYY-MM-DD date to: {date_str}")
            except ValueError:
                try:
                    # Try MM/DD/YYYY format
                    dt_obj = datetime.strptime(date, "%m/%d/%Y")
                    date_str = date
                    logger.info(f"Using provided MM/DD/YYYY date: {date_str}")
                except ValueError:
                    error_msg = f"Invalid date format: {date}. Please use YYYY-MM-DD or MM/DD/YYYY"
                    logger.error(error_msg)
                    raise HTTPException(status_code=400, detail=error_msg)

        # 2. NBA API call with timeout and error handling
        logger.info(f"Fetching NBA games for date: {date_str}")
        try:
            game_finder = leaguegamefinder.LeagueGameFinder(
                date_from_nullable=date_str,
                date_to_nullable=date_str,
                league_id_nullable="00",  # NBA
                headers=custom_headers,
                timeout=60,  # 30 second timeout
            )
        except Exception as api_error:
            error_msg = f"NBA API connection error: {str(api_error)}"
            logger.error(error_msg, exc_info=True)
            raise HTTPException(status_code=503, detail=error_msg)

        # 3. Data processing
        try:
            df = game_finder.get_data_frames()
            if not df or len(df) == 0:
                logger.warning(f"No games found for date: {date_str}")
                return []

            df = df[0]  # Get first dataframe
            if df.empty:
                logger.warning(f"Empty dataframe returned for date: {date_str}")
                return []

        except Exception as df_error:
            error_msg = f"Error processing NBA data: {str(df_error)}"
            logger.error(error_msg, exc_info=True)
            raise HTTPException(status_code=500, detail=error_msg)

        # 4. Group and format data
        games_json_list = []
        try:
            # Group by GAME_ID to pair home & away teams
            grouped = df.groupby("GAME_ID")

            for game_id, group_df in grouped:
                # Identify away vs. home teams
                away_row = group_df[group_df["MATCHUP"].str.contains("@")]
                home_row = group_df[group_df["MATCHUP"].str.contains("vs.")]

                # Validate we have both home and away data
                if len(away_row) != 1 or len(home_row) != 1:
                    logger.warning(
                        f"Skipping game_id {game_id}: Invalid home/away data"
                    )
                    continue

                away_row = away_row.iloc[0]
                home_row = home_row.iloc[0]

                # Format game data
                scoreboard_item = {
                    "away_team": away_row["TEAM_NAME"],
                    "away_tricode": away_row["TEAM_ABBREVIATION"],
                    "score": f"{away_row['PTS']} - {home_row['PTS']}",
                    "home_team": home_row["TEAM_NAME"],
                    "home_tricode": home_row["TEAM_ABBREVIATION"],
                    "time": "Final",
                    "gameId": str(game_id),
                }
                games_json_list.append(scoreboard_item)

            logger.info(
                f"Successfully processed {len(games_json_list)} games for {date_str}"
            )
            return games_json_list

        except Exception as format_error:
            error_msg = f"Error formatting game data: {str(format_error)}"
            logger.error(error_msg, exc_info=True)
            raise HTTPException(status_code=500, detail=error_msg)

    except HTTPException:
        raise  # Re-raise HTTP exceptions as they already have the correct format
    except Exception as e:
        # Catch any other unexpected errors
        error_msg = f"Unexpected error processing scoreboard request: {str(e)}"
        logger.error(error_msg, exc_info=True)
        raise HTTPException(status_code=500, detail=error_msg)


@app.on_event("startup")
async def startup_event():
    """
    When the server starts, launch the background task that fetches
    scoreboard updates and broadcasts them if changed.
    """
    asyncio.create_task(fetch_and_broadcast_updates())

# Custom error handlers
@app.exception_handler(404)
async def not_found_handler(request, exc):
    return JSONResponse(
        status_code=404,
        content={"detail": "The requested resource was not found"}
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "src.main:app",
        host="0.0.0.0",
        port=8000,
        reload=False,
        log_level="info",
        access_log=True
    )