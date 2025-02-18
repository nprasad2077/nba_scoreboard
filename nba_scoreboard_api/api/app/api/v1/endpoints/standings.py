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

router = APIRouter()

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
    if conference.lower() not in ['east', 'west']:
        raise HTTPException(
            status_code=400,
            detail="Conference must be 'East' or 'West'"
        )
    
    standings = await get_conference_standings(db, conference)
    if not standings:
        raise HTTPException(
            status_code=404,
            detail=f"No standings found for {conference} conference"
        )
    return standings

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
    if not standings:
        raise HTTPException(
            status_code=404,
            detail=f"No standings found for {division} division"
        )
    return standings

@router.post("/update", status_code=200)
async def update_standings(db: Session = Depends(get_db)):
    """
    Update the standings database with current NBA standings.
    
    Args:
        db: Database session
    
    Returns:
        Success message
    """
    await update_standings_database(db)
    return {"message": "Standings database updated successfully"}