import http from 'k6/http';
import { sleep, check } from 'k6';

export const options = {
  vus: 10, // 100 virtual users
  duration: '2m', // Test duration
};

export default function () {
  const response = http.get('http://b80ogwo84s0kggkkscssgwwc.143.198.70.30.sslip.io');
  
  check(response, {
    'is status 200': (r) => r.status === 200,
    'transaction time < 200ms': (r) => r.timings.duration < 200,
  });

  sleep(1); // Wait 1 second before next iteration
}