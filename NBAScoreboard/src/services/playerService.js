/**
 * Service for player-related API interactions
 */

/**
 * Search players by name query
 * 
 * @param {string} query - Search query 
 * @returns {Promise<Array>} - Array of matching player objects
 */
export const searchPlayersByName = async (query) => {
  if (query.length < 2) return [];
  
  try {
    // Use the exact URL format expected by the backend - without the /api/v1/ prefix
    const baseUrl = import.meta.env.VITE_PLAYER_SEARCH_URL || "https://api.server.nbaapi.com/api/v1/players/search/";
    
    // Ensure we have the correct URL format with trailing slash before the query parameter
    // The backend expects /players/search/?query=value
    const url = `${baseUrl.endsWith('/') ? baseUrl : baseUrl + '/'}?query=${encodeURIComponent(query)}`;
    
    console.log("Searching players at URL:", url);
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error(`Search request failed with status: ${response.status}`);
      const errorText = await response.text();
      console.error("Error response:", errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log(`Found ${data.length} players matching "${query}"`);
    return data;
  } catch (error) {
    console.error("Error searching players:", error);
    return [];
  }
};

/**
 * Fetch player game statistics
 * 
 * @param {string} playerId - Player ID
 * @param {number} lastNGames - Number of games to fetch
 * @returns {Promise<Object>} - Player game statistics
 */
export const fetchPlayerGameStats = async (playerId, lastNGames = 10) => {
  if (!playerId) return null;
  
  try {
    const baseUrl = import.meta.env.VITE_PLAYER_GAMES_URL || "https://api.server.nbaapi.com/api/v1/players";
    // Ensure proper path format with no double slashes
    const url = `${baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl}/${playerId}/games?last_n_games=${lastNGames}`;
    
    console.log("Fetching player stats at URL:", url);
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error(`Stats request failed with status: ${response.status}`);
      const errorText = await response.text();
      console.error("Error response:", errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log(`Retrieved stats for player ${playerId} (${data?.player_info?.display_name || 'unknown'})`);
    return data;
  } catch (error) {
    console.error("Error fetching player stats:", error);
    return null;
  }
};

/**
 * Get player image URL
 * 
 * @param {string} playerId - Player ID
 * @returns {string|null} - Image URL or null if no ID provided
 */
export const getPlayerImageUrl = (playerId) => {
  if (!playerId) return null;
  const baseUrl = import.meta.env.VITE_PLAYER_IMAGE_URL || "https://cdn.nba.com/headshots/nba/latest/1040x760";
  return `${baseUrl}/${playerId}.png`;
};