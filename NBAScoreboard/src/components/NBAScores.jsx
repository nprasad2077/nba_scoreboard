import React, { useEffect, useState } from 'react';

function NBAScores() {
    const [games, setGames] = useState([]);

    useEffect(() => {
        const ws = new WebSocket('ws://localhost:8000/ws');

        ws.onopen = () => {
            console.log('Connected to NBA Scores WebSocket');
        };

        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                setGames(data);
            } catch (error) {
                console.error('Error parsing message:', error);
            }
        };

        ws.onerror = (error) => {
            console.error('WebSocket error:', error);
        };

        ws.onclose = () => {
            console.log('Disconnected from NBA Scores WebSocket');
        };

        // Cleanup on unmount
        return () => {
            ws.close();
        };
    }, []);

    return (
        <div>
            <h2>NBA Scores</h2>
            {games.map((game, index) => (
                <div key={index}>
                    {game.away_team} vs {game.home_team}: {game.score}
                </div>
            ))}
        </div>
    );
}

export default NBAScores;