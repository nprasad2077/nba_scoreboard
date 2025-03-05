// Scoreboard.jsx
import React, { useState } from "react";
import { Box, Container, Typography, useMediaQuery } from "@mui/material";
import GameDetailsModal from "./GameDetailsModal";
import Header from "./common/Header";
import GameCategorySection from "./common/GameCategorySection";
import { categorizeGames } from "../utils/dateUtils";

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
    // Priority order: higher period first, then lower time (closer to 0:00)
    const period = game.period || 0;
    
    // Handle OT periods (value them higher than regulation periods)
    let periodValue = period;
    if (period >= 5) {
      // OT periods are coded as 5, 6, 7, etc. (5 = 1OT, 6 = 2OT, etc.)
      // We want to value them higher than regulation periods (1-4)
      periodValue = period + 4; // This makes 1OT (period 5) = value 9, etc.
    }
    
    // Calculate time in seconds from the clock string
    let timeInSeconds = 12 * 60; // Default to maximum (12:00)
    
    if (game.clock) {
      // Parse the clock format (e.g., "PT06M54.00S")
      const minutesMatch = game.clock.match(/PT(\d+)M/);
      const secondsMatch = game.clock.match(/M(\d+\.\d+)S/);
      
      if (minutesMatch && secondsMatch) {
        const minutes = parseInt(minutesMatch[1]);
        const seconds = Math.floor(parseFloat(secondsMatch[1]));
        timeInSeconds = (minutes * 60) + seconds;
      }
    }
    
    // Return a single value that can be compared
    // Higher periodValue means later in the game
    // Lower timeInSeconds means closer to end of period
    // Multiply periodValue by a large number to ensure period takes precedence
    return (periodValue * 100000) - timeInSeconds;
  };
  
  // Get the progress values for both games
  const valueA = getGameProgressValue(a);
  const valueB = getGameProgressValue(b);
  
  // Sort in descending order (highest progress value first)
  return valueB - valueA;
};

/**
 * Main scoreboard component for displaying live games
 *
 * @param {Object} props - Component props
 * @param {Array} props.games - List of games to display
 * @param {boolean} props.isConnected - Connection status
 * @param {Date} props.lastUpdateTime - Time of last update
 * @returns {JSX.Element} - Rendered component
 */
const Scoreboard = ({ games, isConnected, lastUpdateTime }) => {
  const isMobile = useMediaQuery("(max-width:600px)");
  const [selectedGame, setSelectedGame] = useState(null);
  const [boxScoreOpen, setBoxScoreOpen] = useState(false);
  const [showCompletedGames, setShowCompletedGames] = useState(true);

  // Categorize games into live, scheduled, and completed using game_status
  const { liveGames, scheduledGames, completedGames } = categorizeGames(games);

  // Sort live games by progress (games closest to completion first)
  const sortedLiveGames = [...liveGames].sort(sortGamesByProgress);

  // For completed games, we can sort by game_id (more recent games first) or keep as is
  // For scheduled games, we can sort by start time (game_time)
  const sortedScheduledGames = [...scheduledGames].sort((a, b) => {
    return new Date(a.game_time) - new Date(b.game_time);
  });

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
        maxWidth: "1400px !important",
      }}
    >
      {/* Header */}
      <Header title="Scoreboard" />

      {/* Game Sections */}
      <GameCategorySection
        games={sortedLiveGames}
        title="Live Games"
        onBoxScoreClick={handleBoxScoreClick}
        isLive={true}
      />

      <GameCategorySection
        games={sortedScheduledGames}
        title="Upcoming Games"
        onBoxScoreClick={handleBoxScoreClick}
      />

      <GameCategorySection
        games={completedGames}
        title="Completed Games"
        onBoxScoreClick={handleBoxScoreClick}
        collapsible={true}
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
            No games scheduled
          </Typography>
        </Box>
      )}
    </Container>
  );
};

export default Scoreboard;