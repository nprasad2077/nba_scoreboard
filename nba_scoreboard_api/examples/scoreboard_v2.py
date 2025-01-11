import pandas as pd
from nba_api.live.nba.endpoints import scoreboard, boxscore
from datetime import timezone
from dateutil import parser
import re
import time
import os

def format_time(quarter, time):
    match = re.match(r"PT(?:(\d+)M)?(?:(\d+)(?:\.\d+)?S)?", time)
    if match:
        minutes = match.group(1) or "0"
        seconds = match.group(2) or "0"
        formatted_time = f"{int(minutes)}:{int(seconds):02d}"
        return f"{quarter}Q {formatted_time}"

def parse_game_time(time_str):
    # Extract quarter and time
    quarter = int(time_str.split('Q')[0])
    time_parts = time_str.split(' ')[1].split(':')
    minutes = int(time_parts[0])
    seconds = int(time_parts[1])
    
    # Special handling for finished games
    if minutes == 0 and seconds == 0:
        return -1  # Will sort to bottom
    
    # Convert to sortable value for active games
    # Multiply quarter by negative to sort in descending order
    return (-quarter * 10000) + (minutes * 60 + seconds)

def get_live_scores():
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
            "Away Team": f"{away_stats['teamCity']} {away_stats['teamName']}",
            "Score": f"{away_stats['statistics']['points']} - {home_stats['statistics']['points']}",
            "Home Team": f"{home_stats['teamCity']} {home_stats['teamName']}",
            "Time": formatted_time,
            "Sort_Value": parse_game_time(formatted_time)
        })
    
    df = pd.DataFrame(game_data)
    # Sort by Sort_Value in ascending order
    df = df.sort_values('Sort_Value', ascending=True).drop('Sort_Value', axis=1)
    return df

def clear_console():
    os.system('cls' if os.name == 'nt' else 'clear')

def auto_refresh_scores(refresh_interval=30):
    try:
        while True:
            clear_console()
            df = get_live_scores()
            
            print("\nNBA Live Scores (Updates every 30 seconds)")
            print("=" * 80)
            
            if len(df) > 0:
                pd.set_option('display.max_columns', None)
                pd.set_option('display.width', None)
                pd.set_option('display.max_colwidth', None)
                pd.set_option('display.colheader_justify', 'center')
                
                # Add padding to make columns wider
                df = df.rename(columns=lambda x: f" {x} ")
                
                print(df.to_string(index=False))
            else:
                print("\nNo games currently in progress")
            
            print("\nPress Ctrl+C to stop updates")
            time.sleep(refresh_interval)
            
    except KeyboardInterrupt:
        print("\nStopped refreshing scores")

if __name__ == "__main__":
    auto_refresh_scores()