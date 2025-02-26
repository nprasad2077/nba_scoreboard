// DateScoreBoard.jsx
import React, { useState, useEffect } from "react";
import GameDetailsModal from "./GameDetailsModal";
import NBA from "../assets/nba_logos/NBA_logo.svg";
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
import { DemoContainer } from "@mui/x-date-pickers/internals/demo";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";

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

const Header = ({ lastUpdateTime, isMobile, selectedDate, onDateChange }) => (
  <Box
    sx={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      mb: isMobile ? 2 : 3,
      backgroundColor: "#101010",
      borderRadius: 2,
      padding: isMobile ? "12px 16px" : "16px 24px",
      boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
    }}
  >
    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
      <Box
        component="img"
        src={NBA}
        alt="NBA Logo"
        sx={{
          height: isMobile ? "24px" : "32px",
          width: "auto",
        }}
      />
      <Typography
        variant={isMobile ? "h6" : "h4"}
        sx={{
          fontSize: isMobile ? "1.5rem" : "2rem",
          fontWeight: 500,
          letterSpacing: "0.5px",
          color: "#ffffff",
        }}
      >
        Box Scores
      </Typography>
    </Box>
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DatePicker
        label="Select Date"
        value={selectedDate}
        onChange={onDateChange}
        sx={{
          "& .MuiOutlinedInput-root": {
            backgroundColor: "#262626",
            color: "white",
            "&:hover": {
              backgroundColor: "#2d2d2d",
            },
            "& fieldset": {
              borderColor: "rgba(255, 255, 255, 0.08)",
            },
            "&:hover fieldset": {
              borderColor: "rgba(255, 255, 255, 0.2)",
            },
            "&.Mui-focused fieldset": {
              borderColor: "#64b5f6",
            },
          },
          "& .MuiInputLabel-root": {
            color: "rgba(255, 255, 255, 0.7)",
            "&.Mui-focused": {
              color: "#64b5f6",
            },
          },
        }}
      />
    </LocalizationProvider>
  </Box>
);

/**
 * Converts Eastern Standard Time (EST) to local time
 * @param {string} timeStr - Time string in format "Start: HH:MM PM"
 * @returns {string} - Formatted time string in local timezone
 */
const convertToLocalTime = (timeStr) => {
  // If it's not a start time (e.g., "1Q 10:44" or "Final"), return as is
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

  // Create a date object with the game time in EST
  // Adding 5 hours to convert EST to UTC (EST is UTC-5)
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
        gap: isMobile ? 1.5 : 3,
        flexDirection: isHomeTeam ? "row-reverse" : "row",
        justifyContent: isHomeTeam ? "flex-start" : "flex-start",
        minWidth: isMobile ? "auto" : "300px",
        flex: isMobile ? 1 : "none",
        width: "100%",
        maxWidth: isHomeTeam ? "45%" : "45%",
      }}
    >
      <Box
        component="img"
        src={logoSrc}
        alt={`${teamName} logo`}
        sx={{
          width: isMobile ? 48 : 72,
          height: isMobile ? 48 : 72,
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
          fontWeight="600"
          sx={{
            fontSize: isMobile ? "1rem" : "1.5rem",
            whiteSpace: "nowrap",
            // Remove maxWidth and overflow handling since we're using conditional rendering
            color: "rgba(255, 255, 255, 0.95)",
          }}
        >
          {isMobile ? tricode : teamName}
        </Typography>
        {score !== "" && (
          <Typography
            variant={isMobile ? "h5" : "h4"}
            sx={{
              color: isWinner ? "#64b5f6" : "rgba(255, 255, 255, 0.95)",
              fontWeight: isWinner ? 600 : 500,
              fontSize: isMobile ? "1.5rem" : "2rem", // Increased from h5/h4 to specific sizes
              lineHeight: 1,
              marginTop: "4px",
            }}
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

  // Check if game is not started yet:
  const isNotStarted =
    gameStatus.startsWith("Start:") || gameStatus.startsWith("0Q");

  // Hide the score for upcoming games (isNotStarted).
  const awayDisplayScore = isNotStarted ? "" : awayScore;
  const homeDisplayScore = isNotStarted ? "" : homeScore;

  // Format the game status display (handle "0Q 0:00" as pre-game, etc.)
  const displayStatus = gameStatus === "0Q 0:00" ? "Pre-Game" : gameStatus;

  return (
    <Card
      // Only call onBoxScoreClick if the game has started (i.e., isNotStarted === false). Prevents call for boxscore data if game has not started.
      onClick={() => {
        if (!isNotStarted) {
          onBoxScoreClick(game);
        }
      }}
      sx={{
        cursor: isNotStarted ? "default" : "pointer",
        mb: isMobile ? 1 : 3,
        backgroundColor: "#262626",
        boxShadow: "0 3px 12px rgba(0,0,0,0.3)",
        transition: "all 0.2s ease-in-out",
        "&:hover": {
          transform: isNotStarted ? "none" : "scale(1.01)",
          backgroundColor: "#2d2d2d",
        },
        height: isMobile ? "120px" : "150px",
        border: "1px solid rgba(255, 255, 255, 0.08)",
        borderRadius: "12px",
        width: "100%",
        maxWidth: "100%",
      }}
    >
      <CardContent
        sx={{
          position: "relative",
          p: isMobile ? "16px !important" : "24px !important", // Increased padding
          height: "100%",
          "&:last-child": {
            paddingBottom: isMobile ? "16px !important" : "24px !important",
          },
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
            {/* Game Start Time Display e.g. 7:30 PM */}
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
 * Main DateScoreBoard component
 */
const DateScoreBoard = () => {
  const isMobile = useMediaQuery("(max-width:600px)");
  const [games, setGames] = useState([]);
  const [selectedGame, setSelectedGame] = useState(null);
  const [boxScoreOpen, setBoxScoreOpen] = useState(false);
  const [showAllGames, setShowAllGames] = useState(true);

  // Add state for selected date, default to yesterday
  const [selectedDate, setSelectedDate] = useState(dayjs().subtract(1, "day"));

  // Track the last time we received an update with new information (for display only)
  const [lastUpdateTime, setLastUpdateTime] = useState(null);

  // Connection Indicator
  const [isConnected, setIsConnected] = useState(false);

  /**
   * On mount, establish a WebSocket connection to get live updates.
   */
  useEffect(() => {
    let pollingInterval = null;
    const base_url =
      import.meta.env.VITE_SCORE_URL ||
      "http://192.168.1.71:8000/scoreboard/past";

    const fetchScoreData = async () => {
      try {
        // Format the date as YYYY-MM-DD for the API
        const formattedDate = selectedDate.format("YYYY-MM-DD");
        const api_url = `${base_url}${
          formattedDate !== dayjs().subtract(1, "day").format("YYYY-MM-DD")
            ? `?date=${formattedDate}`
            : ""
        }`;

        const response = await fetch(api_url);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const gamesData = await response.json();
        setGames(gamesData);
        setLastUpdateTime(new Date());
        setIsConnected(true);
      } catch (error) {
        console.error("Error fetching score data:", error);
        setIsConnected(false);
      }
    };

    fetchScoreData();

    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [selectedDate]); // Add selectedDate as a dependency

  // Date change handler
  const handleDateChange = (newDate) => {
    setSelectedDate(newDate);
  };

  /**
   * Helper function to parse period and time for sorting
   * so we can list in-progress games first, etc.
   */
  const parseGameTime = (time) => {
    // "Start: 7:30 PM"
    if (time.startsWith("Start:"))
      return { period: -1, minutes: 0, seconds: 0 };

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
        game.time !== "Final" &&
        !game.time.startsWith("0Q")
    )
    .sort(sortGames);

  const scheduledGames = games.filter(
    (game) => game.time.startsWith("Start:") || game.time.startsWith("0Q")
  );

  const completedGames = games.filter((game) => game.time === "Final");

  /**
   * Click handler to show the BoxScore for a selected game.
   * (This is only called if the game has started, because
   *  we prevent the click in <GameCard> for not-started games.)
   */
  const handleBoxScoreClick = (game) => {
    console.log("selected game: ", game);
    setSelectedGame(game);
    setBoxScoreOpen(true);
  };

  return (
    <Container
      maxWidth="xl"
      sx={{
        py: isMobile ? 2 : 4,
        px: isMobile ? 1 : 2,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        maxWidth: "1200px !important",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 2,
          mb: isMobile ? 2 : 3,
        }}
      >
        {/* Title and Connection Status */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            backgroundColor: "rgba(0, 0, 0, 0.2)",
            borderRadius: 1,
            padding: isMobile ? "6px 12px" : "8px 16px",
          }}
        >
          <Typography
            variant={isMobile ? "subtitle1" : "h6"}
            sx={{ fontSize: isMobile ? "1rem" : "1.25rem" }}
          >
            NBA Box Scores
          </Typography>
          {/* <Box sx={{ display: "flex", alignItems: "center" }}>
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
          </Box> */}
        </Box>

        {/* DatePicker */}
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            label="Select Date"
            value={selectedDate}
            onChange={handleDateChange}
            sx={{
              bgcolor: "background.paper",
              borderRadius: 1,
              "& .MuiOutlinedInput-root": {
                "& fieldset": {
                  borderColor: "rgba(255, 255, 255, 0.23)",
                },
                "&:hover fieldset": {
                  borderColor: "rgba(255, 255, 255, 0.4)",
                },
              },
            }}
          />
        </LocalizationProvider>
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
            {/* Little red dot to indicate live */}
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
            sx={{
              fontSize: isMobile ? "1rem" : "1.25rem",
            }}
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

      {/** GameDetails Modal
       * BoxScore component still uses the REST endpoint `GET /boxscore/{game_id}`
       * We won't call it for games that have not started, because <GameCard>
       * prevents the click if `game.time` starts with "Start:" or "0Q".
       */}
      <GameDetailsModal
        gameId={selectedGame}
        open={boxScoreOpen}
        onClose={() => {
          setBoxScoreOpen(false);
          setSelectedGame(null);
        }}
      />

      {/* Add responsive styling for potential empty state */}
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

export default DateScoreBoard;
