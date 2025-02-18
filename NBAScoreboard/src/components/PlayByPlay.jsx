import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  useMediaQuery,
  Alert,
} from "@mui/material";

const PlayByPlay = ({ gameId }) => {
  const [actions, setActions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const socketRef = useRef(null);
  const isMobile = useMediaQuery("(max-width:600px)");

  useEffect(() => {
    setLoading(true);
    setInitialLoadComplete(false);
    setError(null);

    if (!gameId) {
      setError("Missing game ID");
      setLoading(false);
      return;
    }

    const minimumLoadingTimer = setTimeout(() => {
      setInitialLoadComplete(true);
    }, 200);

    const socketUrl = `ws://localhost:8000/ws/playbyplay/${gameId}`;
    console.log("Connecting to:", socketUrl);

    try {
      const socket = new WebSocket(socketUrl);
      socketRef.current = socket;

      socket.onopen = () => {
        console.log("PlayByPlay WebSocket connected");
        setError(null);
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.game?.actions) {
            const sorted = [...data.game.actions].sort(
              (a, b) => b.actionNumber - a.actionNumber
            );
            setActions(sorted);
          }
          setLoading(false);
        } catch (err) {
          console.error("Error parsing PBP data:", err);
          setError("Error processing game data");
          setLoading(false);
        }
      };

      socket.onerror = (err) => {
        console.error("PlayByPlay socket error:", err);
        setError("Connection error occurred");
        setLoading(false);
      };

      socket.onclose = () => {
        console.log("PlayByPlay socket disconnected");
        if (!error) {
          setError("Connection closed");
        }
      };

      return () => {
        clearTimeout(minimumLoadingTimer);
        if (
          socketRef.current &&
          socketRef.current.readyState === WebSocket.OPEN
        ) {
          socketRef.current.close();
        }
      };
    } catch (err) {
      console.error("Error setting up WebSocket:", err);
      setError("Failed to establish connection");
      setLoading(false);
    }
  }, [gameId]);

  if (loading || !initialLoadComplete) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "200px",
        }}
      >
        <CircularProgress sx={{ color: "#64b5f6" }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 2, height: "100%" }}>
        <Alert
          severity="error"
          sx={{
            backgroundColor: "rgba(244, 67, 54, 0.1)",
            color: "#f44336",
            "& .MuiAlert-icon": {
              color: "#f44336",
            },
          }}
        >
          {error}
        </Alert>
      </Box>
    );
  }

  if (actions.length === 0) {
    return (
      <Box
        sx={{
          p: 2,
          height: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Typography
          sx={{
            color: "rgba(255, 255, 255, 0.7)",
            fontSize: isMobile ? "0.875rem" : "1rem",
          }}
        >
          No play-by-play data available.
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        width: "100%",
        py: 2,
        px: isMobile ? 1 : 3,
        backgroundColor: "#101010",
        overflow: "auto",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        "&::-webkit-scrollbar": {
          display: "none",
        },
        msOverflowStyle: "none",
        scrollbarWidth: "none",
      }}
    >
      <TableContainer
        component={Paper}
        sx={{
          backgroundColor: "#101010",
          borderRadius: "12px",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.4)",
          overflow: "hidden",
          "&::-webkit-scrollbar": {
            display: "none",
          },
          msOverflowStyle: "none",
          scrollbarWidth: "none",
        }}
      >
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell
                sx={{
                  backgroundColor: "#101010",
                  color: "rgba(255, 255, 255, 0.95)",
                  fontWeight: 600,
                  fontSize: isMobile ? "0.75rem" : "0.875rem",
                  padding: isMobile ? "8px 4px" : "12px 16px",
                  borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
                  width: isMobile ? "60px" : "80px",
                }}
              >
                Clock
              </TableCell>
              <TableCell
                sx={{
                  backgroundColor: "#101010",
                  color: "rgba(255, 255, 255, 0.95)",
                  fontWeight: 600,
                  fontSize: isMobile ? "0.75rem" : "0.875rem",
                  padding: isMobile ? "8px 4px" : "12px 16px",
                  borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
                  width: "60px",
                }}
              >
                Team
              </TableCell>
              <TableCell
                sx={{
                  backgroundColor: "#101010",
                  color: "rgba(255, 255, 255, 0.95)",
                  fontWeight: 600,
                  fontSize: isMobile ? "0.75rem" : "0.875rem",
                  padding: isMobile ? "8px 4px" : "12px 16px",
                  borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
                  width: "100px",
                }}
              >
                Score
              </TableCell>
              <TableCell
                sx={{
                  backgroundColor: "#101010",
                  color: "rgba(255, 255, 255, 0.95)",
                  fontWeight: 600,
                  fontSize: isMobile ? "0.75rem" : "0.875rem",
                  padding: isMobile ? "8px 4px" : "12px 16px",
                  borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
                  width: "100px",
                }}
              >
                Action
              </TableCell>
              <TableCell
                sx={{
                  backgroundColor: "#101010",
                  color: "rgba(255, 255, 255, 0.95)",
                  fontWeight: 600,
                  fontSize: isMobile ? "0.75rem" : "0.875rem",
                  padding: isMobile ? "8px 4px" : "12px 16px",
                  borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
                }}
              >
                Description
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {actions.map((action, index) => (
              <TableRow
                key={action.actionNumber}
                sx={{
                  backgroundColor:
                    index % 2 === 0
                      ? "rgba(255, 255, 255, 0.01)"
                      : "transparent",
                  "&:hover": {
                    backgroundColor: "rgba(255, 255, 255, 0.03)",
                  },
                }}
              >
                <TableCell
                  sx={{
                    color: "rgba(255, 255, 255, 0.87)",
                    padding: isMobile ? "8px 4px" : "12px 16px",
                    fontSize: isMobile ? "0.75rem" : "0.875rem",
                    borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
                  }}
                >
                  {formatClock(action.clock)}
                </TableCell>
                <TableCell
                  sx={{
                    color: "rgba(255, 255, 255, 0.87)",
                    padding: isMobile ? "8px 4px" : "12px 16px",
                    fontSize: isMobile ? "0.75rem" : "0.875rem",
                    borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
                  }}
                >
                  {action.teamTricode || "--"}
                </TableCell>
                <TableCell
                  sx={{
                    color: "#64b5f6",
                    padding: isMobile ? "8px 4px" : "12px 16px",
                    fontSize: isMobile ? "0.75rem" : "0.875rem",
                    borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
                    fontWeight: 500,
                  }}
                >
                  {action.scoreAway} - {action.scoreHome}
                </TableCell>
                <TableCell
                  sx={{
                    color: "rgba(255, 255, 255, 0.87)",
                    padding: isMobile ? "8px 4px" : "12px 16px",
                    fontSize: isMobile ? "0.75rem" : "0.875rem",
                    borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
                  }}
                >
                  {action.actionType}
                </TableCell>
                <TableCell
                  sx={{
                    color: "rgba(255, 255, 255, 0.87)",
                    padding: isMobile ? "8px 4px" : "12px 16px",
                    fontSize: isMobile ? "0.75rem" : "0.875rem",
                    borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
                  }}
                >
                  {action.description}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

const formatClock = (clockStr) => {
  if (!clockStr?.startsWith("PT")) return clockStr;
  const match = clockStr.match(/PT(\d+)M(\d+(\.\d+)?)S/);
  if (!match) return clockStr;

  const minutes = parseInt(match[1]) || 0;
  let seconds = parseFloat(match[2]) || 0;
  seconds = Math.round(seconds * 10) / 10;

  return `${minutes}:${seconds.toFixed(1).padStart(4, "0")}`.replace(
    /\.0$/,
    ""
  );
};

export default PlayByPlay;
