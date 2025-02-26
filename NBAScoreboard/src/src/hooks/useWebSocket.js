import { useState, useEffect, useRef } from 'react';

/**
 * Custom hook for WebSocket connection with automatic reconnection
 * @returns {Object} - Object with games data, connection status, and last update time
 */
const useWebSocket = () => {
  const [games, setGames] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdateTime, setLastUpdateTime] = useState(null);
  
  // Use refs to maintain values across renders
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);

  useEffect(() => {
    const ws_url = import.meta.env.VITE_WS_URL || "ws://h840kckc8c8swg0cos4cs4g0.143.198.70.30.sslip.io/ws";
    console.log("WebSocket URL:", ws_url);

    /**
     * Connect to WebSocket with exponential backoff for retries
     */
    const connectWebSocket = () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }

      try {
        wsRef.current = new WebSocket(ws_url);

        wsRef.current.onopen = () => {
          console.log("Connected to NBA Stats WebSocket");
          setIsConnected(true);
          reconnectAttemptsRef.current = 0;
        };

        wsRef.current.onmessage = (event) => {
          try {
            const gamesData = JSON.parse(event.data);
            setGames(gamesData);
            setLastUpdateTime(new Date());
          } catch (error) {
            console.error("Error parsing WebSocket message:", error);
          }
        };

        wsRef.current.onerror = (error) => {
          console.log(
            `WebSocket error (attempt ${reconnectAttemptsRef.current + 1}):`,
            error
          );
          setIsConnected(false);
        };

        wsRef.current.onclose = (event) => {
          console.log(
            `WebSocket closed (attempt ${reconnectAttemptsRef.current + 1}):`,
            event.code,
            event.reason
          );
          setIsConnected(false);

          reconnectAttemptsRef.current++;

          // Exponential backoff with max of 10 seconds
          const backoffTime = Math.min(
            1000 * Math.pow(2, reconnectAttemptsRef.current),
            10000
          );
          console.log(`Reconnecting in ${backoffTime}ms...`);

          reconnectTimeoutRef.current = setTimeout(() => {
            console.log("Attempting to reconnect...");
            connectWebSocket();
          }, backoffTime);
        };
      } catch (error) {
        console.error("Error creating WebSocket:", error);
        reconnectTimeoutRef.current = setTimeout(connectWebSocket, 5000);
      }
    };

    // Initial connection attempt with slight delay
    reconnectTimeoutRef.current = setTimeout(() => {
      console.log("Making initial connection attempt...");
      connectWebSocket();
    }, 5);

    // Cleanup function
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, []);

  return {
    games,
    isConnected,
    lastUpdateTime
  };
};

export default useWebSocket;