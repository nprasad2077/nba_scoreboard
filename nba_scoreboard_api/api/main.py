# main.py
import asyncio
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.openapi.docs import get_swagger_ui_html, get_redoc_html
import logging
import time
import copy
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
        docs_url=None,  # Disable default /docs
        redoc_url=None,  # Disable default /redoc
    )

    # Configure CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
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
    """
    Background task to periodically fetch the live scoreboard and broadcast updates.
    Enhanced with additional safeguards against fluctuating data.
    """
    logger.info("Starting scoreboard update background task")
    settings = get_settings()
    
    # Simple adaptive polling
    base_interval = 1.0
    current_interval = base_interval
    max_interval = 3.0
    min_interval = 0.5
    
    while True:
        try:
            # Fetch live scoreboard from services/scoreboard.py
            games_response = await get_live_scoreboard()
            
            # Convert to dict for easier manipulation
            games_data = games_response.model_dump()
            
            # Let the scoreboard manager handle validation and broadcasting
            # The manager will now process each game individually and maintain
            # a consistent view of all games
            was_broadcast = await scoreboard_manager.broadcast(games_data["games"])
            
            if was_broadcast:
                logger.debug(f"Broadcast scoreboard update with {len(games_data['games'])} games")
                # Decrease interval slightly on successful broadcast for more responsive updates
                current_interval = max(min_interval, current_interval * 0.9)
            else:
                # Increase interval slightly when no changes to reduce polling
                current_interval = min(max_interval, current_interval * 1.1)
                
            # Sleep before the next update (use dynamic interval)
            await asyncio.sleep(current_interval)
        except Exception as e:
            logger.error(f"Error in scoreboard update task: {e}")
            # Sleep longer on error
            await asyncio.sleep(5)

def are_responses_equal(resp1, resp2):
    """
    Compare two scoreboard responses to check if they represent the same game state.
    Only compares the essential fields that would affect the display.
    
    Args:
        resp1: First response dict
        resp2: Second response dict
        
    Returns:
        True if the responses represent the same game state, False otherwise
    """
    if "games" not in resp1 or "games" not in resp2:
        return False
        
    if len(resp1["games"]) != len(resp2["games"]):
        return False
        
    # Create maps for faster comparison
    games1 = {g["game_id"]: g for g in resp1["games"]}
    games2 = {g["game_id"]: g for g in resp2["games"]}
    
    if set(games1.keys()) != set(games2.keys()):
        return False
        
    # Compare each game
    for game_id, game1 in games1.items():
        game2 = games2[game_id]
        
        # Compare essential fields
        if (game1["game_status"] != game2["game_status"] or
                game1["period"] != game2["period"] or
                game1["home_team"]["score"] != game2["home_team"]["score"] or
                game1["away_team"]["score"] != game2["away_team"]["score"]):
            return False
            
    return True

app = create_app()

if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
