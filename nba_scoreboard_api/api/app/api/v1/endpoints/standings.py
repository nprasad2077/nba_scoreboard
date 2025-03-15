# app/api/v1/endpoints/standings.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.services.standings import (
    get_conference_standings,
    get_division_standings,
    update_standings_database
)
from app.schemas.standings import StandingsResponse
from app.services.nba_api_utils import get_nba_stats_api, NBA_STATS_HEADERS, NBA_API_TIMEOUT
from nba_api.stats.endpoints import leaguestandings
import logging



router = APIRouter()
logger = logging.getLogger(__name__)

@router.get("/conference/{conference}", response_model=List[StandingsResponse])
async def get_conference_standings_route(
    conference: str,
    db: Session = Depends(get_db)
):
    """
    Get standings for a specific conference (East or West).
    
    Args:
        conference: Conference name ('East' or 'West')
        db: Database session
    
    Returns:
        List of team standings for the specified conference
    
    Raises:
        HTTPException: If conference is invalid or no standings found
    """
    try:
        if conference.lower() not in ['east', 'west']:
            raise HTTPException(
                status_code=400,
                detail="Conference must be 'East' or 'West'"
            )
        
        standings = await get_conference_standings(db, conference)
        
        # If no standings in the database, try to fetch them directly
        if not standings:
            logger.info(f"No standings found in database for {conference} conference, fetching from NBA API")
            
            try:
                # Fetch standings from NBA API
                standings_api = get_nba_stats_api(
                    leaguestandings.LeagueStandings,
                    season='2024-25'
                )
                df = standings_api.standings.get_data_frame()
                
                # Filter for the requested conference
                conf_df = df[df['Conference'].str.lower() == conference.lower()]
                
                if conf_df.empty:
                    raise HTTPException(
                        status_code=404,
                        detail=f"No standings found for {conference} conference"
                    )
                
                # Convert to StandingsResponse objects
                standings = []
                for _, row in conf_df.iterrows():
                    standings.append(StandingsResponse(
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
                        vs_east=str(row['vsEast']),
                        vs_west=str(row['vsWest'])
                    ))
                
                # Sort by conference rank
                standings.sort(key=lambda x: x.conference_rank)
                
                # Try to update the database for future requests
                try:
                    await update_standings_database(db)
                except Exception as update_error:
                    logger.warning(f"Non-critical error updating standings database: {update_error}")
                
                return standings
            
            except HTTPException:
                raise
            except Exception as api_error:
                logger.error(f"Error fetching standings from NBA API: {api_error}")
                raise HTTPException(
                    status_code=503,
                    detail=f"Unable to fetch standings at this time. Please try again later."
                )
        
        return standings
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error in get_conference_standings_route: {e}")
        raise HTTPException(
            status_code=500,
            detail="An unexpected error occurred while retrieving standings"
        )

@router.get("/division/{division}", response_model=List[StandingsResponse])
async def get_division_standings_route(
    division: str,
    db: Session = Depends(get_db)
):
    """
    Get standings for a specific division.
    
    Args:
        division: Division name (e.g., 'Atlantic', 'Central', etc.)
        db: Database session
    
    Returns:
        List of team standings for the specified division
    
    Raises:
        HTTPException: If division is invalid or no standings found
    """
    try:
        valid_divisions = [
            'atlantic', 'central', 'southeast',
            'northwest', 'pacific', 'southwest'
        ]
        
        if division.lower() not in valid_divisions:
            raise HTTPException(
                status_code=400,
                detail=f"Division must be one of: {', '.join(valid_divisions)}"
            )
        
        standings = await get_division_standings(db, division)
        
        # If no standings in the database, try to fetch them directly
        if not standings:
            logger.info(f"No standings found in database for {division} division, fetching from NBA API")
            
            try:
                # Fetch standings from NBA API
                standings_api = get_nba_stats_api(
                    leaguestandings.LeagueStandings,
                    season='2024-25'
                )
                df = standings_api.standings.get_data_frame()
                
                # Filter for the requested division
                div_df = df[df['Division'].str.lower() == division.lower()]
                
                if div_df.empty:
                    raise HTTPException(
                        status_code=404,
                        detail=f"No standings found for {division} division"
                    )
                
                # Convert to StandingsResponse objects
                standings = []
                for _, row in div_df.iterrows():
                    standings.append(StandingsResponse(
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
                        vs_east=str(row['vsEast']),
                        vs_west=str(row['vsWest'])
                    ))
                
                # Sort by division rank
                standings.sort(key=lambda x: x.division_rank)
                
                # Try to update the database for future requests
                try:
                    await update_standings_database(db)
                except Exception as update_error:
                    logger.warning(f"Non-critical error updating standings database: {update_error}")
                
                return standings
            
            except HTTPException:
                raise
            except Exception as api_error:
                logger.error(f"Error fetching standings from NBA API: {api_error}")
                raise HTTPException(
                    status_code=503,
                    detail=f"Unable to fetch standings at this time. Please try again later."
                )
        
        return standings
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error in get_division_standings_route: {e}")
        raise HTTPException(
            status_code=500,
            detail="An unexpected error occurred while retrieving standings"
        )

@router.post("/update", status_code=200)
async def update_standings(db: Session = Depends(get_db)):
    """
    Update the standings database with current NBA standings.
    
    Args:
        db: Database session
    
    Returns:
        Success message
    """
    try:
        await update_standings_database(db)
        return {"message": "Standings database updated successfully"}
    except Exception as e:
        logger.error(f"Error updating standings: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to update standings: {str(e)}"
        )