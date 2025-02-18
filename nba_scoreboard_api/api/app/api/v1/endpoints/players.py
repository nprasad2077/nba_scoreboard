# app/api/v1/endpoints/players.py
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.services.players import (
    get_player_recent_games,
    search_players,
    update_player_database
)
from app.schemas.players import PlayerBase, PlayerStats

router = APIRouter()

@router.get("/search/", response_model=List[PlayerBase])
async def search_players_route(
    query: str = Query(..., min_length=2),
    db: Session = Depends(get_db)
):
    """
    Search for players by name.
    
    Args:
        query: Search string (minimum 2 characters)
        db: Database session
    
    Returns:
        List of matching players
    """
    return await search_players(db, query)

@router.get("/{player_id}/games", response_model=PlayerStats)
async def get_player_games(
    player_id: int,
    last_n_games: int = Query(default=10, ge=1, le=82),
    db: Session = Depends(get_db)
):
    """
    Get a player's recent game statistics.
    
    Args:
        player_id: The NBA person ID of the player
        last_n_games: Number of recent games to return (1-82)
        db: Database session
    
    Returns:
        Player info and game statistics
    
    Raises:
        HTTPException: If player is not found
    """
    result = await get_player_recent_games(db, player_id, last_n_games)
    if result is None:
        raise HTTPException(status_code=404, detail="Player not found")
    return result

@router.post("/update", status_code=200)
async def update_players(db: Session = Depends(get_db)):
    """
    Update the players database with current NBA players.
    
    Args:
        db: Database session
    
    Returns:
        Success message
    """
    await update_player_database(db)
    return {"message": "Players database updated successfully"}