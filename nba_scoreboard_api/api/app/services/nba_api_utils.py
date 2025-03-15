# app/services/nba_api_utils.py
import logging
import os
from typing import Any, Callable, TypeVar, Dict

# Type variable for generic return type
T = TypeVar('T')

logger = logging.getLogger(__name__)

# NBA API configuration (load from environment or use defaults)
NBA_API_TIMEOUT = int(os.getenv('NBA_API_TIMEOUT', 120))
NBA_API_RETRIES = int(os.getenv('NBA_API_RETRIES', 3))

# Standard headers for NBA API requests
NBA_STATS_HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Accept': 'application/json',
    'Accept-Language': 'en-US,en;q=0.9',
    'Origin': 'https://stats.nba.com',
    'Referer': 'https://stats.nba.com',
    'Connection': 'keep-alive'
}

def get_nba_stats_api(api_class: Callable[..., T], **kwargs) -> T:
    """
    A wrapper function for all NBA Stats API calls to ensure consistent headers and timeout.
    
    Args:
        api_class: The NBA API endpoint class (e.g., leaguegamefinder.LeagueGameFinder)
        **kwargs: Keyword arguments to pass to the API class
        
    Returns:
        The instantiated API class
        
    Example:
        ```
        from nba_api.stats.endpoints import leaguegamefinder
        from app.services.nba_api_utils import get_nba_stats_api
        
        # Instead of:
        # games_df = leaguegamefinder.LeagueGameFinder(date_from_nullable=date_str).get_data_frames()[0]
        
        # Use:
        games_df = get_nba_stats_api(
            leaguegamefinder.LeagueGameFinder, 
            date_from_nullable=date_str
        ).get_data_frames()[0]
        ```
    """
    # Don't override headers if explicitly provided
    if 'headers' not in kwargs:
        kwargs['headers'] = NBA_STATS_HEADERS
        
    # Don't override timeout if explicitly provided
    if 'timeout' not in kwargs:
        kwargs['timeout'] = NBA_API_TIMEOUT
        
    logger.debug(f"Making NBA Stats API call to {api_class.__name__} with timeout={kwargs.get('timeout')}s")
    
    try:
        # Instantiate the API class with our parameters
        return api_class(**kwargs)
    except Exception as e:
        logger.error(f"Error making NBA Stats API call to {api_class.__name__}: {str(e)}")
        raise