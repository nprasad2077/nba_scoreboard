import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import Scoreboard from './components/Scoreboard';
import DateScoreBoard from './components/DateScoreBoard';
import { useState } from 'react';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#90caf9',
    },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
  },
});

// Custom TabPanel component to handle content display
function TabPanel({ children, value, index }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`scoreboard-tabpanel-${index}`}
      aria-labelledby={`scoreboard-tab-${index}`}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function App() {
  // Set initial tab value to 1 (Today/Live)
  const [currentTab, setCurrentTab] = useState(1);

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Box sx={{ width: '100%', bgcolor: 'background.paper' }}>
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
            icon={<SportsSoccerIcon />} 
            label="Live" 
            id="scoreboard-tab-1"
            aria-controls="scoreboard-tabpanel-1"
          />
        </Tabs>

        <TabPanel value={currentTab} index={0}>
          <DateScoreBoard />
        </TabPanel>
        <TabPanel value={currentTab} index={1}>
          <Scoreboard />
        </TabPanel>
      </Box>
    </ThemeProvider>
  );
}

export default App;