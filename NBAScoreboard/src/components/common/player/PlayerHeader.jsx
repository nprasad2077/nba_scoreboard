import React, { memo } from "react";
import { Box, Avatar, Typography, useMediaQuery } from "@mui/material";
import { getPlayerImageUrl } from "../../../services/playerService";

/**
 * Component for displaying player header information
 * 
 * @param {Object} props - Component props
 * @param {Object} props.playerInfo - Player information object
 * @returns {JSX.Element} - Rendered component
 */
const PlayerHeader = ({ playerInfo }) => {
  const isMobile = useMediaQuery("(max-width:600px)");

  if (!playerInfo) return null;

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        mb: 3,
        gap: 2,
      }}
    >
      <Avatar
        src={getPlayerImageUrl(playerInfo.person_id)}
        alt={playerInfo.display_name}
        sx={{
          width: isMobile ? 60 : 80,
          height: isMobile ? 60 : 80,
          border: "2px solid rgba(255, 255, 255, 0.08)",
          backgroundColor: "#262626",
        }}
      />
      <Box>
        <Typography
          variant="h6"
          sx={{
            color: "white",
            fontWeight: 600,
            fontSize: isMobile ? "1.1rem" : "1.25rem",
          }}
        >
          {playerInfo.display_name}
        </Typography>
        <Typography
          sx={{
            color: "#64b5f6",
            fontSize: isMobile ? "1rem" : "1.1rem",
            fontWeight: 500,
          }}
        >
          {playerInfo.team_abbreviation}
        </Typography>
      </Box>
    </Box>
  );
};

export default memo(PlayerHeader);