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
  { id: "minutes", numeric: false, label: "MIN", width: "12%" },
  { id: "points", numeric: true, label: "PTS", width: "13.5%" },
  { id: "reboundsTotal", numeric: true, label: "REB", width: "14%" },
  { id: "assists", numeric: true, label: "AST", width: "13.5%" },
  { id: "fieldGoals", numeric: true, label: "FG", width: "12%" },
  { id: "threePointers", numeric: true, label: "3P", width: "11.5%" },
  { id: "plusMinusPoints", numeric: true, label: "+/-", width: "12%" },
];

const formatPlayerName = (fullName, isMobile) => {
  if (!isMobile) return fullName;
  const nameParts = fullName.split(" ");
  if (nameParts.length < 2) return fullName;
  const firstName = nameParts[0];
  const lastName = nameParts.slice(1).join(" ");
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
  const { order, orderBy, onRequestSort, isMobile } = props;
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
              padding: isMobile ? "8px 4px" : "12px 16px",
              fontSize: isMobile ? "0.75rem" : "0.875rem",
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

function TeamBoxScoreTable({ team, teamName, scoreboardScore }) {
  const isMobile = useMediaQuery("(max-width:600px)");
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
    : sortedPlayers.slice(0, isMobile ? 5 : 8);

  const teamAbbreviation = getTeamAbbreviation(team.teamCity, team.teamName);

  return (
    <Box sx={{ width: "100%", mb: 4 }}>
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
            pl: isMobile ? 2 : 3,
            pr: isMobile ? 1 : 2,
            minHeight: isMobile ? "60px" : "72px",
            display: "flex",
            alignItems: "center",
            gap: 2,
            borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
            backgroundColor: "#101010",
          }}
        >
          <Box
            component="img"
            src={teamLogos[teamAbbreviation]}
            alt={`${team.teamCity} ${team.teamName} logo`}
            sx={{
              height: isMobile ? "32px" : "40px",
              width: "auto",
              objectFit: "contain",
            }}
          />
          <Typography
            sx={{
              flex: "1 1 100%",
              fontSize: isMobile ? "1rem" : "1.25rem",
              fontWeight: 600,
              color: "white",
            }}
            variant="h6"
            component="div"
          >
            {teamName}
            {scoreboardScore && (
              <Typography
                component="span"
                sx={{
                  ml: 2,
                  color: "#64b5f6",
                  fontSize: isMobile ? "1.25rem" : "1.5rem",
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
            sx={{
              tableLayout: "fixed",
              "& .MuiTableCell-root": {
                padding: isMobile ? "8px 4px" : "12px 16px",
                fontSize: isMobile ? "0.75rem" : "0.875rem",
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
                      gap: "8px",
                    }}
                  >
                    {formatPlayerName(player.name, isMobile)}
                    {player.oncourt && (
                      <Box
                        sx={{
                          width: "6px",
                          height: "6px",
                          borderRadius: "50%",
                          backgroundColor: "#4caf50",
                          display: "inline-block",
                          animation: "pulse 2s infinite",
                        }}
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    {formatMinutes(player.statistics.minutes)}
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{
                      color:
                        player.statistics.points >= 20 ? "#64b5f6" : "inherit",
                      fontWeight: player.statistics.points >= 20 ? 600 : 400,
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
                    }}
                  >
                    {player.statistics.assists}
                  </TableCell>
                  <TableCell align="right">
                    {`${player.statistics.fieldGoalsMade}-${player.statistics.fieldGoalsAttempted}`}
                  </TableCell>
                  <TableCell align="right">
                    {`${player.statistics.threePointersMade}-${player.statistics.threePointersAttempted}`}
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
        {activePlayers.length > (isMobile ? 5 : 8) && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              padding: 2,
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
  const [boxScore, setBoxScore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const api_url = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";
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

export default BoxScore;
