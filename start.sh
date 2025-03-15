#!/bin/sh
set -e

# Try to install alembic if missing
pip install alembic || echo "Failed to install alembic, may already be installed"

# Start the FastAPI backend using uvicorn
cd /app/nba_scoreboard_api/api
python3 -m uvicorn main:app --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!

# Wait a bit for backend to initialize
sleep 5

# Check if backend is still running
if ! ps -p $BACKEND_PID > /dev/null; then
  echo "Warning: Backend failed to start properly, but continuing with frontend"
fi

# Serve static files for the frontend
cd /app/nba_scoreboard_api/static
python3 -m http.server 3000