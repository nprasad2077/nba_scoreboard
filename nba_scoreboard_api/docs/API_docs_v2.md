# NBA Scoreboard API Documentation

## Overview

The NBA Scoreboard API is a FastAPI-based application that provides real-time NBA scores, player statistics, team standings, and play-by-play information. The API uses data from the official NBA API and stores it in a local SQLite database.

**Base URL:** `/api/v1`

## Authentication

The API currently does not require authentication.

## Endpoints

### Players

#### Search Players

```
GET /players/search/
```

Search for NBA players by name.

**Query Parameters:**

- `query` (string, required): Search string (minimum 2 characters)

**Response:**

```json
[
  {
    "person_id": 2544,
    "display_name": "LeBron James",
    "team_name": "Los Angeles Lakers",
    "team_abbreviation": "LAL"
  }
]
```

#### Get Player Game Statistics

```
GET /players/{player_id}/games
```

Get a player's recent game statistics.

**Path Parameters:**

- `player_id` (integer, required): The NBA person ID of the player

**Query Parameters:**

- `last_n_games` (integer, optional, default=10): Number of recent games to return (1-82)

**Response:**

```json
{
  "player_info": {
    "person_id": 2544,
    "display_name": "LeBron James",
    "team_name": "Los Angeles Lakers",
    "team_abbreviation": "LAL"
  },
  "games": [
    {
      "game_date": "2025-02-28",
      "matchup": "LAL vs. DEN",
      "wl": "W",
      "min": 35.5,
      "pts": 28,
      "fgm": 11,
      "fga": 22,
      "fg_pct": 0.5,
      "fg3m": 3,
      "fg3a": 7,
      "fg3_pct": 0.429,
      "ftm": 3,
      "fta": 3,
      "ft_pct": 1.0,
      "oreb": 1,
      "dreb": 10,
      "reb": 11,
      "ast": 11,
      "stl": 1,
      "blk": 1,
      "tov": 4,
      "pf": 2,
      "plus_minus": 15
    }
  ]
}
```

#### Update Players Database

```
POST /players/update
```

Update the players database with current NBA players.

**Response:**

```json
{
  "message": "Players database updated successfully"
}
```

### Scoreboard

#### Live Scoreboard WebSocket

```
WebSocket /scoreboard/ws
```

WebSocket endpoint for live scoreboard updates. Streams game scores and status updates to connected clients.

**Response (JSON streaming):**

```json
[
  {
    "game_id": "0022400789",
    "game_status": 2,
    "away_team": {
      "team_id": "1610612738",
      "team_name": "Celtics",
      "team_city": "Boston",
      "team_tricode": "BOS",
      "score": 78
    },
    "home_team": {
      "team_id": "1610612747",
      "team_name": "Lakers",
      "team_city": "Los Angeles",
      "team_tricode": "LAL",
      "score": 82
    },
    "period": 3,
    "clock": "5:42",
    "game_time": "2025-03-03T19:30:00Z"
  }
]
```

#### Play-by-Play WebSocket

```
WebSocket /scoreboard/ws/playbyplay/{game_id}
```

WebSocket endpoint for live play-by-play updates for a specific game.

**Path Parameters:**

- `game_id` (string, required): NBA game ID

**Response (JSON streaming):**

```json
{
  "gameId": "0022400789",
  "period": 3,
  "gameClock": "5:42",
  "plays": [
    {
      "eventId": "598",
      "clock": "5:42",
      "period": 3,
      "description": "James 3PT Jump Shot",
      "scoreDisplay": "LAL 82 - BOS 78",
      "teamTricode": "LAL",
      "playerNameI": "L. James"
    }
  ]
}
```

#### Past Games

```
GET /scoreboard/past
```

Get scoreboard data for past games.

**Query Parameters:**

- `date` (string, optional): Date in YYYY-MM-DD format. Defaults to yesterday if not provided.

**Response:**

```json
[
  {
    "game_id": "0022400788",
    "game_status": 3,
    "away_team": {
      "team_id": "1610612749",
      "team_name": "Bucks",
      "team_city": "Milwaukee",
      "team_tricode": "MIL",
      "score": 108
    },
    "home_team": {
      "team_id": "1610612756",
      "team_name": "Suns",
      "team_city": "Phoenix",
      "team_tricode": "PHX",
      "score": 115
    },
    "period": 4,
    "clock": "Final",
    "game_time": "2025-03-02T19:00:00Z"
  }
]
```

#### Box Score

```
GET /scoreboard/boxscore/{game_id}
```

Get detailed box score for a specific game.

**Path Parameters:**

- `game_id` (string, required): NBA game ID

**Response:**

```json
{
  "game_id": "0022400789",
  "status": 3,
  "period": 4,
  "clock": "Final",
  "home_team": {
    "team_id": "1610612747",
    "team_name": "Lakers",
    "team_city": "Los Angeles",
    "team_tricode": "LAL",
    "players": [
      {
        "player_id": "2544",
        "name": "LeBron James",
        "position": "F",
        "starter": true,
        "statistics": {
          "minutes": "36:25",
          "points": 30,
          "assists": 12,
          "rebounds": 8,
          "field_goals_made": 12,
          "field_goals_attempted": 20,
          "field_goal_percentage": 0.6,
          "three_pointers_made": 4,
          "three_pointers_attempted": 8,
          "three_point_percentage": 0.5,
          "free_throws_made": 2,
          "free_throws_attempted": 2,
          "free_throw_percentage": 1.0,
          "plus_minus": 12
        }
      }
    ]
  },
  "away_team": {
    "team_id": "1610612738",
    "team_name": "Celtics",
    "team_city": "Boston",
    "team_tricode": "BOS",
    "players": [
      {
        "player_id": "1629684",
        "name": "Jayson Tatum",
        "position": "F",
        "starter": true,
        "statistics": {
          "minutes": "35:10",
          "points": 28,
          "assists": 5,
          "rebounds": 9,
          "field_goals_made": 10,
          "field_goals_attempted": 21,
          "field_goal_percentage": 0.476,
          "three_pointers_made": 5,
          "three_pointers_attempted": 11,
          "three_point_percentage": 0.455,
          "free_throws_made": 3,
          "free_throws_attempted": 4,
          "free_throw_percentage": 0.75,
          "plus_minus": -8
        }
      }
    ]
  }
}
```

### Standings

#### Conference Standings

```
GET /standings/conference/{conference}
```

Get standings for a specific conference (East or West).

**Path Parameters:**

- `conference` (string, required): Conference name ('East' or 'West')

**Response:**

```json
[
  {
    "team_id": 1610612738,
    "team_city": "Boston",
    "team_name": "Celtics",
    "conference": "East",
    "division": "Atlantic",
    "wins": 49,
    "losses": 14,
    "win_pct": 0.778,
    "games_back": 0.0,
    "conference_rank": 1,
    "division_rank": 1,
    "home_record": "27-3",
    "road_record": "22-11",
    "last_ten": "7-3",
    "streak": "W2",
    "points_pg": 121.3,
    "opp_points_pg": 109.1,
    "division_record": "11-2",
    "conference_record": "31-8",
    "vs_east": "31-8",
    "vs_west": "18-6"
  }
]
```

#### Division Standings

```
GET /standings/division/{division}
```

Get standings for a specific division.

**Path Parameters:**

- `division` (string, required): Division name ('Atlantic', 'Central', 'Southeast', 'Northwest', 'Pacific', 'Southwest')

**Response:**

```json
[
  {
    "team_id": 1610612738,
    "team_city": "Boston",
    "team_name": "Celtics",
    "conference": "East",
    "division": "Atlantic",
    "wins": 49,
    "losses": 14,
    "win_pct": 0.778,
    "games_back": 0.0,
    "conference_rank": 1,
    "division_rank": 1,
    "home_record": "27-3",
    "road_record": "22-11",
    "last_ten": "7-3",
    "streak": "W2",
    "points_pg": 121.3,
    "opp_points_pg": 109.1,
    "division_record": "11-2",
    "conference_record": "31-8",
    "vs_east": "31-8",
    "vs_west": "18-6"
  }
]
```

#### Update Standings

```
POST /standings/update
```

Update the standings database with current NBA standings.

**Response:**

```json
{
  "message": "Standings database updated successfully"
}
```

## Data Models

### Player Models

- **PlayerBase**

  - `person_id` (integer): NBA.com person ID
  - `display_name` (string): Player's full name
  - `team_name` (string): Current team name
  - `team_abbreviation` (string): Current team abbreviation

- **GameStats**

  - `game_date` (string): Date of the game
  - `matchup` (string): Game matchup (e.g., 'LAL vs. BOS')
  - `wl` (string): Win/Loss result
  - `min` (float): Minutes played
  - `pts` (integer): Points scored
  - `fgm` (integer): Field goals made
  - `fga` (integer): Field goals attempted
  - `fg_pct` (float): Field goal percentage
  - `fg3m` (integer): Three pointers made
  - `fg3a` (integer): Three pointers attempted
  - `fg3_pct` (float): Three point percentage
  - `ftm` (integer): Free throws made
  - `fta` (integer): Free throws attempted
  - `ft_pct` (float): Free throw percentage
  - `oreb` (integer): Offensive rebounds
  - `dreb` (integer): Defensive rebounds
  - `reb` (integer): Total rebounds
  - `ast` (integer): Assists
  - `stl` (integer): Steals
  - `blk` (integer): Blocks
  - `tov` (integer): Turnovers
  - `pf` (integer): Personal fouls
  - `plus_minus` (integer): Plus/minus

- **PlayerStats**
  - `player_info` (PlayerBase): Player's basic information
  - `games` (array of GameStats): List of game statistics

### Scoreboard Models

- **TeamGameInfo**

  - `team_id` (string): NBA team ID
  - `team_name` (string): Team name
  - `team_city` (string): Team city
  - `team_tricode` (string): Three-letter team code
  - `score` (integer): Current score

- **GameBrief**

  - `game_id` (string): NBA game ID
  - `game_status` (integer): Game status (1=Scheduled, 2=In Progress, 3=Final)
  - `away_team` (TeamGameInfo): Away team information
  - `home_team` (TeamGameInfo): Home team information
  - `period` (integer): Current period
  - `clock` (string, optional): Game clock
  - `game_time` (string): Scheduled game time (UTC)

- **GameDetail** (extends GameBrief)

  - `arena` (string, optional): Arena name
  - `city` (string, optional): City name
  - `state` (string, optional): State name
  - `country` (string, optional): Country name

- **ScoreboardResponse**

  - `games` (array of GameBrief): List of games
  - `total_games` (integer): Total number of games
  - `current_timestamp` (string): Current timestamp

- **PlayerStatistics**

  - `minutes` (string): Minutes played
  - `points` (integer): Points scored
  - `assists` (integer): Assists
  - `rebounds` (integer): Total rebounds
  - `field_goals_made` (integer): Field goals made
  - `field_goals_attempted` (integer): Field goals attempted
  - `field_goal_percentage` (float): Field goal percentage
  - `three_pointers_made` (integer): Three pointers made
  - `three_pointers_attempted` (integer): Three pointers attempted
  - `three_point_percentage` (float): Three point percentage
  - `free_throws_made` (integer): Free throws made
  - `free_throws_attempted` (integer): Free throws attempted
  - `free_throw_percentage` (float): Free throw percentage
  - `plus_minus` (integer): Plus/minus

- **PlayerBoxScore**

  - `player_id` (string): Player ID
  - `name` (string): Player name
  - `position` (string): Player position
  - `starter` (boolean): Whether the player is a starter
  - `statistics` (PlayerStatistics): Player statistics

- **TeamBoxScore**

  - `team_id` (string): Team ID
  - `team_name` (string): Team name
  - `team_city` (string): Team city
  - `team_tricode` (string): Three-letter team code
  - `players` (array of PlayerBoxScore): List of player box scores

- **GameBoxScore**

  - `game_id` (string): Game ID
  - `status` (integer): Game status
  - `period` (integer): Current period
  - `clock` (string, optional): Game clock
  - `home_team` (TeamBoxScore): Home team box score
  - `away_team` (TeamBoxScore): Away team box score

- **PlayByPlayEvent**

  - `event_id` (string): Event ID
  - `clock` (string): Game clock
  - `period` (integer): Period
  - `description` (string): Event description
  - `score` (string, optional): Score display
  - `team_tricode` (string, optional): Team three-letter code
  - `player_name` (string, optional): Player name

- **PlayByPlayResponse**
  - `game_id` (string): Game ID
  - `period` (integer): Current period
  - `clock` (string, optional): Game clock
  - `events` (array of PlayByPlayEvent): List of play-by-play events

### Standings Models

- **StandingsResponse**
  - `team_id` (integer): NBA.com team ID
  - `team_city` (string): Team city
  - `team_name` (string): Team name
  - `conference` (string): Conference (East/West)
  - `division` (string): Division name
  - `wins` (integer): Number of wins
  - `losses` (integer): Number of losses
  - `win_pct` (float): Winning percentage
  - `games_back` (float): Games behind conference leader
  - `conference_rank` (integer): Rank in conference
  - `division_rank` (integer): Rank in division
  - `home_record` (string): Home record (W-L)
  - `road_record` (string): Road record (W-L)
  - `last_ten` (string): Record in last 10 games
  - `streak` (string): Current streak
  - `points_pg` (float): Points per game
  - `opp_points_pg` (float): Opponent points per game
  - `division_record` (string): Record against division
  - `conference_record` (string): Record against conference
  - `vs_east` (string): Record against Eastern Conference
  - `vs_west` (string): Record against Western Conference

## Error Handling

The API returns standard HTTP status codes:

- `200 OK`: Request successful
- `400 Bad Request`: Invalid request parameters
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error

Error responses include a detailed message:

```json
{
  "detail": "Error message"
}
```

## Known Issues

Based on the error log, there's an issue with the scoreboard service:

```
ERROR:app.services.scoreboard:Error fetching live scoreboard: 1 validation error for TeamGameInfo
team_id
Input should be a valid string [type=string_type, input_value=1610612761, input_type=int]
```

The error suggests that the `team_id` field in `TeamGameInfo` schema is defined as a string, but the NBA API is returning it as an integer. The current workaround is to convert team IDs to strings in the `get_live_scoreboard` function.

## Configuration

The API can be configured using environment variables:

- `API_V1_STR`: API version string
- `PROJECT_NAME`: API project name
- `VERSION`: API version
- `DEBUG`: Debug mode flag
- `DB_PATH`: Path to SQLite database
- `NBA_API_DELAY`: Delay between NBA API calls
- `NBA_SEASON`: NBA season (format: "YYYY-YY")
- `NBA_LEAGUE_ID`: NBA league ID
- `CORS_ORIGINS`: Allowed CORS origins
- `WS_UPDATE_INTERVAL`: WebSocket update interval
- `WS_HEARTBEAT_INTERVAL`: WebSocket heartbeat interval
- `TESTING`: Testing mode flag

## Development

### Running the API locally

1. Clone the repository
2. Copy `.env.example` to `.env` and adjust settings as needed
3. Install dependencies with `pip install -e .`
4. Run migrations with `alembic upgrade head`
5. Start the server with `uvicorn main:app --reload`

### Swagger UI

The API documentation is available at `/docs` endpoint.
