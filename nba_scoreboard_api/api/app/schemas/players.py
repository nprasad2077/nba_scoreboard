# app/schemas/players.py
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import date

class PlayerBase(BaseModel):
    """Base player model containing core player information."""
    person_id: int = Field(..., description="NBA.com person ID")
    display_name: str = Field(..., description="Player's full name")
    team_name: str = Field(..., description="Current team name")
    team_abbreviation: str = Field(..., description="Current team abbreviation")

    class Config:
        from_attributes = True

class GameStats(BaseModel):
    """Model for player game statistics."""
    game_date: str = Field(..., description="Date of the game")
    matchup: str = Field(..., description="Game matchup (e.g., 'LAL vs. BOS')")
    wl: str = Field(..., description="Win/Loss result")
    min: float = Field(..., description="Minutes played")
    pts: int = Field(..., description="Points scored")
    fgm: int = Field(..., description="Field goals made")
    fga: int = Field(..., description="Field goals attempted")
    fg_pct: float = Field(..., description="Field goal percentage")
    fg3m: int = Field(..., description="Three pointers made")
    fg3a: int = Field(..., description="Three pointers attempted")
    fg3_pct: float = Field(..., description="Three point percentage")
    ftm: int = Field(..., description="Free throws made")
    fta: int = Field(..., description="Free throws attempted")
    ft_pct: float = Field(..., description="Free throw percentage")
    oreb: int = Field(..., description="Offensive rebounds")
    dreb: int = Field(..., description="Defensive rebounds")
    reb: int = Field(..., description="Total rebounds")
    ast: int = Field(..., description="Assists")
    stl: int = Field(..., description="Steals")
    blk: int = Field(..., description="Blocks")
    tov: int = Field(..., description="Turnovers")
    pf: int = Field(..., description="Personal fouls")
    plus_minus: int = Field(..., description="Plus/minus")

class PlayerStats(BaseModel):
    """Combined model for player info and game statistics."""
    player_info: PlayerBase = Field(..., description="Player's basic information")
    games: List[GameStats] = Field(..., description="List of game statistics")

class PlayerSearch(BaseModel):
    """Model for player search parameters."""
    query: str = Field(..., min_length=2, description="Search query (minimum 2 characters)")

class PlayerGamesParams(BaseModel):
    """Model for player games query parameters."""
    player_id: int = Field(..., description="NBA.com person ID")
    last_n_games: Optional[int] = Field(
        10, 
        ge=1, 
        le=82, 
        description="Number of recent games to return (1-82)"
    )