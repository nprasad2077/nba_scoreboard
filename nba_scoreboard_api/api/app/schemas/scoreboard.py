# app/schemas/scoreboard.py
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

# Team related models for scoreboard display
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

# Box score related models
class PlayerStatistics(BaseModel):
    """Player game statistics."""
    minutes: str = Field(default="0:00")
    points: int = Field(default=0)
    assists: int = Field(default=0)
    reboundsTotal: int = Field(default=0)
    reboundsDefensive: int = Field(default=0)
    reboundsOffensive: int = Field(default=0)
    steals: int = Field(default=0)
    blocks: int = Field(default=0)
    turnovers: int = Field(default=0)
    foulsPersonal: int = Field(default=0)
    fieldGoalsMade: int = Field(default=0)
    fieldGoalsAttempted: int = Field(default=0)
    fieldGoalsPercentage: float = Field(default=0.0)
    threePointersMade: int = Field(default=0)
    threePointersAttempted: int = Field(default=0)
    threePointersPercentage: float = Field(default=0.0)
    freeThrowsMade: int = Field(default=0)
    freeThrowsAttempted: int = Field(default=0)
    freeThrowsPercentage: float = Field(default=0.0)
    plusMinusPoints: int = Field(default=0)

class PlayerData(BaseModel):
    """Player data model matching the original implementation."""
    name: str = Field(default="")
    position: str = Field(default="")
    starter: bool = Field(default=False)
    oncourt: bool = Field(default=False)
    jerseyNum: str = Field(default="")
    status: str = Field(default="")
    statistics: PlayerStatistics = Field(default_factory=PlayerStatistics)

class PlayerBoxScore(BaseModel):
    """Player box score information."""
    player_id: str = Field(default="")
    name: str = Field(default="")
    position: str = Field(default="")
    starter: bool = Field(default=False)
    statistics: PlayerStatistics = Field(default_factory=PlayerStatistics)

class TeamBoxScore(BaseModel):
    """Team box score information."""
    team_id: str = Field(default="")
    team_name: str = Field(default="")
    team_city: str = Field(default="")
    team_tricode: str = Field(default="")
    players: List[PlayerBoxScore] = Field(default_factory=list)

class GameBoxScore(BaseModel):
    """Complete box score for a game."""
    game_id: str
    status: int = Field(default=1)
    period: int = Field(default=0)
    clock: Optional[str] = None
    home_team: TeamBoxScore
    away_team: TeamBoxScore

    class Config:
        from_attributes = True
        populate_by_name = True

class PlayByPlayEvent(BaseModel):
    """Play-by-play event information."""
    event_id: str = Field(default="")
    clock: str = Field(default="")
    period: int = Field(default=0)
    description: str = Field(default="")
    score: Optional[str] = None
    team_tricode: Optional[str] = None
    player_name: Optional[str] = None

class PlayByPlayResponse(BaseModel):
    """Response model for play-by-play endpoint."""
    game_id: str
    period: int = Field(default=0)
    clock: Optional[str] = None
    events: List[PlayByPlayEvent] = Field(default_factory=list)