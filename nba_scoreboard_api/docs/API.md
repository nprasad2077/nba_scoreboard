# NBA Scores API Documentation

This API provides real-time NBA game scores and detailed box score information through both WebSocket connections and REST endpoints.

## Base URL

```
http://localhost:8000
```

## WebSocket Connection

### Live Scores Stream

Connect to the WebSocket endpoint to receive real-time game updates:

```javascript
const ws = new WebSocket("ws://localhost:8000/ws");

ws.onmessage = (event) => {
  const games = JSON.parse(event.data);
  // games is an array of current NBA games
};
```

#### Game Update Format

Each game object in the array contains:

```typescript
interface Game {
  away_team: string; // e.g., "Golden State Warriors"
  away_tricode: string; // e.g., "GSW"
  score: string; // e.g., "100 - 98"
  home_team: string; // e.g., "Los Angeles Lakers"
  home_tricode: string; // e.g., "LAL"
  time: string; // e.g., "2Q 5:30" or "Final" or "Start: 7:30 PM"
  gameId: string; // Unique game identifier
}
```

Game times will be in one of three formats:

- Upcoming games: "Start: HH:MM PM" (Eastern Time)
- In-progress games: "1Q 12:00" (quarter/period and time remaining)
- Completed games: "Final"

The games array is automatically sorted in this order:

1. In-progress games
2. Upcoming games
3. Completed games

### WebSocket Error Handling

```javascript
ws.onerror = (error) => {
  console.error("WebSocket Error:", error);
};

ws.onclose = () => {
  // Implement reconnection logic here
  console.log("WebSocket connection closed");
};
```

## REST Endpoints

### Get Box Score

Retrieve detailed statistics for a specific game.

```
GET /boxscore/{game_id}
```

#### Parameters

- `game_id` (path parameter): The unique identifier for the game

#### Response Format

```typescript
interface PlayerStatistics {
  assists: number;
  blocks: number;
  blocksReceived: number;
  fieldGoalsAttempted: number;
  fieldGoalsMade: number;
  fieldGoalsPercentage: number;
  foulsOffensive: number;
  foulsPersonal: number;
  foulsTechnical: number;
  freeThrowsAttempted: number;
  freeThrowsMade: number;
  freeThrowsPercentage: number;
  minus: number;
  minutes: string;
  plus: number;
  plusMinusPoints: number;
  points: number;
  reboundsDefensive: number;
  reboundsOffensive: number;
  reboundsTotal: number;
  steals: number;
  threePointersAttempted: number;
  threePointersMade: number;
  threePointersPercentage: number;
  turnovers: number;
}

interface PlayerData {
  name: string;
  position: string;
  starter: boolean;
  oncourt: boolean;
  jerseyNum: string;
  status: string;
  statistics: PlayerStatistics;
}

interface TeamBoxScore {
  teamName: string;
  teamCity: string;
  teamTricode: string;
  players: PlayerData[];
}

interface GameBoxScore {
  gameId: string;
  home_team: TeamBoxScore;
  away_team: TeamBoxScore;
}
```

#### Example Request

```javascript
const response = await fetch("http://localhost:8000/boxscore/0022300611");
const boxScore = await response.json();
```

#### Error Responses

- `500 Internal Server Error`: Server failed to fetch box score data
  ```json
  {
    "detail": "Error message describing the failure"
  }
  ```

## Implementation Example

Here's a basic React component example that demonstrates using both the WebSocket connection and box score endpoint:

```javascript
import React, { useEffect, useState } from "react";

function NBAScores() {
  const [games, setGames] = useState([]);
  const [selectedGameStats, setSelectedGameStats] = useState(null);

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8000/ws");

    ws.onmessage = (event) => {
      const gamesData = JSON.parse(event.data);
      setGames(gamesData);
    };

    ws.onerror = (error) => {
      console.error("WebSocket Error:", error);
    };

    return () => {
      ws.close();
    };
  }, []);

  const fetchBoxScore = async (gameId) => {
    try {
      const response = await fetch(`http://localhost:8000/boxscore/${gameId}`);
      const data = await response.json();
      setSelectedGameStats(data);
    } catch (error) {
      console.error("Error fetching box score:", error);
    }
  };

  return (
    <div>
      <h1>NBA Games</h1>
      {games.map((game) => (
        <div key={game.gameId}>
          <p>
            {game.away_team} vs {game.home_team}
          </p>
          <p>Score: {game.score}</p>
          <p>Time: {game.time}</p>
          <button onClick={() => fetchBoxScore(game.gameId)}>
            View Box Score
          </button>
        </div>
      ))}

      {selectedGameStats && (
        <div>
          <h2>Box Score</h2>
          {/* Render box score data */}
        </div>
      )}
    </div>
  );
}

export default NBAScores;
```

## Best Practices

1. Implement WebSocket reconnection logic to handle disconnections
2. Cache box score data locally when appropriate
3. Handle loading and error states for both WebSocket and REST requests
4. Consider implementing rate limiting on box score requests
5. Format timestamps in the user's local timezone when displaying game start times
