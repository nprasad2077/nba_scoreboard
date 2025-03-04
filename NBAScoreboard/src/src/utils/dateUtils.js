/**
 * Converts Eastern Standard Time (EST) to local time
 * @param {string} timeStr - Time string in format "Start: HH:MM PM"
 * @returns {string} - Formatted time string in local timezone
 */
export const convertToLocalTime = (timeStr) => {
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
 * Helper to parse period/time for sorting
 * @param {string} time - Time string (e.g. "1Q 10:44", "Final", "Start: 7:30 PM")
 * @returns {Object} - Object with period, minutes, seconds
 */
export const parseGameTime = (time) => {
  if (time.startsWith("Start:")) return { period: -1, minutes: 0, seconds: 0 };

  // e.g. "1Q 10:44", "OT 5:00", "Final", etc.
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
 * - then final
 */
export const sortGames = (a, b) => {
  const timeA = parseGameTime(a.time);
  const timeB = parseGameTime(b.time);

  // Higher period = earlier in the list
  if (timeB.period !== timeA.period) return timeB.period - timeA.period;

  // Then by clock time ascending
  const totalSecondsA = timeA.minutes * 60 + timeA.seconds;
  const totalSecondsB = timeB.minutes * 60 + timeB.seconds;
  return totalSecondsA - totalSecondsB;
};

/**
 * Categorize games into live, scheduled, and completed games
 * @param {Array} games - Array of game objects
 * @returns {Object} - Object with liveGames, scheduledGames, completedGames arrays
 */
export const categorizeGames = (games) => {
  // Live games: not starting with "Start:", not "Final", not starting with "0Q",
  // and specifically include "Halftime"
  const liveGames = games.filter(
    (game) =>
      game.time &&
      ((!game.time.startsWith("Start:") &&
        game.time !== "Final" &&
        !game.time.startsWith("0Q")) ||
        game.time === "Halftime")
  );

  // Scheduled games
  const scheduledGames = games.filter(
    (game) =>
      game.time &&
      (game.time.startsWith("Start:") || game.time.startsWith("0Q"))
  );

  // Completed games
  const completedGames = games.filter((game) => game.time === "Final");

  return { liveGames, scheduledGames, completedGames };
};

/**
 * Format a date string to local date format
 *
 * @param {string} dateString - ISO date string
 * @returns {string} - Formatted date string
 */
export const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString();
};
