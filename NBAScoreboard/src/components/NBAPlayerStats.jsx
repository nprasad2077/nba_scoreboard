import React, { useState } from 'react';
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
  Box
} from '@mui/material';

const NBAPlayerStats = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [playerStats, setPlayerStats] = useState(null);

  // Search players when input is 2 or more characters
  const searchPlayers = async (query) => {
    if (query.length >= 2) {
      try {
        const response = await fetch(`http://localhost:8000/players/search/?query=${query}`);
        const data = await response.json();
        setSearchResults(data);
      } catch (error) {
        console.error('Error searching players:', error);
      }
    } else {
      setSearchResults([]);
    }
  };

  // Fetch player stats when a player is selected
  const fetchPlayerStats = async (playerId) => {
    try {
      const response = await fetch(`http://localhost:8000/players/${playerId}/last10`);
      const data = await response.json();
      setPlayerStats(data);
    } catch (error) {
      console.error('Error fetching player stats:', error);
    }
  };

  // Format date string
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          NBA Player Stats
        </Typography>
        <Autocomplete
          options={searchResults}
          getOptionLabel={(option) => `${option.display_name} - ${option.team_abbreviation}`}
          onInputChange={(event, newInputValue) => {
            setSearchQuery(newInputValue);
            searchPlayers(newInputValue);
          }}
          onChange={(event, newValue) => {
            setSelectedPlayer(newValue);
            if (newValue) {
              fetchPlayerStats(newValue.person_id);
            }
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Search for a player (min. 2 characters)"
              variant="outlined"
              sx={{ width: 300 }}
            />
          )}
        />
      </Box>

      {playerStats && (
        <Box>
          <Typography variant="h6" gutterBottom>
            Last 10 Games - {playerStats.player_info.display_name} ({playerStats.player_info.team_abbreviation})
          </Typography>
          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Matchup</TableCell>
                  <TableCell>W/L</TableCell>
                  <TableCell>MIN</TableCell>
                  <TableCell>PTS</TableCell>
                  <TableCell>FGM-FGA</TableCell>
                  <TableCell>FG%</TableCell>
                  <TableCell>3PM-3PA</TableCell>
                  <TableCell>3P%</TableCell>
                  <TableCell>FTM-FTA</TableCell>
                  <TableCell>FT%</TableCell>
                  <TableCell>REB</TableCell>
                  <TableCell>AST</TableCell>
                  <TableCell>STL</TableCell>
                  <TableCell>BLK</TableCell>
                  <TableCell>TOV</TableCell>
                  <TableCell>+/-</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {playerStats.last_10_games.map((game, index) => (
                  <TableRow key={index}>
                    <TableCell>{formatDate(game.game_date)}</TableCell>
                    <TableCell>{game.matchup}</TableCell>
                    <TableCell sx={{ color: game.wl === 'W' ? 'success.main' : 'error.main' }}>
                      {game.wl}
                    </TableCell>
                    <TableCell>{Math.round(game.min)}</TableCell>
                    <TableCell>{game.pts}</TableCell>
                    <TableCell>{`${game.fgm}-${game.fga}`}</TableCell>
                    <TableCell>{(game.fg_pct * 100).toFixed(1)}%</TableCell>
                    <TableCell>{`${game.fg3m}-${game.fg3a}`}</TableCell>
                    <TableCell>{(game.fg3_pct * 100).toFixed(1)}%</TableCell>
                    <TableCell>{`${game.ftm}-${game.fta}`}</TableCell>
                    <TableCell>{(game.ft_pct * 100).toFixed(1)}%</TableCell>
                    <TableCell>{game.reb}</TableCell>
                    <TableCell>{game.ast}</TableCell>
                    <TableCell>{game.stl}</TableCell>
                    <TableCell>{game.blk}</TableCell>
                    <TableCell>{game.tov}</TableCell>
                    <TableCell sx={{ color: game.plus_minus > 0 ? 'success.main' : 'error.main' }}>
                      {game.plus_minus > 0 ? `+${game.plus_minus}` : game.plus_minus}
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