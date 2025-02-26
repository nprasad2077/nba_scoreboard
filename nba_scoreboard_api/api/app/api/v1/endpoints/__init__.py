# app/api/v1/endpoints/__init__.py
from fastapi import APIRouter

from app.api.v1.endpoints import players, scoreboard, standings

router = APIRouter()

router.include_router(players.router, prefix="/players", tags=["players"])
router.include_router(scoreboard.router, prefix="/scoreboard", tags=["scoreboard"])
router.include_router(standings.router, prefix="/standings", tags=["standings"])