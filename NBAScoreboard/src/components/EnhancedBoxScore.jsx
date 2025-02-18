import React, { useState, useEffect } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';

const TeamTable = ({ teamData, teamCity, teamName }) => {
  const [sortConfig, setSortConfig] = useState({
    key: 'minutes',
    direction: 'desc'
  });

  const headCells = [
    { id: "name", numeric: false, label: "PLAYER", width: "w-48" },
    { id: "minutes", numeric: false, label: "MIN", width: "w-24" },
    { id: "points", numeric: true, label: "PTS", width: "w-24" },
    { id: "reboundsTotal", numeric: true, label: "REB", width: "w-24" },
    { id: "assists", numeric: true, label: "AST", width: "w-24" },
    { id: "fieldGoals", numeric: true, label: "FG", width: "w-24" },
    { id: "threePointers", numeric: true, label: "3P", width: "w-24" },
    { id: "plusMinusPoints", numeric: true, label: "+/-", width: "w-24" }
  ];

  const handleSort = (key) => {
    let direction = 'desc';
    if (sortConfig.key === key) {
      direction = sortConfig.direction === 'desc' ? 'asc' : 'desc';
    }
    setSortConfig({ key, direction });
  };

  const formatMinutes = (duration) => {
    if (!duration) return '0:00';
    
    // Handle PT30M33.98S format
    const match = duration.match(/PT(\d+)M(\d+\.\d+)S/);
    if (!match) return '0:00';
    
    const minutes = parseInt(match[1]);
    const seconds = Math.round(parseFloat(match[2]));
    
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getSortValue = (player, key) => {
    if (key === 'name') {
      return player.name || '';
    }
    if (key === 'minutes') {
      const duration = player.statistics?.minutes;
      if (!duration) return 0;
      const match = duration.match(/PT(\d+)M(\d+\.\d+)S/);
      if (!match) return 0;
      return parseInt(match[1]) * 60 + parseFloat(match[2]);
    }
    return player.statistics?.[key] ?? 0;
  };

  const sortedPlayers = [...(teamData.players || [])]
    .filter(player => player.status === "ACTIVE")
    .sort((a, b) => {
      const aValue = getSortValue(a, sortConfig.key);
      const bValue = getSortValue(b, sortConfig.key);
      
      if (sortConfig.direction === 'asc') {
        return aValue > bValue ? 1 : -1;
      }
      return aValue < bValue ? 1 : -1;
    });

  return (
    <div className="mb-8">
      <h3 className="text-lg mb-2 text-gray-100 font-semibold">
        {teamCity} {teamName}
      </h3>
      <div className="w-full overflow-x-auto bg-gray-900 rounded-lg shadow-lg">
        <table className="w-full min-w-full divide-y divide-gray-700">
          <thead className="bg-gray-800">
            <tr>
              {headCells.map((cell) => (
                <th
                  key={cell.id}
                  className={`${cell.width} px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-700 transition-colors duration-150`}
                  onClick={() => handleSort(cell.id)}
                >
                  <div className="flex items-center space-x-1">
                    <span>{cell.label}</span>
                    <div className="flex flex-col">
                      <ChevronUp 
                        className={`h-3 w-3 ${
                          sortConfig.key === cell.id && sortConfig.direction === 'asc'
                            ? 'text-blue-400'
                            : 'text-gray-500'
                        }`}
                      />
                      <ChevronDown 
                        className={`h-3 w-3 ${
                          sortConfig.key === cell.id && sortConfig.direction === 'desc'
                            ? 'text-blue-400'
                            : 'text-gray-500'
                        }`}
                      />
                    </div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-gray-900 divide-y divide-gray-700">
            {sortedPlayers.map((player, index) => (
              <tr 
                key={`${player.name}-${index}`}
                className="hover:bg-gray-800 transition-colors duration-150"
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100">
                  <div className="flex items-center gap-2">
                    {player.oncourt === true && (
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    )}
                    <span>{player.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-300">
                  {formatMinutes(player.statistics?.minutes)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-300">
                  {player.statistics?.points || 0}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-300">
                  {player.statistics?.reboundsTotal || 0}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-300">
                  {player.statistics?.assists || 0}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-300">
                  {player.statistics?.fieldGoals || '0-0'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-300">
                  {player.statistics?.threePointers || '0-0'}
                </td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm text-right ${
                  (player.statistics?.plusMinusPoints || 0) > 0 ? 'text-green-400' : 
                  (player.statistics?.plusMinusPoints || 0) < 0 ? 'text-red-400' : 'text-gray-300'
                }`}>
                  {(player.statistics?.plusMinusPoints || 0) > 0 ? '+' : ''}
                  {player.statistics?.plusMinusPoints || 0}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const EnhancedBoxScore = ({ game, open }) => {
  const [boxScore, setBoxScore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const api_url = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";
  const gameId = game?.gameId;

  useEffect(() => {
    const fetchBoxScore = async () => {
      if (!gameId) return;
      try {
        setLoading(true);
        const response = await fetch(`${api_url}/boxscore/${gameId}`);
        const data = await response.json();
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
      <div className="flex justify-center items-center h-full p-8">
        <div className="w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-400 p-4 text-center">
        {error}
      </div>
    );
  }

  if (!boxScore) {
    return (
      <div className="text-gray-300 p-4 text-center">
        No box score data available
      </div>
    );
  }

  return (
    <div className="p-4 bg-gray-900">
      <h2 className="text-xl mb-6 text-gray-100 font-bold">Box Score</h2>
      
      {/* Away Team */}
      <TeamTable 
        teamData={boxScore.away_team}
        teamCity={boxScore.away_team.teamCity}
        teamName={boxScore.away_team.teamName}
      />

      {/* Home Team */}
      <TeamTable 
        teamData={boxScore.home_team}
        teamCity={boxScore.home_team.teamCity}
        teamName={boxScore.home_team.teamName}
      />
    </div>
  );
};

export default EnhancedBoxScore;