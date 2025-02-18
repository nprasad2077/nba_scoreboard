import React, { useState, useEffect, useMemo } from "react";
import { AgGridReact } from "ag-grid-react";
import "../styles/AG.css";

import {
  ClientSideRowModelModule,
  ModuleRegistry,
  ValidationModule,
  themeQuartz,
} from "ag-grid-community";

import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  CircularProgress,
  Box,
  useMediaQuery,
} from "@mui/material";
import { Close } from "@mui/icons-material";
import { teamLogos } from "../assets/nba_logos/teamLogosMap";

const customDarkTheme = themeQuartz.withParams({
  spacing: 2,
  foregroundColor: "rgb(255, 255, 255)", // White text
  backgroundColor: "rgb(30, 30, 30)", // Dark background matching dialog
  headerBackgroundColor: "rgb(40, 40, 40)", // Slightly lighter header
  rowHoverColor: "rgb(45, 45, 45)", // Subtle hover effect
  borderColor: "rgb(50, 50, 50)", // Subtle grid lines
  headerForegroundColor: "rgb(180, 180, 180)", // Slightly dimmed header text
  selectedRowBackgroundColor: "rgb(50, 50, 50)", // Selected row highlighting
  oddRowBackgroundColor: "rgb(35, 35, 35)", // Subtle alternating rows
});

ModuleRegistry.registerModules([ClientSideRowModelModule, ValidationModule]);

const getTeamAbbreviation = (teamCity, teamName) => {
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

const formatMinutes = (minutes) => {
  if (!minutes || minutes === "PT00M00.00S") return "0:00";
  const match = minutes.match(/PT(\d+)M(\d+\.\d+)S/);
  if (!match) return minutes;
  return `${match[1]}:${Math.floor(parseFloat(match[2]))
    .toString()
    .padStart(2, "0")}`;
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
        sort: "desc", // Add this line
        sortIndex: 0, // Add this line
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
      suppressMenu: true,
    }),
    []
  );

  const getRowStyle = (params) => ({
    background: params.data.starter
      ? "rgba(255, 255, 255, 0.05)"
      : "transparent",
  });

  const gridOptions = {
    sortingOrder: ["desc", "asc", null],
  };

  const teamAbbreviation = getTeamAbbreviation(team.teamCity, team.teamName);
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

      <div style={{ height: isMobile ? "300px" : "400px", width: "100%" }}>
        <AgGridReact
          rowData={rowData}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          getRowStyle={getRowStyle}
          domLayout="autoHeight"
          suppressCellFocus={true}
          headerHeight={32}
          rowHeight={32}
          theme={customDarkTheme}
          initialState={{
            sorting: {
              sortModel: [
                {
                  colId: "minutes",
                  sort: "desc",
                },
              ],
            },
          }}
        />
      </div>
    </div>
  );
};

const BoxScoreAgGrid = ({ game, open, onClose }) => {
  if (!game || !open) return null;

  const isMobile = useMediaQuery("(max-width:600px)");
  const [boxScore, setBoxScore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const api_url = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";
  const gameId = game.gameId;
  const [awayScore, homeScore] = game.score
    .split(" - ")
    .map((score) => parseInt(score) || 0);

  useEffect(() => {
    const fetchBoxScore = async () => {
      if (!gameId) return;
      try {
        setLoading(true);
        const response = await fetch(`${api_url}/boxscore/${gameId}`);
        const data = await response.json();
        setBoxScore(data);
      } catch (err) {
        setError("Failed to load box score data");
        console.error("Error fetching box score:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBoxScore();
  }, [gameId]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xl"
      fullWidth
      keepMounted={false}
      fullScreen={isMobile}
      PaperProps={{
        sx: {
          height: isMobile ? "100vh" : "90vh",
          backgroundColor: "rgb(30, 30, 30)",
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          backgroundColor: "rgb(30, 30, 30)",
          color: "white",
          padding: isMobile ? "12px 8px" : "16px 24px",
        }}
      >
        Box Score
        <IconButton onClick={onClose} sx={{ color: "white" }}>
          <Close />
        </IconButton>
      </DialogTitle>
      <DialogContent
        sx={{
          backgroundColor: "rgb(30, 30, 30)",
          padding: isMobile ? "8px" : "16px",
          overflowX: "auto",
        }}
      >
        {loading ? (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            height="100%"
          >
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
        )}
      </DialogContent>
    </Dialog>
  );
};

export default BoxScoreAgGrid;
