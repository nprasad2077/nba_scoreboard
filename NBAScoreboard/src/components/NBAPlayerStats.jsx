import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Autocomplete,
  Typography,
  Box,
  useMediaQuery,
  Avatar,
} from "@mui/material";

const NBAPlayerStats = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [playerStats, setPlayerStats] = useState(null);
  const isMobile = useMediaQuery("(max-width:600px)");

  const getPlayerImagePath = (playerId) => {
    if (!playerId) return null;
    return `https://cdn.nba.com/headshots/nba/latest/1040x760/${playerId}.png`;
  };

  const searchPlayers = async (query) => {
    if (query.length >= 2) {
      try {
        const response = await fetch(
          `http://localhost:8000/players/search/?query=${query}`
        );
        const data = await response.json();
        setSearchResults(data);
      } catch (error) {
        console.error("Error searching players:", error);
      }
    } else {
      setSearchResults([]);
    }
  };

  const fetchPlayerStats = async (playerId) => {
    try {
      const response = await fetch(
        `http://localhost:8000/players/${playerId}/last10`
      );
      const data = await response.json();
      setPlayerStats(data);
    } catch (error) {
      console.error("Error fetching player stats:", error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <Box
      sx={{
        width: "100%",
        py: 2,
        px: isMobile ? 1 : 3,
        backgroundColor: "#101010",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* Search Box */}
      <Box
        sx={{
          mb: 4,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Autocomplete
          options={searchResults}
          getOptionLabel={(option) =>
            `${option.display_name} - ${option.team_abbreviation}`
          }
          onInputChange={(event, newInputValue) => {
            setSearchQuery(newInputValue);
            searchPlayers(newInputValue);
          }}
          onChange={(event, newValue) => {
            setSelectedPlayer(newValue);
            if (newValue) {
              fetchPlayerStats(newValue.person_id);
            }
          }}
          sx={{
            width: "100%",
            maxWidth: 800,
            "& .MuiOutlinedInput-root": {
              backgroundColor: "#262626",
              "&:hover": {
                backgroundColor: "#2d2d2d",
              },
              "& fieldset": {
                borderColor: "rgba(255, 255, 255, 0.08)",
              },
              "&:hover fieldset": {
                borderColor: "rgba(255, 255, 255, 0.2)",
              },
              "&.Mui-focused fieldset": {
                borderColor: "#64b5f6",
              },
            },
            "& .MuiAutocomplete-listbox": {
              backgroundColor: "#262626",
              "& li": {
                color: "white",
                "&:hover": {
                  backgroundColor: "#2d2d2d",
                },
              },
            },
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Search for a player"
              variant="outlined"
              sx={{
                "& .MuiInputLabel-root": {
                  color: "rgba(255, 255, 255, 0.7)",
                  "&.Mui-focused": {
                    color: "#64b5f6",
                  },
                },
                "& .MuiInputBase-input": {
                  color: "white",
                },
              }}
            />
          )}
        />
      </Box>

      {playerStats && (
        <Box
          sx={{
            overflow: "auto",
            flex: 1,
            maxWidth: "1400px",
            margin: "0 auto",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              mb: 3,
              gap: 2,
            }}
          >
            <Avatar
              src={getPlayerImagePath(playerStats?.player_info?.person_id)}
              alt={playerStats?.player_info?.display_name}
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
                {playerStats.player_info.display_name}
              </Typography>
              <Typography
                sx={{
                  color: "#64b5f6",
                  fontSize: isMobile ? "1rem" : "1.1rem",
                  fontWeight: 500,
                }}
              >
                {playerStats.player_info.team_abbreviation}
              </Typography>
            </Box>
          </Box>

          <Typography
            variant="h6"
            sx={{
              mb: 2,
              color: "white",
              fontWeight: 600,
              fontSize: isMobile ? "1rem" : "1.1rem",
            }}
          >
            Last 20 Games
          </Typography>

          <TableContainer
            component={Paper}
            sx={{
              backgroundColor: "#101010",
              borderRadius: "12px",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.4)",
              overflow: "auto",
              "&::-webkit-scrollbar": {
                display: "none",
              },
              msOverflowStyle: "none",
              scrollbarWidth: "none",
              width: "100%",
            }}
          >
            <Table
              size="small"
              stickyHeader
              sx={{
                minWidth: isMobile ? "800px" : "1200px",
                width: "100%",
                tableLayout: "fixed",
              }}
            >
              <colgroup>
                {[
                  { width: "8%" }, // Date
                  { width: "12%" }, // Matchup
                  { width: "4%" }, // W/L
                  { width: "5%" }, // MIN
                  { width: "5%" }, // PTS
                  { width: "7%" }, // FGM-FGA
                  { width: "5%" }, // FG%
                  { width: "7%" }, // 3PM-3PA
                  { width: "5%" }, // 3P%
                  { width: "7%" }, // FTM-FTA
                  { width: "5%" }, // FT%
                  { width: "5%" }, // REB
                  { width: "5%" }, // AST
                  { width: "5%" }, // STL
                  { width: "5%" }, // BLK
                  { width: "5%" }, // TOV
                  { width: "5%" }, // +/-
                ].map((col, index) => (
                  <col key={index} style={{ width: col.width }} />
                ))}
              </colgroup>
              <TableHead>
                <TableRow>
                  {[
                    "Date",
                    "Matchup",
                    "W/L",
                    "MIN",
                    "PTS",
                    "FGM-FGA",
                    "FG%",
                    "3PM-3PA",
                    "3P%",
                    "FTM-FTA",
                    "FT%",
                    "REB",
                    "AST",
                    "STL",
                    "BLK",
                    "TOV",
                    "+/-",
                  ].map((header) => (
                    <TableCell
                      key={header}
                      sx={{
                        backgroundColor: "#101010",
                        color: "rgba(255, 255, 255, 0.95)",
                        fontWeight: 600,
                        fontSize: isMobile ? "0.75rem" : "0.875rem",
                        padding: isMobile ? "8px 4px" : "12px 16px",
                        borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {header}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {playerStats.last_10_games.map((game, index) => (
                  <TableRow
                    key={index}
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
                      {formatDate(game.game_date)}
                    </TableCell>
                    <TableCell
                      sx={{
                        color: "rgba(255, 255, 255, 0.87)",
                        padding: isMobile ? "8px 4px" : "12px 16px",
                        fontSize: isMobile ? "0.75rem" : "0.875rem",
                        borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
                      }}
                    >
                      {game.matchup}
                    </TableCell>
                    <TableCell
                      sx={{
                        color: game.wl === "W" ? "#4caf50" : "#f44336",
                        padding: isMobile ? "8px 4px" : "12px 16px",
                        fontSize: isMobile ? "0.75rem" : "0.875rem",
                        borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
                        fontWeight: 600,
                      }}
                    >
                      {game.wl}
                    </TableCell>
                    <TableCell
                      sx={{
                        color: "rgba(255, 255, 255, 0.87)",
                        padding: isMobile ? "8px 4px" : "12px 16px",
                        fontSize: isMobile ? "0.75rem" : "0.875rem",
                        borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
                      }}
                    >
                      {Math.round(game.min)}
                    </TableCell>
                    <TableCell
                      sx={{
                        color:
                          game.pts >= 20
                            ? "#64b5f6"
                            : "rgba(255, 255, 255, 0.87)",
                        padding: isMobile ? "8px 4px" : "12px 16px",
                        fontSize: isMobile ? "0.75rem" : "0.875rem",
                        borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
                        fontWeight: game.pts >= 20 ? 600 : 400,
                      }}
                    >
                      {game.pts}
                    </TableCell>
                    <TableCell
                      sx={{
                        color: "rgba(255, 255, 255, 0.87)",
                        padding: isMobile ? "8px 4px" : "12px 16px",
                        fontSize: isMobile ? "0.75rem" : "0.875rem",
                        borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
                      }}
                    >
                      {`${game.fgm}-${game.fga}`}
                    </TableCell>
                    <TableCell
                      sx={{
                        color: "rgba(255, 255, 255, 0.87)",
                        padding: isMobile ? "8px 4px" : "12px 16px",
                        fontSize: isMobile ? "0.75rem" : "0.875rem",
                        borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
                      }}
                    >
                      {(game.fg_pct * 100).toFixed(1)}%
                    </TableCell>
                    <TableCell
                      sx={{
                        color: "rgba(255, 255, 255, 0.87)",
                        padding: isMobile ? "8px 4px" : "12px 16px",
                        fontSize: isMobile ? "0.75rem" : "0.875rem",
                        borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
                      }}
                    >
                      {`${game.fg3m}-${game.fg3a}`}
                    </TableCell>
                    <TableCell
                      sx={{
                        color: "rgba(255, 255, 255, 0.87)",
                        padding: isMobile ? "8px 4px" : "12px 16px",
                        fontSize: isMobile ? "0.75rem" : "0.875rem",
                        borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
                      }}
                    >
                      {(game.fg3_pct * 100).toFixed(1)}%
                    </TableCell>
                    <TableCell
                      sx={{
                        color: "rgba(255, 255, 255, 0.87)",
                        padding: isMobile ? "8px 4px" : "12px 16px",
                        fontSize: isMobile ? "0.75rem" : "0.875rem",
                        borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
                      }}
                    >
                      {`${game.ftm}-${game.fta}`}
                    </TableCell>
                    <TableCell
                      sx={{
                        color: "rgba(255, 255, 255, 0.87)",
                        padding: isMobile ? "8px 4px" : "12px 16px",
                        fontSize: isMobile ? "0.75rem" : "0.875rem",
                        borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
                      }}
                    >
                      {(game.ft_pct * 100).toFixed(1)}%
                    </TableCell>
                    <TableCell
                      sx={{
                        color:
                          game.reb >= 10
                            ? "#64b5f6"
                            : "rgba(255, 255, 255, 0.87)",
                        padding: isMobile ? "8px 4px" : "12px 16px",
                        fontSize: isMobile ? "0.75rem" : "0.875rem",
                        borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
                        fontWeight: game.reb >= 10 ? 600 : 400,
                      }}
                    >
                      {game.reb}
                    </TableCell>
                    <TableCell
                      sx={{
                        color:
                          game.ast >= 10
                            ? "#64b5f6"
                            : "rgba(255, 255, 255, 0.87)",
                        padding: isMobile ? "8px 4px" : "12px 16px",
                        fontSize: isMobile ? "0.75rem" : "0.875rem",
                        borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
                        fontWeight: game.ast >= 10 ? 600 : 400,
                      }}
                    >
                      {game.ast}
                    </TableCell>
                    <TableCell
                      sx={{
                        color: "rgba(255, 255, 255, 0.87)",
                        padding: isMobile ? "8px 4px" : "12px 16px",
                        fontSize: isMobile ? "0.75rem" : "0.875rem",
                        borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
                      }}
                    >
                      {game.stl}
                    </TableCell>
                    <TableCell
                      sx={{
                        color: "rgba(255, 255, 255, 0.87)",
                        padding: isMobile ? "8px 4px" : "12px 16px",
                        fontSize: isMobile ? "0.75rem" : "0.875rem",
                        borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
                      }}
                    >
                      {game.blk}
                    </TableCell>
                    <TableCell
                      sx={{
                        color: "rgba(255, 255, 255, 0.87)",
                        padding: isMobile ? "8px 4px" : "12px 16px",
                        fontSize: isMobile ? "0.75rem" : "0.875rem",
                        borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
                      }}
                    >
                      {game.tov}
                    </TableCell>
                    <TableCell
                      sx={{
                        color: game.plus_minus > 0 ? "#4caf50" : "#f44336",
                        padding: isMobile ? "8px 4px" : "12px 16px",
                        fontSize: isMobile ? "0.75rem" : "0.875rem",
                        borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
                        fontWeight: Math.abs(game.plus_minus) >= 15 ? 600 : 400,
                      }}
                    >
                      {game.plus_minus > 0
                        ? `+${game.plus_minus}`
                        : game.plus_minus}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}
    </Box>
  );
};

export default NBAPlayerStats;
