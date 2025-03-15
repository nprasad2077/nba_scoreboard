  #!/bin/sh
  # Start the FastAPI backend using uvicorn (with PYTHONPATH set)
  python3 -m uvicorn main:app --host 0.0.0.0 --port 8000 &

  # Serve static files (if available) using Python's built-in HTTP server
  if [ -d "nba_scoreboard_api/static" ]; then
    cd nba_scoreboard_api/static
    python3 -m http.server 3000
  else
    echo "Warning: Static directory not found. Frontend assets may not be available."
    exit 1
  fi
