import React from "react";
import { Box } from "@mui/material";

const ConnectionIndicator = ({ connected }) => (
  <Box
    component="span"
    sx={{
      width: 8,
      height: 8,
      borderRadius: "50%",
      backgroundColor: connected ? "#4caf50" : "#f44336", // green when connected, red when disconnected
      display: "inline-block",
      mr: 1,
      "@keyframes pulse": {
        "0%": {
          transform: "scale(0.95)",
          boxShadow: "0 0 0 0 rgba(76, 175, 80, 0.7)",
        },
        "70%": {
          transform: "scale(1)",
          boxShadow: "0 0 0 6px rgba(76, 175, 80, 0)",
        },
        "100%": {
          transform: "scale(0.95)",
          boxShadow: "0 0 0 0 rgba(76, 175, 80, 0)",
        },
      },
      animation: connected ? "pulse 2s infinite" : "none",
    }}
  />
);

export default ConnectionIndicator;
