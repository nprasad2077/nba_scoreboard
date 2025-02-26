import React from "react";
import { Box, Typography, useMediaQuery } from "@mui/material";
import { teamLogos } from "../../assets/nba_logos/teamLogosMap";

/**
 * Renders team information (logo, name, score)
 * 
 * @param {Object} props - Component props
 * @param {string} props.teamName - Full team name
 * @param {string} props.tricode - Team three-letter code
 * @param {string|number} props.score - Team score
 * @param {boolean} props.isWinner - Whether team is the winner
 * @param {boolean} props.isHomeTeam - Whether team is home team
 * @returns {JSX.Element} - Rendered component
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
              fontSize: isMobile ? "1.5rem" : "2rem",
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

export default TeamInfo;