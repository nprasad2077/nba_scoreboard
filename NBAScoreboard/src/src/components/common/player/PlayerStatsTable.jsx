import React from "react";
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
        
        <TableBody>
          {games.map((game, index) => (
            <TableRow
              key={index}
              sx={{
                backgroundColor: index % 2 === 0 ? "rgba(255, 255, 255, 0.01)" : "transparent",
                "&:hover": {
                  backgroundColor: "rgba(255, 255, 255, 0.03)",
                },
              }}
            >
              {/* Date */}
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
              
              {/* Matchup */}
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
              
              {/* W/L */}
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
              
              {/* MIN */}
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
              
              {/* PTS */}
              <TableCell
                sx={{
                  color: game.pts >= 20 ? "#64b5f6" : "rgba(255, 255, 255, 0.87)",
                  padding: isMobile ? "8px 4px" : "12px 16px",
                  fontSize: isMobile ? "0.75rem" : "0.875rem",
                  borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
                  fontWeight: game.pts >= 20 ? 600 : 400,
                }}
              >
                {game.pts}
              </TableCell>
              
              {/* FGM-FGA */}
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
              
              {/* FG% */}
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
              
              {/* 3PM-3PA */}
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
              
              {/* 3P% */}
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
              
              {/* FTM-FTA */}
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
              
              {/* FT% */}
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
              
              {/* REB */}
              <TableCell
                sx={{
                  color: game.reb >= 10 ? "#64b5f6" : "rgba(255, 255, 255, 0.87)",
                  padding: isMobile ? "8px 4px" : "12px 16px",
                  fontSize: isMobile ? "0.75rem" : "0.875rem",
                  borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
                  fontWeight: game.reb >= 10 ? 600 : 400,
                }}
              >
                {game.reb}
              </TableCell>
              
              {/* AST */}
              <TableCell
                sx={{
                  color: game.ast >= 10 ? "#64b5f6" : "rgba(255, 255, 255, 0.87)",
                  padding: isMobile ? "8px 4px" : "12px 16px",
                  fontSize: isMobile ? "0.75rem" : "0.875rem",
                  borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
                  fontWeight: game.ast >= 10 ? 600 : 400,
                }}
              >
                {game.ast}
              </TableCell>
              
              {/* STL */}
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
              
              {/* BLK */}
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
              
              {/* TOV */}
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
              
              {/* +/- */}
              <TableCell
                sx={{
                  color: game.plus_minus > 0 ? "#4caf50" : "#f44336",
                  padding: isMobile ? "8px 4px" : "12px 16px",
                  fontSize: isMobile ? "0.75rem" : "0.875rem",
                  borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
                  fontWeight: Math.abs(game.plus_minus) >= 15 ? 600 : 400,
                }}
              >
                {game.plus_minus > 0 ? `+${game.plus_minus}` : game.plus_minus}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default PlayerStatsTable;