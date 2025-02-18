# app/models/players.py
from sqlalchemy import Column, Integer, String, UniqueConstraint, Index
from sqlalchemy.orm import relationship
from app.core.database import Base

class Player(Base):
    """SQLAlchemy model for NBA players."""
    __tablename__ = "players"

    # Primary key
    id = Column(Integer, primary_key=True)
    
    # Player information
    person_id = Column(
        Integer,
        unique=True,
        index=True,
        nullable=False,
        comment="NBA.com person ID"
    )
    display_name = Column(
        String,
        nullable=False,
        comment="Player's full name"
    )
    team_name = Column(
        String,
        nullable=False,
        comment="Current team name"
    )
    team_abbreviation = Column(
        String,
        nullable=False,
        comment="Current team abbreviation"
    )

    # Indexes and constraints
    __table_args__ = (
        UniqueConstraint('person_id', name='uq_player_person_id'),
        Index('ix_player_display_name', 'display_name'),
        Index('ix_player_team', 'team_name', 'team_abbreviation'),
    )

    def __repr__(self):
        """String representation of the Player model."""
        return f"<Player(id={self.id}, name='{self.display_name}', team='{self.team_abbreviation}')>"