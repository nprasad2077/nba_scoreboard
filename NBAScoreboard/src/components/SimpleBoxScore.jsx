import React, { useState, useEffect } from 'react';
import { Box, CircularProgress } from '@mui/material';

const SimpleBoxScore = ({ game, open }) => {
  const [boxScore, setBoxScore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const api_url = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";
  const gameId = game?.gameId;

  console.log('Game prop:', game);
  console.log('GameId:', gameId);

  useEffect(() => {
    const fetchBoxScore = async () => {
      if (!gameId) return;
      try {
        setLoading(true);
        console.log('Fetching from:', `${api_url}/boxscore/${gameId}`);
        const response = await fetch(`${api_url}/boxscore/${gameId}`);
        const data = await response.json();
        console.log('BoxScore data:', data);
        setBoxScore(data);
      } catch (err) {
        console.error("Error fetching box score:", err);
        setError("Failed to load box score data");
      } finally {
        setLoading(false);
      }
    };

    fetchBoxScore();
  }, [gameId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <CircularProgress />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 p-4">
        {error}
      </div>
    );
  }

  if (!boxScore) {
    return (
      <div className="text-white p-4">
        No box score data available
      </div>
    );
  }

  return (
    <div className="text-white p-4">
      <h2 className="text-xl mb-4">Box Score Data</h2>
      
      {/* Away Team */}
      <div className="mb-8">
        <h3 className="text-lg mb-2">
          {boxScore.away_team.teamCity} {boxScore.away_team.teamName}
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-neutral-800">
            <thead>
              <tr className="border-b border-neutral-700">
                <th className="text-left p-2">Player</th>
                <th className="text-right p-2">MIN</th>
                <th className="text-right p-2">PTS</th>
                <th className="text-right p-2">REB</th>
                <th className="text-right p-2">AST</th>
              </tr>
            </thead>
            <tbody>
              {boxScore.away_team.players
                .filter(player => player.status === "ACTIVE")
                .map(player => (
                  <tr key={player.name} className="border-b border-neutral-700">
                    <td className="p-2">{player.name}</td>
                    <td className="text-right p-2">{player.statistics.minutes}</td>
                    <td className="text-right p-2">{player.statistics.points}</td>
                    <td className="text-right p-2">{player.statistics.reboundsTotal}</td>
                    <td className="text-right p-2">{player.statistics.assists}</td>
                  </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Home Team */}
      <div>
        <h3 className="text-lg mb-2">
          {boxScore.home_team.teamCity} {boxScore.home_team.teamName}
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-neutral-800">
            <thead>
              <tr className="border-b border-neutral-700">
                <th className="text-left p-2">Player</th>
                <th className="text-right p-2">MIN</th>
                <th className="text-right p-2">PTS</th>
                <th className="text-right p-2">REB</th>
                <th className="text-right p-2">AST</th>
              </tr>
            </thead>
            <tbody>
              {boxScore.home_team.players
                .filter(player => player.status === "ACTIVE")
                .map(player => (
                  <tr key={player.name} className="border-b border-neutral-700">
                    <td className="p-2">{player.name}</td>
                    <td className="text-right p-2">{player.statistics.minutes}</td>
                    <td className="text-right p-2">{player.statistics.points}</td>
                    <td className="text-right p-2">{player.statistics.reboundsTotal}</td>
                    <td className="text-right p-2">{player.statistics.assists}</td>
                  </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SimpleBoxScore;