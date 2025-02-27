/**
 * API service for handling all HTTP requests to the backend
 */

/**
 * Fetch box score data for a specific game
 * @param {string} gameId - Game ID or object with gameId property
 * @returns {Promise<Object>} - Box score data
 */
export const fetchBoxScore = async (gameId) => {
  if (!gameId) return null;
  
  // If gameId is an object, extract the game_id or gameId
  const id = typeof gameId === 'object' ? (gameId.game_id || gameId.gameId) : gameId;
  
  try {
    const baseUrl = import.meta.env.VITE_BOX_SCORE_URL || "http://localhost:8000/api/v1/scoreboard/boxscore";
    const response = await fetch(`${baseUrl}/${id}`);
    
    if (!response.ok) {
      console.error(`Box score request failed with status: ${response.status}`);
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching box score data:', error);
    return null;
  }
};

/**
 * Fetch historical games for a specific date
 * @param {Object} date - Date object (dayjs)
 * @returns {Promise<Array>} - Games data
 */
export const fetchHistoricalGames = async (date) => {
  try {
    // Log environment variables for debugging
    console.log("Environment variables:", {
      VITE_SCORE_URL: import.meta.env.VITE_SCORE_URL,
      VITE_BACKEND_URL: import.meta.env.VITE_BACKEND_URL
    });
    
    // Use explicit localhost URL for testing
    const baseUrl = "http://localhost:8000/api/v1/scoreboard/past";
    
    // Format the date as YYYY-MM-DD for the API
    const formattedDate = date.format("YYYY-MM-DD");
    
    // Fixed URL construction with explicit localhost path
    const apiUrl = `${baseUrl}?date=${formattedDate}`;
    
    console.log("Fetching historical games from:", apiUrl);
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      console.error(`Historical games request failed with status: ${response.status}`);
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log(`Fetched ${data.length} historical games for ${formattedDate}`);
    return data;
  } catch (error) {
    console.error('Error fetching historical games:', error);
    return [];
  }
};

/**
 * Fetch player statistics by name
 * @param {string} playerName - Name of the player
 * @returns {Promise<Object>} - Player statistics data
 */
export const fetchPlayerStats = async (playerName) => {
  try {
    const baseUrl = import.meta.env.VITE_PLAYER_STATS_URL || "http://localhost:8000/api/v1/players/search";
    const response = await fetch(`${baseUrl}/${encodeURIComponent(playerName)}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching player stats:', error);
    return null;
  }
};