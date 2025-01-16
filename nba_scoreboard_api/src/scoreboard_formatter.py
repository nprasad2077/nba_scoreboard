from datetime import datetime
import pytz
from typing import List, Dict
import re
from dateutil import parser

def format_time(quarter: int, time: str) -> str:
    """Format game time in the required format"""
    if time is None:
        return "0Q 0:00"
    
    match = re.match(r"PT(?:(\d+)M)?(?:(\d+)(?:\.\d+)?S)?", time)
    if match:
        minutes = int(match.group(1) or "0")
        seconds = int(match.group(2) or "0")
        return f"{quarter}Q {minutes}:{seconds:02d}"
    return "0Q 0:00"

def format_start_time(game_time_utc: str, timezone: str = "America/New_York") -> str:
    """Format game start time in the required format"""
    try:
        game_time = parser.parse(game_time_utc).replace(tzinfo=pytz.UTC)
        local_tz = pytz.timezone(timezone)
        local_time = game_time.astimezone(local_tz)
        return f"Start: {local_time.strftime('%I:%M %p')}"
    except Exception:
        return "Start: Time TBD"

def format_scoreboard_data(games_data: List[Dict]) -> List[Dict]:
    """Format games data to match required structure"""
    formatted_games = []
    
    for game in games_data:
        # Extract basic team information
        home_team = game.get('homeTeam', {})
        away_team = game.get('awayTeam', {})
        
        # Determine game status and time
        game_status = game.get('gameStatus', 1)  # 1=Not Started, 2=In Progress, 3=Final
        
        if game_status == 1:
            # Game hasn't started
            time_display = format_start_time(game.get('gameTimeUTC', ''))
            score = "0 - 0"
        else:
            # Game in progress or finished
            current_period = game.get('period', 0)
            game_clock = game.get('gameClock', 'PT00M00S')
            time_display = format_time(current_period, game_clock)
            
            home_score = home_team.get('score', 0)
            away_score = away_team.get('score', 0)
            score = f"{away_score} - {home_score}"

        formatted_game = {
            "away_team": f"{away_team.get('teamCity', '')} {away_team.get('teamName', '')}".strip(),
            "away_tricode": away_team.get('teamTricode', ''),
            "score": score,
            "home_team": f"{home_team.get('teamCity', '')} {home_team.get('teamName', '')}".strip(),
            "home_tricode": home_team.get('teamTricode', ''),
            "time": time_display
        }
        
        formatted_games.append(formatted_game)
    
    return formatted_games

def format_game_update(update_data: Dict) -> Dict:
    """Format individual game update data"""
    if not update_data:
        return {}
        
    game_data = update_data.get('game', {})
    home_team = update_data.get('homeTeam', {})
    away_team = update_data.get('awayTeam', {})
    
    return {
        "away_team": f"{away_team.get('teamCity', '')} {away_team.get('teamName', '')}".strip(),
        "away_tricode": away_team.get('teamTricode', ''),
        "score": f"{away_team.get('statistics', {}).get('points', 0)} - {home_team.get('statistics', {}).get('points', 0)}",
        "home_team": f"{home_team.get('teamCity', '')} {home_team.get('teamName', '')}".strip(),
        "home_tricode": home_team.get('teamTricode', ''),
        "time": format_time(game_data.get('period', 0), game_data.get('gameClock', None))
    }