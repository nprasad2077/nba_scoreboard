import { useState, useEffect, memo, useMemo, useCallback } from "react";
import {
  Box,
  Container,
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
import Header from "./common/Header";

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

// Short column headers for extra small screens
const MOBILE_COLUMN_HEADERS = {
  team: "Team",
  w: "W",
  l: "L",
  pct: "%",
  gb: "GB",
  home: "Home",
  away: "Away",
  div: "Div",
  conf: "Conf",
  last10: "L10",
  strk: "Strk",
};

// Storage key for selected conference tab
const CONFERENCE_TAB_STORAGE_KEY = "nba_app_selected_conference_tab";

// Memoized TabPanel component
const TabPanel = memo(function TabPanel(props) {
  const { children, value, index, ...other } = props;
  const isMobile = useMediaQuery("(max-width:600px)");

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`standings-tabpanel-${index}`}
      aria-labelledby={`standings-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: isMobile ? 1 : 3 }}>{children}</Box>}
    </div>
  );
});

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

// Memoized TeamCell component to reduce rerenders
const TeamCell = memo(function TeamCell({ team, isMobile, isXsScreen }) {
  // Get team identifier for logo lookup
  const teamIdentifier = `${team.team_city} ${team.team_name}`;
  const teamAbbr =
    TEAM_ABBR_MAP[teamIdentifier] ||
    team.team_name.substring(0, 3).toUpperCase();
  const logo = teamLogos[teamAbbr];

  // Display only team name on mobile, abbreviation on extra small screens
  const displayName = isXsScreen
    ? teamAbbr
    : isMobile
    ? team.team_name
    : teamIdentifier;

  return (
    <TableCell
      sx={{
        color: "#ffffff",
        padding: isXsScreen
          ? "8px 2px 8px 4px"
          : isMobile
          ? "10px 6px 10px 2px"
          : "16px 16px 16px 4px", // Reduced left padding
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
        maxWidth: isXsScreen ? "70px" : isMobile ? "100px" : "180px",
        height: isXsScreen ? "40px" : isMobile ? "44px" : "48px", // Set consistent height for all cells
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: isXsScreen ? 0.5 : 1,
        }}
      >
        {logo && (
          <Box
            component="img"
            src={logo}
            alt={teamIdentifier}
            sx={{
              width: isXsScreen ? 16 : 24,
              height: isXsScreen ? 16 : 24,
              display: "block", // Show logo on all screen sizes
            }}
            loading="lazy" // Use lazy loading for images
          />
        )}
        <Typography
          sx={{
            fontSize: isXsScreen ? "0.7rem" : isMobile ? "0.8rem" : "0.875rem",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {displayName}
        </Typography>
      </Box>
    </TableCell>
  );
});

TeamCell.propTypes = {
  team: PropTypes.object.isRequired,
  isMobile: PropTypes.bool.isRequired,
  isXsScreen: PropTypes.bool.isRequired,
};

// Memoized StandingsTable component
const StandingsTable = memo(function StandingsTable({ standings }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isXsScreen = useMediaQuery("(max-width:430px)");
  const isPortrait = useMediaQuery("(orientation: portrait)");

  // Memoize columns to display based on screen size
  const columnsToDisplay = useMemo(() => {
    if (isXsScreen && isPortrait) {
      return ["team", "w", "l", "pct", "strk"];
    }
    if (isMobile) {
      return ["team", "w", "l", "pct", "gb", "strk"];
    }
    return [
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
  }, [isMobile, isXsScreen, isPortrait]);

  // Get appropriate headers based on screen size
  const headers = isXsScreen ? MOBILE_COLUMN_HEADERS : COLUMN_HEADERS;

  // Calculate cell padding based on screen size
  const getCellPadding = () => {
    if (isXsScreen) return "8px 2px";
    if (isMobile) return "10px 4px";
    return "16px";
  };

  return (
    <TableContainer
      component={Paper}
      sx={{
        backgroundColor: "#262626",
        maxHeight: isXsScreen ? "calc(100vh - 180px)" : "calc(100vh - 220px)",
        overflow: "auto",
        "&::-webkit-scrollbar": {
          width: "6px",
          height: "6px",
        },
        "&::-webkit-scrollbar-track": {
          background: "rgba(255, 255, 255, 0.05)",
        },
        "&::-webkit-scrollbar-thumb": {
          background: "rgba(255, 255, 255, 0.2)",
          borderRadius: "3px",
          "&:hover": {
            background: "rgba(255, 255, 255, 0.3)",
          },
        },
      }}
    >
      <Table
        stickyHeader
        aria-label="conference standings table"
        size={isXsScreen ? "small" : isMobile ? "small" : "medium"}
        sx={{ tableLayout: "fixed" }} // Add fixed layout to improve column sizing
      >
        <TableHead>
          <TableRow>
            <TableCell
              sx={{
                backgroundColor: "#1a1a1a",
                color: "#64b5f6",
                fontWeight: "bold",
                padding: getCellPadding(),
                paddingRight: isXsScreen ? "2px" : isMobile ? "4px" : "4px", // Reduced right padding
                paddingLeft: isXsScreen ? "8px" : isMobile ? "12px" : "16px",
                fontSize: isXsScreen
                  ? "0.7rem"
                  : isMobile
                  ? "0.8rem"
                  : "0.875rem",
                width: isXsScreen ? "24px" : isMobile ? "30px" : "40px", // Narrower rank column
              }}
            >
              {isXsScreen ? "#" : "#"}
            </TableCell>
            {columnsToDisplay.map((column) => (
              <TableCell
                key={column}
                align={column !== "team" ? "right" : "left"}
                sx={{
                  backgroundColor: "#1a1a1a",
                  color: "#64b5f6",
                  fontWeight: "bold",
                  minWidth:
                    column === "team"
                      ? isXsScreen
                        ? 80
                        : isMobile
                        ? 120
                        : 220
                      : isXsScreen
                      ? "auto"
                      : "40px",
                  width:
                    column === "team"
                      ? isXsScreen
                        ? 80
                        : isMobile
                        ? 120
                        : 220
                      : column === "w" || column === "l"
                      ? isXsScreen
                        ? "24px"
                        : isMobile
                        ? "30px"
                        : "40px"
                      : "auto",
                  padding: getCellPadding(),
                  paddingLeft:
                    column === "team"
                      ? isXsScreen
                        ? "2px"
                        : "4px"
                      : undefined, // Reduced left padding for team column
                  paddingRight:
                    column === "strk"
                      ? isXsScreen
                        ? "8px"
                        : isMobile
                        ? "12px"
                        : "16px"
                      : undefined,
                  fontSize: isXsScreen
                    ? "0.7rem"
                    : isMobile
                    ? "0.8rem"
                    : "0.875rem",
                  whiteSpace: "nowrap",
                }}
              >
                {headers[column]}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {standings.map((team) => {
            const isTopSixTeam = team.conference_rank <= 6;
            const isPlayInTeam =
              team.conference_rank > 6 && team.conference_rank <= 10;
            const isWinStreak = !team.streak.startsWith("-");

            return (
              <TableRow
                key={team.team_id}
                sx={{
                  "&:hover": { backgroundColor: "#333333" },
                  backgroundColor: isTopSixTeam
                    ? "rgba(100, 181, 246, 0.1)"
                    : isPlayInTeam
                    ? "rgba(100, 181, 246, 0.05)"
                    : "transparent",
                }}
              >
                <TableCell
                  sx={{
                    color: "#ffffff",
                    padding: getCellPadding(),
                    paddingRight: isXsScreen ? "2px" : isMobile ? "4px" : "4px", // Reduced right padding
                    paddingLeft: isXsScreen
                      ? "8px"
                      : isMobile
                      ? "12px"
                      : "16px",
                    fontSize: isXsScreen
                      ? "0.7rem"
                      : isMobile
                      ? "0.8rem"
                      : "0.875rem",
                    height: isXsScreen ? "40px" : isMobile ? "44px" : "48px", // Set consistent height for all cells
                    width: isXsScreen ? "24px" : isMobile ? "30px" : "40px", // Match header width
                  }}
                >
                  {team.conference_rank}
                </TableCell>

                {columnsToDisplay.includes("team") && (
                  <TeamCell
                    team={team}
                    isMobile={isMobile}
                    isXsScreen={isXsScreen}
                  />
                )}

                {columnsToDisplay.includes("w") && (
                  <TableCell
                    align="right"
                    sx={{
                      color: "#ffffff",
                      padding: getCellPadding(),
                      fontSize: isXsScreen
                        ? "0.7rem"
                        : isMobile
                        ? "0.8rem"
                        : "0.875rem",
                      height: isXsScreen ? "40px" : isMobile ? "44px" : "48px", // Set consistent height for all cells
                      width: isXsScreen ? "24px" : isMobile ? "30px" : "40px", // Match header width
                    }}
                  >
                    {team.wins}
                  </TableCell>
                )}
                {columnsToDisplay.includes("l") && (
                  <TableCell
                    align="right"
                    sx={{
                      color: "#ffffff",
                      padding: getCellPadding(),
                      fontSize: isXsScreen
                        ? "0.7rem"
                        : isMobile
                        ? "0.8rem"
                        : "0.875rem",
                      height: isXsScreen ? "40px" : isMobile ? "44px" : "48px", // Set consistent height for all cells
                      width: isXsScreen ? "24px" : isMobile ? "30px" : "40px", // Match header width
                    }}
                  >
                    {team.losses}
                  </TableCell>
                )}
                {/* Remaining cells remain the same */}

                {/* Rest of the columns stay the same */}
                {columnsToDisplay.includes("pct") && (
                  <TableCell
                    align="right"
                    sx={{
                      color: "#ffffff",
                      padding: getCellPadding(),
                      fontSize: isXsScreen
                        ? "0.7rem"
                        : isMobile
                        ? "0.8rem"
                        : "0.875rem",
                      height: isXsScreen ? "40px" : isMobile ? "44px" : "48px",
                    }}
                  >
                    {isXsScreen
                      ? team.win_pct.toFixed(2)
                      : team.win_pct.toFixed(3)}
                  </TableCell>
                )}
                {columnsToDisplay.includes("gb") && (
                  <TableCell
                    align="right"
                    sx={{
                      color: "#ffffff",
                      padding: getCellPadding(),
                      fontSize: isXsScreen
                        ? "0.7rem"
                        : isMobile
                        ? "0.8rem"
                        : "0.875rem",
                      height: isXsScreen ? "40px" : isMobile ? "44px" : "48px",
                    }}
                  >
                    {team.games_back}
                  </TableCell>
                )}
                {columnsToDisplay.includes("home") && (
                  <TableCell
                    align="right"
                    sx={{
                      color: "#ffffff",
                      padding: getCellPadding(),
                      fontSize: isXsScreen
                        ? "0.7rem"
                        : isMobile
                        ? "0.8rem"
                        : "0.875rem",
                      height: isXsScreen ? "40px" : isMobile ? "44px" : "48px",
                    }}
                  >
                    {team.home_record}
                  </TableCell>
                )}
                {columnsToDisplay.includes("away") && (
                  <TableCell
                    align="right"
                    sx={{
                      color: "#ffffff",
                      padding: getCellPadding(),
                      fontSize: isXsScreen
                        ? "0.7rem"
                        : isMobile
                        ? "0.8rem"
                        : "0.875rem",
                      height: isXsScreen ? "40px" : isMobile ? "44px" : "48px",
                    }}
                  >
                    {team.road_record}
                  </TableCell>
                )}
                {columnsToDisplay.includes("div") && (
                  <TableCell
                    align="right"
                    sx={{
                      color: "#ffffff",
                      padding: getCellPadding(),
                      fontSize: isXsScreen
                        ? "0.7rem"
                        : isMobile
                        ? "0.8rem"
                        : "0.875rem",
                      height: isXsScreen ? "40px" : isMobile ? "44px" : "48px",
                    }}
                  >
                    {team.division_record}
                  </TableCell>
                )}
                {columnsToDisplay.includes("conf") && (
                  <TableCell
                    align="right"
                    sx={{
                      color: "#ffffff",
                      padding: getCellPadding(),
                      fontSize: isXsScreen
                        ? "0.7rem"
                        : isMobile
                        ? "0.8rem"
                        : "0.875rem",
                      height: isXsScreen ? "40px" : isMobile ? "44px" : "48px",
                    }}
                  >
                    {team.conference_record}
                  </TableCell>
                )}
                {columnsToDisplay.includes("last10") && (
                  <TableCell
                    align="right"
                    sx={{
                      color: "#ffffff",
                      padding: getCellPadding(),
                      fontSize: isXsScreen
                        ? "0.7rem"
                        : isMobile
                        ? "0.8rem"
                        : "0.875rem",
                      height: isXsScreen ? "40px" : isMobile ? "44px" : "48px",
                    }}
                  >
                    {team.last_ten}
                  </TableCell>
                )}
                {columnsToDisplay.includes("strk") && (
                  <TableCell
                    align="right"
                    sx={{
                      color: isWinStreak ? "#4caf50" : "#ff6b6b",
                      fontWeight: "bold",
                      padding: getCellPadding(),
                      paddingRight: isXsScreen
                        ? "8px"
                        : isMobile
                        ? "12px"
                        : "16px",
                      fontSize: isXsScreen
                        ? "0.7rem"
                        : isMobile
                        ? "0.8rem"
                        : "0.875rem",
                      height: isXsScreen ? "40px" : isMobile ? "44px" : "48px",
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
  // Initialize with the stored value (defaulting to 0 if not found)
  const [tabValue, setTabValue] = useState(() => {
    try {
      const storedValue = localStorage.getItem(CONFERENCE_TAB_STORAGE_KEY);
      return storedValue !== null ? parseInt(storedValue, 10) : 0;
    } catch (error) {
      console.warn("Error accessing localStorage:", error);
      return 0;
    }
  });

  const [standings, setStandings] = useState({ east: [], west: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const isMobile = useMediaQuery("(max-width:600px)");
  const isXsScreen = useMediaQuery("(max-width:430px)");
  const isPortrait = useMediaQuery("(orientation: portrait)");

  const handleTabChange = useCallback((event, newValue) => {
    setTabValue(newValue);
    // Store the selected tab in localStorage
    try {
      localStorage.setItem(CONFERENCE_TAB_STORAGE_KEY, newValue.toString());
    } catch (error) {
      console.warn("Error storing in localStorage:", error);
    }
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
          fetch("https://api.server.nbaapi.com/api/v1/standings/conference/east", {
            signal,
          }),
          fetch("https://api.server.nbaapi.com/api/v1/standings/conference/west", {
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
    <Container
      maxWidth="xl"
      sx={{
        py: isXsScreen ? 1 : isMobile ? 2 : 4,
        px: isXsScreen ? 0.5 : isMobile ? 1 : 2,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        maxWidth: "1400px !important",
      }}
    >
      {/* Header */}
      <Header title="NBA Standings" />

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
          <Box
            sx={{
              borderBottom: 1,
              borderColor: "divider",
              mb: isXsScreen ? 1 : 2,
            }}
          >
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              aria-label="conference standings tabs"
              variant={isPortrait ? "fullWidth" : "standard"}
              centered={!isPortrait}
              sx={{
                "& .MuiTab-root": {
                  color: "#888888",
                  fontWeight: "bold",
                  fontSize: isXsScreen
                    ? "0.75rem"
                    : isMobile
                    ? "0.85rem"
                    : "1rem",
                  padding: isXsScreen
                    ? "6px 8px"
                    : isMobile
                    ? "8px 12px"
                    : "12px 16px",
                  minWidth: isXsScreen ? "auto" : undefined,
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
                label={
                  isXsScreen
                    ? "East"
                    : isMobile
                    ? "Eastern"
                    : "Eastern Conference"
                }
                id="standings-tab-0"
                aria-controls="standings-tabpanel-0"
              />
              <Tab
                label={
                  isXsScreen
                    ? "West"
                    : isMobile
                    ? "Western"
                    : "Western Conference"
                }
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
    </Container>
  );
}

export default Standings;