import React from "react";
import {
  Card,
  CardContent,
  Box,
  Typography,
  Stack,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import TeamInfo from "./TeamInfo";
import { formatGameTime } from "../../utils/dateUtils";

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

  // Extract team info from the game object based on the available structure
  const awayTeam = game.away_team?.team_name || game.away_team;
  const awayTricode = game.away_team?.team_tricode || game.away_tricode;
  const homeTeam = game.home_team?.team_name || game.home_team;
  const homeTricode = game.home_team?.team_tricode || game.home_tricode;

  // Handle score based on available structure
  let scoreStr = game.score;
  if (!scoreStr && game.away_team && game.home_team) {
    scoreStr = `${game.away_team.score || 0} - ${game.home_team.score || 0}`;
  }

  const [awayScore, homeScore] = (scoreStr || "0 - 0")
    .split(" - ")
    .map((score) => parseInt(score) || 0);

  // Use our new function to determine game status based on properties
  const gameStatus = formatGameTime(game);

  // Check if game is not started yet (status 1)
  const isNotStarted = game.game_status === 1;

  // Hide the score for upcoming games
  const awayDisplayScore = isNotStarted ? "" : awayScore;
  const homeDisplayScore = isNotStarted ? "" : homeScore;

  // Format the game status display
  const displayStatus = gameStatus === "0Q 0:00" ? "Pre-Game" : gameStatus;

  console.log("Game card rendering:", {
    id: game.game_id,
    awayTeam,
    awayTricode,
    homeTeam,
    homeTricode,
    gameStatus,
    isNotStarted,
  });

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
            teamName={awayTeam}
            tricode={awayTricode}
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
              {isNotStarted
                ? displayStatus.replace("Start: ", "")
                : displayStatus}{" "}
            </Typography>
          </Box>

          <TeamInfo
            teamName={homeTeam}
            tricode={homeTricode}
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
