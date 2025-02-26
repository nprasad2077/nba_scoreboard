// NBAPlayerStats.jsx
import React, { useState } from "react";
import { Box, useMediaQuery, Alert } from "@mui/material";
import PlayerSearch from "./common/player/PlayerSearch";
import PlayerHeader from "./common/player/PlayerHeader";
import PlayerGameStats from "./common/player/PlayerGameStats";
import { searchPlayersByName, fetchPlayerGameStats } from "../services/playerService";

/**
 * Component for displaying NBA player statistics
 * 
 * @returns {JSX.Element} - Rendered component
 */
const NBAPlayerStats = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [playerStats, setPlayerStats] = useState(null);
  const [showMore, setShowMore] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const [statsError, setStatsError] = useState(null);
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  
  const isMobile = useMediaQuery("(max-width:600px)");

  /**
   * Handle search query change and fetch matching players
   * 
   * @param {string} query - Search query
   */
  const handleSearchChange = async (query) => {
    setSearchQuery(query);
    setSearchError(null); // Clear previous errors
    
    if (query.length >= 2) {
      setIsSearching(true);
      try {
        const results = await searchPlayersByName(query);
        setSearchResults(results);
      } catch (error) {
        console.error("Error in search:", error);
        setSearchError("Failed to search for players. Please try again.");
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    } else {
      setSearchResults([]);
    }
  };

  /**
   * Handle player selection and fetch their stats
   * 
   * @param {Object} player - Selected player object
   */
  const handlePlayerSelect = async (player) => {
    setSelectedPlayer(player);
    setShowMore(false);
    setStatsError(null); // Clear previous errors
    
    if (player) {
      setIsLoadingStats(true);
      try {
        const stats = await fetchPlayerGameStats(player.person_id, 10);
        if (stats) {
          setPlayerStats(stats);
        } else {
          setStatsError("Could not load player statistics");
        }
      } catch (error) {
        console.error("Error fetching player stats:", error);
        setStatsError(`Failed to fetch statistics for ${player.display_name}`);
      } finally {
        setIsLoadingStats(false);
      }
    }
  };

  /**
   * Handle show more button click to fetch more games
   */
  const handleShowMore = async () => {
    setShowMore(true);
    setStatsError(null);
    
    if (selectedPlayer) {
      setIsLoadingStats(true);
      try {
        const stats = await fetchPlayerGameStats(selectedPlayer.person_id, 25);
        if (stats) {
          setPlayerStats(stats);
        } else {
          setStatsError("Could not load additional game statistics");
        }
      } catch (error) {
        console.error("Error fetching more stats:", error);
        setStatsError("Failed to load additional games");
      } finally {
        setIsLoadingStats(false);
      }
    }
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
      <PlayerSearch
        searchQuery={searchQuery}
        searchResults={searchResults}
        onSearchChange={handleSearchChange}
        onPlayerSelect={handlePlayerSelect}
        isLoading={isSearching}
        error={searchError}
      />

      {statsError && (
        <Alert 
          severity="error" 
          sx={{ 
            mb: 2, 
            maxWidth: "1400px", 
            mx: "auto", 
            width: "100%",
            backgroundColor: "#350000", 
            color: "white"
          }}
        >
          {statsError}
        </Alert>
      )}

      {isLoadingStats && !playerStats && (
        <Box 
          sx={{ 
            display: "flex", 
            justifyContent: "center", 
            py: 4 
          }}
        >
          Loading player statistics...
        </Box>
      )}

      {playerStats && (
        <Box
          sx={{
            overflow: "auto",
            flex: 1,
            maxWidth: "1400px",
            margin: "0 auto",
          }}
        >
          <PlayerHeader playerInfo={playerStats.player_info} />

          <PlayerGameStats
            games={playerStats.games}
            showMore={showMore}
            onShowMore={handleShowMore}
            isLoading={isLoadingStats && showMore}
          />
        </Box>
      )}
    </Box>
  );
};

export default NBAPlayerStats;
