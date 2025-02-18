# app/models/standings.py
from sqlalchemy import Column, Integer, String, Float, UniqueConstraint, Index
from sqlalchemy.orm import relationship
from app.core.database import Base

class TeamStanding(Base):
    """SQLAlchemy model for NBA team standings."""
    __tablename__ = "team_standings"

    # Primary key
    id = Column(Integer, primary_key=True)
    
    # Team identification
    team_id = Column(
        Integer,
        unique=True,
        index=True,
        nullable=False,
        comment="NBA.com team ID"
    )
    team_city = Column(
        String,
        nullable=False,
        comment="Team city"
    )
    team_name = Column(
        String,
        nullable=False,
        comment="Team name"
    )

    # Conference and division
    conference = Column(
        String,
        nullable=False,
        comment="Conference (East/West)"
    )
    division = Column(
        String,
        nullable=False,
        comment="Division name"
    )

    # Record
    wins = Column(
        Integer,
        nullable=False,
        default=0,
        comment="Number of wins"
    )
    losses = Column(
        Integer,
        nullable=False,
        default=0,
        comment="Number of losses"
    )
    win_pct = Column(
        Float,
        nullable=False,
        default=0.0,
        comment="Winning percentage"
    )
    games_back = Column(
        Float,
        nullable=False,
        default=0.0,
        comment="Games behind conference leader"
    )

    # Rankings
    conference_rank = Column(
        Integer,
        nullable=False,
        comment="Rank in conference"
    )
    division_rank = Column(
        Integer,
        nullable=False,
        comment="Rank in division"
    )

    # Additional records
    home_record = Column(
        String,
        nullable=False,
        default="0-0",
        comment="Home record (W-L)"
    )
    road_record = Column(
        String,
        nullable=False,
        default="0-0",
        comment="Road record (W-L)"
    )
    last_ten = Column(
        String,
        nullable=False,
        default="0-0",
        comment="Record in last 10 games"
    )
    streak = Column(
        String,
        nullable=False,
        default="",
        comment="Current streak"
    )

    # Statistics
    points_pg = Column(
        Float,
        nullable=False,
        default=0.0,
        comment="Points per game"
    )
    opp_points_pg = Column(
        Float,
        nullable=False,
        default=0.0,
        comment="Opponent points per game"
    )

    # Record breakdowns
    division_record = Column(
        String,
        nullable=False,
        default="0-0",
        comment="Record against division"
    )
    conference_record = Column(
        String,
        nullable=False,
        default="0-0",
        comment="Record against conference"
    )
    vs_east = Column(
        String,
        nullable=False,
        default="0-0",
        comment="Record against Eastern Conference"
    )
    vs_west = Column(
        String,
        nullable=False,
        default="0-0",
        comment="Record against Western Conference"
    )

    # Indexes and constraints
    __table_args__ = (
        UniqueConstraint('team_id', name='uq_team_team_id'),
        Index('ix_team_conference', 'conference'),
        Index('ix_team_division', 'division'),
        Index('ix_team_conference_rank', 'conference', 'conference_rank'),
        Index('ix_team_division_rank', 'division', 'division_rank'),
    )

    def __repr__(self):
        """String representation of the TeamStanding model."""
        return f"<TeamStanding(id={self.id}, team='{self.team_name}', record='{self.wins}-{self.losses}')>"