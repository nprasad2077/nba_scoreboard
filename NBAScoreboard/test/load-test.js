import http from 'k6/http';
import ws from 'k6/ws';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

const FRONTEND_URL = __ENV.FRONTEND_URL;
const WS_URL = __ENV.WS_URL;

const wsConnectFailRate = new Rate('ws_connect_failures');

export const options = {
  vus: 1,
  duration: '30s',
  thresholds: {
    http_req_duration: ['p(95)<500'],
    ws_connect_failures: ['rate<0.1']
  },
};

export default function () {
  // Test HTTP frontend
  const frontendResponse = http.get(FRONTEND_URL);
  check(frontendResponse, {
    'frontend status is 200': (r) => r.status === 200,
    'frontend loads fast': (r) => r.timings.duration < 200,
  });

  // Create a promise to handle WebSocket completion
  let socketClosed = false;
  
  const response = ws.connect(WS_URL, null, function(socket) {
    socket.on('open', () => {
      console.log('WebSocket opened');
      // Send message immediately after connection
      socket.send(JSON.stringify({ type: 'message', content: 'test message' }));
    });

    socket.on('message', (data) => {
      console.log('Message received:', data);
      socketClosed = true;
      socket.close();
    });

    socket.on('close', () => {
      console.log('WebSocket closed');
      socketClosed = true;
    });

    socket.on('error', (e) => {
      console.error('WebSocket error:', e);
      wsConnectFailRate.add(1);
      socketClosed = true;
      socket.close();
    });

    // Force close after 5 seconds if no response
    setTimeout(() => {
      if (!socketClosed) {
        console.log('Forcing WebSocket close due to timeout');
        socket.close();
      }
    }, 5000);
  });

  check(response, { 
    'WebSocket connected successfully': (r) => r && r.status === 101 
  });

  // Wait for socket to close but no longer than 5 seconds
  let waited = 0;
  while (!socketClosed && waited < 5) {
    sleep(1);
    waited++;
  }
}