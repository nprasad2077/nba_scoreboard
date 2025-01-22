import { useState, useEffect } from 'react';

const useWebSocket = () => {
  const [games, setGames] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdateTime, setLastUpdateTime] = useState(null);

  useEffect(() => {
    let ws = null;
    let reconnectTimeout = null;
    let reconnectAttempts = 0;
    const ws_url = import.meta.env.VITE_WS_URL || "ws://localhost:8000/ws";

    const connectWebSocket = () => {
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }

      try {
        ws = new WebSocket(ws_url);

        ws.onopen = () => {
          console.log("Connected to NBA Stats WebSocket");
          setIsConnected(true);
          reconnectAttempts = 0;
        };

        ws.onmessage = (event) => {
          try {
            const gamesData = JSON.parse(event.data);
            setGames(gamesData);
            setLastUpdateTime(new Date());
          } catch (error) {
            console.error("Error parsing WebSocket message:", error);
          }
        };

        ws.onerror = (error) => {
          console.log(
            `WebSocket error (attempt ${reconnectAttempts + 1}):`,
            error
          );
          setIsConnected(false);
        };

        ws.onclose = (event) => {
          console.log(
            `WebSocket closed (attempt ${reconnectAttempts + 1}):`,
            event.code,
            event.reason
          );
          setIsConnected(false);

          reconnectAttempts++;

          const backoffTime = Math.min(
            1000 * Math.pow(2, reconnectAttempts),
            10000
          );
          console.log(`Reconnecting in ${backoffTime}ms...`);

          reconnectTimeout = setTimeout(() => {
            console.log("Attempting to reconnect...");
            connectWebSocket();
          }, backoffTime);
        };
      } catch (error) {
        console.error("Error creating WebSocket:", error);
        reconnectTimeout = setTimeout(connectWebSocket, 5000);
      }
    };

    reconnectTimeout = setTimeout(() => {
      console.log("Making initial connection attempt...");
      connectWebSocket();
    }, 5);

    return () => {
      if (ws) {
        ws.close();
      }
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
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