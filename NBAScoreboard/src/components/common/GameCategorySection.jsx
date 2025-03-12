import React from "react";
import { Box, Typography, IconButton, Collapse } from "@mui/material";
import { KeyboardArrowDown, KeyboardArrowUp } from "@mui/icons-material";
import GameCard from "./GameCard";

/**
 * Section for displaying a category of games (live, upcoming, completed)
 * 
 * @param {Object} props - Component props
 * @param {Array} props.games - List of games to display
 * @param {string} props.title - Section title
 * @param {Function} props.onBoxScoreClick - Click handler for box score
 * @param {boolean} props.collapsible - Whether section is collapsible
 * @param {boolean} props.isLive - Whether games are live (displays animated dot)
 * @returns {JSX.Element} - Rendered component
 */
const GameCategorySection = ({ 
  games, 
  title, 
  onBoxScoreClick, 
  collapsible = false,
  expanded = true,
  onToggleExpand,
  isLive = false
}) => {
  const isMobile = window.matchMedia("(max-width:600px)").matches;

  if (games.length === 0) return null;

  return (
    <Box mb={isMobile ? 2 : 4}>
      <Typography
        variant={isMobile ? "subtitle1" : "h6"}
        gutterBottom
        sx={{
          display: "flex",
          justifyContent: collapsible ? "space-between" : "flex-start",
          alignItems: "center",
          fontSize: isMobile ? "1rem" : "1.25rem"
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center" }}>
          {isLive && (
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
          )}
          {title}
        </Box>
        
        {collapsible && (
          <IconButton
            size={isMobile ? "small" : "medium"}
            onClick={onToggleExpand}
            sx={{
              ml: 1,
              padding: isMobile ? "4px" : "8px",
            }}
          >
            {expanded ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
          </IconButton>
        )}
      </Typography>

      <Collapse in={expanded}>
        {games.map((game, index) => (
          <GameCard
            key={index}
            game={game}
            onBoxScoreClick={onBoxScoreClick}
          />
        ))}
      </Collapse>
    </Box>
  );
};

export default GameCategorySection;