# app/api/v1/endpoints/scoreboard.py
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, HTTPException, Query
import asyncio
from typing import Optional
from datetime import datetime, timedelta

from app.services.scoreboard import (
    get_box_score,
    get_past_scoreboard,
    scoreboard_manager,
    playbyplay_manager
)
from app.schemas.scoreboard import GameBoxScore

router = APIRouter()

@router.websocket("/ws")
async def scoreboard_websocket(websocket: WebSocket):
    """
    WebSocket endpoint for live scoreboard updates.
    Streams game scores and status updates to connected clients.
    """
    await scoreboard_manager.connect(websocket)
    try:
        # Send initial scoreboard data
        await scoreboard_manager.send_current_games(websocket)
        
        # Keep connection alive and handle client messages
        while True:
            await websocket.receive_text()
            
    except WebSocketDisconnect:
        await scoreboard_manager.disconnect(websocket)
    except Exception as e:
        await scoreboard_manager.disconnect(websocket)
        # raise HTTPException(status_code=500, detail=str(e))

@router.websocket("/ws/playbyplay/{game_id}")
async def playbyplay_websocket(websocket: WebSocket, game_id: str):
    """
    WebSocket endpoint for live play-by-play updates for a specific game.
    """
    await playbyplay_manager.connect(websocket, game_id)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        await playbyplay_manager.disconnect(websocket, game_id)
    except Exception as e:
        await playbyplay_manager.disconnect(websocket, game_id)

@router.get("/past")
async def get_past_games(
    date: Optional[str] = Query(None, description="Date in YYYY-MM-DD format")
):
    """
    Get scoreboard data for past games.
    
    Args:
        date: Optional date string (YYYY-MM-DD). Defaults to yesterday if not provided.
    
    Returns:
        List of game results for the specified date
    """
    if date is None:
        # Default to yesterday
        date = (datetime.now() - timedelta(days=1)).strftime("%Y-%m-%d")
    return await get_past_scoreboard(date)

@router.get("/boxscore/{game_id}", response_model=GameBoxScore)
async def get_game_boxscore(game_id: str):
    """
    Get detailed box score for a specific game.
    
    Args:
        game_id: NBA game ID
    
    Returns:
        Detailed game statistics including player stats
    
    Raises:
        HTTPException: If box score is not found
    """
    try:
        return await get_box_score(game_id)
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))