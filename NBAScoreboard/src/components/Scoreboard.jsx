import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Container,
  Stack,
  Collapse,
  Button,
  useTheme,
  IconButton
} from '@mui/material';
import { KeyboardArrowDown, KeyboardArrowUp } from '@mui/icons-material';

// Mock data fetch function - replace with actual API call
const fetchScores = async () => {
  const response = await fetch('http://localhost:8000/');
  const data = await response.json();
  return data;
};

const GameCard = ({ game, isLive }) => {
  const theme = useTheme();
  
  // Split the score string into away and home scores
  const [awayScore, homeScore] = game.score.split(' - ').map(score => parseInt(score));
  
  return (
    <Card 
      sx={{
        mb: 2,
        backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'white',
        boxShadow: isLive ? '0 0 15px rgba(0, 255, 0, 0.1)' : 'none',
        transition: 'transform 0.2s',
        '&:hover': {
          transform: 'scale(1.01)',
        }
      }}
    >
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box flex={1}>
            <Typography variant="body1" fontWeight="bold">
              {game.away_team}
            </Typography>
            <Typography variant="h5" color={awayScore > homeScore ? 'primary' : 'text.primary'}>
              {awayScore}
            </Typography>
          </Box>
          
          <Box sx={{ mx: 2 }}>
            <Typography 
              variant="caption" 
              sx={{
                color: isLive ? 'error.main' : 'text.secondary',
                fontWeight: isLive ? 'bold' : 'normal'
              }}
            >
              {game.time === '4Q 0:00' ? 'Final' : game.time}
            </Typography>
          </Box>
          
          <Box flex={1} sx={{ textAlign: 'right' }}>
            <Typography variant="body1" fontWeight="bold">
              {game.home_team}
            </Typography>
            <Typography variant="h5" color={homeScore > awayScore ? 'primary' : 'text.primary'}>
              {homeScore}
            </Typography>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
};

const Scoreboard = () => {
  const [games, setGames] = useState([]);
  const [showAllGames, setShowAllGames] = useState(true);
  
  useEffect(() => {
    const loadScores = async () => {
      const data = await fetchScores();
      setGames(data);
    };
    
    loadScores();
    // Add polling every 30 seconds
    const interval = setInterval(loadScores, 30000);
    return () => clearInterval(interval);
  }, []);
  
  const liveGames = games.filter(game => game.time !== '4Q 0:00');
  const completedGames = games.filter(game => game.time === '4Q 0:00');
  
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Live Games Section */}
      {liveGames.length > 0 && (
        <Box mb={4}>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
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