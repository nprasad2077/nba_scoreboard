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

// Table headers with mobile-friendly labels
const TABLE_HEADERS = [
  { full: "Date", short: "Date" },
  { full: "Matchup", short: "Match" },
  { full: "W/L", short: "W/L" },
  { full: "MIN", short: "MIN" },
  { full: "PTS", short: "PTS" },
  { full: "FGM-FGA", short: "FG" },
  { full: "FG%", short: "FG%" },
  { full: "3PM-3PA", short: "3P" },
  { full: "3P%", short: "3P%" },
  { full: "FTM-FTA", short: "FT" },
  { full: "FT%", short: "FT%" },
  { full: "REB", short: "REB" },
  { full: "AST", short: "AST" },
  { full: "STL", short: "STL" },
  { full: "BLK", short: "BLK" },
  { full: "TOV", short: "TOV" },
  { full: "+/-", short: "+/-" },
];

// Column widths for different screen sizes
const getColumnWidths = (isMobile, isXsScreen, isPortrait) => {
  if (isXsScreen && isPortrait) {
    return [
      { width: "8%" }, // Date
      { width: "10%" }, // Matchup
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
      { width: "7%" }, // +/-
    ];
  }
  
  if (isMobile && isPortrait) {
    return [
      { width: "8%" }, // Date
      { width: "11%" }, // Matchup
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
      { width: "6%" }, // +/-
    ];
  }
  
  return [
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
};

// Format FG, 3P, and FT stats for mobile
const formatStat = (made, attempted, isMobile, isXsScreen) => {
  if (isXsScreen) {
    return `${made}/${attempted}`;
  }
  return `${made}-${attempted}`;
};

// Memoized table cell component with right alignment for numeric cells
const StyledTableCell = memo(({ children, sx = {}, isNumeric = false, ...props }) => (
  <TableCell
    align={isNumeric ? "right" : "left"}
    sx={{
      padding: { xs: "6px 2px", sm: "12px 16px" },
      fontSize: { xs: "0.65rem", sm: "0.875rem" },
      borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
      ...sx,
    }}
    {...props}
  >
    {children}
  </TableCell>
));

// Memoized game row component
const GameRow = memo(({ game, index, isMobile, isXsScreen }) => {
  const isPtsHighlighted = game.pts >= 20;
  const isRebHighlighted = game.reb >= 10;
  const isAstHighlighted = game.ast >= 10;
  const isPlusMinusHighlighted = Math.abs(game.plus_minus) >= 15;

  const formattedFgPct = (game.fg_pct * 100).toFixed(1);
  const formattedFg3Pct = (game.fg3_pct * 100).toFixed(1);
  const formattedFtPct = (game.ft_pct * 100).toFixed(1);
  const formattedDate = formatDate(game.game_date);
  const plusMinusDisplay = game.plus_minus > 0 ? `+${game.plus_minus}` : game.plus_minus;

  // Format matchup for different screen sizes
  const formatMatchup = (matchup) => {
    if (isXsScreen) {
      // Extract team abbreviations only (e.g., "MIL vs. BOS" -> "MIL v BOS")
      const parts = matchup.split(' ');
      if (parts.length >= 3) {
        return `${parts[0]} v ${parts[2].replace(/\.$/, '')}`;
      }
    }
    return matchup;
  };

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
        {formatMatchup(game.matchup)}
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
      <StyledTableCell isNumeric sx={{ color: "rgba(255, 255, 255, 0.87)" }}>
        {Math.round(game.min)}
      </StyledTableCell>
      
      {/* PTS */}
      <StyledTableCell
        isNumeric
        sx={{
          color: isPtsHighlighted ? "#64b5f6" : "rgba(255, 255, 255, 0.87)",
          fontWeight: isPtsHighlighted ? 600 : 400,
        }}
      >
        {game.pts}
      </StyledTableCell>
      
      {/* FGM-FGA */}
      <StyledTableCell isNumeric sx={{ color: "rgba(255, 255, 255, 0.87)" }}>
        {formatStat(game.fgm, game.fga, isMobile, isXsScreen)}
      </StyledTableCell>
      
      {/* FG% */}
      <StyledTableCell isNumeric sx={{ color: "rgba(255, 255, 255, 0.87)" }}>
        {isXsScreen ? formattedFgPct : `${formattedFgPct}%`}
      </StyledTableCell>
      
      {/* 3PM-3PA */}
      <StyledTableCell isNumeric sx={{ color: "rgba(255, 255, 255, 0.87)" }}>
        {formatStat(game.fg3m, game.fg3a, isMobile, isXsScreen)}
      </StyledTableCell>
      
      {/* 3P% */}
      <StyledTableCell isNumeric sx={{ color: "rgba(255, 255, 255, 0.87)" }}>
        {isXsScreen ? formattedFg3Pct : `${formattedFg3Pct}%`}
      </StyledTableCell>
      
      {/* FTM-FTA */}
      <StyledTableCell isNumeric sx={{ color: "rgba(255, 255, 255, 0.87)" }}>
        {formatStat(game.ftm, game.fta, isMobile, isXsScreen)}
      </StyledTableCell>
      
      {/* FT% */}
      <StyledTableCell isNumeric sx={{ color: "rgba(255, 255, 255, 0.87)" }}>
        {isXsScreen ? formattedFtPct : `${formattedFtPct}%`}
      </StyledTableCell>
      
      {/* REB */}
      <StyledTableCell
        isNumeric
        sx={{
          color: isRebHighlighted ? "#64b5f6" : "rgba(255, 255, 255, 0.87)",
          fontWeight: isRebHighlighted ? 600 : 400,
        }}
      >
        {game.reb}
      </StyledTableCell>
      
      {/* AST */}
      <StyledTableCell
        isNumeric
        sx={{
          color: isAstHighlighted ? "#64b5f6" : "rgba(255, 255, 255, 0.87)",
          fontWeight: isAstHighlighted ? 600 : 400,
        }}
      >
        {game.ast}
      </StyledTableCell>
      
      {/* STL */}
      <StyledTableCell isNumeric sx={{ color: "rgba(255, 255, 255, 0.87)" }}>
        {game.stl}
      </StyledTableCell>
      
      {/* BLK */}
      <StyledTableCell isNumeric sx={{ color: "rgba(255, 255, 255, 0.87)" }}>
        {game.blk}
      </StyledTableCell>
      
      {/* TOV */}
      <StyledTableCell isNumeric sx={{ color: "rgba(255, 255, 255, 0.87)" }}>
        {game.tov}
      </StyledTableCell>
      
      {/* +/- */}
      <StyledTableCell
        isNumeric
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
const TableHeader = memo(({ isMobile, isXsScreen }) => (
  <TableHead>
    <TableRow>
      {TABLE_HEADERS.map((header, index) => {
        const isNumeric = index >= 3; // MIN and all stats after are numeric and right-aligned
        return (
          <TableCell
            key={index}
            align={isNumeric ? "right" : "left"}
            sx={{
              backgroundColor: "#101010",
              color: "rgba(255, 255, 255, 0.95)",
              fontWeight: 600,
              fontSize: isXsScreen ? "0.65rem" : isMobile ? "0.7rem" : "0.875rem",
              padding: isXsScreen ? "6px 2px" : isMobile ? "8px 3px" : "12px 16px",
              borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
              whiteSpace: "nowrap",
              position: "sticky",
              top: 0,
              zIndex: 1,
            }}
          >
            {isXsScreen ? header.short : header.full}
          </TableCell>
        );
      })}
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
  const isXsScreen = useMediaQuery("(max-width:430px)");
  const isPortrait = useMediaQuery("(orientation: portrait)");

  if (!games || games.length === 0) return null;

  const columnWidths = getColumnWidths(isMobile, isXsScreen, isPortrait);
  
  // Adjust table min-width for different screen sizes and orientations
  const getTableMinWidth = () => {
    if (isPortrait) {
      return isXsScreen ? "800px" : isMobile ? "900px" : "1100px";
    }
    return isXsScreen ? "850px" : isMobile ? "950px" : "1200px";
  };

  const tableMinWidth = getTableMinWidth();

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
          height: "6px",
          backgroundColor: "#101010",
        },
        "&::-webkit-scrollbar-thumb": {
          backgroundColor: "rgba(255, 255, 255, 0.2)",
          borderRadius: "3px",
        },
        scrollbarWidth: "thin",
        scrollbarColor: "rgba(255, 255, 255, 0.2) #101010",
        width: "100%",
        maxWidth: "100%",
      }}
    >
      <Table
        size={isXsScreen ? "small" : isMobile ? "small" : "medium"}
        stickyHeader
        sx={{
          minWidth: tableMinWidth,
          width: "100%",
          tableLayout: "fixed",
        }}
      >
        <colgroup>
          {columnWidths.map((col, index) => (
            <col key={index} style={{ width: col.width }} />
          ))}
        </colgroup>
        
        <TableHeader isMobile={isMobile} isXsScreen={isXsScreen} />
        
        <TableBody>
          {games.map((game, index) => (
            <GameRow
              key={`${game.game_date}-${index}`}
              game={game}
              index={index}
              isMobile={isMobile}
              isXsScreen={isXsScreen}
            />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default memo(PlayerStatsTable);