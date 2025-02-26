# main.py
import asyncio
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.openapi.docs import get_swagger_ui_html, get_redoc_html
import logging

from app.core.config import get_settings
from app.core.database import init_db, get_db, SessionLocal
from app.api.v1.endpoints import router as api_router
from app.services.players import update_player_database
from app.services.standings import update_standings_database
# Import these from your scoreboard service (restores old approach)
from app.services.scoreboard import scoreboard_manager, get_live_scoreboard

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan events for database initialization and data updates."""
    settings = get_settings()

    # 1) Initialize DB
    init_db()

    # 2) Update player data + standings if not in testing mode
    if not settings.TESTING:
        db = SessionLocal()
        try:
            await update_player_database(db)
            await update_standings_database(db)
        finally:
            db.close()

    # 3) Start background scoreboard task
    scoreboard_task = asyncio.create_task(fetch_scoreboard_updates())

    yield  # Application is running

    # 4) Cleanup
    scoreboard_task.cancel()
    try:
        await scoreboard_task
    except asyncio.CancelledError:
        pass

def create_app() -> FastAPI:
    """Create and configure the FastAPI application."""
    settings = get_settings()

    app = FastAPI(
        title="NBA Scoreboard API",
        description="FastAPI backend for NBA scores and statistics",
        version="1.0.0",
        lifespan=lifespan,
        docs_url=None,   # Disable default /docs
        redoc_url=None   # Disable default /redoc
    )

    # Configure CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"]
    )

    # Custom docs endpoints
    @app.get("/docs", include_in_schema=False)
    async def custom_swagger_ui_html():
        return get_swagger_ui_html(
            openapi_url=app.openapi_url,
            title=app.title + " - Swagger UI",
            oauth2_redirect_url=app.swagger_ui_oauth2_redirect_url,
        )

    @app.get("/redoc", include_in_schema=False)
    async def redoc_html():
        return get_redoc_html(
            openapi_url=app.openapi_url,
            title=app.title + " - ReDoc",
        )

    # Include API routers
    app.include_router(api_router, prefix="/api/v1")

    return app

async def fetch_scoreboard_updates():
    """Background task to periodically fetch the live scoreboard and broadcast updates."""
    while True:
        try:
            # Fetch live scoreboard from services/scoreboard.py
            games_response = await get_live_scoreboard()
            # Broadcast just the "games" array in that ScoreboardResponse
            await scoreboard_manager.broadcast(games_response.dict()["games"])

            # Sleep briefly before the next update
            await asyncio.sleep(1)
        except Exception as e:
            logger.error(f"Error in scoreboard update task: {e}")
            # Sleep longer on error
            await asyncio.sleep(5)

app = create_app()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
