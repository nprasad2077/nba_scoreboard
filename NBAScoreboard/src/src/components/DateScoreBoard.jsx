// DateScoreBoard.jsx
import React, { useState, useEffect } from "react";
import { Box, Container, Typography, useMediaQuery } from "@mui/material";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import GameDetailsModal from "./GameDetailsModal";
import GameCategorySection from "./common/GameCategorySection";
import Header from "./common/Header";
import { categorizeGames } from "../utils/pastDateUtils";
import { fetchHistoricalGames } from "../services/apiService";

/**
 * Simple helper to transform the raw game data returned by the new endpoint
 * into the shape our UI expects (same as the “old” format).
 */
function transformGames(rawGames) {
  return rawGames.map((g) => {
    const awayScore = g.away_team?.score ?? 0;
    const homeScore = g.home_team?.score ?? 0;
    return {
      // Match the property names used in the UI
      gameId: g.game_id, // was "game_id" in the new data
      away_team: g.away_team?.team_name || "",
      away_tricode: g.away_team?.team_tricode || "",
      home_team: g.home_team?.team_name || "",
      home_tricode: g.home_team?.team_tricode || "",
      score: `${awayScore} - ${homeScore}`,
      // "clock" is already "Final" or similar, so we can store that in the "time" field
      time: g.clock || "",
    };
  });
}

/**
 * Date selector component with custom styling
 */
const DateSelector = ({ selectedDate, onDateChange }) => {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DatePicker
        label="Select Date"
        value={selectedDate}
        onChange={onDateChange}
        sx={{
          bgcolor: "background.paper",
          borderRadius: 1,
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
  );
};

/**
 * Main DateScoreBoard component for displaying historical games by date
 */
const DateScoreBoard = () => {
  const isMobile = useMediaQuery("(max-width:600px)");
  const [games, setGames] = useState([]);
  const [selectedGame, setSelectedGame] = useState(null);
  const [boxScoreOpen, setBoxScoreOpen] = useState(false);
  const [showCompletedGames, setShowCompletedGames] = useState(true);

  // Default date is yesterday
  const [selectedDate, setSelectedDate] = useState(dayjs().subtract(1, "day"));
  const [lastUpdateTime, setLastUpdateTime] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  /**
   * Fetch games data when date changes
   */
  useEffect(() => {
    const loadGames = async () => {
      try {
        // Fetch the new raw data
        const rawGames = await fetchHistoricalGames(selectedDate);
        // Transform so our UI code can handle it
        const transformed = transformGames(rawGames);
        setGames(transformed);
        setLastUpdateTime(new Date());
        setIsConnected(true);
      } catch (error) {
        console.error("Error fetching historical games:", error);
        setIsConnected(false);
      }
    };

    loadGames();
  }, [selectedDate]);

  // Date change handler
  const handleDateChange = (newDate) => {
    setSelectedDate(newDate);
  };

  // Categorize games into live, scheduled, and completed
  const { liveGames, scheduledGames, completedGames } = categorizeGames(games);

  // Click handler for an in-progress or completed game => open modal
  const handleBoxScoreClick = (game) => {
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
      {/* Header with date selector */}
      <Box
        sx={{
          mb: isMobile ? 2 : 3,
          display: "flex", 
          flexDirection: "column",
          gap: 2
        }}
      >
        <Header
          isConnected={isConnected}
          lastUpdateTime={lastUpdateTime}
          title="Box Scores"
        />
        
        <DateSelector
          selectedDate={selectedDate}
          onDateChange={handleDateChange}
        />
      </Box>

      {/* Game Sections */}
      <GameCategorySection 
        games={liveGames} 
        title="Live Games" 
        onBoxScoreClick={handleBoxScoreClick} 
        isLive
      />
      
      <GameCategorySection 
        games={scheduledGames} 
        title="Upcoming Games" 
        onBoxScoreClick={handleBoxScoreClick}
      />
      
      <GameCategorySection 
        games={completedGames} 
        title="Completed Games" 
        onBoxScoreClick={handleBoxScoreClick}
        collapsible
        expanded={showCompletedGames}
        onToggleExpand={() => setShowCompletedGames(!showCompletedGames)}
      />

      {/* Game Details Modal */}
      <GameDetailsModal
        gameId={selectedGame}
        open={boxScoreOpen}
        onClose={() => {
          setBoxScoreOpen(false);
          setSelectedGame(null);
        }}
      />

      {/* Empty State */}
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
            No games scheduled for this date
          </Typography>
        </Box>
      )}
    </Container>
  );
};

export default DateScoreBoard;
