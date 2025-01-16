import asyncio
import websockets
import json
from datetime import datetime
import logging
from rich.console import Console
from rich.table import Table
from rich.live import Live
from rich import box
import sys

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize Rich console
console = Console()

class NBAScoreboardClient:
    def __init__(self, uri="ws://localhost:8000/ws"):
        self.uri = uri
        self.games = []
        self.last_update = None
        self.console = Console()

    def create_table(self):
        """Create a formatted table of games"""
        table = Table(
            title=f"NBA Live Scoreboard (Last Update: {self.last_update})",
            box=box.ROUNDED,
            show_header=True,
            header_style="bold magenta"
        )
        
        # Add columns
        table.add_column("Away Team", style="cyan", width=20)
        table.add_column("Score", justify="center", style="green", width=10)
        table.add_column("Home Team", style="cyan", width=20)
        table.add_column("Time", justify="right", style="yellow", width=15)

        # Sort games by time
        def sort_key(game):
            time = game.get('time', '')
            
            # Helper function to convert quarter to numeric value
            def get_quarter_value(time_str):
                if 'Q' in time_str:
                    return int(time_str.split('Q')[0])
                return 0
            
            # Helper function to convert time to seconds
            def get_time_seconds(time_str):
                if ':' in time_str:
                    minutes, seconds = map(int, time_str.split(':'))
                    return minutes * 60 + seconds
                return 0
            
            if 'Q' in time:
                # Split time into quarter and clock time
                quarter_part = time.split()[0]
                time_part = time.split()[1]
                
                quarter = get_quarter_value(quarter_part)
                seconds = get_time_seconds(time_part)
                
                # Return tuple: (priority=0 for active games, negative quarter for desc order, seconds ascending)
                return (0, -quarter, -seconds)  # Changed to -quarter to reverse quarter order
            elif time.startswith('Start:'):
                # Priority=1 for upcoming games, then sort by start time
                start_time = time.split('Start: ')[1]
                return (1, start_time)
            else:
                # Priority=2 for any other cases
                return (2, time)
        

        sorted_games = sorted(self.games, key=sort_key)
        
        # Add rows
        for game in sorted_games:
            away = f"{game['away_tricode']} {game['away_team']}"
            home = f"{game['home_tricode']} {game['home_team']}"
            table.add_row(
                away,
                game['score'],
                home,
                game['time']
            )
        
        return table

    async def display_updates(self):
        """Display live updates in the terminal"""
        with Live(self.create_table(), refresh_per_second=1) as live:
            while True:
                live.update(self.create_table())
                await asyncio.sleep(1)

    async def connect(self):
        """Connect to WebSocket and handle messages"""
        while True:
            try:
                async with websockets.connect(self.uri) as websocket:
                    console.print(f"[green]Connected to {self.uri}[/green]")
                    
                    # Start display task
                    display_task = asyncio.create_task(self.display_updates())
                    
                    while True:
                        try:
                            message = await websocket.recv()
                            data = json.loads(message)
                            self.games = data
                            self.last_update = datetime.now().strftime("%H:%M:%S")
                            
                        except websockets.ConnectionClosed:
                            console.print("[yellow]Connection closed, attempting to reconnect...[/yellow]")
                            break
                        except Exception as e:
                            console.print(f"[red]Error processing message: {e}[/red]")
                            continue
                    
                    # Cancel display task when connection is closed
                    display_task.cancel()
                    
            except Exception as e:
                console.print(f"[red]Connection error: {e}[/red]")
                await asyncio.sleep(5)  # Wait before reconnecting

async def main():
    client = NBAScoreboardClient()
    await client.connect()

if __name__ == "__main__":
    try:
        # Print initial message
        console.print("[bold blue]NBA Scoreboard WebSocket Client[/bold blue]")
        console.print("Press Ctrl+C to exit\n")
        
        # Run the client
        asyncio.run(main())
    except KeyboardInterrupt:
        console.print("\n[yellow]Shutting down...[/yellow]")
        sys.exit(0)