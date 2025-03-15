#!/bin/sh
set -e

# Make sure alembic is properly installed
pip install --force-reinstall alembic

# Set the correct Python path
export PYTHONPATH=/app/nba_scoreboard_api/api

# Create the data directory if it doesn't exist
mkdir -p /app/nba_scoreboard_api/api/data

# Start the FastAPI backend
cd /app/nba_scoreboard_api/api
python3 -m uvicorn main:app --host 0.0.0.0 --port 8000 &

# Wait a bit for backend to initialize
sleep 5

# Serve static files for the frontend
cd /app/nba_scoreboard_api/static
python3 -m http.server 3000