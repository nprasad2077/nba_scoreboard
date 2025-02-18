# app/api/v1/__init__.py
from fastapi import APIRouter
from app.api.v1.endpoints import players, scoreboard, standings

# Create the main v1 router
router = APIRouter()

# Include all endpoint routers
router.include_router(
    players.router,
    prefix="/players",
    tags=["players"]
)

router.include_router(
    scoreboard.router,
    prefix="/scoreboard",
    tags=["scoreboard"]
)

router.include_router(
    standings.router,
    prefix="/standings",
    tags=["standings"]
)