# File: app/services/scoreboard.py
import logging
import asyncio
from datetime import datetime, timedelta
from typing import List, Optional, Dict, Any, Set
from fastapi import WebSocket
from nba_api.live.nba.endpoints import scoreboard, boxscore, playbyplay
import pytz
from dateutil import parser

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

class ScoreboardManager:
    """Manages live scoreboard data and WebSocket connections."""
    def __init__(self):
        self.active_connections: Set[WebSocket] = set()
        self.current_games: Dict[str, Any] = {}

    async def connect(self, websocket: WebSocket):
        """Add a new WebSocket connection."""
        await websocket.accept()
        self.active_connections.add(websocket)

    async def disconnect(self, websocket: WebSocket):
        """Remove a WebSocket connection."""
        self.active_connections.discard(websocket)

    async def broadcast(self, data: List[Dict]):
        """Broadcast data to all connected clients."""
        for connection in self.active_connections.copy():
            try:
                await connection.send_json(data)
            except Exception as e:
                logger.error(f"Error broadcasting to client: {e}")
                await self.disconnect(connection)

    async def send_current_games(self, websocket: WebSocket):
        """Send initial scoreboard data to a new connection."""
        try:
            current_games = await get_live_scoreboard()
            await websocket.send_json(current_games.dict()["games"])
        except Exception as e:
            logger.error(f"Error sending initial games data: {e}")
            raise

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
                self.tasks[game_id] = asyncio.create_task(self._poll_playbyplay(game_id))

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
                if (not current_data or not current_data.get("plays")) and hasattr(p, "games"):
                    logger.debug("No plays found using p.get_dict(); trying p.games.get_dict()")
                    current_data = p.games.get_dict()

                last = self.last_data.get(game_id)
                if not last or (last != current_data):
                    self.last_data[game_id] = current_data
                    await self.broadcast_to_game(game_id, current_data)  # Updated method call
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
            home_team = TeamGameInfo(
                team_id=game["homeTeam"]["teamId"],
                team_name=game["homeTeam"]["teamName"],
                team_city=game["homeTeam"]["teamCity"],
                team_tricode=game["homeTeam"]["teamTricode"],
                score=game["homeTeam"].get("score", 0),
            )
            away_team = TeamGameInfo(
                team_id=game["awayTeam"]["teamId"],
                team_name=game["awayTeam"]["teamName"],
                team_city=game["awayTeam"]["teamCity"],
                team_tricode=game["awayTeam"]["teamTricode"],
                score=game["awayTeam"].get("score", 0),
            )
            game_brief = GameBrief(
                game_id=game["gameId"],
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
            date_from_nullable=date_formatted, date_to_nullable=date_formatted
        ).get_data_frames()[0]
        return process_past_games(games_df)
    except Exception as e:
        logger.error(f"Error fetching past scoreboard: {e}")
        raise

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
        return process_box_score(box.get_dict())
    except Exception as e:
        logger.error(f"Error fetching box score for game {game_id}: {e}")
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
            score=int(away_row["PTS"])
        )
        home_team = TeamGameInfo(
            team_id=str(home_row["TEAM_ID"]),
            team_name=home_row["TEAM_NAME"],
            team_city="",
            team_tricode=home_row["TEAM_ABBREVIATION"],
            score=int(home_row["PTS"])
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
        return TeamBoxScore(
            team_id=str(team_data.get("teamId", "")),
            team_name=team_data.get("teamName", ""),
            team_city=team_data.get("teamCity", ""),
            team_tricode=team_data.get("teamTricode", ""),
            players=players,
        )
    home_team = process_team(box_score_data.get("homeTeam", {}))
    away_team = process_team(box_score_data.get("awayTeam", {}))
    return GameBoxScore(
        game_id=str(box_score_data.get("gameId", "")),
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
