// NBAPlayerStats.jsx
import React, { useState } from "react";
import { Box, Container, Typography, useMediaQuery, Alert } from "@mui/material";
import PlayerSearch from "./common/player/PlayerSearch";
import PlayerHeader from "./common/player/PlayerHeader";
import PlayerGameStats from "./common/player/PlayerGameStats";
import Header from "./common/Header";
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
        title="Player Statistics"
      />
      
      {/* Search */}
      <Box sx={{ 
        width: "100%", 
        maxWidth: "600px", 
        mb: 3,
        mx: "auto"
      }}>
        <PlayerSearch
          searchQuery={searchQuery}
          searchResults={searchResults}
          onSearchChange={handleSearchChange}
          onPlayerSelect={handlePlayerSelect}
          isLoading={isSearching}
          error={searchError}
        />
      </Box>

      {statsError && (
        <Alert 
          severity="error" 
          sx={{ 
            mb: 2, 
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
            Loading player statistics...
          </Typography>
        </Box>
      )}

      {playerStats && (
        <Box
          sx={{
            overflow: "auto",
            flex: 1,
            width: "100%",
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

      {/* Empty State */}
      {!playerStats && !isLoadingStats && !statsError && (
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
            Search for a player to view their stats
          </Typography>
        </Box>
      )}
    </Container>
  );
};

export default NBAPlayerStats;