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
import random

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
    Enhanced with improved error handling, adaptive polling, and exponential backoff.
    """
    logger.info("Starting scoreboard update background task")
    settings = get_settings()
    
    # Configure adaptive polling
    base_interval = 1.0  # Start with 1 second between updates
    min_interval = 0.5   # Never poll faster than 0.5 seconds
    max_interval = 5.0   # Never poll slower than 5 seconds
    current_interval = base_interval
    
    # Exponential backoff for errors
    error_backoff = 1.0
    max_error_backoff = 60.0  # Maximum 60 seconds between retries on error
    consecutive_errors = 0
    
    # Counters for stats
    update_count = 0
    error_count = 0
    broadcast_count = 0
    
    while True:
        try:
            # Fetch live scoreboard from NBA API
            start_time = time.time()
            games_response = await get_live_scoreboard()
            fetch_time = time.time() - start_time
            
            update_count += 1
            
            # Log periodic statistics every 100 updates
            if update_count % 100 == 0:
                logger.info(
                    f"Scoreboard stats: {update_count} updates, {broadcast_count} broadcasts, "
                    f"{error_count} errors, current interval: {current_interval:.2f}s"
                )
            
            # Convert to dict for easier manipulation
            games_data = games_response.model_dump()
            
            # Let the scoreboard manager handle validation and broadcasting
            broadcast_start = time.time()
            was_broadcast = await scoreboard_manager.broadcast(games_data["games"])
            broadcast_time = time.time() - broadcast_start
            
            if was_broadcast:
                broadcast_count += 1
                logger.debug(
                    f"Broadcast update with {len(games_data['games'])} games "
                    f"(fetch: {fetch_time:.3f}s, process: {broadcast_time:.3f}s)"
                )
                
                # Decrease interval slightly for more responsive updates
                # but don't go below the minimum
                current_interval = max(min_interval, current_interval * 0.95)
            else:
                # Increase interval slightly when no changes
                # but don't go above the maximum
                current_interval = min(max_interval, current_interval * 1.05)
            
            # Reset error count and backoff on successful update
            consecutive_errors = 0
            error_backoff = 1.0
            
            # Sleep before next update
            await asyncio.sleep(current_interval)
            
        except asyncio.CancelledError:
            # Task is being cancelled, exit cleanly
            logger.info("Scoreboard update task cancelled")
            break
            
        except Exception as e:
            error_count += 1
            consecutive_errors += 1
            
            # Log the error with severity based on consecutive count
            if consecutive_errors <= 3:
                logger.warning(f"Error in scoreboard update task: {e}")
            else:
                logger.error(
                    f"Persistent error in scoreboard update task (#{consecutive_errors}): {e}"
                )
                
            # Apply exponential backoff with jitter for retries
            retry_delay = min(max_error_backoff, error_backoff)
            retry_delay = retry_delay * (0.8 + 0.4 * random.random())  # Add jitter
            error_backoff = min(max_error_backoff, error_backoff * 1.5)
            
            logger.info(f"Retrying in {retry_delay:.1f} seconds")
            await asyncio.sleep(retry_delay)


def are_responses_equal(resp1, resp2):
    """
    Compare two scoreboard responses to check if they represent the same game state.
    This improved implementation handles more edge cases and performs deeper comparison.

    Args:
        resp1: First response dict
        resp2: Second response dict

    Returns:
        True if the responses represent the same game state, False otherwise
    """
    # Handle None cases
    if resp1 is None or resp2 is None:
        return resp1 is None and resp2 is None

    # Check if both have the games key
    if "games" not in resp1 or "games" not in resp2:
        return False

    # Different number of games means they're not equal
    if len(resp1["games"]) != len(resp2["games"]):
        return False

    # Create maps for faster comparison
    games1 = {str(g.get("game_id", g.get("gameId", ""))): g for g in resp1["games"]}
    games2 = {str(g.get("game_id", g.get("gameId", ""))): g for g in resp2["games"]}

    # Different set of game IDs means they're not equal
    if set(games1.keys()) != set(games2.keys()):
        return False

    # Compare each game
    for game_id, game1 in games1.items():
        game2 = games2[game_id]

        # Compare essential fields

        # Game status
        status1 = game1.get("game_status", game1.get("gameStatus", 0))
        status2 = game2.get("game_status", game2.get("gameStatus", 0))
        if status1 != status2:
            return False

        # Period
        period1 = game1.get("period", 0)
        period2 = game2.get("period", 0)
        if period1 != period2:
            return False

        # Team scores - normalize access paths
        home_score1 = game1.get("home_team", {}).get(
            "score", game1.get("homeTeam", {}).get("score", 0)
        )
        home_score2 = game2.get("home_team", {}).get(
            "score", game2.get("homeTeam", {}).get("score", 0)
        )
        if home_score1 != home_score2:
            return False

        away_score1 = game1.get("away_team", {}).get(
            "score", game1.get("awayTeam", {}).get("score", 0)
        )
        away_score2 = game2.get("away_team", {}).get(
            "score", game2.get("awayTeam", {}).get("score", 0)
        )
        if away_score1 != away_score2:
            return False

        # Clock comparison
        clock1 = game1.get("clock", game1.get("gameClock", None))
        clock2 = game2.get("clock", game2.get("gameClock", None))

        # If the clocks are both for in-progress games, compare them properly
        if status1 == 2 and clock1 and clock2:
            # Parse clocks to seconds for comparison
            from app.services.scoreboard import parse_game_clock

            secs1 = parse_game_clock(clock1)
            secs2 = parse_game_clock(clock2)

            # If both clocks can be parsed, compare with a small tolerance
            if secs1 is not None and secs2 is not None:
                # Consider clocks equal if within 1 second of each other
                if abs(secs1 - secs2) > 1.0:
                    return False
            else:
                # If either clock can't be parsed, compare as strings
                if clock1 != clock2:
                    return False
        # For non-in-progress games, compare clocks exactly
        elif clock1 != clock2:
            # But allow None and empty string to be equivalent
            if not (
                (clock1 is None and (clock2 == "" or clock2 is None))
                or (clock2 is None and (clock1 == "" or clock1 is None))
            ):
                return False

    return True


app = create_app()

if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
