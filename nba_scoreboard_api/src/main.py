from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict
import pandas as pd
from nba_api.live.nba.endpoints import scoreboard, boxscore
import re
from datetime import datetime
import uvicorn
from pydantic import BaseModel

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
    score: str
    home_team: str
    time: str

def format_time(quarter: int, time: str) -> str:
    match = re.match(r"PT(?:(\d+)M)?(?:(\d+)(?:\.\d+)?S)?", time)
    if match:
        minutes = match.group(1) or "0"
        seconds = match.group(2) or "0"
        formatted_time = f"{int(minutes)}:{int(seconds):02d}"
        return f"{quarter}Q {formatted_time}"
    return "Invalid Time"

def parse_game_time(time_str: str) -> int:
    quarter = int(time_str.split('Q')[0])
    time_parts = time_str.split(' ')[1].split(':')
    minutes = int(time_parts[0])
    seconds = int(time_parts[1])
    
    if minutes == 0 and seconds == 0:
        return -1
    
    return (-quarter * 10000) + (minutes * 60 + seconds)

def get_live_scores() -> List[Dict]:
    try:
        board = scoreboard.ScoreBoard()
        games = board.games.get_dict()
        game_data = []
        
        for game in games:
            gameId = game['gameId']
            box = boxscore.BoxScore(gameId)
            game_details = box.game.get_dict()
            
            current_time = game_details['gameClock'] or "PT00M00.00S"
            current_quarter = game_details['period']
            
            home_stats = box.home_team_stats.get_dict()
            away_stats = box.away_team_stats.get_dict()
            
            formatted_time = format_time(current_quarter, current_time)
            
            game_data.append({
                "away_team": f"{away_stats['teamCity']} {away_stats['teamName']}",
                "score": f"{away_stats['statistics']['points']} - {home_stats['statistics']['points']}",
                "home_team": f"{home_stats['teamCity']} {home_stats['teamName']}",
                "time": formatted_time
            })
        
        # Sort games by time
        game_data.sort(key=lambda x: parse_game_time(x["time"]))
        return game_data
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/", response_model=List[GameScore])
async def read_scores():
    """
    Get current NBA live scores
    
    Returns:
        List[GameScore]: A list of all current NBA games with scores
    """
    return get_live_scores()

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

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)