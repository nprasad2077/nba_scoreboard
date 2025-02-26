import React from "react";
import { Box, Typography, useMediaQuery } from "@mui/material";
import ConnectionIndicator from "../ConnectionIndicator";
import NBA from "../../assets/nba_logos/NBA_logo.svg";

/**
 * Header component for scoreboards
 * 
 * @param {Object} props - Component props
 * @param {boolean} props.isConnected - Connection status
 * @param {Date} props.lastUpdateTime - Time of last update
 * @param {string} props.title - Title to display
 * @returns {JSX.Element} - Rendered component
 */
const Header = ({ isConnected, lastUpdateTime, title = "Scoreboard" }) => {
  const isMobile = useMediaQuery("(max-width:600px)");

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        mb: isMobile ? 2 : 3,
        backgroundColor: "#101010",
        borderRadius: 2,
        padding: isMobile ? "12px 16px" : "16px 24px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <Box
          component="img"
          src={NBA}
          alt="NBA Logo"
          sx={{
            height: isMobile ? "24px" : "32px",
            width: "auto",
          }}
        />
        <Typography
          variant={isMobile ? "h6" : "h4"}
          sx={{
            fontSize: isMobile ? "1.5rem" : "2rem",
            fontWeight: 500,
            letterSpacing: "0.5px",
            color: "#ffffff",
          }}
        >
          {title}
        </Typography>
      </Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <ConnectionIndicator connected={isConnected} />
        {lastUpdateTime && (
          <Typography
            variant="caption"
            sx={{
              opacity: 0.7,
              fontSize: isMobile ? "0.7rem" : "0.75rem",
            }}
          >
            Last update:{" "}
            {lastUpdateTime.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            })}
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default Header;