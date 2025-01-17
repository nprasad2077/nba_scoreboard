import WebSocket from 'ws';

const ws = new WebSocket('ws://localhost:8000/ws');

ws.on('open', function open() {
    console.log('Connected to NBA Scores WebSocket');
});

ws.on('message', function message(data) {
    try {
        const games = JSON.parse(data);
        console.log('Received games:', games);
    } catch (error) {
        console.error('Error parsing message:', error);
    }
});

ws.on('error', function error(error) {
    console.error('WebSocket error:', error);
});

ws.on('close', function close() {
    console.log('Disconnected from NBA Scores WebSocket');
});