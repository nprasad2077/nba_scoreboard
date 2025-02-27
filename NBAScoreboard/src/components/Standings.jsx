import { useState, useEffect, memo, useMemo, useCallback } from "react";
import {
  Box,
  Typography,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  useMediaQuery,
  CircularProgress,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import PropTypes from "prop-types";

// Import the team logo mapping
import { teamLogos } from "../assets/nba_logos/teamLogosMap";

// Create direct mapping for team identifiers to avoid conditional logic
const TEAM_ABBR_MAP = {
  "Atlanta Hawks": "ATL",
  "Boston Celtics": "BOS",
  "Brooklyn Nets": "BKN",
  "Charlotte Hornets": "CHA",
  "Chicago Bulls": "CHI",
  "Cleveland Cavaliers": "CLE",
  "Dallas Mavericks": "DAL",
  "Denver Nuggets": "DEN",
  "Detroit Pistons": "DET",
  "Golden State Warriors": "GSW",
  "Houston Rockets": "HOU",
  "Indiana Pacers": "IND",
  "LA Clippers": "LAC",
  "Los Angeles Lakers": "LAL",
  "Memphis Grizzlies": "MEM",
  "Miami Heat": "MIA",
  "Milwaukee Bucks": "MIL",
  "Minnesota Timberwolves": "MIN",
  "New Orleans Pelicans": "NOP",
  "New York Knicks": "NYK",
  "Oklahoma City Thunder": "OKC",
  "Orlando Magic": "ORL",
  "Philadelphia 76ers": "PHI",
  "Phoenix Suns": "PHX",
  "Portland Trail Blazers": "POR",
  "Sacramento Kings": "SAC",
  "San Antonio Spurs": "SAS",
  "Toronto Raptors": "TOR",
  "Utah Jazz": "UTA",
  "Washington Wizards": "WAS",
};

// Pre-define column headers to avoid recreating object on each render
const COLUMN_HEADERS = {
  team: "Team",
  w: "W",
  l: "L",
  pct: "PCT",
  gb: "GB",
  home: "Home",
  away: "Away",
  div: "Div",
  conf: "Conf",
  last10: "L10",
  strk: "Strk",
};

// Memoized TabPanel component
const TabPanel = memo(function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`standings-tabpanel-${index}`}
      aria-labelledby={`standings-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
});

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

// Memoized TeamCell component to reduce rerenders
const TeamCell = memo(function TeamCell({ team, isMobile }) {
  // Get team identifier for logo lookup
  const teamIdentifier = `${team.team_city} ${team.team_name}`;
  const teamAbbr =
    TEAM_ABBR_MAP[teamIdentifier] ||
    team.team_name.substring(0, 3).toUpperCase();
  const logo = teamLogos[teamAbbr];

  return (
    <TableCell sx={{ color: "#ffffff" }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        {logo && (
          <Box
            component="img"
            src={logo}
            alt={teamIdentifier}
            sx={{ width: 24, height: 24 }}
            loading="lazy" // Use lazy loading for images
          />
        )}
        <Typography>{isMobile ? team.team_name : teamIdentifier}</Typography>
      </Box>
    </TableCell>
  );
});

TeamCell.propTypes = {
  team: PropTypes.object.isRequired,
  isMobile: PropTypes.bool.isRequired,
};

// Memoized StandingsTable component
const StandingsTable = memo(function StandingsTable({ standings }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // Memoize columns to display based on screen size
  const columnsToDisplay = useMemo(() => {
    return isMobile
      ? ["team", "w", "l", "pct", "gb", "strk"]
      : [
          "team",
          "w",
          "l",
          "pct",
          "gb",
          "home",
          "away",
          "div",
          "conf",
          "last10",
          "strk",
        ];
  }, [isMobile]);

  return (
    <TableContainer
      component={Paper}
      sx={{
        backgroundColor: "#262626",
        maxHeight: "calc(100vh - 220px)",
        overflow: "auto",
      }}
    >
      <Table
        stickyHeader
        aria-label="conference standings table"
        size={isMobile ? "small" : "medium"}
      >
        <TableHead>
          <TableRow>
            <TableCell
              sx={{
                backgroundColor: "#1a1a1a",
                color: "#64b5f6",
                fontWeight: "bold",
              }}
            >
              Rank
            </TableCell>
            {columnsToDisplay.map((column) => (
              <TableCell
                key={column}
                sx={{
                  backgroundColor: "#1a1a1a",
                  color: "#64b5f6",
                  fontWeight: "bold",
                  minWidth: column === "team" ? 180 : "auto",
                }}
              >
                {COLUMN_HEADERS[column]}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {standings.map((team) => {
            const isPlayoffTeam = team.conference_rank <= 8;
            const isWinStreak = !team.streak.startsWith("-");

            return (
              <TableRow
                key={team.team_id}
                sx={{
                  "&:hover": { backgroundColor: "#333333" },
                  backgroundColor: isPlayoffTeam
                    ? "rgba(100, 181, 246, 0.1)"
                    : "transparent",
                }}
              >
                <TableCell sx={{ color: "#ffffff" }}>
                  {team.conference_rank}
                </TableCell>

                {columnsToDisplay.includes("team") && (
                  <TeamCell team={team} isMobile={isMobile} />
                )}

                {columnsToDisplay.includes("w") && (
                  <TableCell sx={{ color: "#ffffff" }}>{team.wins}</TableCell>
                )}
                {columnsToDisplay.includes("l") && (
                  <TableCell sx={{ color: "#ffffff" }}>{team.losses}</TableCell>
                )}
                {columnsToDisplay.includes("pct") && (
                  <TableCell sx={{ color: "#ffffff" }}>
                    {team.win_pct.toFixed(3)}
                  </TableCell>
                )}
                {columnsToDisplay.includes("gb") && (
                  <TableCell sx={{ color: "#ffffff" }}>
                    {team.games_back}
                  </TableCell>
                )}
                {columnsToDisplay.includes("home") && (
                  <TableCell sx={{ color: "#ffffff" }}>
                    {team.home_record}
                  </TableCell>
                )}
                {columnsToDisplay.includes("away") && (
                  <TableCell sx={{ color: "#ffffff" }}>
                    {team.road_record}
                  </TableCell>
                )}
                {columnsToDisplay.includes("div") && (
                  <TableCell sx={{ color: "#ffffff" }}>
                    {team.division_record}
                  </TableCell>
                )}
                {columnsToDisplay.includes("conf") && (
                  <TableCell sx={{ color: "#ffffff" }}>
                    {team.conference_record}
                  </TableCell>
                )}
                {columnsToDisplay.includes("last10") && (
                  <TableCell sx={{ color: "#ffffff" }}>
                    {team.last_ten}
                  </TableCell>
                )}
                {columnsToDisplay.includes("strk") && (
                  <TableCell
                    sx={{
                      color: isWinStreak ? "#4caf50" : "#ff6b6b",
                      fontWeight: "bold",
                    }}
                  >
                    {isWinStreak
                      ? `W${team.streak}`
                      : `L${team.streak.substring(1)}`}
                  </TableCell>
                )}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
});

StandingsTable.propTypes = {
  standings: PropTypes.array.isRequired,
};

// Main Standings component
function Standings() {
  const [tabValue, setTabValue] = useState(0);
  const [standings, setStandings] = useState({ east: [], west: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const handleTabChange = useCallback((event, newValue) => {
    setTabValue(newValue);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    const fetchStandings = async () => {
      setLoading(true);
      try {
        // Use a single fetch call with the server that returns all data at once if possible
        // Fallback to parallel fetches with AbortController for cancellation
        const [eastResponse, westResponse] = await Promise.all([
          fetch("http://localhost:8000/api/v1/standings/conference/east", {
            signal,
          }),
          fetch("http://localhost:8000/api/v1/standings/conference/west", {
            signal,
          }),
        ]);

        if (!eastResponse.ok || !westResponse.ok) {
          throw new Error("Failed to fetch standings data");
        }

        const eastData = await eastResponse.json();
        const westData = await westResponse.json();

        // Only sort if necessary (check if first item is already ranked 1)
        const eastSorted =
          eastData[0]?.conference_rank === 1
            ? eastData
            : [...eastData].sort(
                (a, b) => a.conference_rank - b.conference_rank
              );
        const westSorted =
          westData[0]?.conference_rank === 1
            ? westData
            : [...westData].sort(
                (a, b) => a.conference_rank - b.conference_rank
              );

        setStandings({
          east: eastSorted,
          west: westSorted,
        });
        setError(null);
      } catch (err) {
        if (err.name !== "AbortError") {
          setError("Failed to load standings. Please try again later.");
          console.error("Error fetching standings:", err);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchStandings();

    // Cleanup function to abort fetch on unmount
    return () => controller.abort();
  }, []);

  // Only select the current tab's data
  const currentStandings = useMemo(() => {
    return tabValue === 0 ? standings.east : standings.west;
  }, [tabValue, standings]);

  return (
    <Box sx={{ width: "100%", height: "100%" }}>
      <Typography
        variant="h4"
        component="h1"
        gutterBottom
        sx={{ textAlign: "center", color: "#64b5f6", fontWeight: "bold" }}
      >
        NBA Standings
      </Typography>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", p: 5 }}>
          <CircularProgress color="primary" />
        </Box>
      ) : error ? (
        <Box sx={{ p: 3, textAlign: "center", color: "#ff6b6b" }}>
          <Typography>{error}</Typography>
        </Box>
      ) : (
        <>
          <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              aria-label="conference standings tabs"
              centered
              sx={{
                "& .MuiTab-root": {
                  color: "#888888",
                  fontWeight: "bold",
                  "&.Mui-selected": {
                    color: "#64b5f6",
                  },
                },
                "& .MuiTabs-indicator": {
                  backgroundColor: "#64b5f6",
                },
              }}
            >
              <Tab
                label="Eastern Conference"
                id="standings-tab-0"
                aria-controls="standings-tabpanel-0"
              />
              <Tab
                label="Western Conference"
                id="standings-tab-1"
                aria-controls="standings-tabpanel-1"
              />
            </Tabs>
          </Box>

          <TabPanel value={tabValue} index={0}>
            <StandingsTable standings={standings.east} />
          </TabPanel>
          <TabPanel value={tabValue} index={1}>
            <StandingsTable standings={standings.west} />
          </TabPanel>
        </>
      )}
    </Box>
  );
}

export default Standings;
