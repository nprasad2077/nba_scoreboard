// ScoreBoard.jsx
import React, { useState, useEffect } from "react";
import ConnectionIndicator from "./ConnectionIndicator";
import GameDetailsDialog from "./GameDetailsDialog";
// (Optional) If you still use these elsewhere, keep them; otherwise you can remove:
// import BoxScore from "./BoxScore";
// import BoxScoreAgGrid from "./BoxScoreAgGrid";

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
  useMediaQuery,
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
 * Converts Eastern Standard Time (EST) to local time
 * @param {string} timeStr - Time string in format "Start: HH:MM PM"
 * @returns {string} - Formatted time string in local timezone
 */
const convertToLocalTime = (timeStr) => {
  // If it's not a start time (e.g., "1Q 10:44" or "Final"), return as-is.
  if (!timeStr.startsWith("Start:")) {
    return timeStr;
  }

  // Extract the time part
  const [_, timeComponent] = timeStr.split("Start: ");
  const [time, period] = timeComponent.trim().split(" ");
  const [hours, minutes] = time.split(":").map((num) => parseInt(num));

  // Convert to 24-hour format
  let hour24 = hours;
  if (period === "PM" && hours !== 12) {
    hour24 += 12;
  } else if (period === "AM" && hours === 12) {
    hour24 = 0;
  }

  // Get today's date
  const today = new Date();

  // Create a date object with the game time in EST (UTC-5 offset)
  const etDate = new Date(
    Date.UTC(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
      hour24 + 5, // EST to UTC offset
      minutes
    )
  );

  // Convert to local time
  const localTime = new Date(etDate);

  // Format the time in local timezone
  const localTimeStr = localTime.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  return `Start: ${localTimeStr}`;
};

/**
 * Renders away/home team info (logo + name + optional score).
 */
const TeamInfo = ({ teamName, tricode, score, isWinner, isHomeTeam }) => {
  const isMobile = useMediaQuery("(max-width:600px)");
  const logoSrc = teamLogos[tricode];

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: isMobile ? 1 : 2,
        flexDirection: isHomeTeam ? "row-reverse" : "row",
        justifyContent: isHomeTeam ? "flex-start" : "flex-start",
        minWidth: isMobile ? "auto" : "200px",
        flex: isMobile ? 1 : "none",
      }}
    >
      <Box
        component="img"
        src={logoSrc}
        alt={`${teamName} logo`}
        sx={{
          width: isMobile ? 32 : 40,
          height: isMobile ? 32 : 40,
          objectFit: "contain",
        }}
      />
      <Box
        sx={{
          textAlign: isHomeTeam ? "right" : "left",
          overflow: "hidden",
        }}
      >
        <Typography
          variant="body1"
          fontWeight="bold"
          sx={{
            fontSize: isMobile ? "0.875rem" : "1rem",
            whiteSpace: "nowrap",
            color: "#ffffff",
          }}
        >
          {isMobile ? tricode : teamName}
        </Typography>
        {score !== "" && (
          <Typography
            variant={isMobile ? "h6" : "h5"}
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
 * Single game card component.
 * - If a game has not started (time starts with "Start:" or "0Q"), do NOT call onBoxScoreClick.
 */
const GameCard = ({ game, onBoxScoreClick }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery("(max-width:600px)");
  const [awayScore, homeScore] = game.score
    .split(" - ")
    .map((score) => parseInt(score) || 0);

  // Convert the game time to local timezone
  const gameStatus = convertToLocalTime(game.time);

  // Check if game is not started yet
  const isNotStarted =
    gameStatus.startsWith("Start:") || gameStatus.startsWith("0Q");

  // Hide the score for upcoming games
  const awayDisplayScore = isNotStarted ? "" : awayScore;
  const homeDisplayScore = isNotStarted ? "" : homeScore;

  // Format the game status display (handle "0Q 0:00" as pre-game, etc.)
  const displayStatus = gameStatus === "0Q 0:00" ? "Pre-Game" : gameStatus;

  return (
    <Card
      onClick={() => {
        if (!isNotStarted) {
          onBoxScoreClick(game);
        }
      }}
      sx={{
        cursor: isNotStarted ? "default" : "pointer",
        mb: isMobile ? 1 : 2,
        backgroundColor: "rgb(45, 45, 45)",
        boxShadow: "none",
        transition: "transform 0.2s",
        "&:hover": {
          transform: isNotStarted ? "none" : "scale(1.01)",
        },
        height: isMobile ? "70px" : "80px",
      }}
    >
      <CardContent
        sx={{
          position: "relative",
          p: isMobile ? "12px !important" : "16px !important",
          height: "100%",
        }}
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
            score={awayDisplayScore}
            isWinner={!isNotStarted && awayScore > homeScore}
            isHomeTeam={false}
          />

          <Box
            sx={{
              position: "absolute",
              left: "50%",
              top: "50%",
              transform: "translate(-50%, -50%)",
              minWidth: isMobile ? "60px" : "100px",
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
                fontSize: isMobile ? "0.75rem" : "0.875rem",
              }}
            >
              {isNotStarted ? gameStatus.replace("Start: ", "") : displayStatus}{" "}
            </Typography>
          </Box>

          <TeamInfo
            teamName={game.home_team}
            tricode={game.home_tricode}
            score={homeDisplayScore}
            isWinner={!isNotStarted && homeScore > awayScore}
            isHomeTeam={true}
          />
        </Stack>
      </CardContent>
    </Card>
  );
};

/**
 * Main scoreboard component.
 */
const Scoreboard = ({ games, isConnected, lastUpdateTime }) => {
  const isMobile = useMediaQuery("(max-width:600px)");
  const [selectedGame, setSelectedGame] = useState(null);
  const [boxScoreOpen, setBoxScoreOpen] = useState(false);
  const [showAllGames, setShowAllGames] = useState(true);

  // Helper to parse period/time for sorting
  const parseGameTime = (time) => {
    if (time.startsWith("Start:"))
      return { period: -1, minutes: 0, seconds: 0 };

    // e.g. "1Q 10:44", "OT 5:00", "Final", etc.
    const periodMatch = time.match(/(\d+)Q/) || time.match(/(\d+)OT/);
    const timeMatch = time.match(/(\d+):(\d+)/);

    const period = periodMatch ? parseInt(periodMatch[1]) : 0;
    const minutes = timeMatch ? parseInt(timeMatch[1]) : 0;
    const seconds = timeMatch ? parseInt(timeMatch[2]) : 0;

    return { period, minutes, seconds };
  };

  // Sort function: in-progress first, then scheduled, then final
  const sortGames = (a, b) => {
    const timeA = parseGameTime(a.time);
    const timeB = parseGameTime(b.time);

    // Higher period = earlier in the list
    if (timeB.period !== timeA.period) return timeB.period - timeA.period;

    // Then by clock time ascending
    const totalSecondsA = timeA.minutes * 60 + timeA.seconds;
    const totalSecondsB = timeB.minutes * 60 + timeB.seconds;
    return totalSecondsA - totalSecondsB;
  };

  // Separate live, upcoming, completed
  const liveGames = games
    .filter(
      (game) =>
        !game.time.startsWith("Start:") &&
        game.time !== "Final" &&
        !game.time.startsWith("0Q")
    )
    .sort(sortGames);

  const scheduledGames = games.filter(
    (game) => game.time.startsWith("Start:") || game.time.startsWith("0Q")
  );

  const completedGames = games.filter((game) => game.time === "Final");

  // Click handler for an in-progress or completed game => open modal
  const handleBoxScoreClick = (game) => {
    setSelectedGame(game);
    setBoxScoreOpen(true);
  };

  return (
    <Container
      maxWidth="md"
      sx={{
        py: isMobile ? 2 : 4,
        px: isMobile ? 1 : 2,
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: isMobile ? 2 : 3,
          backgroundColor: "rgba(0, 0, 0, 0.2)",
          borderRadius: 1,
          padding: isMobile ? "6px 12px" : "8px 16px",
        }}
      >
        <Typography
          variant={isMobile ? "subtitle1" : "h6"}
          sx={{ fontSize: isMobile ? "1rem" : "1.25rem" }}
        >
          NBA Scoreboard
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <ConnectionIndicator connected={isConnected} />
          {lastUpdateTime && (
            <Typography
              variant="caption"
              sx={{
                opacity: 0.7,
                fontSize: isMobile ? "0.7rem" : "0.75rem",
              }}
            >
              Last update:{" "}
              {lastUpdateTime.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              })}
            </Typography>
          )}
        </Box>
      </Box>

      {/* Live Games Section */}
      {liveGames.length > 0 && (
        <Box mb={isMobile ? 2 : 4}>
          <Typography
            variant={isMobile ? "subtitle1" : "h6"}
            gutterBottom
            sx={{
              display: "flex",
              alignItems: "center",
              fontSize: isMobile ? "1rem" : "1.25rem",
            }}
          >
            {/* Red dot to indicate live */}
            <Box
              component="span"
              sx={{
                width: isMobile ? 6 : 8,
                height: isMobile ? 6 : 8,
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
            <GameCard
              key={index}
              game={game}
              onBoxScoreClick={handleBoxScoreClick}
            />
          ))}
        </Box>
      )}

      {/* Scheduled Games Section */}
      {scheduledGames.length > 0 && (
        <Box mb={isMobile ? 2 : 4}>
          <Typography
            variant={isMobile ? "subtitle1" : "h6"}
            gutterBottom
            sx={{ fontSize: isMobile ? "1rem" : "1.25rem" }}
          >
            Upcoming Games
          </Typography>
          {scheduledGames.map((game, index) => (
            <GameCard
              key={index}
              game={game}
              onBoxScoreClick={handleBoxScoreClick}
            />
          ))}
        </Box>
      )}

      {/* Completed Games Section */}
      {completedGames.length > 0 && (
        <Box>
          <Typography
            variant={isMobile ? "subtitle1" : "h6"}
            gutterBottom
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: isMobile ? "1rem" : "1.25rem",
            }}
          >
            Completed Games
            <IconButton
              size={isMobile ? "small" : "medium"}
              onClick={() => setShowAllGames(!showAllGames)}
              sx={{
                ml: 1,
                padding: isMobile ? "4px" : "8px",
              }}
            >
              {showAllGames ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
            </IconButton>
          </Typography>

          <Collapse in={showAllGames}>
            {completedGames.map((game, index) => (
              <GameCard
                key={index}
                game={game}
                onBoxScoreClick={handleBoxScoreClick}
              />
            ))}
          </Collapse>
        </Box>
      )}

      {/* 
        GameDetailsDialog:
        - Replaces the old BoxScoreAgGrid modal so that when the user clicks
          an in-progress or completed game, this tabbed dialog opens,
          showing Box Score and Play By Play for `selectedGame`.
      */}
      <GameDetailsDialog
        game={selectedGame}
        open={boxScoreOpen}
        onClose={() => {
          setBoxScoreOpen(false);
          setSelectedGame(null);
        }}
      />

      {/* If no games are available, show a "No games scheduled" state */}
      {games.length === 0 && (
        <Box
          sx={{
            textAlign: "center",
            py: isMobile ? 4 : 6,
            opacity: 0.7,
          }}
        >
          <Typography
            variant={isMobile ? "body1" : "h6"}
            sx={{
              fontSize: isMobile ? "0.875rem" : "1rem",
            }}
          >
            No games scheduled
          </Typography>
        </Box>
      )}
    </Container>
  );
};

export default Scoreboard;
