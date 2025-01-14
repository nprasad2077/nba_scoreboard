# NBA Scoreboard

## API

### Start API

Enter api directory: `cd ./nba_scoreboard_api`
Install and initialize python environment:

Bash:

```bash
source venv/bin/activate
```

Powershell:

```powershell
.\venv\Scripts\activate\
```

Start the api using `python main.py`

### API Info

Current Scoreboard: `http://localhost:8000/`
API Docs: `http://localhost:8000/docs`
API Health Check: `http://localhost:8000/health`

## React Application

Enter the NBAScoreboard directory `cd ./NBAScoreboard` and run `npm install` then `npm run dev` to launch the react application.
Default port is 5173.

## Docker

```powershell
docker-compose up -d --build
```

```powershell
docker-compose down --rmi all && docker-compose up -d
```
