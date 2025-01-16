import React, { useEffect, useState, useCallback } from 'react';

const NBAScores = () => {
  const [games, setGames] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);

  const connect = useCallback(() => {
    try {
      const ws = new WebSocket('ws://localhost:8000/ws');

      ws.onopen = () => {
        console.log('Connected to WebSocket');
        setIsConnected(true);
        setError(null);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          setGames(data);
        } catch (e) {
          console.error('Error parsing WebSocket data:', e);
        }
      };

      ws.onclose = () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);
        // Attempt to reconnect after 5 seconds
        setTimeout(() => connect(), 5000);
      };

      ws.onerror = (err) => {
        console.error('WebSocket error:', err);
        setError('Connection error');
      };

      return ws;
    } catch (err) {
      console.error('WebSocket connection error:', err);
      setError('Connection error');
      return null;
    }
  }, []);

  useEffect(() => {
    const ws = connect();
    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, [connect]);

  return (
    <div className="p-4">
      <div className="mb-4 flex items-center gap-2">
        <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
        <span className="text-sm text-gray-600">
          {isConnected ? 'Connected' : 'Disconnected'}
        </span>
        {error && <span className="text-sm text-red-500 ml-2">{error}</span>}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {games.map((game, index) => (
          <div key={index} className="border rounded-lg p-4 shadow-sm">
            <div className="flex justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="font-bold text-gray-600">{game.away_tricode}</span>
                <span>{game.away_team}</span>
              </div>
              <span className="text-sm text-gray-500">@</span>
              <div className="flex items-center gap-2">
                <span>{game.home_team}</span>
                <span className="font-bold text-gray-600">{game.home_tricode}</span>
              </div>
            </div>
            
            <div className="flex justify-between items-center mt-2">
              <span className="text-lg font-bold">{game.score}</span>
              <span className={`text-sm ${
                game.time.startsWith('Start:') ? 'text-blue-600' : 'text-green-600'
              }`}>
                {game.time}
              </span>
            </div>
          </div>
        ))}
      </div>

      {games.length === 0 && !error && (
        <div className="text-center text-gray-500 mt-8">
          No games scheduled
        </div>
      )}
    </div>
  );
};

export default NBAScores;