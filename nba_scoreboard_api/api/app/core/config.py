from functools import lru_cache
from typing import List, Union
from pydantic_settings import BaseSettings
from pathlib import Path
import os

# Get project root directory and env file path
PROJECT_ROOT = Path(__file__).parent.parent.parent
ENV_FILE = PROJECT_ROOT / ".env"

class Settings(BaseSettings):
    # API Settings
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "NBA Scoreboard API"
    VERSION: str = "1.0.0"
    DEBUG: bool = False
    
    # Database
    PROJECT_ROOT: Path = PROJECT_ROOT
    DB_PATH: Path = PROJECT_ROOT / "data" / "nba_players.db"
    SQLALCHEMY_DATABASE_URL: str = f"sqlite:///{DB_PATH}"
    
    # NBA API Settings
    NBA_API_DELAY: float = 1.0  # Delay between NBA API calls
    NBA_SEASON: str = "2024-25"
    NBA_LEAGUE_ID: str = "00"
    
    # CORS - Default to allow all
    CORS_ORIGINS_STR: str = "*"
    
    # WebSocket Settings
    WS_UPDATE_INTERVAL: float = 1.0  # Seconds between scoreboard updates
    WS_HEARTBEAT_INTERVAL: float = 30.0  # Seconds between heartbeat messages
    
    # Testing
    TESTING: bool = False

    @property
    def CORS_ORIGINS(self) -> List[str]:
        """Parse CORS_ORIGINS_STR into a list."""
        if self.CORS_ORIGINS_STR == "*":
            return ["*"]
        return [origin.strip() for origin in self.CORS_ORIGINS_STR.split(",")]
    
    class Config:
        # This tells pydantic to try reading from .env file but doesn't fail if missing
        env_file = str(ENV_FILE) if ENV_FILE.exists() else None
        case_sensitive = True
        # This ensures environment variables take precedence over .env file values
        env_file_encoding = 'utf-8'
        extra = 'ignore'  # Ignore extra fields

@lru_cache()
def get_settings() -> Settings:
    """Return cached settings instance."""
    # Simply return settings without checking for .env file
    return Settings()