# File: app/services/scoreboard.py
import logging
import asyncio
import re
import time
from datetime import datetime, timedelta
from typing import List, Optional, Dict, Any, Set
from fastapi import WebSocket
from nba_api.live.nba.endpoints import scoreboard, boxscore, playbyplay
from nba_api.stats.endpoints import leaguegamefinder
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
    PlayerData,
)

logger = logging.getLogger(__name__)


async def get_box_score_fixed(game_id: str) -> GameBoxScore:
    """
    Fetch and format box score data for a specific game,
    ensuring compatibility with the old API response format.

    Args:
        game_id: NBA game ID

    Returns:
        GameBoxScore object with the same field names as the old API
    """
    try:
        logger.info(f"Fetching box score for game ID: {game_id}")

        # Create BoxScore object from NBA API
        b = boxscore.BoxScore(game_id)

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
                        status=player.get("status", "ACTIVE"),
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
                        status=player.get("status", "ACTIVE"),
                        statistics=PlayerStatistics(
                            **(player.get("statistics", {}) or {})
                        ),
                    )
                )

        # Get team stats
        home_team = b.home_team_stats.get_dict() or {}
        away_team = b.away_team_stats.get_dict() or {}

        # Construct the response using the original field names
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
        raise


def standardize_game_clocks(games_data: List[Dict]) -> List[Dict]:
    """
    Standardize game clocks to a consistent format and filter out invalid formats.
    Improved version with better format handling.

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
        elif isinstance(clock, str):
            # Try to standardize the format
            if clock.startswith("PT") and "M" in clock and "S" in clock:
                # ISO 8601 Duration format - keep as is
                pass
            elif re.match(r"\d+:\d+\s*", clock):
                # Convert "5:06 " format to ISO 8601 duration format
                try:
                    parts = clock.strip().split(":")
                    minutes = int(parts[0])
                    seconds = float(parts[1]) if "." in parts[1] else int(parts[1])
                    game_copy["clock"] = f"PT{minutes:02d}M{seconds:02.2f}S"
                except (ValueError, IndexError):
                    # If conversion fails, keep the original format
                    pass
            elif re.match(r"^\d+(?:\.\d+)?$", clock.strip()):
                # Single number (seconds) format
                try:
                    seconds = float(clock.strip())
                    minutes = int(seconds // 60)
                    remaining_seconds = seconds % 60
                    game_copy["clock"] = f"PT{minutes:02d}M{remaining_seconds:.2f}S"
                except ValueError:
                    # If conversion fails, keep the original format
                    pass

        standardized_games.append(game_copy)

    return standardized_games


def parse_game_clock(clock_str: Optional[str]) -> Optional[float]:
    """
    Parse the game clock string into seconds remaining.
    Handles multiple formats including ISO 8601 duration and MM:SS formats.

    Args:
        clock_str: Game clock string

    Returns:
        Seconds remaining in the period, or None if parsing fails
    """
    if not clock_str:
        return None

    try:
        # Clean the string first - remove any extra whitespace
        clock_str = clock_str.strip()

        # Format: "PT12M34.56S" (ISO 8601 duration)
        if clock_str.startswith("PT"):
            minutes = 0
            seconds = 0

            # Extract minutes if present
            min_match = re.search(r"(\d+)M", clock_str)
            if min_match:
                minutes = int(min_match.group(1))

            # Extract seconds if present
            sec_match = re.search(r"(\d+(?:\.\d+)?)S", clock_str)
            if sec_match:
                seconds = float(sec_match.group(1))

            return minutes * 60 + seconds

        # Format: "12:34" (MM:SS)
        elif ":" in clock_str:
            parts = clock_str.split(":")
            if len(parts) == 2:
                minutes = int(parts[0].strip())
                seconds = float(parts[1].strip())
                return minutes * 60 + seconds

        # Format: "12.3" (seconds only)
        elif re.match(r"^\d+(?:\.\d+)?$", clock_str):
            return float(clock_str)

    except (ValueError, AttributeError) as e:
        logger.debug(f"Error parsing clock string '{clock_str}': {e}")

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


class ScoreboardManager:
    """Manages live scoreboard data and WebSocket connections with improved state management."""

    def __init__(self):
        self.active_connections: Set[WebSocket] = set()
        self.current_games: Dict[str, Dict] = {}  # Keyed by game_id for easier updates
        self._lock = asyncio.Lock()
        self.last_broadcast_time: float = 0
        self.broadcast_cooldown: float = 0.2  # Minimum seconds between broadcasts
        self.update_counts: Dict[str, int] = {}  # Track update count per game

    async def connect(self, websocket: WebSocket):
        """Add a new WebSocket connection."""
        await websocket.accept()
        self.active_connections.add(websocket)
        logger.info(
            f"New WebSocket connection established. Total connections: {len(self.active_connections)}"
        )

    async def disconnect(self, websocket: WebSocket):
        """Remove a WebSocket connection."""
        self.active_connections.discard(websocket)
        logger.info(
            f"WebSocket connection closed. Remaining connections: {len(self.active_connections)}"
        )

    async def send_current_games(self, websocket: WebSocket):
        """Send current scoreboard data to a new connection."""
        try:
            async with self._lock:
                # Convert the current games dictionary to a list
                games_list = list(self.current_games.values())

                if not games_list:
                    # If we don't have any games cached, fetch fresh data
                    current_games = await get_live_scoreboard()
                    games_data = current_games.model_dump()
                    games_list = games_data["games"]

                    # Store in our cache
                    for game in games_list:
                        self.current_games[game["game_id"]] = game

            # Ensure all datetime objects are converted to strings
            json_data = json.loads(
                json.dumps(games_list, default=self._serialize_datetime)
            )

            await websocket.send_json(json_data)
            logger.debug(
                f"Sent initial data with {len(games_list)} games to new connection"
            )
        except Exception as e:
            logger.error(f"Error sending initial games data: {e}")
            raise

    def _serialize_datetime(self, obj):
        """Helper method to serialize datetime objects to ISO format."""
        if isinstance(obj, datetime):
            return obj.isoformat()
        raise TypeError(f"Type {type(obj)} not serializable")

    def _standardize_clock(self, clock_str: Optional[str]) -> Optional[str]:
        """
        Standardize game clock to ISO 8601 duration format.
        Improved version that handles more edge cases correctly.

        Args:
            clock_str: Original clock string

        Returns:
            Standardized clock string in ISO 8601 format or None if invalid
        """
        if not clock_str or clock_str.strip() in ("", " "):
            return None

        # Clean the input
        clock_str = clock_str.strip()

        # Already in ISO 8601 format
        if clock_str.startswith("PT") and ("M" in clock_str or "S" in clock_str):
            return clock_str

        # "MM:SS" format
        if match := re.match(r"(\d+):(\d{1,2})(?:\.(\d+))?", clock_str):
            minutes = int(match.group(1))
            seconds = int(match.group(2))
            milliseconds = match.group(3)

            # Format properly with leading zeros for seconds
            if milliseconds:
                return f"PT{minutes:02d}M{seconds:02d}.{milliseconds}S"
            else:
                return f"PT{minutes:02d}M{seconds:02d}.00S"

        # "X.Y seconds" format
        if match := re.match(
            r"(\d+(?:\.\d+)?)\s*s(?:ec(?:ond)?s?)?", clock_str, re.IGNORECASE
        ):
            seconds = float(match.group(1))
            minutes = int(seconds // 60)
            remaining_seconds = seconds % 60
            return f"PT{minutes:02d}M{remaining_seconds:.2f}S"

        # Try direct seconds parsing
        try:
            seconds = float(clock_str)
            minutes = int(seconds // 60)
            remaining_seconds = seconds % 60
            return f"PT{minutes:02d}M{remaining_seconds:.2f}S"
        except ValueError:
            pass

        # If we can't parse it, return None
        logger.warning(f"Unable to standardize clock format: {clock_str}")
        return None

    def _is_clock_regression(
        self,
        old_clock: Optional[str],
        new_clock: Optional[str],
        game_status: int,
        period: int,
    ) -> bool:
        """
        Check if the new clock represents an invalid regression (time going up).
        Improved version that handles period changes and is more tolerant of small variations.

        Args:
            old_clock: Previous clock value
            new_clock: New clock value
            game_status: Current game status
            period: Current period

        Returns:
            True if regression is detected and invalid, False otherwise
        """
        # Only validate for in-progress games
        if game_status != 2:
            return False

        if old_clock is None or new_clock is None:
            return False

        old_seconds = parse_game_clock(old_clock)
        new_seconds = parse_game_clock(new_clock)

        if old_seconds is None or new_seconds is None:
            return False

        # Regression logic:
        # 1. Allow clock to increase by any amount when moving to a new period
        #    (it goes from 0:00 in one period to 12:00 in the next)
        # 2. Allow minor clock adjustments (up to 5 seconds) during the same period
        #    (this accommodates small corrections by officials)
        # 3. Reject large unexplained increases in the same period

        # Check if both clocks are typical end-of-period times
        is_period_end = old_seconds < 1.0  # Old clock is at or near 0:00

        # If we're at the end of a period, always accept the new clock
        # as it's likely the start of a new period
        if is_period_end:
            return False

        # Clock should generally decrease (or stay same) during gameplay
        # Allow up to 5 second regression for clock corrections (after timeouts, fouls, etc.)
        time_regression = new_seconds > old_seconds
        regression_amount = new_seconds - old_seconds if time_regression else 0

        # Reject only significant unexplained regressions (> 5 seconds)
        return time_regression and regression_amount > 5.0

    def _is_reasonable_score_change(self, old_score: int, new_score: int) -> bool:
        """
        Check if a score change is reasonable (no more than 5 points difference).

        Args:
            old_score: Previous score
            new_score: New score

        Returns:
            True if change is reasonable, False otherwise
        """
        # Score should never decrease
        if new_score < old_score:
            return False

        # Score shouldn't increase by more than 5 points in a single update
        # (accounts for 3-pointers + free throws or other combinations)
        return (new_score - old_score) <= 5

    def _clean_game_data(self, game_data: Dict) -> Dict:
        """
        Clean and normalize game data to ensure consistency.

        Args:
            game_data: Raw game data from API

        Returns:
            Cleaned game data
        """
        game_copy = copy.deepcopy(game_data)

        # Ensure all expected fields exist
        if "game_id" not in game_copy:
            game_copy["game_id"] = str(game_copy.get("gameId", "unknown"))

        # Standardize game status (must be 1, 2, or 3)
        if "game_status" not in game_copy:
            game_copy["game_status"] = game_copy.get("gameStatus", 1)

        game_copy["game_status"] = max(1, min(3, game_copy["game_status"]))

        # Standardize period
        if "period" not in game_copy:
            game_copy["period"] = game_copy.get("period", 0)

        game_copy["period"] = max(0, game_copy["period"])

        # Standardize clock
        if "clock" in game_copy:
            game_copy["clock"] = self._standardize_clock(game_copy["clock"])

        # Ensure team info is consistent
        for team_key in ["home_team", "away_team"]:
            if team_key not in game_copy:
                game_copy[team_key] = {}

            team = game_copy[team_key]

            # Ensure score is an integer
            if "score" not in team:
                team["score"] = 0
            else:
                try:
                    team["score"] = int(team["score"])
                except (ValueError, TypeError):
                    team["score"] = 0

        return game_copy

    def _validate_and_merge_game(self, game_id: str, new_game: Dict) -> Dict:
        """
        Validate new game data against current state and merge intelligently.
        Improved version with better clock handling.

        Args:
            game_id: Game identifier
            new_game: New game data

        Returns:
            Merged game data
        """
        # If we don't have this game yet, just use the new data directly
        if game_id not in self.current_games:
            self.update_counts[game_id] = 1
            return new_game

        current_game = self.current_games[game_id]
        update_count = self.update_counts.get(game_id, 0) + 1
        self.update_counts[game_id] = update_count

        # For the first few updates, be more conservative about accepting changes
        # The API sometimes sends inconsistent initial data
        early_phase = update_count < 5

        result = copy.deepcopy(current_game)

        # Game status changes
        # Only allow status to advance forward (1->2->3) or stay the same
        # Exception: After many updates, allow 3->2 (fixing incorrect final status)
        if new_game["game_status"] > current_game["game_status"]:
            # Always allow status to advance
            result["game_status"] = new_game["game_status"]
        elif new_game["game_status"] < current_game["game_status"] and not early_phase:
            # Only allow status to revert after we've seen many updates
            # This handles cases where games were incorrectly marked as final
            result["game_status"] = new_game["game_status"]

        # Period changes
        # Only allow period to increase or stay the same in early phases
        # Later allow corrections
        if new_game["period"] > current_game["period"]:
            # Always allow period to advance
            result["period"] = new_game["period"]
            # When period advances, ALWAYS accept the new clock
            # (this ensures the clock is correctly reset for the new period)
            result["clock"] = new_game["clock"]
        elif new_game["period"] < current_game["period"] and not early_phase:
            # Only allow period to decrease after many updates (likely a correction)
            result["period"] = new_game["period"]
            # Also accept the clock when period is corrected
            result["clock"] = new_game["clock"]
        else:
            # Same period - handle clock changes
            if new_game["clock"] is not None:
                if current_game["clock"] is None:
                    # If we had no clock before, accept the new one
                    result["clock"] = new_game["clock"]
                elif not self._is_clock_regression(
                    current_game["clock"],
                    new_game["clock"],
                    current_game["game_status"],
                    current_game["period"],  # Pass period to improved function
                ):
                    # Accept clock if it doesn't show an invalid regression
                    result["clock"] = new_game["clock"]

        # Score changes
        for team_key in ["home_team", "away_team"]:
            new_score = new_game[team_key]["score"]
            current_score = current_game[team_key]["score"]

            # Special case: First few updates or games not started yet
            if current_score == 0 or early_phase:
                result[team_key]["score"] = new_score
            # Normal case: Game in progress, validate score changes
            elif (
                self._is_reasonable_score_change(current_score, new_score)
                or not early_phase
            ):
                result[team_key]["score"] = new_score

        # Always update non-critical fields
        result["game_time"] = new_game.get("game_time", current_game.get("game_time"))

        return result

    def _has_meaningful_changes(self, old_game: Dict, new_game: Dict) -> bool:
        """
        Determine if there are meaningful changes between game states that require broadcasting.

        Args:
            old_game: Previous game state
            new_game: New game state

        Returns:
            True if meaningful changes exist, False otherwise
        """
        # Check essential fields
        if (
            old_game["game_status"] != new_game["game_status"]
            or old_game["period"] != new_game["period"]
        ):
            return True

        # Check scores
        if (
            old_game["home_team"]["score"] != new_game["home_team"]["score"]
            or old_game["away_team"]["score"] != new_game["away_team"]["score"]
        ):
            return True

        # Check clock (only if both are present)
        if old_game["clock"] is not None and new_game["clock"] is not None:
            old_seconds = parse_game_clock(old_game["clock"])
            new_seconds = parse_game_clock(new_game["clock"])

            if old_seconds is not None and new_seconds is not None:
                # Consider it meaningful if clock changes by more than 1 second
                if abs(old_seconds - new_seconds) > 1.0:
                    return True

        return False

    async def broadcast(self, games_data: List[Dict]) -> bool:
        """
        Process new game data and broadcast to clients if needed.
        Improved version with better clock handling.

        Args:
            games_data: List of new game data from the API

        Returns:
            True if data was broadcast, False otherwise
        """
        if not games_data:
            return False

        # Apply rate limiting for broadcasts
        current_time = time.time()
        if (current_time - self.last_broadcast_time) < self.broadcast_cooldown:
            return False

        # First, standardize all game clocks to ensure consistent formats
        standardized_games = standardize_game_clocks(games_data)

        # Track if we have any meaningful changes to broadcast
        has_changes = False
        processed_games = {}

        # Process each game
        for game in standardized_games:
            # Clean and normalize the game data
            cleaned_game = self._clean_game_data(game)
            game_id = cleaned_game["game_id"]

            # Validate and merge with existing data
            merged_game = self._validate_and_merge_game(game_id, cleaned_game)
            processed_games[game_id] = merged_game

            # Check if this game has meaningful changes
            if game_id in self.current_games:
                if self._has_meaningful_changes(
                    self.current_games[game_id], merged_game
                ):
                    has_changes = True
            else:
                # New game we haven't seen before
                has_changes = True

        # If we have games in current_games that aren't in the new data,
        # keep them for a while (they may reappear in future updates)
        # This prevents games from flashing in and out
        for game_id, game in self.current_games.items():
            if game_id not in processed_games:
                # Keep the game in our current set
                processed_games[game_id] = game

        # Update our current games
        async with self._lock:
            self.current_games = processed_games

            # If nothing has changed or it's too soon, don't broadcast
            if not has_changes:
                return False

            # Convert to list for the response
            games_list = list(self.current_games.values())

            # Convert any datetime objects to strings
            json_data = json.loads(
                json.dumps(games_list, default=self._serialize_datetime)
            )

            # Broadcast to all connections
            for connection in self.active_connections.copy():
                try:
                    await connection.send_json(json_data)
                except Exception as e:
                    logger.error(f"Error broadcasting to client: {e}")
                    await self.disconnect(connection)

            self.last_broadcast_time = current_time
            logger.debug(f"Broadcast scoreboard update with {len(games_list)} games")

        return True


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
    Get scoreboard data for a past date with improved headers and timeout.

    Args:
        date_str: Date in YYYY-MM-DD format

    Returns:
        List of games for the specified date
    """
    try:
        # Use the custom headers from your working solution
        custom_headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
            "Accept": "application/json",
            "Accept-Language": "en-US,en;q=0.9",
            "Origin": "https://stats.nba.com",
            "Referer": "https://stats.nba.com",
        }

        # Parse the date format
        date_obj = datetime.strptime(date_str, "%Y-%m-%d")
        date_formatted = date_obj.strftime("%m/%d/%Y")

        # Make the API call with custom headers and a longer timeout
        games_df = leaguegamefinder.LeagueGameFinder(
            date_from_nullable=date_formatted,
            date_to_nullable=date_formatted,
            league_id_nullable="00",
            headers=custom_headers,  # Add custom headers
            timeout=120,  # Increase timeout to 120 seconds
        ).get_data_frames()[0]

        return process_past_games(games_df)
    except Exception as e:
        logger.error(f"Error fetching past scoreboard: {e}")
        # Return an empty list instead of raising an exception for now
        return []


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
