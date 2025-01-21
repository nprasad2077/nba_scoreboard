import http from 'k6/http';
import { check, sleep } from 'k6';

const FRONTEND_URL = __ENV.FRONTEND_URL;

export const options = {
  stages: [
    { duration: '30s', target: 50 },  // Ramp up to 50 users
    { duration: '1m', target: 50 },  // Stay at 50 users
    { duration: '30s', target: 0 },   // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<1000'], // 95% of requests should be below 1s
    http_req_failed: ['rate<0.01'],    // Less than 1% can fail
  },
};

export default function () {
  // Test main page load
  const mainPage = http.get(FRONTEND_URL);
  check(mainPage, {
    'main page status is 200': (r) => r.status === 200,
    'main page loads under 1s': (r) => r.timings.duration < 1000,
  });

  sleep(2) // Sleep for 2 secs after main page loads

  // Test static assets (if applicable)
  const assets = http.batch([
    ['GET', `${FRONTEND_URL}/static/js/main.js`],
    ['GET', `${FRONTEND_URL}/static/css/main.css`],
  ]);

  assets.forEach((res, index) => {
    check(res, {
      [`asset ${index} status is 200`]: (r) => r.status === 200,
    });
  });

  sleep(2);
}