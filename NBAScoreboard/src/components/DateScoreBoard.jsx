// DateScoreBoard.jsx
import React, { useState, useEffect } from "react";
import { Box, Container, Typography, useMediaQuery } from "@mui/material";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import GameDetailsModal from "./GameDetailsModal";
import GameCategorySection from "./common/GameCategorySection";
import Header from "./common/Header";
import { categorizeGames } from "../utils/dateUtils"; // Use dateUtils instead of pastDateUtils
import { fetchHistoricalGames } from "../services/apiService";

/**
 * Sort function that orders games by period and time,
 * with games closest to completion first (OT/4Q 00:00) 
 * down to games that are just starting (Pregame/1Q 12:00)
 * 
 * @param {Object} a - First game to compare
 * @param {Object} b - Second game to compare
 * @returns {number} - Sorting value
 */
const sortGamesByProgress = (a, b) => {
  // Helper function to convert game time to a comparable value
  const getGameProgressValue = (game) => {
    // For DateScoreBoard, we need to parse period and clock differently
    // since the format may be different from the live Scoreboard games
    
    // Default to lowest priority if we can't determine
    let periodValue = 0;
    let timeInSeconds = 12 * 60; // Default to maximum (12:00)
    
    // Extract period and time from the time string (e.g. "3Q 2:45" or "Final")
    if (game.time) {
      if (game.time === "Final") {
        // Completed games get highest priority
        return 999999;
      }
      
      if (game.time.startsWith("Start:")) {
        // Scheduled games get lowest priority
        return -999999;
      }
      
      // Try to parse period (e.g., "3Q" or "2OT")
      const periodMatch = game.time.match(/(\d+)Q/) || game.time.match(/(\d+)OT/);
      const isOT = game.time.includes("OT");
      
      if (periodMatch) {
        periodValue = parseInt(periodMatch[1]);
        // OT periods should be valued higher than regulation
        if (isOT) {
          periodValue += 4; // Make OT periods higher than regulation
        }
      }
      
      // Try to parse clock time (e.g., "10:30")
      const timeMatch = game.time.match(/(\d+):(\d+)/);
      if (timeMatch) {
        const minutes = parseInt(timeMatch[1]);
        const seconds = parseInt(timeMatch[2]);
        timeInSeconds = (minutes * 60) + seconds;
      }
    }
    
    // Return a single comparable value
    // Higher periodValue means later in the game
    // Lower timeInSeconds means closer to end of period
    return (periodValue * 100000) - timeInSeconds;
  };
  
  // Get the progress values for both games
  const valueA = getGameProgressValue(a);
  const valueB = getGameProgressValue(b);
  
  // Sort in descending order (highest progress value first)
  return valueB - valueA;
};

/**
 * Simple helper to transform the raw game data returned by the new endpoint
 * into the shape our UI expects (same as the "old" format).
 */
function transformGames(rawGames) {
  return rawGames.map((g) => {
    const awayScore = g.away_team?.score ?? 0;
    const homeScore = g.home_team?.score ?? 0;
    return {
      // Match the property names used in the UI
      gameId: g.game_id, // was "game_id" in the new data
      game_id: g.game_id, // Keep original field too
      period: g.period || 0,
      clock: g.clock || null,
      game_time: g.game_time || null,
      game_status: g.game_status || 0,
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
        // Disable future dates
        maxDate={dayjs().endOf('day')}
        disableFuture={true}
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

  /**
   * Fetch games data when date changes
   */
  useEffect(() => {
    console.log("Date changed in useEffect:", selectedDate.format("YYYY-MM-DD"));
    
    const loadGames = async () => {
      try {
        console.log("Starting to fetch games for date:", selectedDate.format("YYYY-MM-DD"));
        
        // Fetch the new raw data
        const rawGames = await fetchHistoricalGames(selectedDate);
        
        // Check if we have data
        if (!rawGames || rawGames.length === 0) {
          console.log("No games found for the selected date");
          setGames([]);
          return;
        }

        console.log("Raw games data:", rawGames);
        
        // Transform so our UI code can handle it
        const transformed = transformGames(rawGames);
        console.log("Transformed games:", transformed);
        
        // Apply time conversion if needed
        const processedGames = transformed.map(game => {
          // Convert game time to local time if needed
          if (game.time && game.time.startsWith("Start:")) {
            // Use the imported function from dateUtils
            return {
              ...game,
              time: game.time // Already in the right format
            };
          }
          return game;
        });
        
        setGames(processedGames);
      } catch (error) {
        console.error("Error fetching historical games:", error);
      }
    };

    loadGames();
  }, [selectedDate]);

  // Date change handler
  const handleDateChange = (newDate) => {
    console.log("Date changed to:", newDate.format("YYYY-MM-DD"));
    setSelectedDate(newDate);
  };

  // Categorize games into live, scheduled, and completed
  const { liveGames, scheduledGames, completedGames } = categorizeGames(games);

  // Sort live games by progress (games closest to completion first)
  const sortedLiveGames = [...liveGames].sort(sortGamesByProgress);

  // For scheduled games, sort by game time
  const sortedScheduledGames = [...scheduledGames].sort((a, b) => {
    if (a.game_time && b.game_time) {
      return new Date(a.game_time) - new Date(b.game_time);
    }
    return 0;
  });

  // Click handler for an in-progress or completed game => open modal
  const handleBoxScoreClick = (game) => {
    console.log("Selected game for box score:", game);
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
        maxWidth: "1400px !important",
      }}
    >
      {/* Header */}
      <Header
        title="Box Scores"
      />
      
      {/* Date Picker - Moved to a more user-friendly location */}
      <Box 
        sx={{ 
          mb: isMobile ? 3 : 4,
          display: "flex",
          justifyContent: "flex-start",
          mt: 2
        }}
      >
        <DateSelector
          selectedDate={selectedDate}
          onDateChange={handleDateChange}
        />
      </Box>

      {/* Game Sections */}
      {sortedLiveGames.length > 0 && (
        <GameCategorySection 
          games={sortedLiveGames} 
          title="Live Games" 
          onBoxScoreClick={handleBoxScoreClick} 
          isLive
        />
      )}
      
      {sortedScheduledGames.length > 0 && (
        <GameCategorySection 
          games={sortedScheduledGames} 
          title="Upcoming Games" 
          onBoxScoreClick={handleBoxScoreClick}
        />
      )}
      
      {completedGames.length > 0 && (
        <GameCategorySection 
          games={completedGames} 
          title="Completed Games" 
          onBoxScoreClick={handleBoxScoreClick}
          collapsible
          expanded={showCompletedGames}
          onToggleExpand={() => setShowCompletedGames(!showCompletedGames)}
        />
      )}

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