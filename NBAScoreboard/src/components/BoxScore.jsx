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
  TablePagination,
  TableRow,
  TableSortLabel,
  Toolbar,
  Typography,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  CircularProgress,
  useMediaQuery,
} from "@mui/material";
import { Close } from "@mui/icons-material";
import { visuallyHidden } from "@mui/utils";
import { teamLogos } from "../assets/nba_logos/teamLogosMap";

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

// Helper function to format player names
const formatPlayerName = (fullName, isMobile) => {
  if (!isMobile) return fullName;
  const nameParts = fullName.split(" ");
  if (nameParts.length < 2) return fullName;
  const firstName = nameParts[0];
  const lastName = nameParts.slice(1).join(" ");
  return `${firstName[0]}. ${lastName}`;
};

function descendingComparator(a, b, orderBy) {
  // Handle special cases
  if (orderBy === "fieldGoals") {
    // Sort by fieldGoalsMade
    const aMade = a.statistics.fieldGoalsMade ?? 0;
    const bMade = b.statistics.fieldGoalsMade ?? 0;
    if (bMade !== aMade) {
      return bMade - aMade;
    }
    // If made values are equal, use attempts as secondary sort
    return (
      (b.statistics.fieldGoalsAttempted ?? 0) -
      (a.statistics.fieldGoalsAttempted ?? 0)
    );
  }
  if (orderBy === "threePointers") {
    // Sort by threePointersMade
    const aMade = a.statistics.threePointersMade ?? 0;
    const bMade = b.statistics.threePointersMade ?? 0;
    if (bMade !== aMade) {
      return bMade - aMade;
    }
    // If made values are equal, use attempts as secondary sort
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

  // For all other fields
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
              backgroundColor: "rgb(30, 30, 30)",
              color: "white",
              fontWeight: "semi-bold",
              width: headCell.width,
              padding: isMobile ? "2px 2px" : "8px 4px",
              fontSize: isMobile ? "0.2rem" : "0.875rem",
            }}
          >
            <TableSortLabel
              active={orderBy === headCell.id}
              direction={orderBy === headCell.id ? order : "desc"}
              onClick={createSortHandler(headCell.id)}
              hideSortIcon={false} // Keep space for icon
              sx={{
                color: "white !important",
                padding: 0,
                margin: 0,
                minWidth: headCell.numeric ? "100%" : "auto",
                // Hide icon by default so columns remain aligned
                "& .MuiTableSortLabel-icon": {
                  visibility: "hidden",
                },
                // Show icon when active
                "&.Mui-active .MuiTableSortLabel-icon": {
                  visibility: "visible",
                },
                // Remove MUI's trailing dot
                "& .MuiTableSortLabel-iconDirectionDesc::after, & .MuiTableSortLabel-iconDirectionAsc::after": {
                  content: '""',
                },
              }}
            >
              {headCell.label}
            </TableSortLabel>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

EnhancedTableHead.propTypes = {
  onRequestSort: PropTypes.func.isRequired,
  order: PropTypes.oneOf(["asc", "desc"]).isRequired,
  orderBy: PropTypes.string.isRequired,
};

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
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(isMobile ? 5 : 8);

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === "desc";
    setOrder(isAsc ? "asc" : "desc");
    setOrderBy(property);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Filter active players outside of useMemo
  const activePlayers = team.players.filter(
    (player) => player.status === "ACTIVE"
  );

  // Create sorted and paginated rows
  const sortedPlayers = [...activePlayers].sort(getComparator(order, orderBy));

  const visibleRows = React.useMemo(() => {
    const sortedRows = [...activePlayers].sort(getComparator(order, orderBy));
    return sortedRows.slice(
      page * rowsPerPage,
      page * rowsPerPage + rowsPerPage
    );
  }, [activePlayers, order, orderBy, page, rowsPerPage]);

  const emptyRows =
    page > 0 ? Math.max(0, (1 + page) * rowsPerPage - activePlayers.length) : 0;

  // Extract team abbreviation once
  const teamAbbreviation = getTeamAbbreviation(team.teamCity, team.teamName);

  return (
    <Box sx={{ width: "100%", mb: 4 }}>
      <Paper sx={{ width: "100%", mb: 2, backgroundColor: "rgb(30, 30, 30)" }}>
        <Toolbar
          sx={{
            pl: isMobile ? 1 : 2,
            pr: isMobile ? 0.5 : 1,
            minHeight: isMobile ? 48 : 64,
            display: "flex",
            alignItems: "center",
            gap: 2,
          }}
        >
          <Box
            component="img"
            src={teamLogos[teamAbbreviation]}
            alt={`${team.teamCity} ${team.teamName} logo`}
            sx={{
              height: isMobile ? 24 : 32,
              width: "auto",
              objectFit: "contain",
            }}
          />
          <Typography
            sx={{
              flex: "1 1 100%",
              fontSize: isMobile ? "0.9rem" : "1.25rem",
            }}
            variant={isMobile ? "subtitle1" : "h6"}
            component="div"
            color="white"
          >
            {teamName} {scoreboardScore ? ` - ${scoreboardScore}` : ""}
          </Typography>
        </Toolbar>
        <TableContainer>
          <Table
            sx={{
              tableLayout: isMobile ? 'fixed' : 'fixed',
              width: "100%",
              minWidth: isMobile ? "auto" : 750,
              "& .MuiTableCell-root": {
                padding: isMobile ? "4px" : "8px",
                fontSize: isMobile ? "0.65rem" : "0.875rem",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
              },
              "& col": {
                width: "auto",
              },
            }}
            size="small"
          >
            {/* Add colgroup to explicitly define column widths */}
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
              {visibleRows.map((player) => (
                <TableRow
                  hover
                  tabIndex={-1}
                  key={player.name}
                  sx={{
                    backgroundColor: player.starter
                      ? "rgba(255, 255, 255, 0.05)"
                      : "transparent",
                    "&:hover": {
                      backgroundColor: "rgba(255, 255, 255, 0.1) !important",
                    },
                  }}
                >
                  <TableCell
                    sx={{
                      color: "white",
                      width: headCells[0].width,
                      padding: isMobile ? "4px" : "8px",
                    }}
                  >
                    {formatPlayerName(player.name, isMobile)}
                  </TableCell>
                  <TableCell
                    sx={{
                      color: "white",
                      width: headCells[1].width,
                      padding: isMobile ? "4px" : "8px",
                    }}
                  >
                    {formatMinutes(player.statistics.minutes)}
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{
                      color: "white",
                      width: headCells[2].width,
                      padding: isMobile ? "2px" : "8px",
                    }}
                  >
                    {player.statistics.points}
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{
                      color: "white",
                      width: headCells[3].width,
                      padding: isMobile ? "2px" : "8px",
                    }}
                  >
                    {player.statistics.reboundsTotal}
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{
                      color: "white",
                      width: headCells[4].width,
                      padding: isMobile ? "2px" : "8px",
                    }}
                  >
                    {player.statistics.assists}
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{
                      color: "white",
                      width: headCells[5].width,
                      padding: isMobile ? "2px" : "8px",
                    }}
                  >
                    {`${player.statistics.fieldGoalsMade}-${player.statistics.fieldGoalsAttempted}`}
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{
                      color: "white",
                      width: headCells[6].width,
                      padding: isMobile ? "2px" : "8px",
                    }}
                  >
                    {`${player.statistics.threePointersMade}-${player.statistics.threePointersAttempted}`}
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{
                      color: "white",
                      width: headCells[7].width,
                      padding: isMobile ? "2px" : "8px",
                    }}
                  >
                    {player.statistics.plusMinusPoints}
                  </TableCell>
                </TableRow>
              ))}
              {emptyRows > 0 && (
                <TableRow
                  style={{ height: (isMobile ? 29 : 33) * emptyRows }}
                >
                  <TableCell colSpan={8} sx={{ color: "white" }} />
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={isMobile ? [5, 10] : [8, 14, 25]}
          component="div"
          count={activePlayers.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          sx={{
            color: "white",
            ".MuiTablePagination-selectIcon": { color: "white" },
            ".MuiTablePagination-select": {
              color: "white",
              fontSize: isMobile ? "0.65rem" : "0.875rem",
            },
            ".MuiTablePagination-selectLabel": {
              color: "white",
              fontSize: isMobile ? "0.65rem" : "0.875rem",
            },
            ".MuiTablePagination-displayedRows": {
              color: "white",
              fontSize: isMobile ? "0.65rem" : "0.875rem",
            },
            ".MuiTablePagination-actions": { color: "white" },
            ".MuiIconButton-root": {
              color: "white",
              padding: isMobile ? "4px" : "8px",
            },
          }}
        />
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

  console.log(game)
  ;
  

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
    <Box sx={{ width: '100%', py: 4, px: 6}}>
      {loading ? (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          height="100%"
        >
          <CircularProgress />
        </Box>
      ) : error ? (
        <Typography color="error">{error}</Typography>
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
