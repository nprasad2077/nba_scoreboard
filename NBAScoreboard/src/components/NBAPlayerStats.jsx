import React, {
  useState,
  useCallback,
  useMemo,
  memo,
  useRef,
  useEffect,
} from "react";
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
  Button,
  CircularProgress,
} from "@mui/material";

// Debounce utility
function debounce(fn, delay) {
  let timerId;
  return (...args) => {
    clearTimeout(timerId);
    timerId = setTimeout(() => fn(...args), delay);
  };
}

// Memoized table cell
const StyledTableCell = memo(({ children, sx = {}, ...props }) => (
  <TableCell
    sx={{
      padding: { xs: "8px 4px", sm: "12px 16px" },
      fontSize: { xs: "0.75rem", sm: "0.875rem" },
      borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
      ...sx,
    }}
    {...props}
  >
    {children}
  </TableCell>
));

// Memoized row
const GameRow = memo(({ game, isMobile, formatDate }) => {
  const isPtsHighlighted = game.pts >= 20;
  const isRebHighlighted = game.reb >= 10;
  const isAstHighlighted = game.ast >= 10;
  const isPlusMinusHighlighted = Math.abs(game.plus_minus) >= 15;

  const formattedFgPct = (game.fg_pct * 100).toFixed(1);
  const formattedFg3Pct = (game.fg3_pct * 100).toFixed(1);
  const formattedFtPct = (game.ft_pct * 100).toFixed(1);
  const formattedDate = formatDate(game.game_date);
  const plusMinusDisplay =
    game.plus_minus > 0 ? `+${game.plus_minus}` : game.plus_minus;

  return (
    <TableRow
      sx={{
        backgroundColor: (theme) =>
          game.index % 2 === 0 ? "rgba(255, 255, 255, 0.01)" : "transparent",
        "&:hover": {
          backgroundColor: "rgba(255, 255, 255, 0.03)",
        },
      }}
    >
      <StyledTableCell sx={{ color: "rgba(255, 255, 255, 0.87)" }}>
        {formattedDate}
      </StyledTableCell>
      <StyledTableCell sx={{ color: "rgba(255, 255, 255, 0.87)" }}>
        {game.matchup}
      </StyledTableCell>
      <StyledTableCell
        sx={{
          color: game.wl === "W" ? "#4caf50" : "#f44336",
          fontWeight: 600,
        }}
      >
        {game.wl}
      </StyledTableCell>
      <StyledTableCell sx={{ color: "rgba(255, 255, 255, 0.87)" }}>
        {Math.round(game.min)}
      </StyledTableCell>
      <StyledTableCell
        sx={{
          color: isPtsHighlighted ? "#64b5f6" : "rgba(255, 255, 255, 0.87)",
          fontWeight: isPtsHighlighted ? 600 : 400,
        }}
      >
        {game.pts}
      </StyledTableCell>
      <StyledTableCell sx={{ color: "rgba(255, 255, 255, 0.87)" }}>
        {`${game.fgm}-${game.fga}`}
      </StyledTableCell>
      <StyledTableCell sx={{ color: "rgba(255, 255, 255, 0.87)" }}>
        {formattedFgPct}%
      </StyledTableCell>
      <StyledTableCell sx={{ color: "rgba(255, 255, 255, 0.87)" }}>
        {`${game.fg3m}-${game.fg3a}`}
      </StyledTableCell>
      <StyledTableCell sx={{ color: "rgba(255, 255, 255, 0.87)" }}>
        {formattedFg3Pct}%
      </StyledTableCell>
      <StyledTableCell sx={{ color: "rgba(255, 255, 255, 0.87)" }}>
        {`${game.ftm}-${game.fta}`}
      </StyledTableCell>
      <StyledTableCell sx={{ color: "rgba(255, 255, 255, 0.87)" }}>
        {formattedFtPct}%
      </StyledTableCell>
      <StyledTableCell
        sx={{
          color: isRebHighlighted ? "#64b5f6" : "rgba(255, 255, 255, 0.87)",
          fontWeight: isRebHighlighted ? 600 : 400,
        }}
      >
        {game.reb}
      </StyledTableCell>
      <StyledTableCell
        sx={{
          color: isAstHighlighted ? "#64b5f6" : "rgba(255, 255, 255, 0.87)",
          fontWeight: isAstHighlighted ? 600 : 400,
        }}
      >
        {game.ast}
      </StyledTableCell>
      <StyledTableCell sx={{ color: "rgba(255, 255, 255, 0.87)" }}>
        {game.stl}
      </StyledTableCell>
      <StyledTableCell sx={{ color: "rgba(255, 255, 255, 0.87)" }}>
        {game.blk}
      </StyledTableCell>
      <StyledTableCell sx={{ color: "rgba(255, 255, 255, 0.87)" }}>
        {game.tov}
      </StyledTableCell>
      <StyledTableCell
        sx={{
          color: game.plus_minus > 0 ? "#4caf50" : "#f44336",
          fontWeight: isPlusMinusHighlighted ? 600 : 400,
        }}
      >
        {plusMinusDisplay}
      </StyledTableCell>
    </TableRow>
  );
});

// Table header
const TableHeader = memo(({ isMobile }) => {
  const headers = [
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
  ];

  return (
    <TableHead>
      <TableRow>
        {headers.map((header) => (
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
  );
});

// Player info
const PlayerInfo = memo(({ playerInfo, getPlayerImagePath, isMobile }) => {
  if (!playerInfo) return null;

  return (
    <Box sx={{ display: "flex", alignItems: "center", mb: 3, gap: 2 }}>
      <Avatar
        src={getPlayerImagePath(playerInfo.person_id)}
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
});

function NBAPlayerStats() {
  const [searchTerm, setSearchTerm] = useState("");
  // --- Separate states for player info and games
  const [playerInfo, setPlayerInfo] = useState(null);
  const [games, setGames] = useState([]);

  const [searchResults, setSearchResults] = useState([]);
  const [selectedPlayer, setSelectedPlayer] = useState(null);

  const [showMore, setShowMore] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const isMobile = useMediaQuery("(max-width:600px)");

  // Player image path
  const getPlayerImagePath = useCallback((playerId) => {
    if (!playerId) return null;
    return `https://cdn.nba.com/headshots/nba/latest/1040x760/${playerId}.png`;
  }, []);

  // Date formatting
  const formatDate = useCallback((dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  }, []);

  // Debounced search
  const debouncedSearch = useRef(
    debounce(async (query) => {
      if (query.length < 2) {
        setSearchResults([]);
        return;
      }
      try {
        const response = await fetch(
          `http://localhost:8000/api/v1/players/search/?query=${query}`
        );
        const data = await response.json();
        setSearchResults(data);
      } catch (error) {
        console.error("Error searching players:", error);
      }
    }, 400)
  ).current;

  // Trigger debounced search on searchTerm changes
  useEffect(() => {
    debouncedSearch(searchTerm);
  }, [searchTerm, debouncedSearch]);

  // Fetch player stats
  const fetchPlayerStats = useCallback(
    async (playerId, gamesCount = 10) => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `http://localhost:8000/api/v1/players/${playerId}/games?last_n_games=${gamesCount}`
        );
        const data = await response.json();

        // If the backend returns a similar structure:
        // {
        //   player_info: {...},
        //   games: [{...}, ...]
        // }
        if (data?.player_info) {
          // Update the player info if it's new or missing
          setPlayerInfo(data.player_info);
        }

        if (Array.isArray(data?.games)) {
          const annotatedGames = data.games.map((g, idx) => ({
            ...g,
            index: idx,
          }));
          setGames(annotatedGames);
        }
      } catch (error) {
        console.error("Error fetching player stats:", error);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // When user selects a player
  const handlePlayerChange = useCallback(
    (event, newValue) => {
      if (!newValue) return;
      setSelectedPlayer(newValue);
      setShowMore(false);
      fetchPlayerStats(newValue.person_id);
    },
    [fetchPlayerStats]
  );

  // Show More
  const handleShowMore = useCallback(() => {
    setShowMore(true);
    if (selectedPlayer) {
      // Fetch more games (25)
      fetchPlayerStats(selectedPlayer.person_id, 25);
    }
  }, [fetchPlayerStats, selectedPlayer]);

  // Column widths
  const columnWidths = useMemo(
    () => [
      { width: "8%" },
      { width: "12%" },
      { width: "4%" },
      { width: "5%" },
      { width: "5%" },
      { width: "7%" },
      { width: "5%" },
      { width: "7%" },
      { width: "5%" },
      { width: "7%" },
      { width: "5%" },
      { width: "5%" },
      { width: "5%" },
      { width: "5%" },
      { width: "5%" },
      { width: "5%" },
      { width: "5%" },
    ],
    []
  );

  const TableColgroup = useMemo(
    () => (
      <colgroup>
        {columnWidths.map((col, index) => (
          <col key={index} style={{ width: col.width }} />
        ))}
      </colgroup>
    ),
    [columnWidths]
  );

  // Memoized rows
  const tableRows = useMemo(() => {
    return games.map((game, index) => (
      <GameRow
        key={`${game.game_date}-${index}`}
        game={game}
        isMobile={isMobile}
        formatDate={formatDate}
      />
    ));
  }, [games, isMobile, formatDate]);

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
      {/* SEARCH FIELD */}
      <Box
        sx={{
          mb: 4,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 2,
        }}
      >
        <Autocomplete
          options={searchResults}
          getOptionLabel={(option) =>
            `${option.display_name} - ${option.team_abbreviation}`
          }
          onInputChange={(event, newInputValue) => {
            setSearchTerm(newInputValue);
          }}
          onChange={handlePlayerChange}
          blurOnSelect
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

      {/* LOADING INDICATOR */}
      {isLoading && (
        <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
          <CircularProgress sx={{ color: "#64b5f6" }} />
        </Box>
      )}

      {/* PLAYER INFO + TABLE */}
      {!isLoading && playerInfo && (
        <Box
          sx={{
            overflow: "auto",
            flex: 1,
            maxWidth: "1400px",
            margin: "0 auto",
          }}
        >
          {/* Player Header: remains displayed regardless of game fetch */}
          <PlayerInfo
            playerInfo={playerInfo}
            getPlayerImagePath={getPlayerImagePath}
            isMobile={isMobile}
          />

          {/* "Last X Games" + Show More Button */}
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
            {!showMore && games.length > 0 && (
              <Button
                onClick={handleShowMore}
                variant="outlined"
                sx={{
                  color: "#64b5f6",
                  borderColor: "#64b5f6",
                  "&:hover": {
                    borderColor: "#90caf9",
                    backgroundColor: "rgba(100, 181, 246, 0.08)",
                  },
                }}
              >
                Show More
              </Button>
            )}
          </Box>

          {/* Table */}
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
              {TableColgroup}
              <TableHeader isMobile={isMobile} />
              <TableBody>{tableRows}</TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}
    </Box>
  );
}

export default memo(NBAPlayerStats);
