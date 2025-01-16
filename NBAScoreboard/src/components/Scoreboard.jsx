import React, { useState, useEffect, useCallback } from "react";
import BoxScore from "./BoxScore";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Container,
  Stack,
  Collapse,
  IconButton,
  useTheme,
} from "@mui/material";
import { KeyboardArrowDown, KeyboardArrowUp } from "@mui/icons-material";

// Import all logos
import ATL from "../assets/nba_logos/ATL.svg";
import BOS from "../assets/nba_logos/BOS.svg";
import BKN from "../assets/nba_logos/BKN.svg";
import CHA from "../assets/nba_logos/CHA.svg";
import CHI from "../assets/nba_logos/CHI.svg";
import CLE from "../assets/nba_logos/CLE.svg";
import DAL from "../assets/nba_logos/DAL.svg";
import DEN from "../assets/nba_logos/DEN.svg";
import DET from "../assets/nba_logos/DET.svg";
import GSW from "../assets/nba_logos/GSW.svg";
import HOU from "../assets/nba_logos/HOU.svg";
import IND from "../assets/nba_logos/IND.svg";
import LAC from "../assets/nba_logos/LAC.svg";
import LAL from "../assets/nba_logos/LAL.svg";
import MEM from "../assets/nba_logos/MEM.svg";
import MIA from "../assets/nba_logos/MIA.svg";
import MIL from "../assets/nba_logos/MIL.svg";
import MIN from "../assets/nba_logos/MIN.svg";
import NOP from "../assets/nba_logos/NOP.svg";
import NYK from "../assets/nba_logos/NYK.svg";
import OKC from "../assets/nba_logos/OKC.svg";
import ORL from "../assets/nba_logos/ORL.svg";
import PHI from "../assets/nba_logos/PHI.svg";
import PHX from "../assets/nba_logos/PHX.svg";
import POR from "../assets/nba_logos/POR.svg";
import SAC from "../assets/nba_logos/SAC.svg";
import SAS from "../assets/nba_logos/SAS.svg";
import TOR from "../assets/nba_logos/TOR.svg";
import UTA from "../assets/nba_logos/UTA.svg";
import WAS from "../assets/nba_logos/WAS.svg";

// Logo mapping object
const teamLogos = {
  ATL,
  BOS,
  BKN,
  CHA,
  CHI,
  CLE,
  DAL,
  DEN,
  DET,
  GSW,
  HOU,
  IND,
  LAC,
  LAL,
  MEM,
  MIA,
  MIL,
  MIN,
  NOP,
  NYK,
  OKC,
  ORL,
  PHI,
  PHX,
  POR,
  SAC,
  SAS,
  TOR,
  UTA,
  WAS,
};

/**
 * Renders away/home team info (logo + name + optional score)
 */
const TeamInfo = ({ teamName, tricode, score, isWinner, isHomeTeam }) => {
  const logoSrc = teamLogos[tricode];

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 2,
        flexDirection: isHomeTeam ? "row-reverse" : "row",
        justifyContent: isHomeTeam ? "flex-start" : "flex-start",
        minWidth: "200px",
      }}
    >
      <Box
        component="img"
        src={logoSrc}
        alt={`${teamName} logo`}
        sx={{
          width: 40,
          height: 40,
          objectFit: "contain",
        }}
      />
      <Box sx={{ textAlign: isHomeTeam ? "right" : "left" }}>
        <Typography variant="body1" fontWeight="bold">
          {teamName}
        </Typography>
        {score !== "" && (
          <Typography
            variant="h5"
            color={isWinner ? "primary" : "text.primary"}
            sx={{ color: isWinner ? "#64b5f6" : "#ffffff" }}
          >
            {score}
          </Typography>
        )}
      </Box>
    </Box>
  );
};

/**
 * Single game card component
 */
const GameCard = ({ game, onBoxScoreClick }) => {
  const theme = useTheme();
  const [awayScore, homeScore] = game.score
    .split(" - ")
    .map((score) => parseInt(score) || 0);

  const gameStatus = game.time;
  // A quick check to see if the game has not yet started
  const isScheduled = gameStatus.startsWith("Start:");

  // Format the game status display (handle "0Q 0:00" as pre-game, etc.)
  const displayStatus = gameStatus === "0Q 0:00" ? "Pre-Game 0:00" : gameStatus;

  return (
    <Card
      onClick={() => onBoxScoreClick(game.gameId)}
      sx={{
        cursor: "pointer",
        mb: 2,
        backgroundColor: "rgb(45, 45, 45)",
        boxShadow: "none",
        transition: "transform 0.2s",
        "&:hover": {
          transform: "scale(1.01)",
        },
        height: "80px",
      }}
    >
      <CardContent
        sx={{ position: "relative", p: "16px !important", height: "100%" }}
      >
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ height: "100%" }}
        >
          <TeamInfo
            teamName={game.away_team}
            tricode={game.away_tricode}
            score={isScheduled ? "" : awayScore}
            isWinner={!isScheduled && awayScore > homeScore}
            isHomeTeam={false}
          />

          <Box
            sx={{
              position: "absolute",
              left: "50%",
              top: "50%",
              transform: "translate(-50%, -50%)",
              minWidth: "100px",
              textAlign: "center",
            }}
          >
            <Typography
              variant="body2"
              sx={{
                color: "#ffffff",
                opacity: 0.5,
                letterSpacing: "0.5px",
                fontWeight: 400,
                fontSize: "0.875rem",
              }}
            >
              {isScheduled ? gameStatus.replace("Start: ", "") : displayStatus}
            </Typography>
          </Box>

          <TeamInfo
            teamName={game.home_team}
            tricode={game.home_tricode}
            score={isScheduled ? "" : homeScore}
            isWinner={!isScheduled && homeScore > awayScore}
            isHomeTeam={true}
          />
        </Stack>
      </CardContent>
    </Card>
  );
};

/**
 * Main scoreboard component
 */
const Scoreboard = () => {
  const [games, setGames] = useState([]);
  const [selectedGameId, setSelectedGameId] = useState(null);
  const [boxScoreOpen, setBoxScoreOpen] = useState(false);
  const [showAllGames, setShowAllGames] = useState(true);

  // Track the last time we received an update (for display only)
  const [lastUpdateTime, setLastUpdateTime] = useState(null);

  /**
   * On mount, establish a WebSocket connection to get live updates.
   */
  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8000/ws");

    ws.onopen = () => {
      console.log("Connected to NBA Stats WebSocket");
    };

    ws.onmessage = (event) => {
      try {
        const gamesData = JSON.parse(event.data);
        setGames(gamesData);
        setLastUpdateTime(new Date());
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    ws.onclose = () => {
      console.log("Disconnected from NBA Stats WebSocket");
    };

    // Cleanup: close the WS on unmount
    return () => {
      ws.close();
    };
  }, []);

  /**
   * Helper function to parse period and time for sorting
   * so we can list in-progress games first, etc.
   */
  const parseGameTime = (time) => {
    // "Start: 7:30 PM"
    if (time.startsWith("Start:")) return { period: -1, minutes: 0, seconds: 0 };

    // "1Q 10:44", "OT 5:00", "Final", etc.
    const periodMatch = time.match(/(\d+)Q/) || time.match(/(\d+)OT/);
    const timeMatch = time.match(/(\d+):(\d+)/);

    const period = periodMatch ? parseInt(periodMatch[1]) : 0;
    const minutes = timeMatch ? parseInt(timeMatch[1]) : 0;
    const seconds = timeMatch ? parseInt(timeMatch[2]) : 0;

    return { period, minutes, seconds };
  };

  /**
   * Sort function for games: 
   * - In-progress (higher period first),
   * - then scheduled,
   * - then final, etc.
   */
  const sortGames = (a, b) => {
    const timeA = parseGameTime(a.time);
    const timeB = parseGameTime(b.time);

    // First sort by period (descending)
    if (timeB.period !== timeA.period) return timeB.period - timeA.period;

    // Then sort by time (ascending)
    const totalSecondsA = timeA.minutes * 60 + timeA.seconds;
    const totalSecondsB = timeB.minutes * 60 + timeB.seconds;
    return totalSecondsA - totalSecondsB;
  };

  /**
   * Separate games into live, upcoming, and completed categories.
   */
  const liveGames = games
    .filter(
      (game) =>
        !game.time.startsWith("Start:") &&
        game.time !== "Final" && // or however "Final" is signaled
        !game.time.startsWith("0Q") // your condition for non-started
    )
    .sort(sortGames);

  const scheduledGames = games.filter(
    (game) => game.time.startsWith("Start:") || game.time.startsWith("0Q")
  );

  const completedGames = games.filter((game) => game.time === "Final");

  /**
   * Click handler to show the BoxScore for a selected game
   */
  const handleBoxScoreClick = (gameId) => {
    setSelectedGameId(gameId);
    setBoxScoreOpen(true);
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Header (you can still display last update time if desired) */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
          backgroundColor: "rgba(0, 0, 0, 0.2)",
          borderRadius: 1,
          padding: "8px 16px",
        }}
      >
        <Typography variant="h6">NBA Scoreboard</Typography>
        {lastUpdateTime && (
          <Typography variant="caption" sx={{ opacity: 0.7 }}>
            Last update:{" "}
            {lastUpdateTime.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            })}
          </Typography>
        )}
      </Box>

      {/* Live Games Section */}
      {liveGames.length > 0 && (
        <Box mb={4}>
          <Typography
            variant="h6"
            gutterBottom
            sx={{
              display: "flex",
              alignItems: "center",
            }}
          >
            {/* Little red dot to indicate live */}
            <Box
              component="span"
              sx={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                backgroundColor: "error.main",
                display: "inline-block",
                mr: 1,
                animation: "pulse 2s infinite",
              }}
            />
            Live Games
          </Typography>
          {liveGames.map((game, index) => (
            <GameCard key={index} game={game} onBoxScoreClick={handleBoxScoreClick} />
          ))}
        </Box>
      )}

      {/* Scheduled Games Section */}
      {scheduledGames.length > 0 && (
        <Box mb={4}>
          <Typography variant="h6" gutterBottom>
            Upcoming Games
          </Typography>
          {scheduledGames.map((game, index) => (
            <GameCard key={index} game={game} onBoxScoreClick={handleBoxScoreClick} />
          ))}
        </Box>
      )}

      {/* Completed Games Section */}
      {completedGames.length > 0 && (
        <Box>
          <Typography
            variant="h6"
            gutterBottom
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            Completed Games
            <IconButton
              size="small"
              onClick={() => setShowAllGames(!showAllGames)}
              sx={{ ml: 1 }}
            >
              {showAllGames ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
            </IconButton>
          </Typography>

          <Collapse in={showAllGames}>
            {completedGames.map((game, index) => (
              <GameCard key={index} game={game} onBoxScoreClick={handleBoxScoreClick} />
            ))}
          </Collapse>
        </Box>
      )}

      {/**
       * BoxScore component still uses the REST endpoint `GET /boxscore/{game_id}`
       * No changes needed there except you might want to confirm you have a `gameId`
       * in your WebSocket response so BoxScore can look it up correctly.
       */}
      <BoxScore
        gameId={selectedGameId}
        open={boxScoreOpen}
        onClose={() => {
          setBoxScoreOpen(false);
          setSelectedGameId(null);
        }}
      />
    </Container>
  );
};

export default Scoreboard;
