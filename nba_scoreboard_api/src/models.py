from pydantic import BaseModel, Field
from typing import List, Optional

class PlayerStatistics(BaseModel):
    assists: int = Field(default=0)
    blocks: int = Field(default=0)
    blocksReceived: int = Field(default=0)
    fieldGoalsAttempted: int = Field(default=0)
    fieldGoalsMade: int = Field(default=0)
    fieldGoalsPercentage: float = Field(default=0.0)
    foulsOffensive: int = Field(default=0)
    foulsDrawn: int = Field(default=0)
    foulsPersonal: int = Field(default=0)
    foulsTechnical: int = Field(default=0)
    freeThrowsAttempted: int = Field(default=0)
    freeThrowsMade: int = Field(default=0)
    freeThrowsPercentage: float = Field(default=0.0)
    minutes: str = Field(default="0")
    plusMinusPoints: int = Field(default=0)
    points: int = Field(default=0)
    reboundsDefensive: int = Field(default=0)
    reboundsOffensive: int = Field(default=0)
    reboundsTotal: int = Field(default=0)
    steals: int = Field(default=0)
    threePointersAttempted: int = Field(default=0)
    threePointersMade: int = Field(default=0)
    threePointersPercentage: float = Field(default=0.0)
    turnovers: int = Field(default=0)

class PlayerData(BaseModel):
    name: str
    position: Optional[str] = ""
    starter: bool = False
    oncourt: bool = False
    jerseyNum: str = ""
    status: str = ""
    statistics: PlayerStatistics

class TeamBoxScore(BaseModel):
    teamName: str
    teamCity: str
    teamTricode: str
    players: List[PlayerData]

class GameBoxScore(BaseModel):
    gameId: str
    home_team: TeamBoxScore
    away_team: TeamBoxScore
