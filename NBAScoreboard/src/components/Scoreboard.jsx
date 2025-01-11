import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Container,
  Stack,
  Collapse,
  CircularProgress,
  useTheme,
  IconButton
} from '@mui/material';
import { KeyboardArrowDown, KeyboardArrowUp } from '@mui/icons-material';

// Import all logos
import ATL from '../assets/nba_logos/ATL.svg';
import BOS from '../assets/nba_logos/BOS.svg';
import BKN from '../assets/nba_logos/BKN.svg';
import CHA from '../assets/nba_logos/CHA.svg';
import CHI from '../assets/nba_logos/CHI.svg';
import CLE from '../assets/nba_logos/CLE.svg';
import DAL from '../assets/nba_logos/DAL.svg';
import DEN from '../assets/nba_logos/DEN.svg';
import DET from '../assets/nba_logos/DET.svg';
import GSW from '../assets/nba_logos/GSW.svg';
import HOU from '../assets/nba_logos/HOU.svg';
import IND from '../assets/nba_logos/IND.svg';
import LAC from '../assets/nba_logos/LAC.svg';
import LAL from '../assets/nba_logos/LAL.svg';
import MEM from '../assets/nba_logos/MEM.svg';
import MIA from '../assets/nba_logos/MIA.svg';
import MIL from '../assets/nba_logos/MIL.svg';
import MIN from '../assets/nba_logos/MIN.svg';
import NOP from '../assets/nba_logos/NOP.svg';
import NYK from '../assets/nba_logos/NYK.svg';
import OKC from '../assets/nba_logos/OKC.svg';
import ORL from '../assets/nba_logos/ORL.svg';
import PHI from '../assets/nba_logos/PHI.svg';
import PHX from '../assets/nba_logos/PHX.svg';
import POR from '../assets/nba_logos/POR.svg';
import SAC from '../assets/nba_logos/SAC.svg';
import SAS from '../assets/nba_logos/SAS.svg';
import TOR from '../assets/nba_logos/TOR.svg';
import UTA from '../assets/nba_logos/UTA.svg';
import WAS from '../assets/nba_logos/WAS.svg';

// Logo mapping object
const teamLogos = {
  ATL, BOS, BKN, CHA, CHI, CLE, DAL, DEN, DET, GSW,
  HOU, IND, LAC, LAL, MEM, MIA, MIL, MIN, NOP, NYK,
  OKC, ORL, PHI, PHX, POR, SAC, SAS, TOR, UTA, WAS
};

// Team abbreviation mapping
const teamAbbreviations = {
  'Atlanta Hawks': 'ATL',
  'Boston Celtics': 'BOS',
  'Brooklyn Nets': 'BKN',
  'Charlotte Hornets': 'CHA',
  'Chicago Bulls': 'CHI',
  'Cleveland Cavaliers': 'CLE',
  'Dallas Mavericks': 'DAL',
  'Denver Nuggets': 'DEN',
  'Detroit Pistons': 'DET',
  'Golden State Warriors': 'GSW',
  'Houston Rockets': 'HOU',
  'Indiana Pacers': 'IND',
  'Los Angeles Clippers': 'LAC',
  'Los Angeles Lakers': 'LAL',
  'Memphis Grizzlies': 'MEM',
  'Miami Heat': 'MIA',
  'Milwaukee Bucks': 'MIL',
  'Minnesota Timberwolves': 'MIN',
  'New Orleans Pelicans': 'NOP',
  'New York Knicks': 'NYK',
  'Oklahoma City Thunder': 'OKC',
  'Orlando Magic': 'ORL',
  'Philadelphia 76ers': 'PHI',
  'Phoenix Suns': 'PHX',
  'Portland Trail Blazers': 'POR',
  'Sacramento Kings': 'SAC',
  'San Antonio Spurs': 'SAS',
  'Toronto Raptors': 'TOR',
  'Utah Jazz': 'UTA',
  'Washington Wizards': 'WAS'
};

const fetchScores = async () => {
  const response = await fetch('http://localhost:8000/');
  const data = await response.json();
  return data;
};

const TeamInfo = ({ teamName, score, isWinner }) => {
  const abbreviation = teamAbbreviations[teamName];
  const logoSrc = teamLogos[abbreviation];

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      <Box
        component="img"
        src={logoSrc}
        alt={`${teamName} logo`}
        sx={{
          width: 40,
          height: 40,
          objectFit: 'contain'
        }}
      />
      <Box>
        <Typography variant="body1" fontWeight="bold">
          {teamName}
        </Typography>
        <Typography 
          variant="h5" 
          color={isWinner ? 'primary' : 'text.primary'}
        >
          {score}
        </Typography>
      </Box>
    </Box>
  );
};

// Rest of the component remains the same
const GameCard = ({ game, isLive }) => {
  const theme = useTheme();
  const [awayScore, homeScore] = game.score.split(' - ').map(score => parseInt(score));
  
  return (
    <Card 
      sx={{
        mb: 2,
        backgroundColor: 'rgb(45, 45, 45)',
        boxShadow: 'none',
        transition: 'transform 0.2s',
        '&:hover': {
          transform: 'scale(1.01)',
        },
        height: '80px' // Fixed height for consistency
      }}
    >
      <CardContent sx={{ position: 'relative', p: '16px !important', height: '100%' }}>
        <Stack 
          direction="row" 
          justifyContent="space-between" 
          alignItems="center"
          sx={{ height: '100%' }}
        >
          <TeamInfo 
            teamName={game.away_team} 
            score={awayScore}
            isWinner={awayScore > homeScore}
          />
          
          <Box 
            sx={{ 
              position: 'absolute',
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              minWidth: '100px',
              textAlign: 'center'
            }}
          >
            <Typography 
              variant="body2" 
              sx={{
                color: '#ffffff',
                opacity: 0.5,
                letterSpacing: '0.5px',
                fontWeight: 400,
                fontSize: '0.875rem'
              }}
            >
              {game.time === '4Q 0:00' ? 'Final' : game.time}
            </Typography>
          </Box>
          
          <TeamInfo 
            teamName={game.home_team} 
            score={homeScore}
            isWinner={homeScore > awayScore}
          />
        </Stack>
      </CardContent>
    </Card>
  );
};

const RefreshProgress = ({ progress, lastUpdateTime }) => {
  const formatLastUpdate = (date) => {
    if (!date) return '';
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: 2,
      backgroundColor: 'rgba(0, 0, 0, 0.04)',
      borderRadius: 1,
      padding: '4px 12px',
    }}>
      <Typography variant="caption" sx={{ opacity: 0.7 }}>
        Last update: {formatLastUpdate(lastUpdateTime)}
      </Typography>
      <Box sx={{ position: 'relative', display: 'inline-flex' }}>
        <CircularProgress 
          variant="determinate" 
          value={progress} 
          size={28}
          thickness={4}
          sx={{ color: 'primary.main' }}
        />
        <Box
          sx={{
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
            position: 'absolute',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Typography 
            variant="caption" 
            sx={{ 
              fontSize: '0.7rem',
              fontWeight: 'bold',
              color: 'primary.main'
            }}
          >
            {Math.round(progress / 100 * 20)}s
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

const Scoreboard = () => {
  const [games, setGames] = useState([]);
  const [showAllGames, setShowAllGames] = useState(true);
  const [progress, setProgress] = useState(0);
  const [lastUpdateTime, setLastUpdateTime] = useState(null);

  const updateScores = useCallback(async () => {
    try {
      const data = await fetchScores();
      setGames(data);
      setLastUpdateTime(new Date());
      setProgress(0);
    } catch (error) {
      console.error('Error fetching scores:', error);
    }
  }, []);

  useEffect(() => {
    // Initial load
    updateScores();

    // Set up progress timer
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          return 0;
        }
        return prev + (100 / 20); // Increment for smooth 20-second countdown
      });
    }, 1000);

    // Set up data refresh timer (slightly earlier than visual countdown)
    const refreshInterval = setInterval(() => {
      updateScores();
    }, 19800); // 19.8 seconds

    return () => {
      clearInterval(progressInterval);
      clearInterval(refreshInterval);
    };
  }, [updateScores]);

  const liveGames = games.filter(game => game.time !== '4Q 0:00');
  const completedGames = games.filter(game => game.time === '4Q 0:00');

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Header with Progress */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 3,
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
        borderRadius: 1,
        padding: '8px 16px'
      }}>
        <Typography variant="h6">
          NBA Scoreboard
        </Typography>
        <RefreshProgress progress={progress} lastUpdateTime={lastUpdateTime} />
      </Box>

      {/* Live Games Section */}
      {liveGames.length > 0 && (
        <Box mb={4}>
          <Typography variant="h6" gutterBottom sx={{ 
            display: 'flex', 
            alignItems: 'center'
          }}>
            <Box
              component="span"
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                backgroundColor: 'error.main',
                display: 'inline-block',
                mr: 1,
                animation: 'pulse 2s infinite'
              }}
            />
            Live Games
          </Typography>
          {liveGames.map((game, index) => (
            <GameCard key={index} game={game} isLive={true} />
          ))}
        </Box>
      )}

      {/* Completed Games Section */}
      {completedGames.length > 0 && (
        <Box>
          <Typography variant="h6" gutterBottom sx={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            Completed Games
            <IconButton 
              size="small"
              onClick={() => setShowAllGames(!showAllGames)}
              sx={{ ml: 1 }}
            >
              {showAllGames ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
            </IconButton>
          </Typography>
          
          <Collapse in={showAllGames}>
            {completedGames.map((game, index) => (
              <GameCard key={index} game={game} isLive={false} />
            ))}
          </Collapse>
        </Box>
      )}
    </Container>
  );
};

export default Scoreboard;