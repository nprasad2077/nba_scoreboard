import sqlite3
import requests
import os
import time
from pathlib import Path
import logging
from urllib.parse import urljoin

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('headshots_download.log'),
        logging.StreamHandler()
    ]
)

class NBAHeadshotDownloader:
    def __init__(self, db_path, output_dir='headshots', delay=1.0):
        """
        Initialize the downloader with database path and configuration.
        
        Args:
            db_path (str): Path to SQLite database
            output_dir (str): Directory to save downloaded images
            delay (float): Delay between requests in seconds
        """
        self.db_path = db_path
        self.output_dir = Path(output_dir)
        self.delay = delay
        self.base_url = "https://cdn.nba.com/headshots/nba/latest/1040x760/"
        
        # Create output directory if it doesn't exist
        self.output_dir.mkdir(parents=True, exist_ok=True)
    
    def get_players(self):
        """Fetch all players from the database."""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        try:
            cursor.execute("SELECT person_id, display_name, team_abbreviation FROM players")
            return cursor.fetchall()
        finally:
            conn.close()
    
    def download_headshot(self, person_id, player_name, team):
        """
        Download headshot for a specific player.
        
        Args:
            person_id (int): Player's NBA person ID
            player_name (str): Player's display name
            team (str): Team abbreviation
        
        Returns:
            bool: True if download successful, False otherwise
        """
        url = urljoin(self.base_url, f"{person_id}.png")
        filename = f"{person_id}_{player_name.replace(' ', '_')}_{team}.png"
        filepath = self.output_dir / filename
        
        # Skip if file already exists
        if filepath.exists():
            logging.info(f"Skipping {player_name} - file already exists")
            return True
        
        try:
            response = requests.get(url, timeout=10)
            response.raise_for_status()
            
            # Check if we actually got an image
            if response.headers.get('content-type') != 'image/png':
                logging.warning(f"Invalid content type for {player_name}")
                return False
            
            # Save the image
            with open(filepath, 'wb') as f:
                f.write(response.content)
            
            logging.info(f"Successfully downloaded headshot for {player_name}")
            return True
            
        except requests.exceptions.RequestException as e:
            logging.error(f"Error downloading {player_name}'s headshot: {str(e)}")
            return False
    
    def download_all(self):
        """Download headshots for all players in the database."""
        players = self.get_players()
        total = len(players)
        successful = 0
        failed = 0
        
        logging.info(f"Starting download of {total} player headshots")
        
        for i, (person_id, name, team) in enumerate(players, 1):
            logging.info(f"Processing {i}/{total}: {name}")
            
            if self.download_headshot(person_id, name, team):
                successful += 1
            else:
                failed += 1
            
            # Sleep to avoid overwhelming the server
            time.sleep(self.delay)
        
        logging.info(f"Download complete. Successful: {successful}, Failed: {failed}")
        return successful, failed

def main():
    # Configure these variables as needed
    DB_PATH = "../data/nba_players_1.db"  # Path to your SQLite database
    OUTPUT_DIR = "../data/player_images"  # Directory where images will be saved
    DELAY = 1.5  # Delay between requests in seconds
    
    downloader = NBAHeadshotDownloader(
        db_path=DB_PATH,
        output_dir=OUTPUT_DIR,
        delay=DELAY
    )
    
    successful, failed = downloader.download_all()
    
    print(f"\nDownload Summary:")
    print(f"Successful downloads: {successful}")
    print(f"Failed downloads: {failed}")

if __name__ == "__main__":
    main()