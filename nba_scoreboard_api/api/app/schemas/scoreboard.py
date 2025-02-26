# app/schemas/scoreboard.py
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class TeamGameInfo(BaseModel):
    """Basic team information for a game."""
    team_id: str = Field(..., description="NBA team ID")
    team_name: str = Field(..., description="Team name")
    team_city: str = Field(..., description="Team city")
    team_tricode: str = Field(..., description="Three-letter team code")
    score: int = Field(default=0, description="Current score")

class GameBrief(BaseModel):
    """Brief game information for scoreboard display."""
    game_id: str = Field(..., description="NBA game ID")
    game_status: int = Field(..., description="1=Scheduled, 2=In Progress, 3=Final")
    away_team: TeamGameInfo
    home_team: TeamGameInfo
    period: int = Field(default=0, description="Current period")
    clock: Optional[str] = Field(None, description="Game clock in ISO 8601 duration format")
    game_time: datetime = Field(..., description="Scheduled game time (UTC)")

class GameDetail(GameBrief):
    """Detailed game information including venue."""
    arena: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None

class ScoreboardResponse(BaseModel):
    """Response model for scoreboard endpoint."""
    games: List[GameBrief]
    total_games: int
    current_timestamp: datetime = Field(default_factory=datetime.utcnow)

class PlayerStatistics(BaseModel):
    """Player statistics for box scores."""
    minutes: str = Field(default="0:00")
    points: int = Field(default=0)
    assists: int = Field(default=0)
    rebounds: int = Field(default=0)
    field_goals_made: int = Field(default=0)
    field_goals_attempted: int = Field(default=0)
    field_goal_percentage: float = Field(default=0.0)
    three_pointers_made: int = Field(default=0)
    three_pointers_attempted: int = Field(default=0)
    three_point_percentage: float = Field(default=0.0)
    free_throws_made: int = Field(default=0)
    free_throws_attempted: int = Field(default=0)
    free_throw_percentage: float = Field(default=0.0)
    plus_minus: int = Field(default=0)

class PlayerBoxScore(BaseModel):
    """Player box score information."""
    player_id: str
    name: str
    position: str
    starter: bool
    statistics: PlayerStatistics

class TeamBoxScore(BaseModel):
    """Team box score including player statistics."""
    team_id: str
    team_name: str
    team_city: str
    team_tricode: str
    players: List[PlayerBoxScore]

class GameBoxScore(BaseModel):
    """Complete box score for a game."""
    game_id: str
    status: int
    period: int
    clock: Optional[str]
    home_team: TeamBoxScore
    away_team: TeamBoxScore

class PlayByPlayEvent(BaseModel):
    """Play-by-play event information."""
    event_id: str
    clock: str
    period: int
    description: str
    score: Optional[str]
    team_tricode: Optional[str]
    player_name: Optional[str]

class PlayByPlayResponse(BaseModel):
    """Response model for play-by-play endpoint."""
    game_id: str
    period: int
    clock: Optional[str]
    events: List[PlayByPlayEvent]