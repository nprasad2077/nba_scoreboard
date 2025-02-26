# app/models/scoreboard.py
from sqlalchemy import Column, Integer, String, DateTime, Float, ForeignKey, Index
from sqlalchemy.orm import relationship
from app.core.database import Base
from datetime import datetime

class Game(Base):
    """SQLAlchemy model for NBA games."""
    __tablename__ = "games"

    id = Column(Integer, primary_key=True)
    game_id = Column(String, unique=True, index=True, nullable=False)
    game_date = Column(DateTime, nullable=False)
    status = Column(Integer, nullable=False, comment="1=Scheduled, 2=In Progress, 3=Final")
    period = Column(Integer, default=0)
    clock = Column(String)
    
    # Teams
    home_team_id = Column(String, nullable=False)
    home_team_name = Column(String, nullable=False)
    home_team_city = Column(String, nullable=False)
    home_team_tricode = Column(String, nullable=False)
    home_team_score = Column(Integer, default=0)
    
    away_team_id = Column(String, nullable=False)
    away_team_name = Column(String, nullable=False)
    away_team_city = Column(String, nullable=False)
    away_team_tricode = Column(String, nullable=False)
    away_team_score = Column(Integer, default=0)

    # Metadata
    arena = Column(String)
    city = Column(String)
    state = Column(String)
    country = Column(String)
    
    # Last updated timestamp
    updated_at = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False
    )

    __table_args__ = (
        Index('ix_games_date_status', 'game_date', 'status'),
    )

    def __repr__(self):
        return f"<Game {self.game_id}: {self.away_team_tricode} @ {self.home_team_tricode}>"