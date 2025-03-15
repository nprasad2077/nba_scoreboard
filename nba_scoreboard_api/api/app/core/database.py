# app/core/database.py
import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session, DeclarativeBase
from pathlib import Path
import subprocess

from app.core.config import get_settings

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

settings = get_settings()

# Ensure the data directory exists
settings.DB_PATH.parent.mkdir(parents=True, exist_ok=True)

# Create engine
engine = create_engine(
    settings.SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False}  # Needed for SQLite
)

SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)

class Base(DeclarativeBase):
    pass

def get_db() -> Session:
    """Dependency that provides a DB session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db() -> None:
    """Initialize the database by creating all tables."""
    try:
        # First try to run migrations using alembic CLI
        try:
            subprocess.run(["alembic", "upgrade", "head"], check=True)
            logger.info("Database migrations completed successfully")
        except subprocess.CalledProcessError as e:
            logger.error(f"Error running migrations: {e}")
            # Fallback: Create tables directly using SQLAlchemy
            logger.info("Falling back to SQLAlchemy table creation")
            Base.metadata.create_all(bind=engine)
            logger.info("Database tables created successfully using SQLAlchemy")
    except Exception as e:
        logger.error(f"Error initializing database: {e}")
        raise