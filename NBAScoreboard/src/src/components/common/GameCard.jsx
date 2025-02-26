import React from "react";
import { Card, CardContent, Box, Typography, Stack, useTheme, useMediaQuery } from "@mui/material";
import TeamInfo from "./TeamInfo";
import { convertToLocalTime } from "../../utils/dateUtils";

/**
 * Single game card component
 * 
 * @param {Object} props - Component props
 * @param {Object} props.game - Game data
 * @param {Function} props.onBoxScoreClick - Click handler for box score
 * @returns {JSX.Element} - Rendered component
 */
const GameCard = ({ game, onBoxScoreClick }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery("(max-width:600px)");
  const [awayScore, homeScore] = game.score.split(" - ").map((score) => parseInt(score) || 0);

  // Convert the game time to local timezone
  const gameStatus = convertToLocalTime(game.time);

  // Check if game is not started yet
  const isNotStarted = gameStatus.startsWith("Start:") || gameStatus.startsWith("0Q");

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
        mb: isMobile ? 1 : 3,
        backgroundColor: "#262626", // Lighter than background for contrast
        boxShadow: "0 3px 12px rgba(0,0,0,0.3)", // More pronounced shadow
        transition: "all 0.2s ease-in-out",
        "&:hover": {
          transform: isNotStarted ? "none" : "scale(1.01)",
          backgroundColor: "#2d2d2d", // Slightly lighter on hover
        },
        height: isMobile ? "120px" : "150px",
        border: "1px solid rgba(255, 255, 255, 0.08)", // Subtle border
        borderRadius: "12px", // Slightly more rounded corners
        width: "100%",
        maxWidth: "100%",
      }}
    >
      <CardContent
        sx={{
          position: "relative",
          p: isMobile ? "16px !important" : "24px !important",
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
            <Typography
              variant="body2"
              sx={{
                color: "#ffffff",
                opacity: 0.5,
                letterSpacing: "0.5px",
                fontWeight: 400,
                fontSize: isMobile ? "0.875rem" : "1.25rem",
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

export default GameCard;