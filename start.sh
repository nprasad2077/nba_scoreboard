#!/bin/sh
# Set up error handling
set -e

# Debug: Print current directory
echo "Current directory: $(pwd)"
echo "Listing directories:"
ls -la /app

# Start the FastAPI backend with proper directory
cd /app/nba_scoreboard_api/api
echo "Starting FastAPI backend in $(pwd)"
export PYTHONPATH=/app/nba_scoreboard_api/api
python3 -m uvicorn main:app --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!

# Wait a moment to ensure backend starts
sleep 2

# Check if backend process is still running
if ! ps -p $BACKEND_PID > /dev/null; then
  echo "ERROR: Backend failed to start! Logs:"
  cat /tmp/backend.log
  exit 1
fi

# Serve static files
echo "Starting static file server"
if [ -d "/app/nba_scoreboard_api/static" ]; then
  cd /app/nba_scoreboard_api/static
  python3 -m http.server 3000
else
  echo "Warning: Static directory not found at /app/nba_scoreboard_api/static"
  echo "Looking for alternative static directories..."
  find /app -name "static" -type d
  
  # Check if there's a dist directory from the frontend build
  if [ -d "/app/nba_scoreboard_api/static" ]; then
    cd /app/nba_scoreboard_api/static
    python3 -m http.server 3000
  else
    echo "Error: No static files found to serve!"
    # Kill the backend process before exiting
    kill $BACKEND_PID
    exit 1
  fi
fi
EOF