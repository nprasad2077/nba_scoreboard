/**
 * Converts an ISO date string (assumed in EST) to a local time string.
 * If the string already represents a scheduled status (e.g. "Start:" or "0Q")
 * or is "Final", it is returned as-is.
 *
 * @param {string} timeStr - Either an ISO date string (e.g. "2025-02-24T00:00:00")
 *                           or a status string like "Start: 7:30 PM" or "Final".
 * @returns {string} - A formatted time string (e.g. "Start: 7:30 PM") in local timezone.
 */
export const convertToLocalTime = (timeStr) => {
  if (
    timeStr.startsWith("Start:") ||
    timeStr.startsWith("0Q") ||
    timeStr === "Final"
  ) {
    return timeStr;
  }

  // If timeStr is an ISO string (contains "T"), assume it’s in EST (UTC-5).
  if (timeStr.includes("T")) {
    // Append EST offset if needed.
    const date = new Date(timeStr + "-05:00");
    const localTimeStr = date.toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
    return `Start: ${localTimeStr}`;
  }

  return timeStr;
};

/**
 * Normalizes a historical game object.
 * - Creates a top-level `score` property in the format "awayScore - homeScore".
 * - Creates a top-level `time` property using `clock` (or converts `game_time` if missing).
 * - Flattens team objects so UI components receive plain strings.
 *
 * @param {Object} game - A game object from the API.
 * @returns {Object} - A normalized game object.
 */
export const normalizeGame = (game) => {
  // Build a score string from the team scores.
  const awayScore = game.away_team?.score ?? "";
  const homeScore = game.home_team?.score ?? "";
  const score =
    awayScore !== "" && homeScore !== ""
      ? `${awayScore} - ${homeScore}`
      : "";

  // Use the clock if available; otherwise, convert game_time.
  const time = game.clock ? game.clock : convertToLocalTime(game.game_time);

  return {
    ...game,
    score,
    time,
    // Flatten team details for easy consumption in UI components.
    away_team_name: game.away_team?.team_name ?? "",
    away_team_tricode: game.away_team?.team_tricode ?? "",
    home_team_name: game.home_team?.team_name ?? "",
    home_team_tricode: game.home_team?.team_tricode ?? "",
  };
};

/**
 * Normalizes an array of game objects.
 *
 * @param {Array} games - Array of game objects.
 * @returns {Array} - Array of normalized game objects.
 */
export const normalizeGames = (games) => {
  return games.map((game) => normalizeGame(game));
};

/**
 * Sorts games by their game_time in descending order.
 * The most recent game appears first.
 *
 * @param {Object} a - First game object.
 * @param {Object} b - Second game object.
 * @returns {number} - Sorting order.
 */
export const sortGames = (a, b) => {
  return new Date(b.game_time) - new Date(a.game_time);
};

/**
 * Categorizes normalized games into live, scheduled, and completed.
 * - Scheduled games: Those with a time starting with "Start:" or "0Q".
 * - Completed games: Those with a time exactly equal to "Final".
 * - Live games: Any game not falling into the above categories.
 *
 * @param {Array} games - Array of normalized game objects.
 * @returns {Object} - An object with keys { liveGames, scheduledGames, completedGames }.
 */
export const categorizeGames = (games) => {
  const liveGames = games.filter((game) => {
    return (
      !game.time.startsWith("Start:") &&
      !game.time.startsWith("0Q") &&
      game.time !== "Final"
    );
  });

  const scheduledGames = games.filter((game) => {
    return game.time.startsWith("Start:") || game.time.startsWith("0Q");
  });

  const completedGames = games.filter((game) => {
    return game.time === "Final";
  });

  return { liveGames, scheduledGames, completedGames };
};

/**
 * Formats an ISO date string to a local date format.
 *
 * @param {string} dateString - An ISO date string.
 * @returns {string} - A formatted date string (e.g. "2/24/2025").
 */
export const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString();
};
