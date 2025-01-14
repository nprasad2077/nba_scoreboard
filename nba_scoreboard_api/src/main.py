from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict, Optional
import pandas as pd
from nba_api.live.nba.endpoints import scoreboard, boxscore
import re
from datetime import datetime, timezone
from dateutil import parser
import pytz
import uvicorn
from pydantic import BaseModel
import argparse
import os

app = FastAPI(
    title="NBA Live Scores API",
    description="API that provides live NBA game scores and statistics",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class GameScore(BaseModel):
    away_team: str
    away_tricode: str
    score: str
    home_team: str
    home_tricode: str
    time: str

def format_time(quarter: int, time: str) -> str:
    if time is None:
        return "Not Started"
    
    match = re.match(r"PT(?:(\d+)M)?(?:(\d+)(?:\.\d+)?S)?", time)
    if match:
        minutes = match.group(1) or "0"
        seconds = match.group(2) or "0"
        formatted_time = f"{int(minutes)}:{int(seconds):02d}"
        return f"{quarter}Q {formatted_time}"
    return "Invalid Time"

def parse_game_time(time_str: str) -> int:
    if time_str == "Not Started":
        return 999999  # Place "Not Started" games at the end
        
    try:
        quarter = int(time_str.split('Q')[0])
        time_parts = time_str.split(' ')[1].split(':')
        minutes = int(time_parts[0])
        seconds = int(time_parts[1])
        
        if minutes == 0 and seconds == 0:
            return -1
        
        return (-quarter * 10000) + (minutes * 60 + seconds)
    except:
        return 999999  # Handle any parsing errors by placing at the end

def format_game_start_time(game_time_utc: str, tz_name: Optional[str] = None) -> str:
    """
    Format game start time according to specified timezone
    
    Args:
        game_time_utc: UTC time string
        tz_name: Timezone name (e.g., 'America/Chicago')
    
    Returns:
        Formatted time string in the specified timezone
    """
    try:
        # Parse the UTC time
        game_time = parser.parse(game_time_utc).replace(tzinfo=timezone.utc)
        
        if tz_name:
            try:
                # Convert to specified timezone
                local_tz = pytz.timezone(tz_name)
                game_time = game_time.astimezone(local_tz)
            except pytz.exceptions.UnknownTimeZoneError:
                # Fall back to system timezone if specified timezone is invalid
                game_time = game_time.astimezone()
        else:
            # Use system timezone if none specified
            game_time = game_time.astimezone()
            
        return game_time.strftime("%I:%M %p")
    
    except Exception as e:
        return "Time Unknown"

def get_live_scores(timezone: Optional[str] = None) -> List[Dict]:
    try:
        board = scoreboard.ScoreBoard()
        games = board.games.get_dict()
        game_data = []
        
        for game in games:
            gameId = game['gameId']
            
            try:
                # Attempt to get live game data
                box = boxscore.BoxScore(gameId)
                game_details = box.game.get_dict()
                
                current_time = game_details['gameClock']
                current_quarter = game_details['period']
                
                home_stats = box.home_team_stats.get_dict()
                away_stats = box.away_team_stats.get_dict()
                
                formatted_time = format_time(current_quarter, current_time)
                
                game_data.append({
                    "away_team": f"{away_stats['teamCity']} {away_stats['teamName']}",
                    "away_tricode": away_stats['teamTricode'],
                    "score": f"{away_stats['statistics']['points']} - {home_stats['statistics']['points']}",
                    "home_team": f"{home_stats['teamCity']} {home_stats['teamName']}",
                    "home_tricode": home_stats['teamTricode'],
                    "time": formatted_time
                })
                
            except Exception as game_error:
                # If we can't get live data, use scheduled game info
                start_time = format_game_start_time(game['gameTimeUTC'], timezone)
                
                game_data.append({
                    "away_team": f"{game['awayTeam']['teamCity']} {game['awayTeam']['teamName']}",
                    "away_tricode": game['awayTeam']['teamTricode'],
                    "score": "0 - 0",
                    "home_team": f"{game['homeTeam']['teamCity']} {game['homeTeam']['teamName']}",
                    "home_tricode": game['homeTeam']['teamTricode'],
                    "time": f"Start: {start_time}"
                })
        
        # Sort games by time, with scheduled games at the end
        game_data.sort(key=lambda x: parse_game_time(x["time"]))
        return game_data
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/", response_model=List[GameScore])
async def read_scores(timezone: Optional[str] = Query(None, description="Timezone (e.g., 'America/Chicago')")):
    """
    Get current NBA live scores
    
    Parameters:
        timezone: Optional timezone name (e.g., 'America/Chicago', 'America/New_York')
    
    Returns:
        List[GameScore]: A list of all current NBA games with scores
    """
    return get_live_scores(timezone)

@app.get("/health")
async def health_check():
    """
    Health check endpoint
    
    Returns:
        dict: Status of the API
    """
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat()
    }


def parse_args():
    parser = argparse.ArgumentParser(description='NBA Live Scores API')
    parser.add_argument('--port', type=int, default=int(os.environ.get('PORT', 8080)))
    return parser.parse_args()

if __name__ == "__main__":
    args = parse_args()
    uvicorn.run(app, host="0.0.0.0", port=args.port)