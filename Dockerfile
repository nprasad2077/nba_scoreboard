# Stage 1: Build the frontend
FROM node:18-alpine AS frontend-build
WORKDIR /app/nbascoreboard
COPY NBAScoreboard/package*.json ./
RUN npm install
COPY NBAScoreboard/ .
RUN npm run build

# Stage 2: Build the backend and bundle frontend assets
FROM python:3.9-slim AS backend
WORKDIR /app

# Install build tools (if needed by your Python dependencies)
RUN apt-get update && apt-get install -y gcc && rm -rf /var/lib/apt/lists/*

# Copy the FastAPI application code and install Python dependencies
COPY nba_scoreboard_api/ ./nba_scoreboard_api/
RUN pip install --upgrade pip && \
    pip install -r nba_scoreboard_api/requirements.txt

# Copy the built frontend assets into the backend
COPY --from=frontend-build /app/nbascoreboard/dist/ ./nba_scoreboard_api/static/

# Set PYTHONPATH so that "app" is discoverable (it’s inside nba_scoreboard_api/api)
ENV PYTHONPATH=/app/nba_scoreboard_api/api

# Copy the startup script and ensure it’s executable
COPY start.sh /start.sh
RUN chmod +x /start.sh

# Expose ports: 8000 for FastAPI, 3000 for serving static assets
EXPOSE 8000 3000

CMD ["/start.sh"]
