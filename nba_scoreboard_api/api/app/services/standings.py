# app/services/standings.py
import logging
from sqlalchemy.orm import Session
from sqlalchemy import func
from nba_api.stats.endpoints import leaguestandings
from typing import List

from app.models.standings import TeamStanding
from app.schemas.standings import StandingsResponse

# Configure logging
logger = logging.getLogger(__name__)

async def update_standings_database(db: Session) -> None:
    """
    Update the standings in the database with current NBA standings.
    
    Args:
        db: Database session
    
    Raises:
        Exception: If there's an error updating the database
    """
    try:
        # Get current standings
        standings = leaguestandings.LeagueStandings(season='2024-25')
        df = standings.standings.get_data_frame()
        
        try:
            # Clear existing standings
            db.query(TeamStanding).delete()
            
            # Add new standings
            for _, row in df.iterrows():
                db_standing = TeamStanding(
                    team_id=row['TeamID'],
                    team_city=row['TeamCity'],
                    team_name=row['TeamName'],
                    conference=row['Conference'],
                    division=row['Division'],
                    wins=row['WINS'],
                    losses=row['LOSSES'],
                    win_pct=row['WinPCT'],
                    games_back=row['ConferenceGamesBack'],
                    conference_rank=row['PlayoffRank'],
                    division_rank=row['DivisionRank'],
                    home_record=row['HOME'],
                    road_record=row['ROAD'],
                    last_ten=row['L10'],
                    streak=row['CurrentStreak'],
                    points_pg=row['PointsPG'],
                    opp_points_pg=row['OppPointsPG'],
                    division_record=row['DivisionRecord'],
                    conference_record=row['ConferenceRecord'],
                    vs_east=f"{row['vsEast']}",
                    vs_west=f"{row['vsWest']}"
                )
                db.add(db_standing)
            
            db.commit()
            logger.info("Successfully updated standings database")
            
        except Exception as e:
            db.rollback()
            logger.error(f"Error updating standings database: {e}")
            raise
            
    except Exception as e:
        logger.error(f"Error fetching standings data: {e}")
        raise

async def get_conference_standings(
    db: Session,
    conference: str
) -> List[StandingsResponse]:
    """
    Get standings for a specific conference.
    
    Args:
        db: Database session
        conference: Conference name ('East' or 'West')
    
    Returns:
        List of team standings for the specified conference
    """
    standings = (
        db.query(TeamStanding)
        .filter(func.lower(TeamStanding.conference) == func.lower(conference))
        .order_by(TeamStanding.conference_rank)
        .all()
    )
    return standings

async def get_division_standings(
    db: Session,
    division: str
) -> List[StandingsResponse]:
    """
    Get standings for a specific division.
    
    Args:
        db: Database session
        division: Division name
    
    Returns:
        List of team standings for the specified division
    """
    standings = (
        db.query(TeamStanding)
        .filter(func.lower(TeamStanding.division) == func.lower(division))
        .order_by(TeamStanding.division_rank)
        .all()
    )
    return standings

def validate_conference(conference: str) -> bool:
    """
    Validate conference name.
    
    Args:
        conference: Conference name to validate
    
    Returns:
        True if valid, False otherwise
    """
    return conference.lower() in ['east', 'west']

def validate_division(division: str) -> bool:
    """
    Validate division name.
    
    Args:
        division: Division name to validate
    
    Returns:
        True if valid, False otherwise
    """
    valid_divisions = [
        'atlantic',
        'central',
        'southeast',
        'northwest',
        'pacific',
        'southwest'
    ]
    return division.lower() in valid_divisions