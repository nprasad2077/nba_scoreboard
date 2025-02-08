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
    }, 300);

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
      <Box sx={{ textAlign: "center", p: 2, height: "100%" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 2, height: "100%" }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (actions.length === 0) {
    return (
      <Box sx={{ p: 2, height: "100%" }}>
        <Typography color="white" variant="body2">
          No play-by-play data available.
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        px: 6,
        py:4,
      }}
    >
      <TableContainer
        component={Paper}
        sx={{
          flex: 1,
          backgroundColor: "rgb(45,45,45)",
          "&::-webkit-scrollbar": {
            display: "none",
          },
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          "& .MuiTableCell-root": {
            borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
          },
        }}
      >
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell
                sx={{ color: "white", backgroundColor: "rgb(35,35,35)" }}
              >
                Clock
              </TableCell>
              <TableCell
                sx={{ color: "white", backgroundColor: "rgb(35,35,35)" }}
              >
                Team
              </TableCell>
              <TableCell
                sx={{ color: "white", backgroundColor: "rgb(35,35,35)" }}
              >
                Score
              </TableCell>
              <TableCell
                sx={{ color: "white", backgroundColor: "rgb(35,35,35)" }}
              >
                Action
              </TableCell>
              <TableCell
                sx={{ color: "white", backgroundColor: "rgb(35,35,35)" }}
              >
                Description
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {actions.map((action) => (
              <TableRow key={action.actionNumber}>
                <TableCell sx={{ color: "white" }}>
                  {formatClock(action.clock)}
                </TableCell>
                <TableCell sx={{ color: "white" }}>
                  {action.teamTricode || "--"}
                </TableCell>
                <TableCell sx={{ color: "white" }}>
                  {action.scoreAway} - {action.scoreHome}
                </TableCell>
                <TableCell sx={{ color: "white" }}>
                  {action.actionType}
                </TableCell>
                <TableCell sx={{ color: "white" }}>
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
