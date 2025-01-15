from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict, Optional, Union
import pandas as pd
from nba_api.live.nba.endpoints import scoreboard, boxscore
import re
from datetime import datetime, timezone
from dateutil import parser
import pytz
import uvicorn
from pydantic import BaseModel, Field

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

class PlayerStatistics(BaseModel):
    assists: int = Field(default=0)
    blocks: int = Field(default=0)
    blocksReceived: int = Field(default=0)
    fieldGoalsAttempted: int = Field(default=0)
    fieldGoalsMade: int = Field(default=0)
    fieldGoalsPercentage: float = Field(default=0.0)
    foulsOffensive: int = Field(default=0)
    foulsDrawn: int = Field(default=0)
    foulsPersonal: int = Field(default=0)
    foulsTechnical: int = Field(default=0)
    freeThrowsAttempted: int = Field(default=0)
    freeThrowsMade: int = Field(default=0)
    freeThrowsPercentage: float = Field(default=0.0)
    minutes: str = Field(default="0")
    plusMinusPoints: int = Field(default=0)
    points: int = Field(default=0)
    reboundsDefensive: int = Field(default=0)
    reboundsOffensive: int = Field(default=0)
    reboundsTotal: int = Field(default=0)
    steals: int = Field(default=0)
    threePointersAttempted: int = Field(default=0)
    threePointersMade: int = Field(default=0)
    threePointersPercentage: float = Field(default=0.0)
    turnovers: int = Field(default=0)

class PlayerData(BaseModel):
    name: str
    position: Optional[str] = ""
    starter: bool = False
    oncourt: bool = False
    jerseyNum: str = ""
    status: str = ""
    statistics: PlayerStatistics

class TeamBoxScore(BaseModel):
    teamName: str
    teamCity: str
    teamTricode: str
    players: List[PlayerData]

class GameBoxScore(BaseModel):
    gameId: str
    home_team: TeamBoxScore
    away_team: TeamBoxScore

class GameScore(BaseModel):
    away_team: str
    away_tricode: str
    score: str
    home_team: str
    home_tricode: str
    time: str
    gameId: str

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
    try:
        game_time = parser.parse(game_time_utc).replace(tzinfo=timezone.utc)
        
        if tz_name:
            try:
                local_tz = pytz.timezone(tz_name)
                game_time = game_time.astimezone(local_tz)
            except pytz.exceptions.UnknownTimeZoneError:
                game_time = game_time.astimezone()
        else:
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
                    "time": formatted_time,
                    "gameId": gameId
                })
                
            except Exception as game_error:
                start_time = format_game_start_time(game['gameTimeUTC'], timezone)
                
                game_data.append({
                    "away_team": f"{game['awayTeam']['teamCity']} {game['awayTeam']['teamName']}",
                    "away_tricode": game['awayTeam']['teamTricode'],
                    "score": "0 - 0",
                    "home_team": f"{game['homeTeam']['teamCity']} {game['homeTeam']['teamName']}",
                    "home_tricode": game['homeTeam']['teamTricode'],
                    "time": f"Start: {start_time}",
                    "gameId": gameId
                })
        
        game_data.sort(key=lambda x: parse_game_time(x["time"]))
        return game_data
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def get_box_score(game_id: str) -> GameBoxScore:
    try:
        box = boxscore.BoxScore(game_id)
        
        # Process home team players
        home_players = []
        for player in box.home_team_player_stats.get_dict():
            home_players.append(PlayerData(
                name=player.get('name', ''),
                position=player.get('position', ''),
                starter=player.get('starter', False),
                oncourt=player.get('oncourt', False),
                jerseyNum=player.get('jerseyNum', ''),
                status=player.get('status', ''),
                statistics=PlayerStatistics(**player.get('statistics', {}))
            ))
        
        # Process away team players
        away_players = []
        for player in box.away_team_player_stats.get_dict():
            away_players.append(PlayerData(
                name=player.get('name', ''),
                position=player.get('position', ''),
                starter=player.get('starter', False),
                oncourt=player.get('oncourt', False),
                jerseyNum=player.get('jerseyNum', ''),
                status=player.get('status', ''),
                statistics=PlayerStatistics(**player.get('statistics', {}))
            ))
        
        home_team = box.home_team_stats.get_dict()
        away_team = box.away_team_stats.get_dict()
        
        return GameBoxScore(
            gameId=game_id,
            home_team=TeamBoxScore(
                teamName=home_team['teamName'],
                teamCity=home_team['teamCity'],
                teamTricode=home_team['teamTricode'],
                players=home_players
            ),
            away_team=TeamBoxScore(
                teamName=away_team['teamName'],
                teamCity=away_team['teamCity'],
                teamTricode=away_team['teamTricode'],
                players=away_players
            )
        )
        
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

@app.get("/boxscore/{game_id}", response_model=GameBoxScore)
async def read_box_score(game_id: str):
    """
    Get box score for a specific game
    
    Parameters:
        game_id: The ID of the game to get box score for
    
    Returns:
        GameBoxScore: Detailed box score statistics for the specified game
    """
    return get_box_score(game_id)

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