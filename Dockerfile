# Stage 1: Build the frontend
FROM node:18-alpine AS frontend-build
WORKDIR /app/nbascoreboard
# Copy only what's needed for npm install first
COPY NBAScoreboard/package*.json ./
RUN npm install
# Then copy the rest (excluding node_modules thanks to .dockerignore)
COPY NBAScoreboard/ .
RUN npm run build

# Stage 2: Build the backend and bundle frontend assets
FROM python:3.9-slim AS backend
WORKDIR /app
# Install build tools
RUN apt-get update && apt-get install -y gcc && rm -rf /var/lib/apt/lists/*

# Copy only requirements.txt first for better caching
COPY nba_scoreboard_api/requirements.txt ./nba_scoreboard_api/
RUN pip install alembic
RUN pip install --upgrade pip && \
    pip install -r nba_scoreboard_api/requirements.txt

# Copy the API code (excluding venv thanks to .dockerignore)
COPY nba_scoreboard_api/ ./nba_scoreboard_api/

# Copy the built frontend assets
COPY --from=frontend-build /app/nbascoreboard/dist/ ./nba_scoreboard_api/static/

# Set PYTHONPATH and expose ports
ENV PYTHONPATH=/app/nba_scoreboard_api/api
COPY start.sh /start.sh
RUN chmod +x /start.sh
EXPOSE 8000 3000
CMD ["/start.sh"]