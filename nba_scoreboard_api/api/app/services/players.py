# app/services/players.py
import logging
from sqlalchemy.orm import Session
from nba_api.stats.endpoints import commonallplayers, playergamelogs
from typing import Optional, Tuple, Any, List
from app.services.nba_api_utils import get_nba_stats_api

from app.models.players import Player
from app.schemas.players import PlayerStats, PlayerBase, GameStats

# Configure logging
logger = logging.getLogger(__name__)

async def update_player_database(db: Session) -> None:
    """
    Update the SQLite database with current NBA players.
    
    Args:
        db: Database session
    
    Raises:
        Exception: If there's an error updating the database
    """
    try:
        # Get all current NBA players using our wrapper
        all_players = get_nba_stats_api(
            commonallplayers.CommonAllPlayers,
            is_only_current_season=1,
            league_id='00',
            season='2024-25'
        )
        df_players = all_players.common_all_players.get_data_frame()
        
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
            
    except Exception as e:
        logger.error(f"Error fetching player data: {e}")
        raise

async def get_player_recent_games(
    db: Session,
    player_id: int,
    last_n_games: int = 10
) -> Optional[PlayerStats]:
    """
    Get recent games for a specific player.
    
    Args:
        db: Database session
        player_id: NBA.com person ID
        last_n_games: Number of recent games to return (default: 10)
    
    Returns:
        PlayerStats object containing player info and game statistics,
        or None if player not found
    """
    # Get player from database
    player = db.query(Player).filter(Player.person_id == player_id).first()
    if not player:
        return None
    
    try:
        # Fetch game logs from NBA API using our wrapper
        logs = get_nba_stats_api(
            playergamelogs.PlayerGameLogs,
            player_id_nullable=player_id,
            season_nullable="2024-25",
            season_type_nullable="Regular Season",
            last_n_games_nullable=last_n_games
        )
        
        df_games = logs.get_data_frames()[0]
        
        # Convert player to PlayerBase model
        player_info = PlayerBase(
            person_id=player.person_id,
            display_name=player.display_name,
            team_name=player.team_name,
            team_abbreviation=player.team_abbreviation
        )
        
        # Convert game logs to GameStats models
        games = []
        for _, game in df_games.iterrows():
            game_stats = GameStats(
                game_date=game["GAME_DATE"],
                matchup=game["MATCHUP"],
                wl=game["WL"],
                min=float(game["MIN"]) if game["MIN"] else 0.0,
                pts=game["PTS"],
                fgm=game["FGM"],
                fga=game["FGA"],
                fg_pct=game["FG_PCT"],
                fg3m=game["FG3M"],
                fg3a=game["FG3A"],
                fg3_pct=game["FG3_PCT"],
                ftm=game["FTM"],
                fta=game["FTA"],
                ft_pct=game["FT_PCT"],
                oreb=game["OREB"],
                dreb=game["DREB"],
                reb=game["REB"],
                ast=game["AST"],
                stl=game["STL"],
                blk=game["BLK"],
                tov=game["TOV"],
                pf=game["PF"],
                plus_minus=game["PLUS_MINUS"]
            )
            games.append(game_stats)
        
        return PlayerStats(player_info=player_info, games=games)
        
    except Exception as e:
        logger.error(f"Error fetching game logs for player {player_id}: {e}")
        raise

async def search_players(db: Session, query: str) -> list[Player]:
    """
    Search for players by name.
    
    Args:
        db: Database session
        query: Search string
    
    Returns:
        List of matching Player objects
    """
    search_query = f"%{query}%"
    return db.query(Player).filter(Player.display_name.ilike(search_query)).all()