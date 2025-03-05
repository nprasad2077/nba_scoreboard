/**
 * Formats a game time ISO string into a displayable start time
 * @param {string} isoTimeString - ISO time string (e.g., "2025-03-05T01:00:00+00:00")
 * @returns {string} - Formatted time string (e.g., "Start: 8:00 PM")
 */
export const formatGameStartTime = (isoTimeString) => {
  if (!isoTimeString) return "Start: TBD";

  try {
    // Log the input for debugging
    console.log("Formatting time string:", isoTimeString);

    // For timezone-aware ISO strings, use directly
    // For non-timezone strings, assume UTC
    let date;

    try {
      // Try direct parsing first
      date = new Date(isoTimeString);

      // Check if valid
      if (isNaN(date.getTime())) {
        throw new Error("Invalid date from direct parsing");
      }
    } catch (parseError) {
      console.warn(
        "Direct parsing failed, trying alternative methods:",
        parseError
      );

      // Try manually parsing ISO format
      const matches = isoTimeString.match(
        /(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.(\d+))?(?:Z|([+-])(\d{2}):(\d{2}))?/
      );

      if (matches) {
        const [_, year, month, day, hour, minute, second] = matches;
        // Construct date in local timezone
        date = new Date(
          parseInt(year),
          parseInt(month) - 1, // Month is 0-indexed
          parseInt(day),
          parseInt(hour),
          parseInt(minute),
          parseInt(second)
        );
      } else {
        console.error("Unable to parse date string:", isoTimeString);
        return "Start: TBD";
      }
    }

    // Format the time
    const formattedTime = date.toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

    console.log("Successfully formatted time:", formattedTime);
    return `Start: ${formattedTime}`;
  } catch (error) {
    console.error("Error formatting game time:", error, isoTimeString);
    return "Start: TBD";
  }
};

/**
 * Categorize games into live, scheduled, and completed games
 * @param {Array} games - Array of game objects
 * @returns {Object} - Object with liveGames, scheduledGames, completedGames arrays
 */
export const categorizeGames = (games) => {
  // Live games: game_status is 2 (in progress)
  const liveGames = games.filter((game) => game.game_status === 2);

  // Scheduled games: game_status is 1 (not started)
  const scheduledGames = games.filter((game) => game.game_status === 1);

  // Completed games: game_status is 3 (final)
  const completedGames = games.filter((game) => game.game_status === 3);

  return { liveGames, scheduledGames, completedGames };
};

/**
 * Converts an ISO date string to a readable game time
 * For use in GameCard component
 *
 * @param {string} isoString - ISO date string
 * @returns {string} - Formatted game time string
 */
export const formatGameTime = (game) => {
  // For upcoming games (status 1)
  if (game.game_status === 1) {
    if (!game.game_time) return "Start: TBD";

    try {
      // Parse the ISO date string manually to avoid issues
      const dateMatch = game.game_time.match(
        /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})/
      );

      if (dateMatch) {
        // Manual date construction
        const [_, year, month, day, hour, minute] = dateMatch;
        const date = new Date(
          Date.UTC(
            parseInt(year),
            parseInt(month) - 1,
            parseInt(day),
            parseInt(hour),
            parseInt(minute)
          )
        );

        // Format the time
        return `Start: ${date.toLocaleTimeString([], {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        })}`;
      }

      // Fallback to direct parsing
      const date = new Date(game.game_time);
      if (!isNaN(date.getTime())) {
        return `Start: ${date.toLocaleTimeString([], {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        })}`;
      }

      return "Start: TBD";
    } catch (error) {
      console.error("Error formatting game time:", error);
      return "Start: TBD";
    }
  }

  // For live games (status 2)
  if (game.game_status === 2) {
    // Format period and clock
    const period = game.period || 1;

    // If there's no clock, return just the period
    if (!game.clock) return `${period}Q`;

    // Parse the clock format (e.g., "PT06M54.00S")
    const minutesMatch = game.clock.match(/PT(\d+)M/);
    const secondsMatch = game.clock.match(/M(\d+\.\d+)S/);

    if (minutesMatch && secondsMatch) {
      const minutes = minutesMatch[1];
      const seconds = Math.floor(parseFloat(secondsMatch[1]));
      return `${period}Q ${minutes}:${seconds.toString().padStart(2, "0")}`;
    }

    return `${period}Q`;
  }

  // For completed games (status 3)
  if (game.game_status === 3) {
    return "Final";
  }

  return "TBD";
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

// Keep the other functions from dateUtils.js
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
