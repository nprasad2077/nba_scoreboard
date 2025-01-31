import React, { useState, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Tabs,
  Tab,
  useMediaQuery,
  Box,
  CircularProgress
} from "@mui/material";
import { Close } from "@mui/icons-material";
import { AgGridReact } from "ag-grid-react";
import {
  ClientSideRowModelModule,
  ModuleRegistry,
  RowStyleModule,
  GridStateModule
} from "ag-grid-community";
import PlayByPlay from "./PlayByPlay";  // Add this import
import { teamLogos } from "../assets/nba_logos/teamLogosMap";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";

// Register AG Grid modules
ModuleRegistry.registerModules([
  ClientSideRowModelModule,
  RowStyleModule,
  GridStateModule
]);

const formatMinutes = (minutes) => {
  if (!minutes || minutes === "PT00M00.00S") return "0:00";
  const match = minutes.match(/PT(\d+)M(\d+\.\d+)S/);
  if (!match) return minutes;
  return `${match[1]}:${Math.floor(parseFloat(match[2]))
    .toString()
    .padStart(2, "0")}`;
};

const getTeamAbbreviation = (teamCity) => {
  const teamAbbreviations = {
    Atlanta: "ATL",
    Boston: "BOS",
    Brooklyn: "BKN",
    Charlotte: "CHA",
    Chicago: "CHI",
    Cleveland: "CLE",
    Dallas: "DAL",
    Denver: "DEN",
    Detroit: "DET",
    "Golden State": "GSW",
    Houston: "HOU",
    Indiana: "IND",
    LA: "LAC",
    "Los Angeles": "LAL",
    Memphis: "MEM",
    Miami: "MIA",
    Milwaukee: "MIL",
    Minnesota: "MIN",
    "New Orleans": "NOP",
    "New York": "NYK",
    "Oklahoma City": "OKC",
    Orlando: "ORL",
    Philadelphia: "PHI",
    Phoenix: "PHX",
    Portland: "POR",
    Sacramento: "SAC",
    "San Antonio": "SAS",
    Toronto: "TOR",
    Utah: "UTA",
    Washington: "WAS",
  };
  return teamAbbreviations[teamCity] || "";
};

const TeamBoxScoreGrid = ({ team, teamName, scoreboardScore }) => {
  const isMobile = useMediaQuery("(max-width:600px)");

  const columnDefs = useMemo(
    () => [
      {
        field: "name",
        headerName: "PLAYER",
        flex: 1.8,
        minWidth: 120,
        sortable: true,
        valueFormatter: (params) =>
          isMobile
            ? `${params.value.split(" ")[0][0]}. ${params.value
                .split(" ")
                .slice(1)
                .join(" ")}`
            : params.value,
      },
      {
        field: "minutes",
        headerName: "MIN",
        flex: 1,
        minWidth: 70,
        sortable: true,
        sort: "desc",
        valueGetter: (params) => {
          const minutes = params.data.statistics.minutes;
          return minutes ? parseInt(minutes.match(/PT(\d+)M/)?.[1] || 0) : 0;
        },
        valueFormatter: (params) =>
          formatMinutes(params.data.statistics.minutes),
      },
      {
        field: "points",
        headerName: "PTS",
        flex: 1,
        minWidth: 70,
        sortable: true,
        valueGetter: (params) => params.data.statistics.points,
      },
      {
        field: "reboundsTotal",
        headerName: "REB",
        flex: 1,
        minWidth: 70,
        sortable: true,
        valueGetter: (params) => params.data.statistics.reboundsTotal,
      },
      {
        field: "assists",
        headerName: "AST",
        flex: 1,
        minWidth: 70,
        sortable: true,
        valueGetter: (params) => params.data.statistics.assists,
      },
      {
        field: "fieldGoals",
        headerName: "FG",
        flex: 1,
        minWidth: 70,
        sortable: true,
        valueGetter: (params) => params.data.statistics.fieldGoalsMade,
        valueFormatter: (params) =>
          `${params.data.statistics.fieldGoalsMade}-${params.data.statistics.fieldGoalsAttempted}`,
      },
      {
        field: "threePointers",
        headerName: "3P",
        flex: 1,
        minWidth: 70,
        sortable: true,
        valueGetter: (params) => params.data.statistics.threePointersMade,
        valueFormatter: (params) =>
          `${params.data.statistics.threePointersMade}-${params.data.statistics.threePointersAttempted}`,
      },
      {
        field: "plusMinusPoints",
        headerName: "+/-",
        flex: 1,
        minWidth: 70,
        sortable: true,
        valueGetter: (params) => params.data.statistics.plusMinusPoints,
      },
    ],
    [isMobile]
  );

  const defaultColDef = useMemo(
    () => ({
      sortable: true,
      resizable: false,
      suppressMovable: true,
      suppressHeaderMenuButton: true,
    }),
    []
  );

  const getRowStyle = (params) => ({
    backgroundColor: params.data.starter
      ? "rgba(255, 255, 255, 0.05)"
      : "transparent",
  });

  const teamAbbreviation = getTeamAbbreviation(team.teamCity);
  const rowData = team.players.filter((player) => player.status === "ACTIVE");

  return (
    <div className="mb-20 w-full">
      <div className="grid grid-cols-2 items-center w-full mb-1">
        <div className="flex items-center gap-2">
          <img
            src={teamLogos[teamAbbreviation]}
            alt={`${team.teamCity} ${team.teamName} logo`}
            style={{ height: isMobile ? "20px" : "24px", width: "auto" }}
          />
          <span className={`text-white ${isMobile ? "text-sm" : "text-lg"}`}>
            {teamName}
          </span>
        </div>
        {scoreboardScore && (
          <span
            className={`text-white text-right ${
              isMobile ? "text-xl" : "text-2xl"
            } font-bold`}
          >
            {scoreboardScore}
          </span>
        )}
      </div>

      <div 
        className="ag-theme-quartz-dark"
        style={{ height: isMobile ? "300px" : "400px", width: "100%" }}
      >
        <AgGridReact
          rowData={rowData}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          getRowStyle={getRowStyle}
          domLayout="normal"
          suppressCellFocus={true}
          headerHeight={32}
          rowHeight={32}
          suppressDragLeaveHidesColumns={true}
        />
      </div>
    </div>
  );
};

const GameDetailsDialog = ({ game, open, onClose }) => {
  const isMobile = useMediaQuery("(max-width:600px)");
  const [tabValue, setTabValue] = useState(0);
  const [boxScore, setBoxScore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const api_url = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";

  useEffect(() => {
    const fetchBoxScore = async () => {
      if (!game?.gameId) return;
      try {
        setLoading(true);
        const response = await fetch(`${api_url}/boxscore/${game.gameId}`);
        const data = await response.json();
        setBoxScore(data);
      } catch (err) {
        setError("Failed to load box score data");
        console.error("Error fetching box score:", err);
      } finally {
        setLoading(false);
      }
    };

    if (open && tabValue === 0) {
      fetchBoxScore();
    }
  }, [game?.gameId, open, tabValue]);

  if (!game || !open) return null;

  const handleChangeTab = (event, newValue) => {
    setTabValue(newValue);
  };

  const [awayScore, homeScore] = game.score
    .split(" - ")
    .map((score) => parseInt(score) || 0);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xl"
      fullWidth
      fullScreen={isMobile}
      PaperProps={{
        sx: {
          height: isMobile ? "100vh" : "90vh",
          backgroundColor: "rgb(30,30,30)"
        }
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          backgroundColor: "rgb(30, 30, 30)",
          color: "white",
          padding: isMobile ? "12px 16px" : "16px 24px"
        }}
      >
        {game.away_team} @ {game.home_team}
        <IconButton onClick={onClose} sx={{ color: "white" }}>
          <Close />
        </IconButton>
      </DialogTitle>

      <Tabs
        value={tabValue}
        onChange={handleChangeTab}
        variant="fullWidth"
        textColor="inherit"
        sx={{ 
          backgroundColor: "rgb(45,45,45)",
          borderBottom: 1,
          borderColor: "divider"
        }}
        TabIndicatorProps={{
          style: { backgroundColor: "#64b5f6" }
        }}
      >
        <Tab label="Box Score" />
        <Tab label="Play By Play" />
      </Tabs>

      <DialogContent 
        sx={{ 
          p: isMobile ? 1 : 2, 
          backgroundColor: "rgb(30,30,30)",
          overflow: "auto"
        }}
      >
        {tabValue === 0 && (
          loading ? (
            <Box display="flex" justifyContent="center" alignItems="center" height="100%">
              <CircularProgress />
            </Box>
          ) : error ? (
            <div className="text-red-500">{error}</div>
          ) : (
            boxScore && (
              <>
                <div className="pb-10 mt-2 py-4">
                  <TeamBoxScoreGrid
                    team={boxScore.away_team}
                    teamName={`${boxScore.away_team.teamCity} ${boxScore.away_team.teamName}`}
                    scoreboardScore={awayScore}
                  />
                </div>
                <div className="pt-10 py-4">
                  <TeamBoxScoreGrid
                    team={boxScore.home_team}
                    teamName={`${boxScore.home_team.teamCity} ${boxScore.home_team.teamName}`}
                    scoreboardScore={homeScore}
                  />
                </div>
              </>
            )
          )
        )}

        {tabValue === 1 && (
          <PlayByPlay
            gameId={game.gameId}
            wsUrl={api_url.replace('http', 'ws')}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default GameDetailsDialog;