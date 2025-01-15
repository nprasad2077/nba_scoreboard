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
} from "@mui/material";
import { Close } from "@mui/icons-material";
import { visuallyHidden } from "@mui/utils";

const headCells = [
  { id: "name", numeric: false, label: "PLAYER" },
  { id: "minutes", numeric: false, label: "MIN" },
  { id: "points", numeric: true, label: "PTS" },
  { id: "reboundsTotal", numeric: true, label: "REB" },
  { id: "assists", numeric: true, label: "AST" },
  { id: "fieldGoals", numeric: true, label: "FG" },
  { id: "threePointers", numeric: true, label: "3PT" },
  { id: "plusMinusPoints", numeric: true, label: "+/-" },
];

function descendingComparator(a, b, orderBy) {
  // Handle special cases
  if (orderBy === "fieldGoals") {
    const aFG = `${a.statistics.fieldGoalsMade}-${a.statistics.fieldGoalsAttempted}`;
    const bFG = `${b.statistics.fieldGoalsMade}-${b.statistics.fieldGoalsAttempted}`;
    return bFG.localeCompare(aFG);
  }
  if (orderBy === "threePointers") {
    const a3PT = `${a.statistics.threePointersMade}-${a.statistics.threePointersAttempted}`;
    const b3PT = `${b.statistics.threePointersMade}-${b.statistics.threePointersAttempted}`;
    return b3PT.localeCompare(a3PT);
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
  const { order, orderBy, onRequestSort } = props;

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
              fontWeight: "bold",
              whiteSpace: "nowrap",
            }}
          >
            <TableSortLabel
              active={orderBy === headCell.id}
              direction={orderBy === headCell.id ? order : "asc"}
              onClick={createSortHandler(headCell.id)}
              sx={{
                "&.MuiTableSortLabel-root": {
                  color: "rgba(255, 255, 255, 0.7)",
                },
                "&.MuiTableSortLabel-root:hover": {
                  color: "white",
                },
                "&.Mui-active": {
                  color: "white",
                },
                "& .MuiTableSortLabel-icon": {
                  color: "white !important",
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

function TeamBoxScoreTable({ team, teamName }) {
  const [order, setOrder] = useState("desc");
  const [orderBy, setOrderBy] = useState("minutes");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(7);

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const activePlayers = team.players.filter(
    (player) => player.status === "ACTIVE"
  );

  const visibleRows = React.useMemo(() => {
    const sortedRows = [...activePlayers].sort(getComparator(order, orderBy));
    return sortedRows.slice(
      page * rowsPerPage,
      page * rowsPerPage + rowsPerPage
    );
  }, [order, orderBy, page, rowsPerPage, activePlayers]);

  const emptyRows =
    page > 0 ? Math.max(0, (1 + page) * rowsPerPage - activePlayers.length) : 0;

  return (
    <Box sx={{ width: "100%", mb: 4 }}>
      <Paper sx={{ width: "100%", mb: 2, backgroundColor: "rgb(30, 30, 30)" }}>
        <Toolbar sx={{ pl: 2, pr: 1 }}>
          <Typography
            sx={{ flex: "1 1 100%" }}
            variant="h6"
            component="div"
            color="white"
          >
            {teamName}
          </Typography>
        </Toolbar>
        <TableContainer>
          <Table sx={{ minWidth: 750 }} size="small">
            <EnhancedTableHead
              order={order}
              orderBy={orderBy}
              onRequestSort={handleRequestSort}
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
                  <TableCell sx={{ color: "white" }}>{player.name}</TableCell>
                  <TableCell sx={{ color: "white" }}>
                    {formatMinutes(player.statistics.minutes)}
                  </TableCell>
                  <TableCell align="right" sx={{ color: "white" }}>
                    {player.statistics.points}
                  </TableCell>
                  <TableCell align="right" sx={{ color: "white" }}>
                    {player.statistics.reboundsTotal}
                  </TableCell>
                  <TableCell align="right" sx={{ color: "white" }}>
                    {player.statistics.assists}
                  </TableCell>
                  <TableCell align="right" sx={{ color: "white" }}>
                    {`${player.statistics.fieldGoalsMade}-${player.statistics.fieldGoalsAttempted}`}
                  </TableCell>
                  <TableCell align="right" sx={{ color: "white" }}>
                    {`${player.statistics.threePointersMade}-${player.statistics.threePointersAttempted}`}
                  </TableCell>
                  <TableCell align="right" sx={{ color: "white" }}>
                    {player.statistics.plusMinusPoints}
                  </TableCell>
                </TableRow>
              ))}
              {emptyRows > 0 && (
                <TableRow style={{ height: 33 * emptyRows }}>
                  <TableCell colSpan={8} sx={{ color: "white" }} />
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[7, 14, 25]}
          component="div"
          count={activePlayers.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          sx={{
            color: "white",
            ".MuiTablePagination-selectIcon": { color: "white" },
            ".MuiTablePagination-select": { color: "white" },
            ".MuiTablePagination-selectLabel": { color: "white" },
            ".MuiTablePagination-displayedRows": { color: "white" },
            ".MuiTablePagination-actions": { color: "white" },
            ".MuiIconButton-root": { color: "white" },
          }}
        />
      </Paper>
    </Box>
  );
}

const BoxScore = ({ gameId, open, onClose }) => {
  const [boxScore, setBoxScore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBoxScore = async () => {
      if (!gameId) return;
      try {
        setLoading(true);
        const response = await fetch(
          `http://localhost:8000/boxscore/${gameId}`
        );
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

  if (!open) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xl"
      fullWidth
      PaperProps={{
        sx: {
          height: "90vh",
          backgroundColor: "rgb(30, 30, 30)",
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          backgroundColor: "rgb(30, 30, 30)",
          color: "white",
        }}
      >
        Box Score
        <IconButton onClick={onClose} sx={{ color: "white" }}>
          <Close />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ backgroundColor: "rgb(30, 30, 30)" }}>
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
              />
              <TeamBoxScoreTable
                team={boxScore.home_team}
                teamName={`${boxScore.home_team.teamCity} ${boxScore.home_team.teamName}`}
              />
            </>
          )
        )}
      </DialogContent>
    </Dialog>
  );
};

export default BoxScore;
