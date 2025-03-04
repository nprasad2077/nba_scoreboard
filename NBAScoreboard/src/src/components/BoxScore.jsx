import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Toolbar,
  Typography,
  CircularProgress,
  useMediaQuery,
  Button,
  Collapse,
} from "@mui/material";
import { visuallyHidden } from "@mui/utils";
import { teamLogos } from "../assets/nba_logos/teamLogosMap";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";

const getTeamAbbreviation = (teamCity, teamName) => {
  const teamAbbreviations = {
    Atlanta: "ATL",
    Boston: "BOS",
    Brooklyn: "BKN",
    Charlotte: "CHA",
    Chicago: "CHI",
    Cleveland: "CLE",
    Dallas: "DAL",
    Denver: "DEN",
    Detroit: "DET",
    "Golden State": "GSW",
    Houston: "HOU",
    Indiana: "IND",
    LA: "LAC",
    "Los Angeles": "LAL",
    Memphis: "MEM",
    Miami: "MIA",
    Milwaukee: "MIL",
    Minnesota: "MIN",
    "New Orleans": "NOP",
    "New York": "NYK",
    "Oklahoma City": "OKC",
    Orlando: "ORL",
    Philadelphia: "PHI",
    Phoenix: "PHX",
    Portland: "POR",
    Sacramento: "SAC",
    "San Antonio": "SAS",
    Toronto: "TOR",
    Utah: "UTA",
    Washington: "WAS",
  };
  return teamAbbreviations[teamCity] || "";
};

const headCells = [
  { id: "name", numeric: false, label: "PLAYER", width: "18%" },
  { id: "minutes", numeric: false, label: "MIN", width: "10%" },
  { id: "points", numeric: true, label: "PTS", width: "10%" },
  { id: "reboundsTotal", numeric: true, label: "REB", width: "10%" },
  { id: "assists", numeric: true, label: "AST", width: "10%" },
  { id: "fieldGoals", numeric: true, label: "FG", width: "15%" },
  { id: "threePointers", numeric: true, label: "3P", width: "15%" },
  { id: "plusMinusPoints", numeric: true, label: "+/-", width: "12%" },
];

const formatPlayerName = (fullName, isMobile, isXsScreen) => {
  if (!isMobile) return fullName;
  
  const nameParts = fullName.split(" ");
  if (nameParts.length < 2) return fullName;
  
  const firstName = nameParts[0];
  const lastName = nameParts.slice(1).join(" ");
  
  if (isXsScreen) {
    // First initial + last name, truncated if needed
    return `${firstName[0]}. ${lastName.length > 6 ? lastName.substring(0, 6) + "." : lastName}`;
  }
  
  return `${firstName[0]}. ${lastName}`;
};

function descendingComparator(a, b, orderBy) {
  if (orderBy === "fieldGoals") {
    const aMade = a.statistics.fieldGoalsMade ?? 0;
    const bMade = b.statistics.fieldGoalsMade ?? 0;
    if (bMade !== aMade) return bMade - aMade;
    return (
      (b.statistics.fieldGoalsAttempted ?? 0) -
      (a.statistics.fieldGoalsAttempted ?? 0)
    );
  }
  if (orderBy === "threePointers") {
    const aMade = a.statistics.threePointersMade ?? 0;
    const bMade = b.statistics.threePointersMade ?? 0;
    if (bMade !== aMade) return bMade - aMade;
    return (
      (b.statistics.threePointersAttempted ?? 0) -
      (a.statistics.threePointersAttempted ?? 0)
    );
  }
  if (orderBy === "minutes") {
    const aMinutes = a.statistics.minutes.match(/PT(\d+)M/)
      ? parseInt(a.statistics.minutes.match(/PT(\d+)M/)[1])
      : 0;
    const bMinutes = b.statistics.minutes.match(/PT(\d+)M/)
      ? parseInt(b.statistics.minutes.match(/PT(\d+)M/)[1])
      : 0;
    return bMinutes - aMinutes;
  }

  const aValue = orderBy === "name" ? a[orderBy] : a.statistics[orderBy] ?? 0;
  const bValue = orderBy === "name" ? b[orderBy] : b.statistics[orderBy] ?? 0;

  if (bValue < aValue) return -1;
  if (bValue > aValue) return 1;
  return 0;
}

function getComparator(order, orderBy) {
  return order === "desc"
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function EnhancedTableHead(props) {
  const { order, orderBy, onRequestSort, isMobile, isXsScreen } = props;
  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property);
  };

  return (
    <TableHead>
      <TableRow>
        {headCells.map((headCell) => (
          <TableCell
            key={headCell.id}
            align={headCell.numeric ? "right" : "left"}
            sortDirection={orderBy === headCell.id ? order : false}
            sx={{
              backgroundColor: "#101010",
              color: "rgba(255, 255, 255, 0.95)",
              fontWeight: 600,
              width: headCell.width,
              padding: isXsScreen 
                ? headCell.id === "name" || headCell.id === "plusMinusPoints" 
                  ? "4px 4px" 
                  : "4px 1px" 
                : isMobile 
                  ? headCell.id === "name" || headCell.id === "plusMinusPoints"
                    ? "6px 6px"
                    : "6px 2px" 
                  : "12px 16px",
              fontSize: isXsScreen ? "0.6rem" : isMobile ? "0.7rem" : "0.875rem",
              borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
              whiteSpace: "nowrap",
            }}
          >
            <TableSortLabel
              active={orderBy === headCell.id}
              direction={orderBy === headCell.id ? order : "desc"}
              onClick={createSortHandler(headCell.id)}
              sx={{
                color: "rgba(255, 255, 255, 0.95) !important",
                "&.Mui-active": {
                  color: "#64b5f6 !important",
                },
                "& .MuiTableSortLabel-icon": {
                  color: "#64b5f6 !important",
                },
              }}
            >
              {headCell.label}
              {orderBy === headCell.id ? (
                <Box component="span" sx={visuallyHidden}>
                  {order === "desc" ? "sorted descending" : "sorted ascending"}
                </Box>
              ) : null}
            </TableSortLabel>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

function formatMinutes(minutes) {
  if (!minutes || minutes === "PT00M00.00S") return "0:00";
  const match = minutes.match(/PT(\d+)M(\d+\.\d+)S/);
  if (!match) return minutes;
  return `${match[1]}:${Math.floor(parseFloat(match[2]))
    .toString()
    .padStart(2, "0")}`;
}

function formatFractionalStat(made, attempted, isMobile, isXsScreen) {
  if (isXsScreen) {
    return `${made}-${attempted}`;
  }
  return `${made}-${attempted}`;
}

function TeamBoxScoreTable({ team, teamName, scoreboardScore }) {
  const isMobile = useMediaQuery("(max-width:600px)");
  const isXsScreen = useMediaQuery("(max-width:430px)");
  const isPortrait = useMediaQuery("(orientation: portrait)");
  const [order, setOrder] = useState("desc");
  const [orderBy, setOrderBy] = useState("minutes");
  const [showAll, setShowAll] = useState(false);

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === "desc";
    setOrder(isAsc ? "asc" : "desc");
    setOrderBy(property);
  };

  const activePlayers = team.players.filter(
    (player) => player.status === "ACTIVE"
  );

  const sortedPlayers = React.useMemo(
    () => [...activePlayers].sort(getComparator(order, orderBy)),
    [activePlayers, order, orderBy]
  );

  const displayedPlayers = showAll
    ? sortedPlayers
    : sortedPlayers.slice(0, isXsScreen ? 5 : isMobile ? 5 : 8);

  const teamAbbreviation = getTeamAbbreviation(team.teamCity, team.teamName);

  return (
    <Box sx={{ width: "100%", mb: 2 }}>
      <Paper
        sx={{
          width: "100%",
          mb: 2,
          backgroundColor: "#101010",
          borderRadius: "12px",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.4)",
          overflow: "hidden",
        }}
      >
        <Toolbar
          sx={{
            pl: isXsScreen ? 1 : isMobile ? 1.5 : 3,
            pr: isXsScreen ? 0.5 : isMobile ? 1 : 2,
            minHeight: isXsScreen ? "44px" : isMobile ? "50px" : "72px",
            display: "flex",
            alignItems: "center",
            gap: isXsScreen ? 0.5 : 1,
            borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
            backgroundColor: "#101010",
          }}
        >
          <Box
            component="img"
            src={teamLogos[teamAbbreviation]}
            alt={`${team.teamCity} ${team.teamName} logo`}
            sx={{
              height: isXsScreen ? "24px" : isMobile ? "28px" : "40px",
              width: "auto",
              objectFit: "contain",
            }}
          />
          <Typography
            sx={{
              flex: "1 1 100%",
              fontSize: isXsScreen ? "0.8rem" : isMobile ? "0.9rem" : "1.25rem",
              fontWeight: 600,
              color: "white",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
            variant="h6"
            component="div"
          >
            {isXsScreen ? team.teamName : teamName}
            {scoreboardScore && (
              <Typography
                component="span"
                sx={{
                  ml: isXsScreen ? 1.5 : isMobile ? 2 : 3,
                  color: "#64b5f6",
                  fontSize: isXsScreen ? "0.9rem" : isMobile ? "1rem" : "1.5rem",
                  fontWeight: 600,
                }}
              >
                {scoreboardScore}
              </Typography>
            )}
          </Typography>
        </Toolbar>

        <TableContainer>
          <Table
            size={isXsScreen ? "small" : isMobile ? "small" : "medium"}
            sx={{
              tableLayout: "fixed",
              "& .MuiTableCell-root": {
                padding: isXsScreen ? "4px 1px" : isMobile ? "6px 2px" : "12px 16px",
                fontSize: isXsScreen ? "0.65rem" : isMobile ? "0.7rem" : "0.875rem",
                color: "rgba(255, 255, 255, 0.95)",
                borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
              },
              "& .MuiTableRow-root:hover": {
                backgroundColor: "rgba(255, 255, 255, 0.03)",
              },
            }}
          >
            <colgroup>
              {headCells.map((cell, index) => (
                <col key={index} style={{ width: cell.width }} />
              ))}
            </colgroup>

            <EnhancedTableHead
              order={order}
              orderBy={orderBy}
              onRequestSort={handleRequestSort}
              isMobile={isMobile}
              isXsScreen={isXsScreen}
            />
            <TableBody>
              {displayedPlayers.map((player, index) => (
                <TableRow
                  hover
                  tabIndex={-1}
                  key={player.name}
                  sx={{
                    backgroundColor: player.starter
                      ? "rgba(255, 255, 255, 0.00)"
                      : index % 2 === 0
                      ? "rgba(255, 255, 255, 0.00)"
                      : "transparent",
                    "&:hover": {
                      backgroundColor: "rgba(255, 255, 255, 0.06) !important",
                    },
                  }}
                >
                  <TableCell
                    sx={{
                      color: "rgba(255, 255, 255, 0.9)",
                      fontWeight: player.starter ? 600 : 400,
                      position: "relative",
                      display: "flex",
                      alignItems: "center",
                      gap: isXsScreen ? "2px" : "4px",
                      padding: isXsScreen ? "4px 4px" : isMobile ? "6px 6px" : "12px 16px",
                    }}
                  >
                    {formatPlayerName(player.name, isMobile, isXsScreen)}
                    {player.oncourt && (
                      <Box
                        sx={{
                          width: "5px",
                          height: "5px",
                          borderRadius: "50%",
                          backgroundColor: "#4caf50",
                          display: "inline-block",
                          animation: "pulse 2s infinite",
                        }}
                      />
                    )}
                  </TableCell>
                  <TableCell sx={{ padding: isXsScreen ? "4px 1px" : isMobile ? "6px 2px" : "12px 16px" }}>
                    {formatMinutes(player.statistics.minutes)}
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{
                      color:
                        player.statistics.points >= 20 ? "#64b5f6" : "inherit",
                      fontWeight: player.statistics.points >= 20 ? 600 : 400,
                      padding: isXsScreen ? "4px 1px" : isMobile ? "6px 2px" : "12px 16px",
                    }}
                  >
                    {player.statistics.points}
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{
                      color:
                        player.statistics.reboundsTotal >= 10
                          ? "#64b5f6"
                          : "inherit",
                      fontWeight:
                        player.statistics.reboundsTotal >= 10 ? 600 : 400,
                      padding: isXsScreen ? "4px 1px" : isMobile ? "6px 2px" : "12px 16px",
                    }}
                  >
                    {player.statistics.reboundsTotal}
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{
                      color:
                        player.statistics.assists >= 10 ? "#64b5f6" : "inherit",
                      fontWeight: player.statistics.assists >= 10 ? 600 : 400,
                      padding: isXsScreen ? "4px 1px" : isMobile ? "6px 2px" : "12px 16px",
                    }}
                  >
                    {player.statistics.assists}
                  </TableCell>
                  <TableCell 
                    align="right"
                    sx={{ padding: isXsScreen ? "4px 1px" : isMobile ? "6px 2px" : "12px 16px" }}
                  >
                    {formatFractionalStat(
                      player.statistics.fieldGoalsMade,
                      player.statistics.fieldGoalsAttempted,
                      isMobile,
                      isXsScreen
                    )}
                  </TableCell>
                  <TableCell 
                    align="right"
                    sx={{ padding: isXsScreen ? "4px 1px" : isMobile ? "6px 2px" : "12px 16px" }}
                  >
                    {formatFractionalStat(
                      player.statistics.threePointersMade,
                      player.statistics.threePointersAttempted,
                      isMobile,
                      isXsScreen
                    )}
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{
                      color:
                        player.statistics.plusMinusPoints > 0
                          ? "#4caf50"
                          : player.statistics.plusMinusPoints < 0
                          ? "#f44336"
                          : "inherit",
                      fontWeight:
                        Math.abs(player.statistics.plusMinusPoints) >= 15
                          ? 600
                          : 400,
                      padding: isXsScreen ? "4px 4px" : isMobile ? "6px 6px" : "12px 16px",
                    }}
                  >
                    {player.statistics.plusMinusPoints > 0
                      ? `+${player.statistics.plusMinusPoints}`
                      : player.statistics.plusMinusPoints}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Expand/Collapse Button */}
        {activePlayers.length > (isXsScreen ? 5 : isMobile ? 5 : 8) && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              padding: isXsScreen ? 0.5 : isMobile ? 1 : 2,
              borderTop: "1px solid rgba(255, 255, 255, 0.08)",
              backgroundColor: "#101010",
            }}
          >
            <Button
              onClick={() => setShowAll(!showAll)}
              endIcon={showAll ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              sx={{
                color: "#64b5f6",
                "&:hover": {
                  backgroundColor: "rgba(100, 181, 246, 0.08)",
                },
                textTransform: "none",
                fontWeight: 600,
                fontSize: isXsScreen ? "0.7rem" : undefined,
                padding: isXsScreen ? "2px 6px" : undefined,
              }}
            >
              {showAll ? "Show Less" : "Show All"}
            </Button>
          </Box>
        )}
      </Paper>
    </Box>
  );
}

const BoxScore = ({ game, open }) => {
  if (!game || !open) {
    return null;
  }

  const isMobile = useMediaQuery("(max-width:600px)");
  const isXsScreen = useMediaQuery("(max-width:430px)");
  const [boxScore, setBoxScore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const api_url = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000/api/v1";
  const gameId = game.gameId;
  const [awayScore, homeScore] = game.score
    .split(" - ")
    .map((score) => parseInt(score) || 0);

  useEffect(() => {
    const fetchBoxScore = async () => {
      if (!gameId) return;
      try {
        setLoading(true);
        const response = await fetch(`${api_url}/boxscore/${gameId}`);
        const data = await response.json();
        setBoxScore(data);
      } catch (err) {
        setError("Failed to load box score data");
        console.error("Error fetching box score:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBoxScore();
  }, [gameId]);

  return (
    <Box
      sx={{
        width: "100%",
        py: isXsScreen ? 0.5 : isMobile ? 1 : 2,
        px: isXsScreen ? 0.5 : isMobile ? 1 : 3,
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
      {loading ? (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          height="200px"
        >
          <CircularProgress sx={{ color: "#64b5f6" }} />
        </Box>
      ) : error ? (
        <Typography color="error" sx={{ textAlign: "center" }}>
          {error}
        </Typography>
      ) : (
        boxScore && (
          <>
            <TeamBoxScoreTable
              team={boxScore.away_team}
              teamName={`${boxScore.away_team.teamCity} ${boxScore.away_team.teamName}`}
              scoreboardScore={awayScore}
            />
            <TeamBoxScoreTable
              team={boxScore.home_team}
              teamName={`${boxScore.home_team.teamCity} ${boxScore.home_team.teamName}`}
              scoreboardScore={homeScore}
            />
          </>
        )
      )}
    </Box>
  );
};

BoxScore.propTypes = {
  game: PropTypes.object,
  open: PropTypes.bool,
};

export default BoxScore;