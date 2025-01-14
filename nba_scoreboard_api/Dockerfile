# File: nba_scoreboard_api/Dockerfile
FROM python:3.9-slim

WORKDIR /app

# Copy requirements file first for better caching
COPY requirements.txt requirements.txt

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application code
COPY . .

# Set environment variables
ENV PORT=8080

# Command to run the application
CMD ["bash", "-c", "python src/main.py --port $PORT"]
