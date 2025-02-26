# app/schemas/standings.py
from pydantic import BaseModel, Field
from typing import List
from enum import Enum

class Conference(str, Enum):
    """Enumeration of NBA conferences."""
    EAST = "East"
    WEST = "West"

class Division(str, Enum):
    """Enumeration of NBA divisions."""
    ATLANTIC = "Atlantic"
    CENTRAL = "Central"
    SOUTHEAST = "Southeast"
    NORTHWEST = "Northwest"
    PACIFIC = "Pacific"
    SOUTHWEST = "Southwest"

class StandingsResponse(BaseModel):
    """Model for team standings information."""
    team_id: int = Field(..., description="NBA.com team ID")
    team_city: str = Field(..., description="Team city")
    team_name: str = Field(..., description="Team name")
    conference: str = Field(..., description="Conference (East/West)")
    division: str = Field(..., description="Division name")
    wins: int = Field(..., description="Number of wins")
    losses: int = Field(..., description="Number of losses")
    win_pct: float = Field(..., description="Winning percentage")
    games_back: float = Field(..., description="Games behind conference leader")
    conference_rank: int = Field(..., description="Rank in conference")
    division_rank: int = Field(..., description="Rank in division")
    home_record: str = Field(..., description="Home record (W-L)")
    road_record: str = Field(..., description="Road record (W-L)")
    last_ten: str = Field(..., description="Record in last 10 games")
    streak: str = Field(..., description="Current streak")
    points_pg: float = Field(..., description="Points per game")
    opp_points_pg: float = Field(..., description="Opponent points per game")
    division_record: str = Field(..., description="Record against division")
    conference_record: str = Field(..., description="Record against conference")
    vs_east: str = Field(..., description="Record against Eastern Conference")
    vs_west: str = Field(..., description="Record against Western Conference")

    class Config:
        from_attributes = True

class ConferenceStandings(BaseModel):
    """Model for conference standings response."""
    conference: Conference
    standings: List[StandingsResponse]

class DivisionStandings(BaseModel):
    """Model for division standings response."""
    division: Division
    standings: List[StandingsResponse]

class StandingsUpdate(BaseModel):
    """Model for standings update response."""
    message: str = Field(..., description="Update status message")
    updated_teams: int = Field(..., description="Number of teams updated")