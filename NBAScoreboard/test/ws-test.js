import http from 'k6/http';
import ws from 'k6/ws';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

const BACKEND_URL = __ENV.BACKEND_URL;
const WS_URL = __ENV.WS_URL;

const wsConnectFailRate = new Rate('ws_connect_failures');

export const options = {
  stages: [
    { duration: '30s', target: 100 },  // Ramp up to 100 users
    { duration: '2m', target: 100 },  // Stay at 50 users
    { duration: '30s', target: 0 },   // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],
    ws_connect_failures: ['rate<0.1'],
    http_req_failed: ['rate<0.01']
  },
};

export default function () {
  // Test REST API endpoints
  const boxscoreResponse = http.get(`${BACKEND_URL}/boxscore/0022400552`);
  check(boxscoreResponse, {
    'boxscore status is 200': (r) => r.status === 200,
    'boxscore response is json': (r) => r.headers['Content-Type'].includes('application/json'),
  });

  // Test WebSocket
  let socketClosed = false;
  const wsResponse = ws.connect(WS_URL, null, function(socket) {
    socket.on('open', () => {
      socket.send(JSON.stringify({ type: 'message', content: 'test message' }));
    });

    socket.on('message', (data) => {
      check(data, {
        'received game data': (d) => d.includes('gameId'),
      });
      socketClosed = true;
      socket.close();
    });

    socket.on('close', () => socketClosed = true);
    socket.on('error', (e) => {
      wsConnectFailRate.add(1);
      socketClosed = true;
      socket.close();
    });
  });

  check(wsResponse, { 
    'WebSocket connected successfully': (r) => r && r.status === 101 
  });

  // Wait for socket closure
  let waited = 0;
  while (!socketClosed && waited < 5) {
    sleep(1);
    waited++;
  }
}