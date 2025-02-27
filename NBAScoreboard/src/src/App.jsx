import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import SportsBasketballIcon from "@mui/icons-material/SportsBasketball";
import ScoreboardIcon from '@mui/icons-material/Scoreboard';
import LeaderboardIcon from '@mui/icons-material/Leaderboard';
import Scoreboard from "./components/Scoreboard";
import DateScoreBoard from "./components/DateScoreBoard";
import NBAPlayerStats from "./components/NBAPlayerStats";
import Standings from "./components/Standings";
import { useState } from "react";
import useWebSocket from "./hooks/useWebSocket";
import darkTheme from './styles/theme'
import useMediaQuery from "@mui/material/useMediaQuery";


// Custom TabPanel component to handle content display
function TabPanel({ children, value, index }) {
  if (value !== index) return null;
  return (
    <div
      role="tabpanel"
      id={`scoreboard-tabpanel-${index}`}
      aria-labelledby={`scoreboard-tab-${index}`}
      style={{ height: "100%" }}
    >
      <Box sx={{ p: { xs: 1, sm: 2, md: 3 }, height: "100%" }}>{children}</Box>
    </div>
  );
}

function App() {
  const [currentTab, setCurrentTab] = useState(1);
  const { games, isConnected, lastUpdateTime } = useWebSocket();
  const isMobile = useMediaQuery("(max-width:600px)");
  const isPortrait = useMediaQuery("(orientation: portrait)");

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Box
        sx={{
          width: "100%",
          bgcolor: "background.paper",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Tabs
          value={currentTab}
          onChange={handleTabChange}
          centered={!isPortrait}
          variant={isPortrait ? "fullWidth" : "standard"}
          scrollButtons={isPortrait ? false : "auto"}
          allowScrollButtonsMobile
          aria-label="scoreboard navigation tabs"
          sx={{
            "& .MuiTab-root": {
              fontSize: isMobile && isPortrait ? "0.7rem" : undefined,
              minWidth: isMobile && isPortrait ? 0 : undefined,
              padding: isMobile && isPortrait ? "6px 4px" : undefined,
            },
          }}
        >
          <Tab
            icon={<CalendarTodayIcon fontSize={isMobile && isPortrait ? "small" : "medium"} />}
            label="Yesterday"
            id="scoreboard-tab-0"
            aria-controls="scoreboard-tabpanel-0"
          />
          <Tab
            icon={<ScoreboardIcon fontSize={isMobile && isPortrait ? "small" : "medium"} />}
            label="Live"
            id="scoreboard-tab-1"
            aria-controls="scoreboard-tabpanel-1"
          />
          <Tab
            icon={<SportsBasketballIcon fontSize={isMobile && isPortrait ? "small" : "medium"} />}
            label="NBA Stats"
            id="scoreboard-tab-2"
            aria-controls="scoreboard-tabpanel-2"
          />
          <Tab
            icon={<LeaderboardIcon fontSize={isMobile && isPortrait ? "small" : "medium"} />}
            label="Standings"
            id="scoreboard-tab-3"
            aria-controls="scoreboard-tabpanel-3"
          />
        </Tabs>
        <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
          <TabPanel value={currentTab} index={0}>
            <DateScoreBoard />
          </TabPanel>
          <TabPanel value={currentTab} index={1}>
            <Scoreboard
              games={games}
              isConnected={isConnected}
              lastUpdateTime={lastUpdateTime}
            />
          </TabPanel>
          <TabPanel value={currentTab} index={2}>
            <NBAPlayerStats />
          </TabPanel>
          <TabPanel value={currentTab} index={3}>
            <Standings />
          </TabPanel>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App;