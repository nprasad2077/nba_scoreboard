#!/bin/sh
set -e

# First make sure alembic is properly installed
pip install --force-reinstall alembic>=1.12.0

# Set environment variables for more resilient startup
export NBA_API_TIMEOUT=60
export TESTING=true  # Skip initial NBA API calls for startup

# Start the FastAPI backend using uvicorn
cd /app/nba_scoreboard_api/api
python3 -m uvicorn main:app --host 0.0.0.0 --port 8000 &

# Wait a bit for backend to initialize
sleep 5

# Serve static files for the frontend
cd /app/nba_scoreboard_api/static
python3 -m http.server 3000