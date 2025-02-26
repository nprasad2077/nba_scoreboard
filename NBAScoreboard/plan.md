# Refactor Plan and current Status.

We are in the original codebase. I have started on a Refactor plan based on this code base. Please help me generate the missing components/files needed to restore this codebase to a 1:1 state from the original.


I will post the plan and the current code base status below:


Plan:

```
src/
├── assets/
│   └── images/
│       └── nba_logos/
│           └── teamLogosMap.js
├── components/
│   ├── common/
│   │   ├── ConnectionIndicator/
│   │   │   ├── index.jsx
│   │   │   └── styles.js
│   │   └── TeamLogo/
│   │       ├── index.jsx
│   │       └── styles.js
│   ├── game/
│   │   ├── BoxScore/
│   │   │   ├── components/
│   │   │   │   ├── PlayerRow.jsx
│   │   │   │   ├── TeamBoxScore.jsx
│   │   │   │   └── TeamHeader.jsx
│   │   │   ├── index.jsx
│   │   │   └── styles.js
│   │   ├── GameCard/
│   │   │   ├── components/
│   │   │   │   ├── TeamInfo.jsx
│   │   │   │   └── GameStatus.jsx
│   │   │   ├── index.jsx
│   │   │   └── styles.js
│   │   └── PlayByPlay/
│   │       ├── components/
│   │       │   └── PlayAction.jsx
│   │       ├── index.jsx
│   │       └── styles.js
│   └── layout/
│       ├── Header/
│       │   ├── index.jsx
│       │   └── styles.js
│       └── TabPanel/
│           ├── index.jsx
│           └── styles.js
├── contexts/
│   ├── GameContext.jsx
│   └── ThemeContext.jsx
├── features/
│   ├── dateScoreboard/
│   │   ├── components/
│   │   ├── hooks/
│   │   └── index.jsx
│   ├── playerStats/
│   │   ├── components/
│   │   ├── hooks/
│   │   └── index.jsx
│   └── scoreboard/
│       ├── components/
│       ├── hooks/
│       └── index.jsx
├── hooks/
│   ├── useGameData.js
│   ├── usePlayByPlay.js
│   └── useWebSocket.js
├── services/
│   ├── api.js
│   └── websocket.js
├── styles/
│   ├── theme/
│   │   ├── components.js
│   │   ├── palette.js
│   │   └── typography.js
│   ├── global.css
│   └── tailwind.css
├── utils/
│   ├── constants.js
│   ├── dateUtils.js
│   ├── formatters.js
│   └── teamUtils.js
├── App.jsx
└── main.jsx
```


Current Code Base:

Directory structure:
└── src/
    ├── App.css
    ├── App.jsx
    ├── index.css
    ├── main.jsx
    ├── assets/
    │   ├── images/
    │   │   └── nba_logos/
    │   │       └── teamLogosMap.js
    │   └── nba_logos/
    ├── components/
    │   ├── GameDetailsModal.jsx
    │   ├── common/
    │   │   ├── ConnectionIndicator/
    │   │   │   └── index.jsx
    │   │   └── TeamLogo/
    │   │       ├── index.jsx
    │   │       └── styles.js
    │   ├── game/
    │   │   ├── BoxScore/
    │   │   │   ├── constants.js
    │   │   │   ├── index.jsx
    │   │   │   └── components/
    │   │   │       ├── PlayerRow.jsx
    │   │   │       ├── PluaMinusCell.jsx
    │   │   │       ├── StatCell.jsx
    │   │   │       └── TeamBoxScoreTable.jsx
    │   │   ├── GameCard/
    │   │   │   ├── index.jsx
    │   │   │   └── components/
    │   │   └── PlayByPlay/
    │   │       ├── index.jsx
    │   │       └── components/
    │   └── layout/
    │       ├── GameDetailsModal/
    │       │   └── index.jsx
    │       ├── Header/
    │       │   ├── index.jsx
    │       │   └── styles.js
    │       └── TabPanel/
    │           ├── index.jsx
    │           └── styles.js
    ├── contexts/
    │   ├── GameContext.jsx
    │   └── ThemeContext.jsx
    ├── features/
    │   ├── dateScoreboard/
    │   │   ├── index.jsx
    │   │   ├── components/
    │   │   └── hooks/
    │   ├── playerStats/
    │   │   ├── index.jsx
    │   │   ├── components/
    │   │   └── hooks/
    │   └── scoreboard/
    │       ├── index.jsx
    │       ├── components/
    │       └── hooks/
    ├── hooks/
    │   ├── useGameData.js
    │   ├── usePlayByPlay.js
    │   └── useWebSocket.js
    ├── services/
    │   ├── api.js
    │   └── websocket.js
    ├── styles/
    │   ├── global.css
    │   ├── tailwind.css
    │   └── theme/
    │       └── index.js
    └── utils/
        ├── boxScoreUtils.js
        ├── constants.js
        ├── dateUtils.js
        ├── formatters.js
        └── teamUtils.js

================================================
File: App.css
================================================
#root {
  max-width: 1280px;
  margin: 0 auto;
  padding: 2rem;
  text-align: center;
}

.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.react:hover {
  filter: drop-shadow(0 0 2em #61dafbaa);
}

@keyframes logo-spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@media (prefers-reduced-motion: no-preference) {
  a:nth-of-type(2) .logo {
    animation: logo-spin infinite 20s linear;
  }
}

.card {
  padding: 2em;
}

.read-the-docs {
  color: #888;
}


================================================
File: App.jsx
================================================
import CssBaseline from "@mui/material/CssBaseline";
import Box from "@mui/material/Box";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import SportsBasketballIcon from "@mui/icons-material/SportsBasketball";
import ScoreboardIcon from '@mui/icons-material/Scoreboard';
import { useState } from "react";

// Import components from new feature-based structure
import Scoreboard from "@/features/scoreboard";
import DateScoreBoard from "@/features/dateScoreboard";
import NBAPlayerStats from "@/features/playerStats";

// Import custom hooks
import useWebSocket from "@/hooks/useWebSocket";

// Import providers
import { GameProvider } from '@/contexts/GameContext';
import { ThemeProvider } from '@/contexts/ThemeContext';

// Import TabPanel from layout components
import TabPanel from '@/components/layout/TabPanel';

function App() {
  const [currentTab, setCurrentTab] = useState(1);
  const { games, isConnected, lastUpdateTime } = useWebSocket();

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  return (
    <ThemeProvider>
      <GameProvider>
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
      </GameProvider>
    </ThemeProvider>
  );
}

export default App;

================================================
File: index.css
================================================
:root {
  font-family: Inter, system-ui, Avenir, Helvetica, Arial, sans-serif;
  line-height: 1.5;
  font-weight: 400;

  color-scheme: light dark;
  color: rgba(255, 255, 255, 0.87);
  background-color: #242424;

  font-synthesis: none;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

a {
  font-weight: 500;
  color: #646cff;
  text-decoration: inherit;
}
a:hover {
  color: #535bf2;
}

body {
  margin: 0;
  display: flex;
  place-items: center;
  min-width: 320px;
  min-height: 100vh;
}

h1 {
  font-size: 3.2em;
  line-height: 1.1;
}

button {
  border-radius: 8px;
  border: 1px solid transparent;
  padding: 0.6em 1.2em;
  font-size: 1em;
  font-weight: 500;
  font-family: inherit;
  background-color: #1a1a1a;
  cursor: pointer;
  transition: border-color 0.25s;
}
button:hover {
  border-color: #646cff;
}
button:focus,
button:focus-visible {
  outline: 4px auto -webkit-focus-ring-color;
}

@media (prefers-color-scheme: light) {
  :root {
    color: #213547;
    background-color: #ffffff;
  }
  a:hover {
    color: #747bff;
  }
  button {
    background-color: #f9f9f9;
  }
}


================================================
File: main.jsx
================================================
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { theme } from './theme/theme'
import './styles/tailwind.css';

ReactDOM.createRoot(document.getElementById('root')).render(
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
)

================================================
File: assets/images/nba_logos/teamLogosMap.js
================================================
// Import all logos
import ATL from "./ATL.svg";
import BOS from "./BOS.svg";
import BKN from "./BKN.svg";
import CHA from "./CHA.svg";
import CHI from "./CHI.svg";
import CLE from "./CLE.svg";
import DAL from "./DAL.svg";
import DEN from "./DEN.svg";
import DET from "./DET.svg";
import GSW from "./GSW.svg";
import HOU from "./HOU.svg";
import IND from "./IND.svg";
import LAC from "./LAC.svg";
import LAL from "./LAL.svg";
import MEM from "./MEM.svg";
import MIA from "./MIA.svg";
import MIL from "./MIL.svg";
import MIN from "./MIN.svg";
import NOP from "./NOP.svg";
import NYK from "./NYK.svg";
import OKC from "./OKC.svg";
import ORL from "./ORL.svg";
import PHI from "./PHI.svg";
import PHX from "./PHX.svg";
import POR from "./POR.svg";
import SAC from "./SAC.svg";
import SAS from "./SAS.svg";
import TOR from "./TOR.svg";
import UTA from "./UTA.svg";
import WAS from "./WAS.svg";

export const teamLogos = {
  ATL,
  BOS,
  BKN,
  CHA,
  CHI,
  CLE,
  DAL,
  DEN,
  DET,
  GSW,
  HOU,
  IND,
  LAC,
  LAL,
  MEM,
  MIA,
  MIL,
  MIN,
  NOP,
  NYK,
  OKC,
  ORL,
  PHI,
  PHX,
  POR,
  SAC,
  SAS,
  TOR,
  UTA,
  WAS,
};

================================================
File: components/GameDetailsModal.jsx
================================================
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Box,
  Tabs,
  Tab,
  useMediaQuery,
} from "@mui/material";
import { Close } from "@mui/icons-material";

// Import existing components
import BoxScore from "./BoxScore";
import PlayByPlay from "./PlayByPlay";

import SimpleBoxScore from "./SimpleBoxScore";
import EnhancedBoxScore from "./EnhancedBoxScore";

const GameDetailsModal = ({ gameId, open, onClose }) => {
  const [activeTab, setActiveTab] = useState(0);
  const isMobile = useMediaQuery("(max-width:600px)");

  const game_id = gameId?.gameId;

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const resetTab = () => {
    onClose();
    setActiveTab(0);
  };

  return (
    <Dialog
      open={open}
      onClose={resetTab}
      maxWidth="xl"
      fullWidth
      fullScreen={isMobile}
      PaperProps={{
        sx: {
          height: isMobile ? "100vh" : "90vh",
          backgroundColor: "#101010",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          borderRadius: isMobile ? 0 : "12px",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.4)",
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
          backgroundColor: "#101010",
          zIndex: 1,
        }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            color: "white",
            padding: isMobile ? "12px 16px" : "16px 24px",
            fontSize: isMobile ? "1.1rem" : "1.25rem",
            minHeight: "auto",
            fontWeight: 600,
          }}
        >
          Game Details
          <IconButton
            onClick={resetTab}
            sx={{
              color: "white",
              padding: isMobile ? "8px" : "12px",
              "&:hover": {
                backgroundColor: "rgba(255, 255, 255, 0.1)",
              },
            }}
          >
            <Close sx={{ fontSize: isMobile ? "1.25rem" : "1.5rem" }} />
          </IconButton>
        </DialogTitle>

        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          textColor="inherit"
          sx={{
            minHeight: "48px",
            backgroundColor: "#101010",
            "& .MuiTabs-indicator": {
              backgroundColor: "#64b5f6",
              height: "3px",
            },
            "& .MuiTab-root": {
              color: "rgba(255, 255, 255, 0.7)",
              minWidth: "120px",
              minHeight: "48px",
              padding: "12px 24px",
              textTransform: "none",
              fontWeight: 600,
              "&.Mui-selected": {
                color: "#64b5f6",
              },
              "&:hover": {
                backgroundColor: "rgba(255, 255, 255, 0.05)",
              },
            },
          }}
        >
          <Tab
            label="Box Score"
            sx={{
              fontSize: isMobile ? "0.875rem" : "1rem",
            }}
          />
          <Tab
            label="Play by Play"
            sx={{
              fontSize: isMobile ? "0.875rem" : "1rem",
            }}
          />
        </Tabs>
      </Box>

      <DialogContent
        sx={{
          backgroundColor: "#101010",
          padding: 0,
          flex: 1,
          overflow: "hidden",
          position: "relative",
        }}
      >
        <Box
          sx={{
            height: "100%",
            overflow: "auto",
            p: 0,
            "&::-webkit-scrollbar": {
              width: "8px",
            },
            "&::-webkit-scrollbar-track": {
              background: "rgba(255, 255, 255, 0.05)",
            },
            "&::-webkit-scrollbar-thumb": {
              background: "rgba(255, 255, 255, 0.2)",
              borderRadius: "4px",
              "&:hover": {
                background: "rgba(255, 255, 255, 0.3)",
              },
            },
          }}
        >
          {activeTab === 0 ? (
            <BoxScore game={gameId} open={open} />
          ) : (
            <PlayByPlay gameId={game_id} />
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default GameDetailsModal;


================================================
File: components/common/ConnectionIndicator/index.jsx
================================================
import React from "react";
import {
  Box,
} from "@mui/material";


const ConnectionIndicator = ({ connected }) => (
    <Box
      component="span"
      sx={{
        width: 8,
        height: 8,
        borderRadius: "50%",
        backgroundColor: connected ? "#4caf50" : "#f44336", // green when connected, red when disconnected
        display: "inline-block",
        mr: 1,
        "@keyframes pulse": {
          "0%": {
            transform: "scale(0.95)",
            boxShadow: "0 0 0 0 rgba(76, 175, 80, 0.7)",
          },
          "70%": {
            transform: "scale(1)",
            boxShadow: "0 0 0 6px rgba(76, 175, 80, 0)",
          },
          "100%": {
            transform: "scale(0.95)",
            boxShadow: "0 0 0 0 rgba(76, 175, 80, 0)",
          },
        },
        animation: connected ? "pulse 2s infinite" : "none",
      }}
    />
  );

export default ConnectionIndicator;

================================================
File: components/common/TeamLogo/index.jsx
================================================
// src/components/common/TeamLogo/index.jsx
import React from 'react';
import { Box } from '@mui/material';
import { teamLogos } from '../../../assets/images/nba_logos/teamLogosMap';

const TeamLogo = ({ teamAbbreviation, size = 'medium' }) => {
  const sizeMap = {
    small: { width: 32, height: 32 },
    medium: { width: 48, height: 48 },
    large: { width: 72, height: 72 }
  };

  const dimensions = sizeMap[size] || sizeMap.medium;

  return (
    <Box
      component="img"
      src={teamLogos[teamAbbreviation]}
      alt={`${teamAbbreviation} logo`}
      sx={{
        ...dimensions,
        objectFit: "contain"
      }}
    />
  );
};

export default TeamLogo;

================================================
File: components/common/TeamLogo/styles.js
================================================
// src/components/common/TeamLogo/styles.js
export const styles = {
    logo: {
      objectFit: 'contain',
      transition: 'transform 0.2s ease-in-out',
      '&:hover': {
        transform: 'scale(1.05)'
      }
    }
  };

================================================
File: components/game/BoxScore/constants.js
================================================
export const headCells = [
  { id: "name", numeric: false, label: "PLAYER", width: "18%" },
  { id: "minutes", numeric: false, label: "MIN", width: "12%" },
  { id: "points", numeric: true, label: "PTS", width: "13.5%" },
  { id: "reboundsTotal", numeric: true, label: "REB", width: "14%" },
  { id: "assists", numeric: true, label: "AST", width: "13.5%" },
  { id: "fieldGoals", numeric: true, label: "FG", width: "12%" },
  { id: "threePointers", numeric: true, label: "3P", width: "11.5%" },
  { id: "plusMinusPoints", numeric: true, label: "+/-", width: "12%" },
];

================================================
File: components/game/BoxScore/index.jsx
================================================
import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  useMediaQuery,
} from "@mui/material";
import TeamBoxScoreTable from "./components/TeamBoxScoreTable";
import apiService from "../../../services/api";

const BoxScore = ({ game, open }) => {
  if (!game || !open) {
    return null;
  }

  const isMobile = useMediaQuery("(max-width:600px)");
  const [boxScore, setBoxScore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const gameId = game.gameId;
  const [awayScore, homeScore] = game.score
    .split(" - ")
    .map((score) => parseInt(score) || 0);

  useEffect(() => {
    const fetchBoxScore = async () => {
      if (!gameId) return;
      
      try {
        setLoading(true);
        const data = await apiService.fetchBoxScore(gameId);
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
    <Box
      sx={{
        width: "100%",
        py: 2,
        px: isMobile ? 1 : 3,
        backgroundColor: "#101010",
        overflow: "auto",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        "&::-webkit-scrollbar": {
          display: "none",
        },
        msOverflowStyle: "none",
        scrollbarWidth: "none",
      }}
    >
      {loading ? (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          height="200px"
        >
          <CircularProgress sx={{ color: "#64b5f6" }} />
        </Box>
      ) : error ? (
        <Typography color="error" sx={{ textAlign: "center" }}>
          {error}
        </Typography>
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


================================================
File: components/game/BoxScore/components/PlayerRow.jsx
================================================
// src/components/game/BoxScore/components/PlayerRow.jsx
export const PlayerRow = ({ player, index, isMobile }) => {
  return (
    <TableRow
      hover
      tabIndex={-1}
      sx={{
        backgroundColor: player.starter
          ? "rgba(255, 255, 255, 0.00)"
          : index % 2 === 0
          ? "rgba(255, 255, 255, 0.00)"
          : "transparent",
        "&:hover": {
          backgroundColor: "rgba(255, 255, 255, 0.06) !important",
        },
      }}
    >
      <TableCell
        sx={{
          color: "rgba(255, 255, 255, 0.9)",
          fontWeight: player.starter ? 600 : 400,
          position: "relative",
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
        {formatPlayerName(player.name, isMobile)}
        {player.oncourt && (
          <Box
            sx={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              backgroundColor: "#4caf50",
              display: "inline-block",
              animation: "pulse 2s infinite",
            }}
          />
        )}
      </TableCell>
      <TableCell>{formatMinutes(player.statistics.minutes)}</TableCell>
      <StatCell value={player.statistics.points} threshold={20} align="right" />
      <StatCell
        value={player.statistics.reboundsTotal}
        threshold={10}
        align="right"
      />
      <StatCell
        value={player.statistics.assists}
        threshold={10}
        align="right"
      />
      <TableCell align="right">
        {`${player.statistics.fieldGoalsMade}-${player.statistics.fieldGoalsAttempted}`}
      </TableCell>
      <TableCell align="right">
        {`${player.statistics.threePointersMade}-${player.statistics.threePointersAttempted}`}
      </TableCell>
      <PlusMinusCell value={player.statistics.plusMinusPoints} />
    </TableRow>
  );
};


================================================
File: components/game/BoxScore/components/PluaMinusCell.jsx
================================================
// src/components/game/BoxScore/components/PlusMinusCell.jsx
const PlusMinusCell = ({ value }) => (
  <TableCell
    align="right"
    sx={{
      color: value > 0 ? "#4caf50" : value < 0 ? "#f44336" : "inherit",
      fontWeight: Math.abs(value) >= 15 ? 600 : 400,
    }}
  >
    {value > 0 ? `+${value}` : value}
  </TableCell>
);


================================================
File: components/game/BoxScore/components/StatCell.jsx
================================================
// src/components/game/BoxScore/components/StatCell.jsx
const StatCell = ({ value, threshold, align = "right" }) => (
  <TableCell
    align={align}
    sx={{
      color: value >= threshold ? "#64b5f6" : "inherit",
      fontWeight: value >= threshold ? 600 : 400,
    }}
  >
    {value}
  </TableCell>
);


================================================
File: components/game/BoxScore/components/TeamBoxScoreTable.jsx
================================================
// src/components/game/BoxScore/components/TeamBoxScoreTable.jsx
import React, { useState } from "react";
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableContainer,
  Toolbar,
  Typography,
  Button,
  useMediaQuery,
} from "@mui/material";
import { ExpandMore as ExpandMoreIcon, ExpandLess as ExpandLessIcon } from "@mui/icons-material";
import { teamLogos } from "../../../../assets/images/nba_logos/teamLogosMap";
import { getTeamAbbreviation } from "../../../../utils/teamUtils";
import { getComparator } from "../../../../utils/boxScoreUtils";
import { headCells } from "../constants";
import EnhancedTableHead from "./EnhancedTableHead";
import PlayerRow from "./PlayerRow";

const TeamBoxScoreTable = ({ team, teamName, scoreboardScore }) => {
  const isMobile = useMediaQuery("(max-width:600px)");
  const [order, setOrder] = useState("desc");
  const [orderBy, setOrderBy] = useState("minutes");
  const [showAll, setShowAll] = useState(false);

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === "desc";
    setOrder(isAsc ? "asc" : "desc");
    setOrderBy(property);
  };

  const activePlayers = team.players.filter(
    (player) => player.status === "ACTIVE"
  );

  const sortedPlayers = React.useMemo(
    () => [...activePlayers].sort(getComparator(order, orderBy)),
    [activePlayers, order, orderBy]
  );

  const displayedPlayers = showAll
    ? sortedPlayers
    : sortedPlayers.slice(0, isMobile ? 5 : 8);

  const teamAbbreviation = getTeamAbbreviation(team.teamCity, team.teamName);

  return (
    <Box sx={{ width: "100%", mb: 4 }}>
      <Paper
        sx={{
          width: "100%",
          mb: 2,
          backgroundColor: "#101010",
          borderRadius: "12px",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.4)",
          overflow: "hidden",
        }}
      >
        <Toolbar
          sx={{
            pl: isMobile ? 2 : 3,
            pr: isMobile ? 1 : 2,
            minHeight: isMobile ? "60px" : "72px",
            display: "flex",
            alignItems: "center",
            gap: 2,
            borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
            backgroundColor: "#101010",
          }}
        >
          <Box
            component="img"
            src={teamLogos[teamAbbreviation]}
            alt={`${team.teamCity} ${team.teamName} logo`}
            sx={{
              height: isMobile ? "32px" : "40px",
              width: "auto",
              objectFit: "contain",
            }}
          />
          <Typography
            sx={{
              flex: "1 1 100%",
              fontSize: isMobile ? "1rem" : "1.25rem",
              fontWeight: 600,
              color: "white",
            }}
            variant="h6"
            component="div"
          >
            {teamName}
            {scoreboardScore && (
              <Typography
                component="span"
                sx={{
                  ml: 2,
                  color: "#64b5f6",
                  fontSize: isMobile ? "1.25rem" : "1.5rem",
                  fontWeight: 600,
                }}
              >
                {scoreboardScore}
              </Typography>
            )}
          </Typography>
        </Toolbar>

        <TableContainer>
          <Table
            sx={{
              tableLayout: "fixed",
              "& .MuiTableCell-root": {
                padding: isMobile ? "8px 4px" : "12px 16px",
                fontSize: isMobile ? "0.75rem" : "0.875rem",
                color: "rgba(255, 255, 255, 0.95)",
                borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
              },
              "& .MuiTableRow-root:hover": {
                backgroundColor: "rgba(255, 255, 255, 0.03)",
              },
            }}
          >
            <EnhancedTableHead
              order={order}
              orderBy={orderBy}
              onRequestSort={handleRequestSort}
              isMobile={isMobile}
            />
            <TableBody>
              {displayedPlayers.map((player, index) => (
                <PlayerRow
                  key={player.name}
                  player={player}
                  index={index}
                  isMobile={isMobile}
                />
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {activePlayers.length > (isMobile ? 5 : 8) && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              padding: 2,
              borderTop: "1px solid rgba(255, 255, 255, 0.08)",
              backgroundColor: "#101010",
            }}
          >
            <Button
              onClick={() => setShowAll(!showAll)}
              endIcon={showAll ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              sx={{
                color: "#64b5f6",
                "&:hover": {
                  backgroundColor: "rgba(100, 181, 246, 0.08)",
                },
                textTransform: "none",
                fontWeight: 600,
              }}
            >
              {showAll ? "Show Less" : "Show All"}
            </Button>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default TeamBoxScoreTable;

================================================
File: components/game/GameCard/index.jsx
================================================
// ScoreBoard.jsx
import React, { useState, useEffect } from "react";
import ConnectionIndicator from "./ConnectionIndicator";
import GameDetailsDialog from "./GameDetailsDialog";
import GameDetailsModal from "./GameDetailsModal";
// (Optional) If you still use these elsewhere, keep them; otherwise you can remove:
// import BoxScore from "./BoxScore";
// import BoxScoreAgGrid from "./BoxScoreAgGrid";

import {
  Box,
  Card,
  CardContent,
  Typography,
  Container,
  Stack,
  Collapse,
  IconButton,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { KeyboardArrowDown, KeyboardArrowUp } from "@mui/icons-material";

// Import all logos
import ATL from "@assets/nba_logos/ATL.svg";
import BOS from "@assets/nba_logos/BOS.svg";
import BKN from "@assets/nba_logos/BKN.svg";
import CHA from "@assets/nba_logos/CHA.svg";
import CHI from "@assets/nba_logos/CHI.svg";
import CLE from "@assets/nba_logos/CLE.svg";
import DAL from "@assets/nba_logos/DAL.svg";
import DEN from "@assets/nba_logos/DEN.svg";
import DET from "@assets/nba_logos/DET.svg";
import GSW from "@assets/nba_logos/GSW.svg";
import HOU from "@assets/nba_logos/HOU.svg";
import IND from "@assets/nba_logos/IND.svg";
import LAC from "@assets/nba_logos/LAC.svg";
import LAL from "@assets/nba_logos/LAL.svg";
import MEM from "@assets/nba_logos/MEM.svg";
import MIA from "@assets/nba_logos/MIA.svg";
import MIL from "@assets/nba_logos/MIL.svg";
import MIN from "@assets/nba_logos/MIN.svg";
import NOP from "@assets/nba_logos/NOP.svg";
import NYK from "@assets/nba_logos/NYK.svg";
import OKC from "@assets/nba_logos/OKC.svg";
import ORL from "@assets/nba_logos/ORL.svg";
import PHI from "@assets/nba_logos/PHI.svg";
import PHX from "@assets/nba_logos/PHX.svg";
import POR from "@assets/nba_logos/POR.svg";
import SAC from "@assets/nba_logos/SAC.svg";
import SAS from "@assets/nba_logos/SAS.svg";
import TOR from "@assets/nba_logos/TOR.svg";
import UTA from "@assets/nba_logos/UTA.svg";
import WAS from "@assets/nba_logos/WAS.svg";
import NBA from "@assets/nba_logos/NBA_logo.svg";

const teamLogos = {
  ATL,
  BOS,
  BKN,
  CHA,
  CHI,
  CLE,
  DAL,
  DEN,
  DET,
  GSW,
  HOU,
  IND,
  LAC,
  LAL,
  MEM,
  MIA,
  MIL,
  MIN,
  NOP,
  NYK,
  OKC,
  ORL,
  PHI,
  PHX,
  POR,
  SAC,
  SAS,
  TOR,
  UTA,
  WAS,
};

const Header = ({ isConnected, lastUpdateTime, isMobile }) => (
  <Box
    sx={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      mb: isMobile ? 2 : 3,
      backgroundColor: "#101010",
      borderRadius: 2,
      padding: isMobile ? "12px 16px" : "16px 24px",
      boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
    }}
  >
    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
      <Box
        component="img"
        src={NBA}
        alt="NBA Logo"
        sx={{
          height: isMobile ? "24px" : "32px",
          width: "auto",
          // Remove the filter and let the SVG's natural colors show
        }}
      />
      <Typography
        variant={isMobile ? "h6" : "h4"}
        sx={{
          fontSize: isMobile ? "1.5rem" : "2rem",
          fontWeight: 500,
          letterSpacing: "0.5px",
          color: "#ffffff",
        }}
      >
        Scoreboard
      </Typography>
    </Box>
    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
      <ConnectionIndicator connected={isConnected} />
      {lastUpdateTime && (
        <Typography
          variant="caption"
          sx={{
            opacity: 0.7,
            fontSize: isMobile ? "0.7rem" : "0.75rem",
          }}
        >
          Last update:{" "}
          {lastUpdateTime.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          })}
        </Typography>
      )}
    </Box>
  </Box>
);

/**
 * Converts Eastern Standard Time (EST) to local time
 * @param {string} timeStr - Time string in format "Start: HH:MM PM"
 * @returns {string} - Formatted time string in local timezone
 */
const convertToLocalTime = (timeStr) => {
  // If it's not a start time (e.g., "1Q 10:44" or "Final"), return as-is.
  if (!timeStr.startsWith("Start:")) {
    return timeStr;
  }

  // Extract the time part
  const [_, timeComponent] = timeStr.split("Start: ");
  const [time, period] = timeComponent.trim().split(" ");
  const [hours, minutes] = time.split(":").map((num) => parseInt(num));

  // Convert to 24-hour format
  let hour24 = hours;
  if (period === "PM" && hours !== 12) {
    hour24 += 12;
  } else if (period === "AM" && hours === 12) {
    hour24 = 0;
  }

  // Get today's date
  const today = new Date();

  // Create a date object with the game time in EST (UTC-5 offset)
  const etDate = new Date(
    Date.UTC(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
      hour24 + 5, // EST to UTC offset
      minutes
    )
  );

  // Convert to local time
  const localTime = new Date(etDate);

  // Format the time in local timezone
  const localTimeStr = localTime.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  return `Start: ${localTimeStr}`;
};

/**
 * Renders away/home team info (logo + name + optional score).
 */
const TeamInfo = ({ teamName, tricode, score, isWinner, isHomeTeam }) => {
  const isMobile = useMediaQuery("(max-width:600px)");
  const logoSrc = teamLogos[tricode];

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: isMobile ? 1.5 : 3,
        flexDirection: isHomeTeam ? "row-reverse" : "row",
        justifyContent: isHomeTeam ? "flex-start" : "flex-start",
        minWidth: isMobile ? "auto" : "300px",
        flex: isMobile ? 1 : "none",
        width: "100%",
        maxWidth: isHomeTeam ? "45%" : "45%",
      }}
    >
      <Box
        component="img"
        src={logoSrc}
        alt={`${teamName} logo`}
        sx={{
          width: isMobile ? 48 : 72,
          height: isMobile ? 48 : 72,
          objectFit: "contain",
        }}
      />
      <Box
        sx={{
          textAlign: isHomeTeam ? "right" : "left",
          overflow: "hidden",
        }}
      >
        <Typography
          variant="body1"
          fontWeight="600"
          sx={{
            fontSize: isMobile ? "1rem" : "1.5rem",
            whiteSpace: "nowrap",
            color: "rgba(255, 255, 255, 0.95)",
          }}
        >
          {isMobile ? tricode : teamName}
        </Typography>
        {score !== "" && (
          <Typography
            variant={isMobile ? "h5" : "h4"}
            sx={{
              color: isWinner ? "#64b5f6" : "rgba(255, 255, 255, 0.95)",
              fontWeight: isWinner ? 600 : 500,
              fontSize: isMobile ? "1.5rem" : "2rem",
              lineHeight: 1, // Tighten up the spacing between name and score
              marginTop: "4px", // Add a small gap between name and score
            }}
          >
            {score}
          </Typography>
        )}
      </Box>
    </Box>
  );
};

/**
 * Single game card component.
 * - If a game has not started (time starts with "Start:" or "0Q"), do NOT call onBoxScoreClick.
 */
const GameCard = ({ game, onBoxScoreClick }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery("(max-width:600px)");
  const [awayScore, homeScore] = game.score
    .split(" - ")
    .map((score) => parseInt(score) || 0);

  // Convert the game time to local timezone
  const gameStatus = convertToLocalTime(game.time);

  // Check if game is not started yet
  const isNotStarted =
    gameStatus.startsWith("Start:") || gameStatus.startsWith("0Q");

  // Hide the score for upcoming games
  const awayDisplayScore = isNotStarted ? "" : awayScore;
  const homeDisplayScore = isNotStarted ? "" : homeScore;

  // Format the game status display (handle "0Q 0:00" as pre-game, etc.)
  const displayStatus = gameStatus === "0Q 0:00" ? "Pre-Game" : gameStatus;

  return (
    <Card
      onClick={() => {
        if (!isNotStarted) {
          onBoxScoreClick(game);
        }
      }}
      sx={{
        cursor: isNotStarted ? "default" : "pointer",
        mb: isMobile ? 1 : 3,
        backgroundColor: "#262626", // Lighter than background for contrast
        boxShadow: "0 3px 12px rgba(0,0,0,0.3)", // More pronounced shadow
        transition: "all 0.2s ease-in-out",
        "&:hover": {
          transform: isNotStarted ? "none" : "scale(1.01)",
          backgroundColor: "#2d2d2d", // Slightly lighter on hover
        },
        height: isMobile ? "120px" : "150px",
        border: "1px solid rgba(255, 255, 255, 0.08)", // Subtle border
        borderRadius: "12px", // Slightly more rounded corners
        width: "100%",
        maxWidth: "100%",
      }}
    >
      <CardContent
        sx={{
          position: "relative",
          p: isMobile ? "16px !important" : "24px !important",
          height: "100%",
          "&:last-child": {
            paddingBottom: isMobile ? "16px !important" : "24px !important",
          },
        }}
      >
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ height: "100%" }}
        >
          <TeamInfo
            teamName={game.away_team}
            tricode={game.away_tricode}
            score={awayDisplayScore}
            isWinner={!isNotStarted && awayScore > homeScore}
            isHomeTeam={false}
          />

          <Box
            sx={{
              position: "absolute",
              left: "50%",
              top: "50%",
              transform: "translate(-50%, -50%)",
              minWidth: isMobile ? "60px" : "100px",
              textAlign: "center",
            }}
          >
            <Typography
              variant="body2"
              sx={{
                color: "#ffffff",
                opacity: 0.5,
                letterSpacing: "0.5px",
                fontWeight: 400,
                fontSize: isMobile ? "0.875rem" : "1.25rem",
              }}
            >
              {isNotStarted ? gameStatus.replace("Start: ", "") : displayStatus}{" "}
            </Typography>
          </Box>

          <TeamInfo
            teamName={game.home_team}
            tricode={game.home_tricode}
            score={homeDisplayScore}
            isWinner={!isNotStarted && homeScore > awayScore}
            isHomeTeam={true}
          />
        </Stack>
      </CardContent>
    </Card>
  );
};

/**
 * Main scoreboard component.
 */
const Scoreboard = ({ games, isConnected, lastUpdateTime }) => {
  const isMobile = useMediaQuery("(max-width:600px)");
  const [selectedGame, setSelectedGame] = useState(null);
  const [boxScoreOpen, setBoxScoreOpen] = useState(false);
  const [showAllGames, setShowAllGames] = useState(true);

  // Helper to parse period/time for sorting
  const parseGameTime = (time) => {
    if (time.startsWith("Start:"))
      return { period: -1, minutes: 0, seconds: 0 };

    // e.g. "1Q 10:44", "OT 5:00", "Final", etc.
    const periodMatch = time.match(/(\d+)Q/) || time.match(/(\d+)OT/);
    const timeMatch = time.match(/(\d+):(\d+)/);

    const period = periodMatch ? parseInt(periodMatch[1]) : 0;
    const minutes = timeMatch ? parseInt(timeMatch[1]) : 0;
    const seconds = timeMatch ? parseInt(timeMatch[2]) : 0;

    return { period, minutes, seconds };
  };

  // Sort function: in-progress first, then scheduled, then final
  const sortGames = (a, b) => {
    const timeA = parseGameTime(a.time);
    const timeB = parseGameTime(b.time);

    // Higher period = earlier in the list
    if (timeB.period !== timeA.period) return timeB.period - timeA.period;

    // Then by clock time ascending
    const totalSecondsA = timeA.minutes * 60 + timeA.seconds;
    const totalSecondsB = timeB.minutes * 60 + timeB.seconds;
    return totalSecondsA - totalSecondsB;
  };

  // Separate live, upcoming, completed
  const liveGames = games
    .filter(
      (game) =>
        !game.time.startsWith("Start:") &&
        game.time !== "Final" &&
        !game.time.startsWith("0Q")
    )
    .sort(sortGames);

  const scheduledGames = games.filter(
    (game) => game.time.startsWith("Start:") || game.time.startsWith("0Q")
  );

  const completedGames = games.filter((game) => game.time === "Final");

  // Click handler for an in-progress or completed game => open modal
  const handleBoxScoreClick = (game) => {
    setSelectedGame(game);
    setBoxScoreOpen(true);
  };

  return (
    <Container
      maxWidth="xl"
      sx={{
        py: isMobile ? 2 : 4,
        px: isMobile ? 1 : 2,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        maxWidth: "1400px !important",
      }}
    >
      {/* Header */}
      <Header
        isConnected={isConnected}
        lastUpdateTime={lastUpdateTime}
        isMobile={isMobile}
      />

      {/* Live Games Section */}
      {liveGames.length > 0 && (
        <Box mb={isMobile ? 2 : 4}>
          <Typography
            variant={isMobile ? "subtitle1" : "h6"}
            gutterBottom
            sx={{
              display: "flex",
              alignItems: "center",
              fontSize: isMobile ? "1rem" : "1.25rem",
            }}
          >
            {/* Red dot to indicate live */}
            <Box
              component="span"
              sx={{
                width: isMobile ? 6 : 8,
                height: isMobile ? 6 : 8,
                borderRadius: "50%",
                backgroundColor: "error.main",
                display: "inline-block",
                mr: 1,
                animation: "pulse 2s infinite",
              }}
            />
            Live Games
          </Typography>
          {liveGames.map((game, index) => (
            <GameCard
              key={index}
              game={game}
              onBoxScoreClick={handleBoxScoreClick}
            />
          ))}
        </Box>
      )}

      {/* Scheduled Games Section */}
      {scheduledGames.length > 0 && (
        <Box mb={isMobile ? 2 : 4}>
          <Typography
            variant={isMobile ? "subtitle1" : "h6"}
            gutterBottom
            sx={{ fontSize: isMobile ? "1rem" : "1.25rem" }}
          >
            Upcoming Games
          </Typography>
          {scheduledGames.map((game, index) => (
            <GameCard
              key={index}
              game={game}
              onBoxScoreClick={handleBoxScoreClick}
            />
          ))}
        </Box>
      )}

      {/* Completed Games Section */}
      {completedGames.length > 0 && (
        <Box>
          <Typography
            variant={isMobile ? "subtitle1" : "h6"}
            gutterBottom
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: isMobile ? "1rem" : "1.25rem",
            }}
          >
            Completed Games
            <IconButton
              size={isMobile ? "small" : "medium"}
              onClick={() => setShowAllGames(!showAllGames)}
              sx={{
                ml: 1,
                padding: isMobile ? "4px" : "8px",
              }}
            >
              {showAllGames ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
            </IconButton>
          </Typography>

          <Collapse in={showAllGames}>
            {completedGames.map((game, index) => (
              <GameCard
                key={index}
                game={game}
                onBoxScoreClick={handleBoxScoreClick}
              />
            ))}
          </Collapse>
        </Box>
      )}

      {/* 
        GameDetailsDialog:
        - Replaces the old BoxScoreAgGrid modal so that when the user clicks
          an in-progress or completed game, this tabbed dialog opens,
          showing Box Score and Play By Play for `selectedGame`.
      */}
      <GameDetailsModal
        gameId={selectedGame}
        open={boxScoreOpen}
        onClose={() => {
          setBoxScoreOpen(false);
          setSelectedGame(null);
        }}
      />

      {/* If no games are available, show a "No games scheduled" state */}
      {games.length === 0 && (
        <Box
          sx={{
            textAlign: "center",
            py: isMobile ? 4 : 6,
            opacity: 0.7,
          }}
        >
          <Typography
            variant={isMobile ? "body1" : "h6"}
            sx={{
              fontSize: isMobile ? "0.875rem" : "1rem",
            }}
          >
            No games scheduled
          </Typography>
        </Box>
      )}
    </Container>
  );
};

export default Scoreboard;


================================================
File: components/game/PlayByPlay/index.jsx
================================================
// src/components/game/PlayByPlay/index.jsx
import React from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  useMediaQuery,
  Alert,
} from "@mui/material";
import { usePlayByPlay } from "../../../hooks/useGameData";
import { formatClock } from "../../../utils/formatters";

const PlayByPlay = ({ gameId }) => {
  const isMobile = useMediaQuery("(max-width:600px)");
  const { actions, loading, error } = usePlayByPlay(gameId);

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "200px",
        }}
      >
        <CircularProgress sx={{ color: "#64b5f6" }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 2, height: "100%" }}>
        <Alert
          severity="error"
          sx={{
            backgroundColor: "rgba(244, 67, 54, 0.1)",
            color: "#f44336",
            "& .MuiAlert-icon": {
              color: "#f44336",
            },
          }}
        >
          {error}
        </Alert>
      </Box>
    );
  }

  if (!actions?.length) {
    return (
      <Box
        sx={{
          p: 2,
          height: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Typography
          sx={{
            color: "rgba(255, 255, 255, 0.7)",
            fontSize: isMobile ? "0.875rem" : "1rem",
          }}
        >
          No play-by-play data available.
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        width: "100%",
        py: 2,
        px: isMobile ? 1 : 3,
        backgroundColor: "#101010",
        overflow: "auto",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        "&::-webkit-scrollbar": {
          display: "none",
        },
        msOverflowStyle: "none",
        scrollbarWidth: "none",
      }}
    >
      <TableContainer
        component={Paper}
        sx={{
          backgroundColor: "#101010",
          borderRadius: "12px",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.4)",
          overflow: "hidden",
          "&::-webkit-scrollbar": {
            display: "none",
          },
          msOverflowStyle: "none",
          scrollbarWidth: "none",
        }}
      >
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              {[
                { label: 'Clock', width: isMobile ? '60px' : '80px' },
                { label: 'Team', width: '60px' },
                { label: 'Score', width: '100px' },
                { label: 'Action', width: '100px' },
                { label: 'Description', width: 'auto' },
              ].map(({ label, width }) => (
                <TableCell
                  key={label}
                  sx={{
                    backgroundColor: "#101010",
                    color: "rgba(255, 255, 255, 0.95)",
                    fontWeight: 600,
                    fontSize: isMobile ? "0.75rem" : "0.875rem",
                    padding: isMobile ? "8px 4px" : "12px 16px",
                    borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
                    width,
                  }}
                >
                  {label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {actions.map((action, index) => (
              <TableRow
                key={action.actionNumber}
                sx={{
                  backgroundColor:
                    index % 2 === 0
                      ? "rgba(255, 255, 255, 0.01)"
                      : "transparent",
                  "&:hover": {
                    backgroundColor: "rgba(255, 255, 255, 0.03)",
                  },
                }}
              >
                <TableCell
                  sx={{
                    color: "rgba(255, 255, 255, 0.87)",
                    padding: isMobile ? "8px 4px" : "12px 16px",
                    fontSize: isMobile ? "0.75rem" : "0.875rem",
                    borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
                  }}
                >
                  {formatClock(action.clock)}
                </TableCell>
                <TableCell
                  sx={{
                    color: "rgba(255, 255, 255, 0.87)",
                    padding: isMobile ? "8px 4px" : "12px 16px",
                    fontSize: isMobile ? "0.75rem" : "0.875rem",
                    borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
                  }}
                >
                  {action.teamTricode || "--"}
                </TableCell>
                <TableCell
                  sx={{
                    color: "#64b5f6",
                    padding: isMobile ? "8px 4px" : "12px 16px",
                    fontSize: isMobile ? "0.75rem" : "0.875rem",
                    borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
                    fontWeight: 500,
                  }}
                >
                  {action.scoreAway} - {action.scoreHome}
                </TableCell>
                <TableCell
                  sx={{
                    color: "rgba(255, 255, 255, 0.87)",
                    padding: isMobile ? "8px 4px" : "12px 16px",
                    fontSize: isMobile ? "0.75rem" : "0.875rem",
                    borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
                  }}
                >
                  {action.actionType}
                </TableCell>
                <TableCell
                  sx={{
                    color: "rgba(255, 255, 255, 0.87)",
                    padding: isMobile ? "8px 4px" : "12px 16px",
                    fontSize: isMobile ? "0.75rem" : "0.875rem",
                    borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
                  }}
                >
                  {action.description}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default PlayByPlay;

================================================
File: components/layout/GameDetailsModal/index.jsx
================================================
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Box,
  Tabs,
  Tab,
  useMediaQuery,
} from "@mui/material";
import { Close } from "@mui/icons-material";

// Import existing components
import BoxScore from "./BoxScore";
import PlayByPlay from "./PlayByPlay";

const GameDetailsModal = ({ gameId, open, onClose }) => {
  const [activeTab, setActiveTab] = useState(0);
  const isMobile = useMediaQuery("(max-width:600px)");

  const game_id = gameId?.gameId;

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const resetTab = () => {
    onClose();
    setActiveTab(0);
  };

  return (
    <Dialog
      open={open}
      onClose={resetTab}
      maxWidth="xl"
      fullWidth
      fullScreen={isMobile}
      PaperProps={{
        sx: {
          height: isMobile ? "100vh" : "90vh",
          backgroundColor: "#101010",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          borderRadius: isMobile ? 0 : "12px",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.4)",
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
          backgroundColor: "#101010",
          zIndex: 1,
        }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            color: "white",
            padding: isMobile ? "12px 16px" : "16px 24px",
            fontSize: isMobile ? "1.1rem" : "1.25rem",
            minHeight: "auto",
            fontWeight: 600,
          }}
        >
          Game Details
          <IconButton
            onClick={resetTab}
            sx={{
              color: "white",
              padding: isMobile ? "8px" : "12px",
              "&:hover": {
                backgroundColor: "rgba(255, 255, 255, 0.1)",
              },
            }}
          >
            <Close sx={{ fontSize: isMobile ? "1.25rem" : "1.5rem" }} />
          </IconButton>
        </DialogTitle>

        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          textColor="inherit"
          sx={{
            minHeight: "48px",
            backgroundColor: "#101010",
            "& .MuiTabs-indicator": {
              backgroundColor: "#64b5f6",
              height: "3px",
            },
            "& .MuiTab-root": {
              color: "rgba(255, 255, 255, 0.7)",
              minWidth: "120px",
              minHeight: "48px",
              padding: "12px 24px",
              textTransform: "none",
              fontWeight: 600,
              "&.Mui-selected": {
                color: "#64b5f6",
              },
              "&:hover": {
                backgroundColor: "rgba(255, 255, 255, 0.05)",
              },
            },
          }}
        >
          <Tab
            label="Box Score"
            sx={{
              fontSize: isMobile ? "0.875rem" : "1rem",
            }}
          />
          <Tab
            label="Play by Play"
            sx={{
              fontSize: isMobile ? "0.875rem" : "1rem",
            }}
          />
        </Tabs>
      </Box>

      <DialogContent
        sx={{
          backgroundColor: "#101010",
          padding: 0,
          flex: 1,
          overflow: "hidden",
          position: "relative",
        }}
      >
        <Box
          sx={{
            height: "100%",
            overflow: "auto",
            p: 0,
            "&::-webkit-scrollbar": {
              width: "8px",
            },
            "&::-webkit-scrollbar-track": {
              background: "rgba(255, 255, 255, 0.05)",
            },
            "&::-webkit-scrollbar-thumb": {
              background: "rgba(255, 255, 255, 0.2)",
              borderRadius: "4px",
              "&:hover": {
                background: "rgba(255, 255, 255, 0.3)",
              },
            },
          }}
        >
          {activeTab === 0 ? (
            <BoxScore game={gameId} open={open} />
          ) : (
            <PlayByPlay gameId={game_id} />
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default GameDetailsModal;


================================================
File: components/layout/Header/index.jsx
================================================
// src/components/layout/Header/index.jsx
import React from 'react';
import { Box, Typography } from '@mui/material';
import { styles } from './styles';
import NBA from '../../../assets/nba_logos/NBA_logo.svg';
import ConnectionIndicator from '../../common/ConnectionIndicator';

const Header = ({ isConnected, lastUpdateTime, isMobile }) => (
  <Box sx={styles.headerContainer}>
    <Box sx={styles.logoContainer}>
      <Box
        component="img"
        src={NBA}
        alt="NBA Logo"
        sx={styles.logo}
      />
      <Typography
        variant={isMobile ? "h6" : "h4"}
        sx={styles.title}
      >
        Scoreboard
      </Typography>
    </Box>
    <Box sx={styles.statusContainer}>
      <ConnectionIndicator connected={isConnected} />
      {lastUpdateTime && (
        <Typography
          variant="caption"
          sx={styles.updateTime}
        >
          Last update:{" "}
          {lastUpdateTime.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          })}
        </Typography>
      )}
    </Box>
  </Box>
);

export default Header;

================================================
File: components/layout/Header/styles.js
================================================
// src/components/layout/Header/styles.js
export const styles = {
    headerContainer: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      mb: { xs: 2, md: 3 },
      backgroundColor: "#101010",
      borderRadius: 2,
      padding: { xs: "12px 16px", md: "16px 24px" },
      boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
    },
    logoContainer: {
      display: "flex",
      alignItems: "center",
      gap: 2
    },
    logo: {
      height: { xs: "24px", md: "32px" },
      width: "auto"
    },
    title: {
      fontSize: { xs: "1.5rem", md: "2rem" },
      fontWeight: 500,
      letterSpacing: "0.5px",
      color: "#ffffff"
    },
    statusContainer: {
      display: "flex",
      alignItems: "center",
      gap: 2
    },
    updateTime: {
      opacity: 0.7,
      fontSize: { xs: "0.7rem", md: "0.75rem" }
    }
  };

================================================
File: components/layout/TabPanel/index.jsx
================================================
// src/components/layout/TabPanel/index.jsx
import React from 'react';
import { Box } from '@mui/material';
import { styles } from './styles';

const TabPanel = ({ children, value, index }) => {
  if (value !== index) return null;
  
  return (
    <div
      role="tabpanel"
      id={`scoreboard-tabpanel-${index}`}
      aria-labelledby={`scoreboard-tab-${index}`}
      style={{ height: "100%" }}
    >
      <Box sx={styles.container}>{children}</Box>
    </div>
  );
};

export default TabPanel;

================================================
File: components/layout/TabPanel/styles.js
================================================
// src/components/layout/TabPanel/styles.js
export const styles = {
    container: {
      p: 3,
      height: "100%",
      overflow: "auto",
      "&::-webkit-scrollbar": {
        width: "8px"
      },
      "&::-webkit-scrollbar-track": {
        background: "rgba(255, 255, 255, 0.05)"
      },
      "&::-webkit-scrollbar-thumb": {
        background: "rgba(255, 255, 255, 0.2)",
        borderRadius: "4px",
        "&:hover": {
          background: "rgba(255, 255, 255, 0.3)"
        }
      }
    }
  };

================================================
File: contexts/GameContext.jsx
================================================
// src/contexts/GameContext.jsx
import React, { createContext, useContext, useState } from 'react';

const GameContext = createContext();

export const GameProvider = ({ children }) => {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState(false);

  const updateGames = (newGames) => {
    setGames(newGames);
  };

  return (
    <GameContext.Provider value={{
      games,
      updateGames,
      loading,
      setLoading,
      error,
      setError,
      connectionStatus,
      setConnectionStatus
    }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGameContext = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGameContext must be used within a GameProvider');
  }
  return context;
};

================================================
File: contexts/ThemeContext.jsx
================================================
// src/contexts/ThemeContext.jsx
import React, { createContext, useContext, useState } from 'react';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import darkTheme from '../styles/theme';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme] = useState(darkTheme);

  return (
    <ThemeContext.Provider value={{ theme }}>
      <MuiThemeProvider theme={theme}>
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

================================================
File: features/dateScoreboard/index.jsx
================================================
// DateScoreBoard.jsx
import React, { useState, useEffect } from "react";
import BoxScore from "./BoxScore";
import ConnectionIndicator from "./ConnectionIndicator";
import GameDetailsModal from "./GameDetailsModal";
import NBA from "../assets/nba_logos/NBA_logo.svg";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Container,
  Stack,
  Collapse,
  IconButton,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { KeyboardArrowDown, KeyboardArrowUp } from "@mui/icons-material";
import { DemoContainer } from "@mui/x-date-pickers/internals/demo";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";

// Import all logos
import ATL from "../assets/nba_logos/ATL.svg";
import BOS from "../assets/nba_logos/BOS.svg";
import BKN from "../assets/nba_logos/BKN.svg";
import CHA from "../assets/nba_logos/CHA.svg";
import CHI from "../assets/nba_logos/CHI.svg";
import CLE from "../assets/nba_logos/CLE.svg";
import DAL from "../assets/nba_logos/DAL.svg";
import DEN from "../assets/nba_logos/DEN.svg";
import DET from "../assets/nba_logos/DET.svg";
import GSW from "../assets/nba_logos/GSW.svg";
import HOU from "../assets/nba_logos/HOU.svg";
import IND from "../assets/nba_logos/IND.svg";
import LAC from "../assets/nba_logos/LAC.svg";
import LAL from "../assets/nba_logos/LAL.svg";
import MEM from "../assets/nba_logos/MEM.svg";
import MIA from "../assets/nba_logos/MIA.svg";
import MIL from "../assets/nba_logos/MIL.svg";
import MIN from "../assets/nba_logos/MIN.svg";
import NOP from "../assets/nba_logos/NOP.svg";
import NYK from "../assets/nba_logos/NYK.svg";
import OKC from "../assets/nba_logos/OKC.svg";
import ORL from "../assets/nba_logos/ORL.svg";
import PHI from "../assets/nba_logos/PHI.svg";
import PHX from "../assets/nba_logos/PHX.svg";
import POR from "../assets/nba_logos/POR.svg";
import SAC from "../assets/nba_logos/SAC.svg";
import SAS from "../assets/nba_logos/SAS.svg";
import TOR from "../assets/nba_logos/TOR.svg";
import UTA from "../assets/nba_logos/UTA.svg";
import WAS from "../assets/nba_logos/WAS.svg";

const teamLogos = {
  ATL,
  BOS,
  BKN,
  CHA,
  CHI,
  CLE,
  DAL,
  DEN,
  DET,
  GSW,
  HOU,
  IND,
  LAC,
  LAL,
  MEM,
  MIA,
  MIL,
  MIN,
  NOP,
  NYK,
  OKC,
  ORL,
  PHI,
  PHX,
  POR,
  SAC,
  SAS,
  TOR,
  UTA,
  WAS,
};

const Header = ({ lastUpdateTime, isMobile, selectedDate, onDateChange }) => (
  <Box
    sx={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      mb: isMobile ? 2 : 3,
      backgroundColor: "#101010",
      borderRadius: 2,
      padding: isMobile ? "12px 16px" : "16px 24px",
      boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
    }}
  >
    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
      <Box
        component="img"
        src={NBA}
        alt="NBA Logo"
        sx={{
          height: isMobile ? "24px" : "32px",
          width: "auto",
        }}
      />
      <Typography
        variant={isMobile ? "h6" : "h4"}
        sx={{
          fontSize: isMobile ? "1.5rem" : "2rem",
          fontWeight: 500,
          letterSpacing: "0.5px",
          color: "#ffffff",
        }}
      >
        Box Scores
      </Typography>
    </Box>
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DatePicker
        label="Select Date"
        value={selectedDate}
        onChange={onDateChange}
        sx={{
          "& .MuiOutlinedInput-root": {
            backgroundColor: "#262626",
            color: "white",
            "&:hover": {
              backgroundColor: "#2d2d2d",
            },
            "& fieldset": {
              borderColor: "rgba(255, 255, 255, 0.08)",
            },
            "&:hover fieldset": {
              borderColor: "rgba(255, 255, 255, 0.2)",
            },
            "&.Mui-focused fieldset": {
              borderColor: "#64b5f6",
            },
          },
          "& .MuiInputLabel-root": {
            color: "rgba(255, 255, 255, 0.7)",
            "&.Mui-focused": {
              color: "#64b5f6",
            },
          },
        }}
      />
    </LocalizationProvider>
  </Box>
);

/**
 * Converts Eastern Standard Time (EST) to local time
 * @param {string} timeStr - Time string in format "Start: HH:MM PM"
 * @returns {string} - Formatted time string in local timezone
 */
const convertToLocalTime = (timeStr) => {
  // If it's not a start time (e.g., "1Q 10:44" or "Final"), return as is
  if (!timeStr.startsWith("Start:")) {
    return timeStr;
  }

  // Extract the time part
  const [_, timeComponent] = timeStr.split("Start: ");
  const [time, period] = timeComponent.trim().split(" ");
  const [hours, minutes] = time.split(":").map((num) => parseInt(num));

  // Convert to 24-hour format
  let hour24 = hours;
  if (period === "PM" && hours !== 12) {
    hour24 += 12;
  } else if (period === "AM" && hours === 12) {
    hour24 = 0;
  }

  // Get today's date
  const today = new Date();

  // Create a date object with the game time in EST
  // Adding 5 hours to convert EST to UTC (EST is UTC-5)
  const etDate = new Date(
    Date.UTC(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
      hour24 + 5, // EST to UTC offset
      minutes
    )
  );

  // Convert to local time
  const localTime = new Date(etDate);

  // Format the time in local timezone
  const localTimeStr = localTime.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  return `Start: ${localTimeStr}`;
};

/**
 * Renders away/home team info (logo + name + optional score).
 */
const TeamInfo = ({ teamName, tricode, score, isWinner, isHomeTeam }) => {
  const isMobile = useMediaQuery("(max-width:600px)");
  const logoSrc = teamLogos[tricode];

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: isMobile ? 1.5 : 3,
        flexDirection: isHomeTeam ? "row-reverse" : "row",
        justifyContent: isHomeTeam ? "flex-start" : "flex-start",
        minWidth: isMobile ? "auto" : "300px",
        flex: isMobile ? 1 : "none",
        width: "100%",
        maxWidth: isHomeTeam ? "45%" : "45%",
      }}
    >
      <Box
        component="img"
        src={logoSrc}
        alt={`${teamName} logo`}
        sx={{
          width: isMobile ? 48 : 72,
          height: isMobile ? 48 : 72,
          objectFit: "contain",
        }}
      />
      <Box
        sx={{
          textAlign: isHomeTeam ? "right" : "left",
          overflow: "hidden",
        }}
      >
        <Typography
          variant="body1"
          fontWeight="600"
          sx={{
            fontSize: isMobile ? "1rem" : "1.5rem",
            whiteSpace: "nowrap",
            // Remove maxWidth and overflow handling since we're using conditional rendering
            color: "rgba(255, 255, 255, 0.95)",
          }}
        >
          {isMobile ? tricode : teamName}
        </Typography>
        {score !== "" && (
          <Typography
            variant={isMobile ? "h5" : "h4"}
            sx={{
              color: isWinner ? "#64b5f6" : "rgba(255, 255, 255, 0.95)",
              fontWeight: isWinner ? 600 : 500,
              fontSize: isMobile ? "1.5rem" : "2rem", // Increased from h5/h4 to specific sizes
              lineHeight: 1,
              marginTop: "4px",
            }}
          >
            {score}
          </Typography>
        )}
      </Box>
    </Box>
  );
};

/**
 * Single game card component.
 * - If a game has not started (time starts with "Start:" or "0Q"), do NOT call onBoxScoreClick.
 */
const GameCard = ({ game, onBoxScoreClick }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery("(max-width:600px)");
  const [awayScore, homeScore] = game.score
    .split(" - ")
    .map((score) => parseInt(score) || 0);

  // Convert the game time to local timezone
  const gameStatus = convertToLocalTime(game.time);

  // Check if game is not started yet:
  const isNotStarted =
    gameStatus.startsWith("Start:") || gameStatus.startsWith("0Q");

  // Hide the score for upcoming games (isNotStarted).
  const awayDisplayScore = isNotStarted ? "" : awayScore;
  const homeDisplayScore = isNotStarted ? "" : homeScore;

  // Format the game status display (handle "0Q 0:00" as pre-game, etc.)
  const displayStatus = gameStatus === "0Q 0:00" ? "Pre-Game" : gameStatus;

  return (
    <Card
      // Only call onBoxScoreClick if the game has started (i.e., isNotStarted === false). Prevents call for boxscore data if game has not started.
      onClick={() => {
        if (!isNotStarted) {
          onBoxScoreClick(game);
        }
      }}
      sx={{
        cursor: isNotStarted ? "default" : "pointer",
        mb: isMobile ? 1 : 3,
        backgroundColor: "#262626",
        boxShadow: "0 3px 12px rgba(0,0,0,0.3)",
        transition: "all 0.2s ease-in-out",
        "&:hover": {
          transform: isNotStarted ? "none" : "scale(1.01)",
          backgroundColor: "#2d2d2d",
        },
        height: isMobile ? "120px" : "150px",
        border: "1px solid rgba(255, 255, 255, 0.08)",
        borderRadius: "12px",
        width: "100%",
        maxWidth: "100%",
      }}
    >
      <CardContent
        sx={{
          position: "relative",
          p: isMobile ? "16px !important" : "24px !important", // Increased padding
          height: "100%",
          "&:last-child": {
            paddingBottom: isMobile ? "16px !important" : "24px !important",
          },
        }}
      >
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ height: "100%" }}
        >
          <TeamInfo
            teamName={game.away_team}
            tricode={game.away_tricode}
            score={awayDisplayScore}
            isWinner={!isNotStarted && awayScore > homeScore}
            isHomeTeam={false}
          />

          <Box
            sx={{
              position: "absolute",
              left: "50%",
              top: "50%",
              transform: "translate(-50%, -50%)",
              minWidth: isMobile ? "60px" : "100px",
              textAlign: "center",
            }}
          >
            {/* Game Start Time Display e.g. 7:30 PM */}
            <Typography
              variant="body2"
              sx={{
                color: "#ffffff",
                opacity: 0.5,
                letterSpacing: "0.5px",
                fontWeight: 400,
                fontSize: isMobile ? "0.75rem" : "0.875rem",
              }}
            >
              {isNotStarted ? gameStatus.replace("Start: ", "") : displayStatus}{" "}
            </Typography>
          </Box>

          <TeamInfo
            teamName={game.home_team}
            tricode={game.home_tricode}
            score={homeDisplayScore}
            isWinner={!isNotStarted && homeScore > awayScore}
            isHomeTeam={true}
          />
        </Stack>
      </CardContent>
    </Card>
  );
};

/**
 * Main DateScoreBoard component
 */
const DateScoreBoard = () => {
  const isMobile = useMediaQuery("(max-width:600px)");
  const [games, setGames] = useState([]);
  const [selectedGame, setSelectedGame] = useState(null);
  const [boxScoreOpen, setBoxScoreOpen] = useState(false);
  const [showAllGames, setShowAllGames] = useState(true);

  // Add state for selected date, default to yesterday
  const [selectedDate, setSelectedDate] = useState(dayjs().subtract(1, "day"));

  // Track the last time we received an update with new information (for display only)
  const [lastUpdateTime, setLastUpdateTime] = useState(null);

  // Connection Indicator
  const [isConnected, setIsConnected] = useState(false);

  /**
   * On mount, establish a WebSocket connection to get live updates.
   */
  useEffect(() => {
    let pollingInterval = null;
    const base_url =
      import.meta.env.VITE_SCORE_URL ||
      "http://192.168.1.71:8000/scoreboard/past";

    const fetchScoreData = async () => {
      try {
        // Format the date as YYYY-MM-DD for the API
        const formattedDate = selectedDate.format("YYYY-MM-DD");
        const api_url = `${base_url}${
          formattedDate !== dayjs().subtract(1, "day").format("YYYY-MM-DD")
            ? `?date=${formattedDate}`
            : ""
        }`;

        const response = await fetch(api_url);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const gamesData = await response.json();
        setGames(gamesData);
        setLastUpdateTime(new Date());
        setIsConnected(true);
      } catch (error) {
        console.error("Error fetching score data:", error);
        setIsConnected(false);
      }
    };

    fetchScoreData();

    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [selectedDate]); // Add selectedDate as a dependency

  // Date change handler
  const handleDateChange = (newDate) => {
    setSelectedDate(newDate);
  };

  /**
   * Helper function to parse period and time for sorting
   * so we can list in-progress games first, etc.
   */
  const parseGameTime = (time) => {
    // "Start: 7:30 PM"
    if (time.startsWith("Start:"))
      return { period: -1, minutes: 0, seconds: 0 };

    // "1Q 10:44", "OT 5:00", "Final", etc.
    const periodMatch = time.match(/(\d+)Q/) || time.match(/(\d+)OT/);
    const timeMatch = time.match(/(\d+):(\d+)/);

    const period = periodMatch ? parseInt(periodMatch[1]) : 0;
    const minutes = timeMatch ? parseInt(timeMatch[1]) : 0;
    const seconds = timeMatch ? parseInt(timeMatch[2]) : 0;

    return { period, minutes, seconds };
  };

  /**
   * Sort function for games:
   * - In-progress (higher period first),
   * - then scheduled,
   * - then final, etc.
   */
  const sortGames = (a, b) => {
    const timeA = parseGameTime(a.time);
    const timeB = parseGameTime(b.time);

    // First sort by period (descending)
    if (timeB.period !== timeA.period) return timeB.period - timeA.period;

    // Then sort by time (ascending)
    const totalSecondsA = timeA.minutes * 60 + timeA.seconds;
    const totalSecondsB = timeB.minutes * 60 + timeB.seconds;
    return totalSecondsA - totalSecondsB;
  };

  /**
   * Separate games into live, upcoming, and completed categories.
   */
  const liveGames = games
    .filter(
      (game) =>
        !game.time.startsWith("Start:") &&
        game.time !== "Final" &&
        !game.time.startsWith("0Q")
    )
    .sort(sortGames);

  const scheduledGames = games.filter(
    (game) => game.time.startsWith("Start:") || game.time.startsWith("0Q")
  );

  const completedGames = games.filter((game) => game.time === "Final");

  /**
   * Click handler to show the BoxScore for a selected game.
   * (This is only called if the game has started, because
   *  we prevent the click in <GameCard> for not-started games.)
   */
  const handleBoxScoreClick = (game) => {
    console.log("selected game: ", game);
    setSelectedGame(game);
    setBoxScoreOpen(true);
  };

  return (
    <Container
      maxWidth="xl"
      sx={{
        py: isMobile ? 2 : 4,
        px: isMobile ? 1 : 2,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        maxWidth: "1200px !important",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 2,
          mb: isMobile ? 2 : 3,
        }}
      >
        {/* Title and Connection Status */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            backgroundColor: "rgba(0, 0, 0, 0.2)",
            borderRadius: 1,
            padding: isMobile ? "6px 12px" : "8px 16px",
          }}
        >
          <Typography
            variant={isMobile ? "subtitle1" : "h6"}
            sx={{ fontSize: isMobile ? "1rem" : "1.25rem" }}
          >
            NBA Box Scores
          </Typography>
          {/* <Box sx={{ display: "flex", alignItems: "center" }}>
            <ConnectionIndicator connected={isConnected} />
            {lastUpdateTime && (
              <Typography
                variant="caption"
                sx={{
                  opacity: 0.7,
                  fontSize: isMobile ? "0.7rem" : "0.75rem",
                }}
              >
                Last update:{" "}
                {lastUpdateTime.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                })}
              </Typography>
            )}
          </Box> */}
        </Box>

        {/* DatePicker */}
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            label="Select Date"
            value={selectedDate}
            onChange={handleDateChange}
            sx={{
              bgcolor: "background.paper",
              borderRadius: 1,
              "& .MuiOutlinedInput-root": {
                "& fieldset": {
                  borderColor: "rgba(255, 255, 255, 0.23)",
                },
                "&:hover fieldset": {
                  borderColor: "rgba(255, 255, 255, 0.4)",
                },
              },
            }}
          />
        </LocalizationProvider>
      </Box>

      {/* Live Games Section */}
      {liveGames.length > 0 && (
        <Box mb={isMobile ? 2 : 4}>
          <Typography
            variant={isMobile ? "subtitle1" : "h6"}
            gutterBottom
            sx={{
              display: "flex",
              alignItems: "center",
              fontSize: isMobile ? "1rem" : "1.25rem",
            }}
          >
            {/* Little red dot to indicate live */}
            <Box
              component="span"
              sx={{
                width: isMobile ? 6 : 8,
                height: isMobile ? 6 : 8,
                borderRadius: "50%",
                backgroundColor: "error.main",
                display: "inline-block",
                mr: 1,
                animation: "pulse 2s infinite",
              }}
            />
            Live Games
          </Typography>
          {liveGames.map((game, index) => (
            <GameCard
              key={index}
              game={game}
              onBoxScoreClick={handleBoxScoreClick}
            />
          ))}
        </Box>
      )}

      {/* Scheduled Games Section */}
      {scheduledGames.length > 0 && (
        <Box mb={isMobile ? 2 : 4}>
          <Typography
            variant={isMobile ? "subtitle1" : "h6"}
            gutterBottom
            sx={{
              fontSize: isMobile ? "1rem" : "1.25rem",
            }}
          >
            Upcoming Games
          </Typography>
          {scheduledGames.map((game, index) => (
            <GameCard
              key={index}
              game={game}
              onBoxScoreClick={handleBoxScoreClick}
            />
          ))}
        </Box>
      )}

      {/* Completed Games Section */}
      {completedGames.length > 0 && (
        <Box>
          <Typography
            variant={isMobile ? "subtitle1" : "h6"}
            gutterBottom
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: isMobile ? "1rem" : "1.25rem",
            }}
          >
            Completed Games
            <IconButton
              size={isMobile ? "small" : "medium"}
              onClick={() => setShowAllGames(!showAllGames)}
              sx={{
                ml: 1,
                padding: isMobile ? "4px" : "8px",
              }}
            >
              {showAllGames ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
            </IconButton>
          </Typography>

          <Collapse in={showAllGames}>
            {completedGames.map((game, index) => (
              <GameCard
                key={index}
                game={game}
                onBoxScoreClick={handleBoxScoreClick}
              />
            ))}
          </Collapse>
        </Box>
      )}

      {/** GameDetails Modal
       * BoxScore component still uses the REST endpoint `GET /boxscore/{game_id}`
       * We won't call it for games that have not started, because <GameCard>
       * prevents the click if `game.time` starts with "Start:" or "0Q".
       */}
      <GameDetailsModal
        gameId={selectedGame}
        open={boxScoreOpen}
        onClose={() => {
          setBoxScoreOpen(false);
          setSelectedGame(null);
        }}
      />

      {/* Add responsive styling for potential empty state */}
      {games.length === 0 && (
        <Box
          sx={{
            textAlign: "center",
            py: isMobile ? 4 : 6,
            opacity: 0.7,
          }}
        >
          <Typography
            variant={isMobile ? "body1" : "h6"}
            sx={{
              fontSize: isMobile ? "0.875rem" : "1rem",
            }}
          >
            No games scheduled
          </Typography>
        </Box>
      )}
    </Container>
  );
};

export default DateScoreBoard;


================================================
File: features/playerStats/index.jsx
================================================
import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Autocomplete,
  Typography,
  Box,
  useMediaQuery,
  Avatar,
  Button,
} from "@mui/material";

const NBAPlayerStats = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [playerStats, setPlayerStats] = useState(null);
  const [showMore, setShowMore] = useState(false);
  const isMobile = useMediaQuery("(max-width:600px)");

  const getPlayerImagePath = (playerId) => {
    if (!playerId) return null;
    return `https://cdn.nba.com/headshots/nba/latest/1040x760/${playerId}.png`;
  };

  const searchPlayers = async (query) => {
    if (query.length >= 2) {
      try {
        const response = await fetch(
          `http://localhost:8000/players/search/?query=${query}`
        );
        const data = await response.json();
        setSearchResults(data);
      } catch (error) {
        console.error("Error searching players:", error);
      }
    } else {
      setSearchResults([]);
    }
  };

  const fetchPlayerStats = async (playerId) => {
    try {
      // When fetching initial player stats, always get 10 games
      const response = await fetch(
        `http://localhost:8000/players/${playerId}/games?last_n_games=10`
      );
      const data = await response.json();
      setPlayerStats(data);
    } catch (error) {
      console.error("Error fetching player stats:", error);
    }
  };

  const handleShowMore = () => {
    setShowMore(true);
    if (selectedPlayer) {
      // Create new fetch URL with 25 games explicitly
      fetch(
        `http://localhost:8000/players/${selectedPlayer.person_id}/games?last_n_games=25`
      )
        .then((response) => response.json())
        .then((data) => {
          setPlayerStats(data);
        })
        .catch((error) => {
          console.error("Error fetching extended stats:", error);
        });
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <Box
      sx={{
        width: "100%",
        py: 2,
        px: isMobile ? 1 : 3,
        backgroundColor: "#101010",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* Search Box */}
      <Box
        sx={{
          mb: 4,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 2,
        }}
      >
        <Autocomplete
          options={searchResults}
          getOptionLabel={(option) =>
            `${option.display_name} - ${option.team_abbreviation}`
          }
          onInputChange={(event, newInputValue) => {
            setSearchQuery(newInputValue);
            searchPlayers(newInputValue);
          }}
          onChange={(event, newValue) => {
            setSelectedPlayer(newValue);
            setShowMore(false); // Reset show more state when selecting new player
            if (newValue) {
              fetchPlayerStats(newValue.person_id);
            }
          }}
          sx={{
            width: "100%",
            maxWidth: 800,
            "& .MuiOutlinedInput-root": {
              backgroundColor: "#262626",
              "&:hover": {
                backgroundColor: "#2d2d2d",
              },
              "& fieldset": {
                borderColor: "rgba(255, 255, 255, 0.08)",
              },
              "&:hover fieldset": {
                borderColor: "rgba(255, 255, 255, 0.2)",
              },
              "&.Mui-focused fieldset": {
                borderColor: "#64b5f6",
              },
            },
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Search for a player"
              variant="outlined"
              sx={{
                "& .MuiInputLabel-root": {
                  color: "rgba(255, 255, 255, 0.7)",
                  "&.Mui-focused": {
                    color: "#64b5f6",
                  },
                },
                "& .MuiInputBase-input": {
                  color: "white",
                },
              }}
            />
          )}
        />
      </Box>

      {playerStats && (
        <Box
          sx={{
            overflow: "auto",
            flex: 1,
            maxWidth: "1400px",
            margin: "0 auto",
          }}
        >
          {/* Player Info Header */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              mb: 3,
              gap: 2,
            }}
          >
            <Avatar
              src={getPlayerImagePath(playerStats?.player_info?.person_id)}
              alt={playerStats?.player_info?.display_name}
              sx={{
                width: isMobile ? 60 : 80,
                height: isMobile ? 60 : 80,
                border: "2px solid rgba(255, 255, 255, 0.08)",
                backgroundColor: "#262626",
              }}
            />
            <Box>
              <Typography
                variant="h6"
                sx={{
                  color: "white",
                  fontWeight: 600,
                  fontSize: isMobile ? "1.1rem" : "1.25rem",
                }}
              >
                {playerStats.player_info.display_name}
              </Typography>
              <Typography
                sx={{
                  color: "#64b5f6",
                  fontSize: isMobile ? "1rem" : "1.1rem",
                  fontWeight: 500,
                }}
              >
                {playerStats.player_info.team_abbreviation}
              </Typography>
            </Box>
          </Box>

          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Typography
              variant="h6"
              sx={{
                color: "white",
                fontWeight: 600,
                fontSize: isMobile ? "1rem" : "1.1rem",
              }}
            >
              Last {showMore ? 25 : 10} Games
            </Typography>
            {!showMore && (
              <Button
                onClick={handleShowMore}
                variant="outlined"
                sx={{
                  color: "#64b5f6",
                  borderColor: "#64b5f6",
                  "&:hover": {
                    borderColor: "#90caf9",
                    backgroundColor: "rgba(100, 181, 246, 0.08)",
                  },
                }}
              >
                Show More
              </Button>
            )}
          </Box>

          {/* Stats Table */}
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
                {[
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
                ].map((col, index) => (
                  <col key={index} style={{ width: col.width }} />
                ))}
              </colgroup>
              <TableHead>
                <TableRow>
                  {[
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
                  ].map((header) => (
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
                {playerStats?.games?.map((game, index) => (
                  <TableRow
                    key={index}
                    sx={{
                      backgroundColor:
                        index % 2 === 0
                          ? "rgba(255, 255, 255, 0.01)"
                          : "transparent",
                      "&:hover": {
                        backgroundColor: "rgba(255, 255, 255, 0.03)",
                      },
                    }}
                  >
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
                    <TableCell
                      sx={{
                        color:
                          game.pts >= 20
                            ? "#64b5f6"
                            : "rgba(255, 255, 255, 0.87)",
                        padding: isMobile ? "8px 4px" : "12px 16px",
                        fontSize: isMobile ? "0.75rem" : "0.875rem",
                        borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
                        fontWeight: game.pts >= 20 ? 600 : 400,
                      }}
                    >
                      {game.pts}
                    </TableCell>
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
                    <TableCell
                      sx={{
                        color:
                          game.reb >= 10
                            ? "#64b5f6"
                            : "rgba(255, 255, 255, 0.87)",
                        padding: isMobile ? "8px 4px" : "12px 16px",
                        fontSize: isMobile ? "0.75rem" : "0.875rem",
                        borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
                        fontWeight: game.reb >= 10 ? 600 : 400,
                      }}
                    >
                      {game.reb}
                    </TableCell>
                    <TableCell
                      sx={{
                        color:
                          game.ast >= 10
                            ? "#64b5f6"
                            : "rgba(255, 255, 255, 0.87)",
                        padding: isMobile ? "8px 4px" : "12px 16px",
                        fontSize: isMobile ? "0.75rem" : "0.875rem",
                        borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
                        fontWeight: game.ast >= 10 ? 600 : 400,
                      }}
                    >
                      {game.ast}
                    </TableCell>
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
                    <TableCell
                      sx={{
                        color: game.plus_minus > 0 ? "#4caf50" : "#f44336",
                        padding: isMobile ? "8px 4px" : "12px 16px",
                        fontSize: isMobile ? "0.75rem" : "0.875rem",
                        borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
                        fontWeight: Math.abs(game.plus_minus) >= 15 ? 600 : 400,
                      }}
                    >
                      {game.plus_minus > 0
                        ? `+${game.plus_minus}`
                        : game.plus_minus}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}
    </Box>
  );
};

export default NBAPlayerStats;


================================================
File: features/scoreboard/index.jsx
================================================
// src/features/scoreboard/index.jsx
import React, { useState } from "react";
import { useGameData } from "../../hooks/useGameData";
import {
  Box,
  Container,
  Typography,
  Collapse,
  IconButton,
  useMediaQuery,
} from "@mui/material";
import { KeyboardArrowDown, KeyboardArrowUp } from "@mui/icons-material";
import GameCard from "../../components/game/GameCard";
import GameDetailsModal from "../../components/layout/GameDetailsModal";
import Header from "../../components/layout/Header";

const Scoreboard = () => {
  const { 
    liveGames, 
    scheduledGames, 
    completedGames, 
    isConnected, 
    lastUpdateTime 
  } = useGameData();

  const isMobile = useMediaQuery("(max-width:600px)");
  const [selectedGame, setSelectedGame] = useState(null);
  const [boxScoreOpen, setBoxScoreOpen] = useState(false);
  const [showAllGames, setShowAllGames] = useState(true);

  const handleBoxScoreClick = (game) => {
    setSelectedGame(game);
    setBoxScoreOpen(true);
  };

  return (
    <Container
      maxWidth="xl"
      sx={{
        py: isMobile ? 2 : 4,
        px: isMobile ? 1 : 2,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        maxWidth: "1400px !important",
      }}
    >
      <Header
        isConnected={isConnected}
        lastUpdateTime={lastUpdateTime}
        isMobile={isMobile}
      />

      {/* Live Games Section */}
      {liveGames.length > 0 && (
        <Box mb={isMobile ? 2 : 4}>
          <Typography
            variant={isMobile ? "subtitle1" : "h6"}
            gutterBottom
            sx={{
              display: "flex",
              alignItems: "center",
              fontSize: isMobile ? "1rem" : "1.25rem",
            }}
          >
            <Box
              component="span"
              sx={{
                width: isMobile ? 6 : 8,
                height: isMobile ? 6 : 8,
                borderRadius: "50%",
                backgroundColor: "error.main",
                display: "inline-block",
                mr: 1,
                animation: "pulse 2s infinite",
              }}
            />
            Live Games
          </Typography>
          {liveGames.map((game, index) => (
            <GameCard
              key={index}
              game={game}
              onBoxScoreClick={handleBoxScoreClick}
            />
          ))}
        </Box>
      )}

      {/* Scheduled Games Section */}
      {scheduledGames.length > 0 && (
        <Box mb={isMobile ? 2 : 4}>
          <Typography
            variant={isMobile ? "subtitle1" : "h6"}
            gutterBottom
            sx={{ fontSize: isMobile ? "1rem" : "1.25rem" }}
          >
            Upcoming Games
          </Typography>
          {scheduledGames.map((game, index) => (
            <GameCard
              key={index}
              game={game}
              onBoxScoreClick={handleBoxScoreClick}
            />
          ))}
        </Box>
      )}

      {/* Completed Games Section */}
      {completedGames.length > 0 && (
        <Box>
          <Typography
            variant={isMobile ? "subtitle1" : "h6"}
            gutterBottom
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: isMobile ? "1rem" : "1.25rem",
            }}
          >
            Completed Games
            <IconButton
              size={isMobile ? "small" : "medium"}
              onClick={() => setShowAllGames(!showAllGames)}
              sx={{
                ml: 1,
                padding: isMobile ? "4px" : "8px",
              }}
            >
              {showAllGames ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
            </IconButton>
          </Typography>

          <Collapse in={showAllGames}>
            {completedGames.map((game, index) => (
              <GameCard
                key={index}
                game={game}
                onBoxScoreClick={handleBoxScoreClick}
              />
          ))}
          </Collapse>
        </Box>
      )}

      <GameDetailsModal
        gameId={selectedGame}
        open={boxScoreOpen}
        onClose={() => {
          setBoxScoreOpen(false);
          setSelectedGame(null);
        }}
      />

      {/* Empty State */}
      {!liveGames.length && !scheduledGames.length && !completedGames.length && (
        <Box
          sx={{
            textAlign: "center",
            py: isMobile ? 4 : 6,
            opacity: 0.7,
          }}
        >
          <Typography
            variant={isMobile ? "body1" : "h6"}
            sx={{
              fontSize: isMobile ? "0.875rem" : "1rem",
            }}
          >
            No games scheduled
          </Typography>
        </Box>
      )}
    </Container>
  );
};

export default Scoreboard;

================================================
File: hooks/useGameData.js
================================================
// src/hooks/useGameData.js
import { useState, useEffect, useCallback } from 'react';
import { useGameContext } from '../contexts/GameContext';
import apiService from '../services/api';
import wsService from '../services/websocket';

export const useGameData = (date = null) => {
  const { 
    games,
    updateGames,
    setLoading,
    setError,
    setConnectionStatus 
  } = useGameContext();

  const [lastUpdateTime, setLastUpdateTime] = useState(null);

  const handleWebSocketMessage = useCallback((data) => {
    updateGames(data);
    setLastUpdateTime(new Date());
  }, [updateGames]);

  const handleConnectionChange = useCallback((isConnected) => {
    setConnectionStatus(isConnected);
  }, [setConnectionStatus]);

  // Initial data fetch and WebSocket setup
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        const gamesData = await apiService.fetchPastGames(date);
        updateGames(gamesData);
        setLastUpdateTime(new Date());
      } catch (error) {
        setError('Failed to fetch games data');
        console.error('Error fetching games:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();

    // Setup WebSocket listeners
    wsService.addEventListener('message', handleWebSocketMessage);
    wsService.addEventListener('connectionChange', handleConnectionChange);

    // Connect to WebSocket if not already connected
    if (!wsService.isConnected) {
      wsService.connect();
    }

    // Cleanup
    return () => {
      wsService.removeEventListener('message', handleWebSocketMessage);
      wsService.removeEventListener('connectionChange', handleConnectionChange);
    };
  }, [date, handleWebSocketMessage, handleConnectionChange, setError, setLoading, updateGames]);

  // Helper functions to sort and filter games
  const getLiveGames = useCallback(() => {
    return games.filter(game => 
      !game.time.startsWith('Start:') && 
      game.time !== 'Final' && 
      !game.time.startsWith('0Q')
    );
  }, [games]);

  const getScheduledGames = useCallback(() => {
    return games.filter(game => 
      game.time.startsWith('Start:') || 
      game.time.startsWith('0Q')
    );
  }, [games]);

  const getCompletedGames = useCallback(() => {
    return games.filter(game => game.time === 'Final');
  }, [games]);

  return {
    games,
    liveGames: getLiveGames(),
    scheduledGames: getScheduledGames(),
    completedGames: getCompletedGames(),
    lastUpdateTime,
    isConnected: wsService.isConnected,
  };
};



================================================
File: hooks/usePlayByPlay.js
================================================
// src/hooks/usePlayByPlay.js
export const usePlayByPlay = (gameId) => {
    const [actions, setActions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const wsRef = useRef(null);
  
    useEffect(() => {
      if (!gameId) {
        setError('Missing game ID');
        setLoading(false);
        return;
      }
  
      const ws = wsService.connectPlayByPlay(gameId);
      wsRef.current = ws;
  
      ws.onopen = () => {
        console.log('PlayByPlay WebSocket connected');
        setError(null);
      };
  
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.game?.actions) {
            const sorted = [...data.game.actions].sort((a, b) => 
              b.actionNumber - a.actionNumber
            );
            setActions(sorted);
          }
          setLoading(false);
        } catch (err) {
          setError('Error processing game data');
          setLoading(false);
        }
      };
  
      ws.onerror = () => {
        setError('Connection error occurred');
        setLoading(false);
      };
  
      return () => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
          wsRef.current.close();
        }
      };
    }, [gameId]);
  
    return { actions, loading, error };
  };

================================================
File: hooks/useWebSocket.js
================================================
import { useState, useEffect } from 'react';

const useWebSocket = () => {
  const [games, setGames] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdateTime, setLastUpdateTime] = useState(null);

  useEffect(() => {
    let ws = null;
    let reconnectTimeout = null;
    let reconnectAttempts = 0;
    const ws_url = import.meta.env.VITE_WS_URL || "ws://localhost:8000/ws";

    console.log(ws_url)

    const connectWebSocket = () => {
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }

      try {
        ws = new WebSocket(ws_url);

        ws.onopen = () => {
          console.log("Connected to NBA Stats WebSocket");
          setIsConnected(true);
          reconnectAttempts = 0;
        };

        ws.onmessage = (event) => {
          try {
            const gamesData = JSON.parse(event.data);
            setGames(gamesData);
            setLastUpdateTime(new Date());
          } catch (error) {
            console.error("Error parsing WebSocket message:", error);
          }
        };

        ws.onerror = (error) => {
          console.log(
            `WebSocket error (attempt ${reconnectAttempts + 1}):`,
            error
          );
          setIsConnected(false);
        };

        ws.onclose = (event) => {
          console.log(
            `WebSocket closed (attempt ${reconnectAttempts + 1}):`,
            event.code,
            event.reason
          );
          setIsConnected(false);

          reconnectAttempts++;

          const backoffTime = Math.min(
            1000 * Math.pow(2, reconnectAttempts),
            10000
          );
          console.log(`Reconnecting in ${backoffTime}ms...`);

          reconnectTimeout = setTimeout(() => {
            console.log("Attempting to reconnect...");
            connectWebSocket();
          }, backoffTime);
        };
      } catch (error) {
        console.error("Error creating WebSocket:", error);
        reconnectTimeout = setTimeout(connectWebSocket, 5000);
      }
    };

    reconnectTimeout = setTimeout(() => {
      console.log("Making initial connection attempt...");
      connectWebSocket();
    }, 5);

    return () => {
      if (ws) {
        ws.close();
      }
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }
    };
  }, []);

  return {
    games,
    isConnected,
    lastUpdateTime
  };
};

export default useWebSocket;

================================================
File: services/api.js
================================================
// src/services/api.js
import { API_ENDPOINTS } from '../utils/constants';

class ApiService {
  constructor() {
    this.baseUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';
  }

  async fetchWithError(endpoint, options = {}) {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API Error: ${endpoint}`, error);
      throw error;
    }
  }

  // Box Score related endpoints
  async fetchBoxScore(gameId) {
    return this.fetchWithError(API_ENDPOINTS.BOXSCORE(gameId));
  }

  async fetchHistoricalBoxScore(gameId, date) {
    return this.fetchWithError(`${API_ENDPOINTS.BOXSCORE(gameId)}?date=${date}`);
  }

  // Player related endpoints
  async searchPlayers(query) {
    if (query.length < 2) return [];
    return this.fetchWithError(API_ENDPOINTS.PLAYER_SEARCH(query));
  }

  async fetchPlayerStats(playerId, lastNGames = 10) {
    return this.fetchWithError(
      `${API_ENDPOINTS.PLAYER_STATS(playerId)}?last_n_games=${lastNGames}`
    );
  }

  async fetchPlayerProfile(playerId) {
    return this.fetchWithError(`/api/v1/players/${playerId}/profile`);
  }

  // Games related endpoints
  async fetchPastGames(date) {
    return this.fetchWithError(
      `/scoreboard/past${date ? `?date=${date}` : ''}`
    );
  }

  async fetchScheduledGames(date) {
    return this.fetchWithError(
      `/scoreboard/upcoming${date ? `?date=${date}` : ''}`
    );
  }

  // Error handling helper
  handleError(error, fallback = []) {
    console.error('API Error:', error);
    // You could also implement error reporting here
    return fallback;
  }
}

// Create a singleton instance
const apiService = new ApiService();
export default apiService;

================================================
File: services/websocket.js
================================================
// src/services/websocket.js
import { WS_ENDPOINTS } from '../utils/constants';

class WebSocketService {
  constructor() {
    this.ws = null;
    this.reconnectAttempts = 0;
    this.reconnectTimeout = null;
    this.listeners = new Map();
    this.isConnected = false;
  }

  connect(url = import.meta.env.VITE_WS_URL || "ws://localhost:8000/ws") {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }

    try {
      this.ws = new WebSocket(url);

      this.ws.onopen = () => {
        console.log("WebSocket connected");
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.notifyListeners('connectionChange', true);
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.notifyListeners('message', data);
        } catch (error) {
          console.error("Error parsing WebSocket message:", error);
        }
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.isConnected = false;
        this.notifyListeners('connectionChange', false);
      };

      this.ws.onclose = () => {
        console.log("WebSocket closed");
        this.isConnected = false;
        this.notifyListeners('connectionChange', false);
        this.scheduleReconnect();
      };

    } catch (error) {
      console.error("Error creating WebSocket:", error);
      this.scheduleReconnect();
    }
  }

  connectPlayByPlay(gameId) {
    const url = `${import.meta.env.VITE_WS_URL || "ws://localhost:8000"}${WS_ENDPOINTS.PLAYBYPLAY(gameId)}`;
    return new WebSocket(url);
  }

  addEventListener(type, callback) {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }
    this.listeners.get(type).add(callback);
  }

  removeEventListener(type, callback) {
    if (this.listeners.has(type)) {
      this.listeners.get(type).delete(callback);
    }
  }

  notifyListeners(type, data) {
    if (this.listeners.has(type)) {
      this.listeners.get(type).forEach(callback => callback(data));
    }
  }

  scheduleReconnect() {
    this.reconnectAttempts++;
    const backoffTime = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 10000);
    
    this.reconnectTimeout = setTimeout(() => {
      console.log(`Attempting to reconnect (attempt ${this.reconnectAttempts})...`);
      this.connect();
    }, backoffTime);
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
    }
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }
    this.listeners.clear();
  }
}

// Create a singleton instance
const wsService = new WebSocketService();
export default wsService;

================================================
File: styles/global.css
================================================
@import 'ag-grid-community/styles/ag-grid.css';
/* @import 'ag-grid-community/styles/ag-theme-alpine-dark.css'; */

================================================
File: styles/tailwind.css
================================================
/* src/tailwind.css */
@import "tailwindcss";


================================================
File: utils/boxScoreUtils.js
================================================
// src/utils/boxScoreUtils.js
export const formatPlayerName = (fullName, isMobile) => {
    if (!isMobile) return fullName;
    const nameParts = fullName.split(" ");
    if (nameParts.length < 2) return fullName;
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(" ");
    return `${firstName[0]}. ${lastName}`;
  };
  
  export const descendingComparator = (a, b, orderBy) => {
    if (orderBy === "fieldGoals") {
      const aMade = a.statistics.fieldGoalsMade ?? 0;
      const bMade = b.statistics.fieldGoalsMade ?? 0;
      if (bMade !== aMade) return bMade - aMade;
      return (
        (b.statistics.fieldGoalsAttempted ?? 0) -
        (a.statistics.fieldGoalsAttempted ?? 0)
      );
    }
    if (orderBy === "threePointers") {
      const aMade = a.statistics.threePointersMade ?? 0;
      const bMade = b.statistics.threePointersMade ?? 0;
      if (bMade !== aMade) return bMade - aMade;
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
  
    const aValue = orderBy === "name" ? a[orderBy] : a.statistics[orderBy] ?? 0;
    const bValue = orderBy === "name" ? b[orderBy] : b.statistics[orderBy] ?? 0;
  
    if (bValue < aValue) return -1;
    if (bValue > aValue) return 1;
    return 0;
  };
  
  export const getComparator = (order, orderBy) => {
    return order === "desc"
      ? (a, b) => descendingComparator(a, b, orderBy)
      : (a, b) => -descendingComparator(a, b, orderBy);
  };

================================================
File: utils/constants.js
================================================
// src/utils/constants.js
export const API_ENDPOINTS = {
    BOXSCORE: (gameId) => `/boxscore/${gameId}`,
    PLAYER_STATS: (playerId) => `/api/v1/players/${playerId}/games`,
    PLAYER_SEARCH: (query) => `/api/v1/players/search/?query=${query}`,
  };
  
  export const WS_ENDPOINTS = {
    SCOREBOARD: '/ws',
    PLAYBYPLAY: (gameId) => `/api/v1/scoreboard/ws/playbyplay/${gameId}`,
  };

================================================
File: utils/dateUtils.js
================================================
// src/utils/dateUtils.js
import dayjs from 'dayjs';

export const formatDate = (date) => {
  return dayjs(date).format('YYYY-MM-DD');
};

export const isToday = (date) => {
  return dayjs(date).isSame(dayjs(), 'day');
};

export const isYesterday = (date) => {
  return dayjs(date).isSame(dayjs().subtract(1, 'day'), 'day');
};

export const addDays = (date, days) => {
  return dayjs(date).add(days, 'day');
};

export const subtractDays = (date, days) => {
  return dayjs(date).subtract(days, 'day');
};

================================================
File: utils/formatters.js
================================================
  // src/utils/formatters.js
  export const formatMinutes = (minutes) => {
    if (!minutes || minutes === "PT00M00.00S") return "0:00";
    const match = minutes.match(/PT(\d+)M(\d+\.\d+)S/);
    if (!match) return minutes;
    return `${match[1]}:${Math.floor(parseFloat(match[2])).toString().padStart(2, "0")}`;
  };
  
  export const formatLocalTime = (timeStr) => {
    if (!timeStr.startsWith("Start:")) return timeStr;
    
    const [_, timeComponent] = timeStr.split("Start: ");
    const [time, period] = timeComponent.trim().split(" ");
    const [hours, minutes] = time.split(":").map(num => parseInt(num));
    
    let hour24 = hours;
    if (period === "PM" && hours !== 12) hour24 += 12;
    else if (period === "AM" && hours === 12) hour24 = 0;
    
    const today = new Date();
    const etDate = new Date(
      Date.UTC(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
        hour24 + 5,
        minutes
      )
    );
    
    const localTime = new Date(etDate);
    return localTime.toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

================================================
File: utils/teamUtils.js
================================================
// src/utils/teamUtils.js
export const getTeamAbbreviation = (teamCity, teamName) => {
    const teamAbbreviations = {
      "Atlanta": "ATL",
      "Boston": "BOS",
      "Brooklyn": "BKN",
      "Charlotte": "CHA",
      "Chicago": "CHI",
      "Cleveland": "CLE",
      "Dallas": "DAL",
      "Denver": "DEN",
      "Detroit": "DET",
      "Golden State": "GSW",
      "Houston": "HOU",
      "Indiana": "IND",
      "LA": "LAC",
      "Los Angeles": "LAL",
      "Memphis": "MEM",
      "Miami": "MIA",
      "Milwaukee": "MIL",
      "Minnesota": "MIN",
      "New Orleans": "NOP",
      "New York": "NYK",
      "Oklahoma City": "OKC",
      "Orlando": "ORL",
      "Philadelphia": "PHI",
      "Phoenix": "PHX",
      "Portland": "POR",
      "Sacramento": "SAC",
      "San Antonio": "SAS",
      "Toronto": "TOR",
      "Utah": "UTA",
      "Washington": "WAS",
    };
    return teamAbbreviations[teamCity] || "";
  };

