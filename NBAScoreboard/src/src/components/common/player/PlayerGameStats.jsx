import React from "react";
import {
  Box,
  Typography,
  Button,
  useMediaQuery,
  CircularProgress,
} from "@mui/material";
import PlayerStatsTable from "./PlayerStatsTable";

/**
 * Component for displaying player game statistics
 * 
 * @param {Object} props - Component props
 * @param {Array} props.games - List of games with stats
 * @param {boolean} props.showMore - Whether to show more games
 * @param {Function} props.onShowMore - Function to handle show more button click
 * @param {boolean} props.isLoading - Whether data is loading
 * @returns {JSX.Element} - Rendered component
 */
const PlayerGameStats = ({ games, showMore, onShowMore, isLoading = false }) => {
  const isMobile = useMediaQuery("(max-width:600px)");

  if (!games || games.length === 0) return null;

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography
          variant="h6"
          sx={{
            color: "white",
            fontWeight: 600,
            fontSize: isMobile ? "1rem" : "1.1rem",
          }}
        >
          Last {showMore ? 25 : 10} Games
        </Typography>
        {!showMore && (
          <Button
            onClick={onShowMore}
            variant="outlined"
            disabled={isLoading}
            startIcon={isLoading ? <CircularProgress size={16} color="inherit" /> : null}
            sx={{
              color: "#64b5f6",
              borderColor: "#64b5f6",
              "&:hover": {
                borderColor: "#90caf9",
                backgroundColor: "rgba(100, 181, 246, 0.08)",
              },
              "&.Mui-disabled": {
                borderColor: "rgba(100, 181, 246, 0.3)",
                color: "rgba(100, 181, 246, 0.3)",
              }
            }}
          >
            {isLoading ? "Loading..." : "Show More"}
          </Button>
        )}
      </Box>

      {isLoading && showMore ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress color="primary" />
        </Box>
      ) : (
        <PlayerStatsTable games={games} />
      )}
    </Box>
  );
};

export default PlayerGameStats;