// Scoreboard.jsx
import React, { useState } from "react";
import { Box, Container, Typography, useMediaQuery } from "@mui/material";
import GameDetailsModal from "./GameDetailsModal";
import Header from "./common/Header";
import GameCard from "./common/GameCard";
import GameCategorySection from "./common/GameCategorySection";
import { categorizeGames } from "../utils/dateUtils";

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
        maxWidth: "1400px !important",
      }}
    >
      {/* Header */}
      <Header
        isConnected={isConnected}
        lastUpdateTime={lastUpdateTime}
        title="Scoreboard"
      />

      {/* Game Sections */}
      <GameCategorySection 
        games={liveGames} 
        title="Live Games" 
        onBoxScoreClick={handleBoxScoreClick} 
        isLive={true}
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
