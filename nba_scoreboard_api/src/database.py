from sqlalchemy import create_engine, Column, Integer, String
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from nba_api.stats.endpoints import commonallplayers
import logging
from typing import Generator
from pathlib import Path

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Get project root directory (2 levels up from this file)
PROJECT_ROOT = Path(__file__).parent.parent

# Database path configuration
DB_PATH = PROJECT_ROOT / "data" / "nba_players.db"

# Ensure the data directory exists
DB_PATH.parent.mkdir(parents=True, exist_ok=True)

# Create database URL
SQLALCHEMY_DATABASE_URL = f"sqlite:///{DB_PATH}"
logger.info(f"Database path: {DB_PATH}")

# Create engine
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False}  # Needed for SQLite
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class Player(Base):
    __tablename__ = "players"
    
    id = Column(Integer, primary_key=True)
    person_id = Column(Integer, unique=True, index=True)
    display_name = Column(String)
    team_name = Column(String)
    team_abbreviation = Column(String)

def init_db() -> None:
    """Initialize the database by creating all tables."""
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("Database initialized successfully")
    except Exception as e:
        logger.error(f"Error initializing database: {e}")
        raise

def get_db() -> Generator[Session, None, None]:
    """Database session dependency."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

async def update_player_database() -> None:
    """Update the SQLite database with current NBA players."""
    try:
        # Get all current NBA players
        all_players = commonallplayers.CommonAllPlayers(
            is_only_current_season=1,
            league_id='00',
            season='2024-25'
        )
        df_players = all_players.common_all_players.get_data_frame()

        # Create database session
        db = SessionLocal()
        
        try:
            # Clear existing players
            db.query(Player).delete()
            
            # Add new players
            for _, row in df_players.iterrows():
                db_player = Player(
                    person_id=row['PERSON_ID'],
                    display_name=row['DISPLAY_FIRST_LAST'],
                    team_name=row['TEAM_NAME'],
                    team_abbreviation=row['TEAM_ABBREVIATION']
                )
                db.add(db_player)
            
            db.commit()
            logger.info("Successfully updated player database")
            
        except Exception as e:
            db.rollback()
            logger.error(f"Error updating database: {e}")
            raise
        finally:
            db.close()
            
    except Exception as e:
        logger.error(f"Error fetching player data: {e}")
        raise