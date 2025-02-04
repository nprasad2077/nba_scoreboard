import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import SportsBasketballIcon from "@mui/icons-material/SportsBasketball";
import ScoreboardIcon from '@mui/icons-material/Scoreboard';
import Scoreboard from "./components/Scoreboard";
import DateScoreBoard from "./components/DateScoreBoard";
import NBAPlayerStats from "./components/NBAPlayerStats";
import { useState } from "react";
import useWebSocket from "./hooks/useWebSocket";

const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#90caf9",
    },
    background: {
      default: "#121212",
      paper: "#1e1e1e",
    },
  },
  // Add support for shadcn/ui components
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          // This ensures shadcn/ui components inherit the dark theme
          '[data-theme="dark"]': {
            "--background": "214 9% 7%",
            "--foreground": "210 40% 98%",
          },
        },
      },
    },
  },
});

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
      <Box sx={{ p: 3, height: "100%" }}>{children}</Box>
    </div>
  );
}

function App() {
  const [currentTab, setCurrentTab] = useState(1);
  const { games, isConnected, lastUpdateTime } = useWebSocket();

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
          centered
          aria-label="scoreboard navigation tabs"
        >
          <Tab
            icon={<CalendarTodayIcon />}
            label="Yesterday"
            id="scoreboard-tab-0"
            aria-controls="scoreboard-tabpanel-0"
          />
          <Tab
            icon={<ScoreboardIcon />}
            label="Live"
            id="scoreboard-tab-1"
            aria-controls="scoreboard-tabpanel-1"
          />
          <Tab
            icon={<SportsBasketballIcon />}
            label="NBA Stats"
            id="scoreboard-tab-2"
            aria-controls="scoreboard-tabpanel-2"
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
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App;