import http from 'k6/http';
import { check, sleep } from 'k6';

const IS_CI = __ENV.CI_MODE === 'true';
const BASE_URL = IS_CI ? 'http://localhost:8888' : 'http://forge-ops.local:8888';

export const options = {
  vus: 1,
  duration: '30s',
  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<500'],
  },
};

export default function () {
  const endpoints = ['/users', '/products', '/orders'];
  for (const path of endpoints) {
    const res = http.get(`${BASE_URL}${path}`);
    check(res, {
      'status is 200': (r) => r.status === 200,
      'response time < 500ms': (r) => r.timings.duration < 500,
    });
    sleep(1);
  }
}