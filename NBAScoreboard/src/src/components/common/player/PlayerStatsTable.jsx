import React, { memo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  useMediaQuery,
} from "@mui/material";
import { formatDate } from "../../../utils/dateUtils";

// Table headers
const TABLE_HEADERS = [
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

// Column widths for consistent layout
const COLUMN_WIDTHS = [
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
];

// Memoized table cell component
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

// Memoized game row component
const GameRow = memo(({ game, index, isMobile }) => {
  const isPtsHighlighted = game.pts >= 20;
  const isRebHighlighted = game.reb >= 10;
  const isAstHighlighted = game.ast >= 10;
  const isPlusMinusHighlighted = Math.abs(game.plus_minus) >= 15;

  const formattedFgPct = (game.fg_pct * 100).toFixed(1);
  const formattedFg3Pct = (game.fg3_pct * 100).toFixed(1);
  const formattedFtPct = (game.ft_pct * 100).toFixed(1);
  const formattedDate = formatDate(game.game_date);
  const plusMinusDisplay = game.plus_minus > 0 ? `+${game.plus_minus}` : game.plus_minus;

  return (
    <TableRow
      sx={{
        backgroundColor: index % 2 === 0 ? "rgba(255, 255, 255, 0.01)" : "transparent",
        "&:hover": {
          backgroundColor: "rgba(255, 255, 255, 0.03)",
        },
      }}
    >
      {/* Date */}
      <StyledTableCell sx={{ color: "rgba(255, 255, 255, 0.87)" }}>
        {formattedDate}
      </StyledTableCell>
      
      {/* Matchup */}
      <StyledTableCell sx={{ color: "rgba(255, 255, 255, 0.87)" }}>
        {game.matchup}
      </StyledTableCell>
      
      {/* W/L */}
      <StyledTableCell
        sx={{
          color: game.wl === "W" ? "#4caf50" : "#f44336",
          fontWeight: 600,
        }}
      >
        {game.wl}
      </StyledTableCell>
      
      {/* MIN */}
      <StyledTableCell sx={{ color: "rgba(255, 255, 255, 0.87)" }}>
        {Math.round(game.min)}
      </StyledTableCell>
      
      {/* PTS */}
      <StyledTableCell
        sx={{
          color: isPtsHighlighted ? "#64b5f6" : "rgba(255, 255, 255, 0.87)",
          fontWeight: isPtsHighlighted ? 600 : 400,
        }}
      >
        {game.pts}
      </StyledTableCell>
      
      {/* FGM-FGA */}
      <StyledTableCell sx={{ color: "rgba(255, 255, 255, 0.87)" }}>
        {`${game.fgm}-${game.fga}`}
      </StyledTableCell>
      
      {/* FG% */}
      <StyledTableCell sx={{ color: "rgba(255, 255, 255, 0.87)" }}>
        {formattedFgPct}%
      </StyledTableCell>
      
      {/* 3PM-3PA */}
      <StyledTableCell sx={{ color: "rgba(255, 255, 255, 0.87)" }}>
        {`${game.fg3m}-${game.fg3a}`}
      </StyledTableCell>
      
      {/* 3P% */}
      <StyledTableCell sx={{ color: "rgba(255, 255, 255, 0.87)" }}>
        {formattedFg3Pct}%
      </StyledTableCell>
      
      {/* FTM-FTA */}
      <StyledTableCell sx={{ color: "rgba(255, 255, 255, 0.87)" }}>
        {`${game.ftm}-${game.fta}`}
      </StyledTableCell>
      
      {/* FT% */}
      <StyledTableCell sx={{ color: "rgba(255, 255, 255, 0.87)" }}>
        {formattedFtPct}%
      </StyledTableCell>
      
      {/* REB */}
      <StyledTableCell
        sx={{
          color: isRebHighlighted ? "#64b5f6" : "rgba(255, 255, 255, 0.87)",
          fontWeight: isRebHighlighted ? 600 : 400,
        }}
      >
        {game.reb}
      </StyledTableCell>
      
      {/* AST */}
      <StyledTableCell
        sx={{
          color: isAstHighlighted ? "#64b5f6" : "rgba(255, 255, 255, 0.87)",
          fontWeight: isAstHighlighted ? 600 : 400,
        }}
      >
        {game.ast}
      </StyledTableCell>
      
      {/* STL */}
      <StyledTableCell sx={{ color: "rgba(255, 255, 255, 0.87)" }}>
        {game.stl}
      </StyledTableCell>
      
      {/* BLK */}
      <StyledTableCell sx={{ color: "rgba(255, 255, 255, 0.87)" }}>
        {game.blk}
      </StyledTableCell>
      
      {/* TOV */}
      <StyledTableCell sx={{ color: "rgba(255, 255, 255, 0.87)" }}>
        {game.tov}
      </StyledTableCell>
      
      {/* +/- */}
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

// Memoized table header
const TableHeader = memo(({ isMobile }) => (
  <TableHead>
    <TableRow>
      {TABLE_HEADERS.map((header) => (
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
));

/**
 * Component for displaying player game statistics in a table
 * 
 * @param {Object} props - Component props
 * @param {Array} props.games - List of games with stats
 * @returns {JSX.Element} - Rendered component
 */
const PlayerStatsTable = ({ games }) => {
  const isMobile = useMediaQuery("(max-width:600px)");

  if (!games || games.length === 0) return null;

  return (
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
          {COLUMN_WIDTHS.map((col, index) => (
            <col key={index} style={{ width: col.width }} />
          ))}
        </colgroup>
        
        <TableHeader isMobile={isMobile} />
        
        <TableBody>
          {games.map((game, index) => (
            <GameRow
              key={`${game.game_date}-${index}`}
              game={game}
              index={index}
              isMobile={isMobile}
            />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default memo(PlayerStatsTable);