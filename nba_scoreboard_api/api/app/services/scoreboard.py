# File: app/services/scoreboard.py
import logging
import asyncio
import re
import time
from datetime import datetime, timedelta
from typing import List, Optional, Dict, Any, Set
from fastapi import WebSocket
from nba_api.live.nba.endpoints import scoreboard, boxscore, playbyplay
import pytz
from dateutil import parser
import json
import copy

from app.models.scoreboard import Game
from app.schemas.scoreboard import (
    GameBrief,
    GameDetail,
    ScoreboardResponse,
    GameBoxScore,
    PlayByPlayEvent,
    PlayByPlayResponse,
    TeamGameInfo,
    TeamBoxScore,
    PlayerBoxScore,
    PlayerStatistics,
)

logger = logging.getLogger(__name__)


async def get_box_score_fixed(game_id: str):
    """
    Fixed implementation that matches the schema fields correctly.

    This implementation follows the corrected field names in our schema:
    - game_id instead of gameId
    - team_id instead of teamId
    - etc.
    """
    try:
        logger.info(f"Fetching box score for game ID: {game_id}")

        # Create BoxScore object from NBA API
        b = boxscore.BoxScore(game_id)

        # Process home team players
        home_players = []
        for player in b.home_team_player_stats.get_dict() or []:
            if isinstance(player, dict):
                # Extract statistics safely
                stats_dict = player.get("statistics", {}) or {}

                home_players.append(
                    PlayerBoxScore(
                        player_id=str(player.get("personId", "")),
                        name=player.get("name", ""),
                        position=player.get("position", ""),
                        starter=player.get("starter", False),
                        statistics=PlayerStatistics(**stats_dict),
                    )
                )

        # Process away team players
        away_players = []
        for player in b.away_team_player_stats.get_dict() or []:
            if isinstance(player, dict):
                # Extract statistics safely
                stats_dict = player.get("statistics", {}) or {}

                away_players.append(
                    PlayerBoxScore(
                        player_id=str(player.get("personId", "")),
                        name=player.get("name", ""),
                        position=player.get("position", ""),
                        starter=player.get("starter", False),
                        statistics=PlayerStatistics(**stats_dict),
                    )
                )

        # Get team stats
        home_team_stats = b.home_team_stats.get_dict() or {}
        away_team_stats = b.away_team_stats.get_dict() or {}

        # Get game metadata
        game_data = b.get_dict() or {}
        game_status = game_data.get("gameStatus", 1)
        game_period = game_data.get("period", 0)
        game_clock = game_data.get("gameClock")

        # Construct the final response using field names matching the schema
        return GameBoxScore(
            game_id=game_id,
            status=game_status,
            period=game_period,
            clock=game_clock,
            home_team=TeamBoxScore(
                team_id=str(home_team_stats.get("teamId", "")),
                team_name=home_team_stats.get("teamName", ""),
                team_city=home_team_stats.get("teamCity", ""),
                team_tricode=home_team_stats.get("teamTricode", ""),
                players=home_players,
            ),
            away_team=TeamBoxScore(
                team_id=str(away_team_stats.get("teamId", "")),
                team_name=away_team_stats.get("teamName", ""),
                team_city=away_team_stats.get("teamCity", ""),
                team_tricode=away_team_stats.get("teamTricode", ""),
                players=away_players,
            ),
        )

    except Exception as e:
        logger.error(f"Error in get_box_score_fixed for game {game_id}: {e}")
        # Return empty response with correct field names
        return GameBoxScore(
            game_id=game_id,
            status=1,
            period=0,
            clock=None,
            home_team=TeamBoxScore(
                team_id="",
                team_name="",
                team_city="",
                team_tricode="",
                players=[],
            ),
            away_team=TeamBoxScore(
                team_id="",
                team_name="",
                team_city="",
                team_tricode="",
                players=[],
            ),
        )


def standardize_game_clocks(games_data: List[Dict]) -> List[Dict]:
    """
    Standardize game clocks to a consistent format and filter out invalid formats.

    Args:
        games_data: List of game data dictionaries

    Returns:
        List of games with standardized clock formats
    """
    standardized_games = []

    for game in games_data:
        # Create a copy to avoid modifying the original
        game_copy = copy.deepcopy(game)

        # Process the clock field
        clock = game_copy.get("clock", "")

        # Handle various clock formats
        if clock is None or clock.strip() in ("", " "):
            # Set empty/blank clocks to None
            game_copy["clock"] = None
        elif clock.startswith("PT") and "M" in clock and "S" in clock:
            # ISO 8601 Duration format - keep as is
            pass
        elif re.match(r"\d+:\d+\s*", clock):
            # Convert "5:06 " format to ISO 8601 duration format
            try:
                parts = clock.strip().split(":")
                minutes = int(parts[0])
                seconds = int(parts[1])
                game_copy["clock"] = f"PT{minutes:02d}M{seconds:02d}.00S"
            except (ValueError, IndexError):
                # If conversion fails, set to None
                game_copy["clock"] = None
        else:
            # Unknown format, set to None
            game_copy["clock"] = None

        standardized_games.append(game_copy)

    return standardized_games


def parse_game_clock(clock_str: Optional[str]) -> Optional[float]:
    """
    Parse the game clock string into seconds remaining.

    Args:
        clock_str: Game clock string in ISO 8601 duration format (e.g., "PT09M47.00S")

    Returns:
        Seconds remaining in the period, or None if parsing fails
    """
    if not clock_str:
        return None

    try:
        # Parse the PT12M00.00S format
        match = re.match(r"PT(\d+)M(\d+(?:\.\d+)?)S", clock_str)
        if match:
            minutes = int(match.group(1))
            seconds = float(match.group(2))
            return minutes * 60 + seconds
    except Exception:
        pass

    return None


def scoreboard_changed(old_data: List[Dict], new_data: List[Dict]) -> bool:
    """
    Determine if there's a meaningful difference between old and new scoreboard data.
    This function prevents unnecessary broadcasts when the data hasn't changed.

    Args:
        old_data: Previous scoreboard data
        new_data: Current scoreboard data

    Returns:
        True if there are meaningful changes, False otherwise
    """
    if not old_data and not new_data:
        return False

    if len(old_data) != len(new_data):
        return True

    # Create a map of old games by game_id for faster comparison
    old_map = {g["game_id"]: g for g in old_data}

    # Check each new game for changes
    for new_game in new_data:
        game_id = new_game["game_id"]
        if game_id not in old_map:
            # New game added
            return True

        old_game = old_map[game_id]

        # Check key fields for changes
        if (
            old_game["game_status"] != new_game["game_status"]
            or old_game["period"] != new_game["period"]
            or old_game["clock"] != new_game["clock"]
            or old_game["home_team"]["score"] != new_game["home_team"]["score"]
            or old_game["away_team"]["score"] != new_game["away_team"]["score"]
        ):
            return True

    return False


# Modified ScoreboardManager class for app/services/scoreboard.py


class ScoreboardManager:
    """Manages live scoreboard data and WebSocket connections with enhanced state validation."""

    def __init__(self):
        self.active_connections: Set[WebSocket] = set()
        self.current_games: List[Dict] = []  # Store current game state
        self._lock = asyncio.Lock()  # Add lock for thread safety
        self.last_update_timestamp: Dict[str, float] = (
            {}
        )  # Track last update time per game
        self.game_state_history: Dict[str, List[Dict]] = (
            {}
        )  # Track game state history for validation

    async def connect(self, websocket: WebSocket):
        """Add a new WebSocket connection."""
        await websocket.accept()
        self.active_connections.add(websocket)

    async def disconnect(self, websocket: WebSocket):
        """Remove a WebSocket connection."""
        self.active_connections.discard(websocket)

    def is_valid_game_progression(self, game_id: str, new_data: Dict) -> bool:
        """
        Check if the new game data represents a valid progression from previous states.

        This function enforces logical game progression rules to filter out invalid/inconsistent updates.

        Args:
            game_id: The unique identifier for the game
            new_data: The new game data to check

        Returns:
            True if data represents valid game progression, False otherwise
        """
        # If we haven't seen this game before, accept the data
        if game_id not in self.game_state_history:
            self.game_state_history[game_id] = []
            return True

        # If history is empty, accept the data
        if not self.game_state_history[game_id]:
            return True

        # Get the last known state
        last_state = self.game_state_history[game_id][-1]

        # Rule 1: Period should never decrease during a live game
        if new_data["game_status"] == 2 and last_state["game_status"] == 2:
            if new_data["period"] < last_state["period"]:
                logger.warning(
                    f"Rejected invalid period regression for game {game_id}: "
                    f"period {last_state['period']} -> {new_data['period']}"
                )
                return False

        # Rule 2: If period increases, allow it (natural progression)
        if new_data["period"] > last_state["period"]:
            return True

        # Rule 3: If in the same period, ensure clock is progressing forward (decreasing)
        if (
            new_data["period"] == last_state["period"]
            and new_data["game_status"] == 2
            and last_state["game_status"] == 2
        ):

            old_seconds = parse_game_clock(last_state["clock"])
            new_seconds = parse_game_clock(new_data["clock"])

            # Only validate if both clocks can be parsed
            if old_seconds is not None and new_seconds is not None:
                # Clock should be decreasing (time moving forward)
                if new_seconds > old_seconds:
                    # Allow some tolerance for small clock adjustments (e.g., official review)
                    if new_seconds - old_seconds > 5:  # More than 5 seconds backwards
                        logger.warning(
                            f"Rejected invalid clock regression for game {game_id}: "
                            f"{last_state['clock']} -> {new_data['clock']}"
                        )
                        return False

        # Rule 4: Score should never decrease during a game
        if (
            new_data["home_team"]["score"] < last_state["home_team"]["score"]
            or new_data["away_team"]["score"] < last_state["away_team"]["score"]
        ):
            logger.warning(f"Rejected invalid score decrease for game {game_id}")
            return False

        # Rule 5: Game status should never go backwards (1->2->3)
        if new_data["game_status"] < last_state["game_status"]:
            logger.warning(
                f"Rejected invalid status regression for game {game_id}: "
                f"status {last_state['game_status']} -> {new_data['game_status']}"
            )
            return False

        return True

    def update_game_history(self, game_id: str, game_data: Dict):
        """
        Update the history of game states.

        Maintains a limited history of recent game states for validation purposes.

        Args:
            game_id: The unique identifier for the game
            game_data: The game data to add to history
        """
        if game_id not in self.game_state_history:
            self.game_state_history[game_id] = []

        # Add new state to history
        self.game_state_history[game_id].append(copy.deepcopy(game_data))

        # Keep only the last 5 states to limit memory usage
        if len(self.game_state_history[game_id]) > 5:
            self.game_state_history[game_id].pop(0)

    async def broadcast(self, data: List[Dict]) -> bool:
        """
        Broadcast data to all connected clients, with enhanced validation to prevent
        fluctuating data states and inconsistent updates.

        Args:
            data: New scoreboard data

        Returns:
            True if data was broadcast, False otherwise
        """
        if not data:
            return False

        # Standardize game clocks first
        standardized_data = standardize_game_clocks(data)

        valid_updates = []

        # First pass: validate each game update individually
        for new_game in standardized_data:
            game_id = new_game["game_id"]

            # Check if this update represents valid game progression
            if self.is_valid_game_progression(game_id, new_game):
                # Additional check for timestamps to prevent frequent updates
                current_time = time.time()
                time_since_last_update = current_time - self.last_update_timestamp.get(
                    game_id, 0
                )

                # Add to valid updates if it's been at least 1 second since the last update
                # or if it's a significant state change (period change, game status change)
                old_game = next(
                    (g for g in self.current_games if g["game_id"] == game_id), None
                )
                significant_change = (
                    old_game is None
                    or old_game["game_status"] != new_game["game_status"]
                    or old_game["period"] != new_game["period"]
                    or abs(
                        old_game["home_team"]["score"] - new_game["home_team"]["score"]
                    )
                    >= 2
                    or abs(
                        old_game["away_team"]["score"] - new_game["away_team"]["score"]
                    )
                    >= 2
                )

                if time_since_last_update >= 1.0 or significant_change:
                    valid_updates.append(new_game)
                    self.last_update_timestamp[game_id] = current_time
                    self.update_game_history(game_id, new_game)

        if not valid_updates:
            return False

        # Second pass: check if the overall scoreboard has changed
        async with self._lock:
            # Create a map for faster comparison
            current_map = {g["game_id"]: g for g in self.current_games}
            has_changes = False

            for game in valid_updates:
                game_id = game["game_id"]
                if game_id not in current_map:
                    has_changes = True
                    break

                old_game = current_map[game_id]
                if (
                    old_game["game_status"] != game["game_status"]
                    or old_game["period"] != game["period"]
                    or old_game["clock"] != game["clock"]
                    or old_game["home_team"]["score"] != game["home_team"]["score"]
                    or old_game["away_team"]["score"] != game["away_team"]["score"]
                ):
                    has_changes = True
                    break

            if not has_changes:
                return False

            # Update our current games list with the valid updates
            new_current_games = []

            # First add games that didn't get updated
            for old_game in self.current_games:
                if old_game["game_id"] not in [g["game_id"] for g in valid_updates]:
                    new_current_games.append(old_game)

            # Then add the valid updates
            new_current_games.extend(valid_updates)
            self.current_games = new_current_games

        # Convert any datetime objects to strings
        json_data = json.loads(
            json.dumps(valid_updates, default=self._serialize_datetime)
        )

        # Broadcast to all connections
        for connection in self.active_connections.copy():
            try:
                await connection.send_json(json_data)
            except Exception as e:
                logger.error(f"Error broadcasting to client: {e}")
                await self.disconnect(connection)

        return True

    # Other methods remain the same...
    async def send_current_games(self, websocket: WebSocket):
        """Send initial scoreboard data to a new connection."""
        try:
            current_games = await get_live_scoreboard()

            # Convert the Pydantic model to a dict
            games_data = current_games.model_dump()

            # Standardize game clocks
            standardized_data = standardize_game_clocks(games_data["games"])

            # Ensure all datetime objects are converted to strings
            json_data = json.loads(
                json.dumps(standardized_data, default=self._serialize_datetime)
            )

            # Send standardized games data
            await websocket.send_json(json_data)
        except Exception as e:
            logger.error(f"Error sending initial games data: {e}")
            raise

    def _serialize_datetime(self, obj):
        """Helper method to serialize datetime objects to ISO format."""
        if isinstance(obj, datetime):
            return obj.isoformat()
        raise TypeError(f"Type {type(obj)} not serializable")


class PlayByPlayManager:
    """Manages play-by-play WebSocket connections for individual games."""

    def __init__(self):
        self.active_connections: Dict[str, Set[WebSocket]] = {}
        self.last_data: Dict[str, Any] = {}
        self.tasks: Dict[str, asyncio.Task] = {}
        self._lock = asyncio.Lock()  # Added lock for concurrency safety

    async def connect(self, websocket: WebSocket, game_id: str):
        """Add a new WebSocket connection for a specific game and start background polling if needed."""
        await websocket.accept()
        async with self._lock:
            if game_id not in self.active_connections:
                self.active_connections[game_id] = set()
            self.active_connections[game_id].add(websocket)
            if game_id not in self.tasks:
                self.tasks[game_id] = asyncio.create_task(
                    self._poll_playbyplay(game_id)
                )

    async def disconnect(self, websocket: WebSocket, game_id: str):
        """Remove a WebSocket connection for a specific game."""
        async with self._lock:
            if game_id in self.active_connections:
                self.active_connections[game_id].discard(websocket)
                if not self.active_connections[game_id]:
                    if game_id in self.tasks:
                        self.tasks[game_id].cancel()
                        del self.tasks[game_id]
                    del self.active_connections[game_id]
                    if game_id in self.last_data:
                        del self.last_data[game_id]

    async def broadcast_to_game(self, game_id: str, data: Any):
        """Broadcast data to all connections for a specific game."""
        async with self._lock:
            if game_id not in self.active_connections:
                return
            connections = self.active_connections[game_id].copy()
        for connection in connections:
            try:
                await connection.send_json(data)
            except Exception as e:
                logger.error(f"Error broadcasting to game {game_id} client: {e}")
                await self.disconnect(connection, game_id)

    async def _poll_playbyplay(self, game_id: str):
        from nba_api.live.nba.endpoints import playbyplay  # typically imported here

        logger.info(f"Starting PlayByPlay polling for {game_id}")
        while True:
            try:
                p = playbyplay.PlayByPlay(game_id)
                if not p:
                    await asyncio.sleep(0.2)
                    continue

                current_data = p.get_dict()
                # Fallback: if current_data is empty or missing a nonempty "plays" key and p has a "games" attribute, try that
                if (not current_data or not current_data.get("plays")) and hasattr(
                    p, "games"
                ):
                    logger.debug(
                        "No plays found using p.get_dict(); trying p.games.get_dict()"
                    )
                    current_data = p.games.get_dict()

                last = self.last_data.get(game_id)
                if not last or (last != current_data):
                    self.last_data[game_id] = current_data
                    await self.broadcast_to_game(
                        game_id, current_data
                    )  # Updated method call
                await asyncio.sleep(0.2)
            except asyncio.CancelledError:
                logger.info(f"Canceling PlayByPlay polling for {game_id}")
                break
            except Exception as e:
                logger.error(f"[PlayByPlay] Error in background loop ({game_id}): {e}")
                await asyncio.sleep(1)


# Helper functions for data processing


async def get_live_scoreboard() -> ScoreboardResponse:
    """
    Fetch current scoreboard data from NBA API.
    Returns:
        ScoreboardResponse containing current games
    """
    try:
        board = scoreboard.ScoreBoard()
        games_data = board.games.get_dict()
        games = []

        for game in games_data:
            # Create TeamGameInfo objects with string IDs
            home_team = TeamGameInfo(
                team_id=str(game["homeTeam"]["teamId"]),  # Convert to string
                team_name=game["homeTeam"]["teamName"],
                team_city=game["homeTeam"]["teamCity"],
                team_tricode=game["homeTeam"]["teamTricode"],
                score=game["homeTeam"].get("score", 0),
            )

            away_team = TeamGameInfo(
                team_id=str(game["awayTeam"]["teamId"]),  # Convert to string
                team_name=game["awayTeam"]["teamName"],
                team_city=game["awayTeam"]["teamCity"],
                team_tricode=game["awayTeam"]["teamTricode"],
                score=game["awayTeam"].get("score", 0),
            )

            # Create GameBrief object
            game_brief = GameBrief(
                game_id=str(game["gameId"]),  # Convert to string
                game_status=game["gameStatus"],
                period=game.get("period", 0),
                clock=game.get("gameClock"),
                game_time=parser.parse(game["gameTimeUTC"]),
                home_team=home_team,
                away_team=away_team,
            )

            games.append(game_brief)

        return ScoreboardResponse(games=games, total_games=len(games))

    except Exception as e:
        logger.error(f"Error fetching live scoreboard: {e}")
        raise


async def get_past_scoreboard(date_str: str) -> List[GameBrief]:
    """
    Get scoreboard data for a past date.
    Args:
        date_str: Date in YYYY-MM-DD format
    Returns:
        List of games for the specified date
    """
    try:
        from nba_api.stats.endpoints import leaguegamefinder

        date_obj = datetime.strptime(date_str, "%Y-%m-%d")
        date_formatted = date_obj.strftime("%m/%d/%Y")
        games_df = leaguegamefinder.LeagueGameFinder(
            date_from_nullable=date_formatted,
            date_to_nullable=date_formatted,
            league_id_nullable="00",
        ).get_data_frames()[0]
        return process_past_games(games_df)
    except Exception as e:
        logger.error(f"Error fetching past scoreboard: {e}")
        raise


# Updated get_box_score function in app/services/scoreboard.py


async def get_box_score(game_id: str) -> GameBoxScore:
    """
    Get detailed box score for a specific game.
    Args:
        game_id: NBA game ID
    Returns:
        GameBoxScore with detailed statistics
    Raises:
        Exception if box score cannot be retrieved
    """
    try:
        box = boxscore.BoxScore(game_id)

        # Debug logging to see the raw data structure
        raw_data = box.get_dict()
        logger.debug(f"Raw boxscore data for game {game_id}: {raw_data}")

        # Access the proper data structure
        # Note: Depending on the actual structure, we might need to adjust this
        # If get_dict() doesn't return the expected structure, try alternative paths

        # Option 1: Direct structure from get_dict()
        boxscore_data = raw_data

        # Option 2: If data is nested under a specific key
        # boxscore_data = raw_data.get('game', {})  # Adjust based on actual structure

        # Process the boxscore data
        return process_box_score(boxscore_data)
    except Exception as e:
        logger.error(f"Error fetching box score for game {game_id}: {e}")
        # Re-raise as HTTP exception or return a default/empty response
        raise


async def get_play_by_play(game_id: str) -> PlayByPlayResponse:
    """
    Get play-by-play data for a specific game.
    Args:
        game_id: NBA game ID
    Returns:
        PlayByPlayResponse with play-by-play events
    """
    try:
        pbp = playbyplay.PlayByPlay(game_id)
        return process_play_by_play(pbp.get_dict())
    except Exception as e:
        logger.error(f"Error fetching play-by-play for game {game_id}: {e}")
        raise


def process_past_games(games_df) -> List[GameBrief]:
    """
    Process games DataFrame into GameBrief objects.
    Args:
        games_df: DataFrame from NBA API containing game data
    Returns:
        List of GameBrief objects
    """
    games = []
    grouped = games_df.groupby("GAME_ID")
    for game_id, group in grouped:
        try:
            away_row = group[group["MATCHUP"].str.contains("@")].iloc[0]
            home_row = group[group["MATCHUP"].str.contains("vs.")].iloc[0]
        except IndexError:
            continue
        away_team = TeamGameInfo(
            team_id=str(away_row["TEAM_ID"]),
            team_name=away_row["TEAM_NAME"],
            team_city="",  # Placeholder as TEAM_CITY is not provided
            team_tricode=away_row["TEAM_ABBREVIATION"],
            score=int(away_row["PTS"]),
        )
        home_team = TeamGameInfo(
            team_id=str(home_row["TEAM_ID"]),
            team_name=home_row["TEAM_NAME"],
            team_city="",
            team_tricode=home_row["TEAM_ABBREVIATION"],
            score=int(home_row["PTS"]),
        )
        game_brief = GameBrief(
            game_id=str(game_id),
            game_status=3,  # Past games are final
            period=4,
            clock="Final",
            game_time=parser.parse(home_row["GAME_DATE"]),
            home_team=home_team,
            away_team=away_team,
        )
        games.append(game_brief)
    return games


def process_box_score(box_score_data: Dict) -> GameBoxScore:
    """
    Process box score data into GameBoxScore object.
    Args:
        box_score_data: Dictionary containing box score data from NBA API
    Returns:
        GameBoxScore object with detailed statistics
    """

    def process_team(team_data: Dict) -> TeamBoxScore:
        players = []
        for player in team_data.get("players", []):
            stats = player.get("statistics", {})
            player_stats = PlayerStatistics(
                minutes=stats.get("minutes", "0:00"),
                points=stats.get("points", 0),
                assists=stats.get("assists", 0),
                rebounds=stats.get("reboundsTotal", 0),
                field_goals_made=stats.get("fieldGoalsMade", 0),
                field_goals_attempted=stats.get("fieldGoalsAttempted", 0),
                field_goal_percentage=stats.get("fieldGoalsPercentage", 0.0),
                three_pointers_made=stats.get("threePointersMade", 0),
                three_pointers_attempted=stats.get("threePointersAttempted", 0),
                three_point_percentage=stats.get("threePointersPercentage", 0.0),
                free_throws_made=stats.get("freeThrowsMade", 0),
                free_throws_attempted=stats.get("freeThrowsAttempted", 0),
                free_throw_percentage=stats.get("freeThrowsPercentage", 0.0),
                plus_minus=stats.get("plusMinusPoints", 0),
            )
            player_box = PlayerBoxScore(
                player_id=str(player.get("personId", "")),
                name=player.get("name", ""),
                position=player.get("position", ""),
                starter=player.get("starter", False),
                statistics=player_stats,
            )
            players.append(player_box)

        # Ensure team_id is converted to string
        team_id = team_data.get("teamId", "")
        if team_id != "":
            team_id = str(team_id)

        return TeamBoxScore(
            team_id=team_id,
            team_name=team_data.get("teamName", ""),
            team_city=team_data.get("teamCity", ""),
            team_tricode=team_data.get("teamTricode", ""),
            players=players,
        )

    game_id = box_score_data.get("gameId", "")
    if game_id:
        game_id = str(game_id)

    home_team = process_team(box_score_data.get("homeTeam", {}))
    away_team = process_team(box_score_data.get("awayTeam", {}))

    return GameBoxScore(
        game_id=game_id,
        status=box_score_data.get("gameStatus", 1),
        period=box_score_data.get("period", 0),
        clock=box_score_data.get("gameClock"),
        home_team=home_team,
        away_team=away_team,
    )


def process_play_by_play(pbp_data: Dict) -> PlayByPlayResponse:
    """
    Process play-by-play data into PlayByPlayResponse object.
    Args:
        pbp_data: Dictionary containing play-by-play data from NBA API
    Returns:
        PlayByPlayResponse with play-by-play events
    """
    events = []
    for play in pbp_data.get("plays", []):
        event = PlayByPlayEvent(
            event_id=str(play.get("eventId", "")),
            clock=play.get("clock", ""),
            period=play.get("period", 0),
            description=play.get("description", ""),
            score=play.get("scoreDisplay"),
            team_tricode=play.get("teamTricode"),
            player_name=play.get("playerNameI"),
        )
        events.append(event)
    return PlayByPlayResponse(
        game_id=str(pbp_data.get("gameId", "")),
        period=pbp_data.get("period", 0),
        clock=pbp_data.get("gameClock"),
        events=events,
    )


# Global instances of managers
scoreboard_manager = ScoreboardManager()
playbyplay_manager = PlayByPlayManager()
