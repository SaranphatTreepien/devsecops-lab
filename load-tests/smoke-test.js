import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE_URL = __ENV.BASE_URL || 'http://forge-ops.local:8888';
const IS_CI = __ENV.BASE_URL !== undefined;

export const options = {
  vus: 1,
  duration: '30s',
  thresholds: {
    http_req_failed: ['rate<0.01'],
    // CI ยิง httpbin.org ช้ากว่า → 2000ms
    // Local ยิง forge-ops.local → 500ms
    http_req_duration: [IS_CI ? 'p(95)<2000' : 'p(95)<500'],
  },
};

const endpoints = IS_CI
  ? ['/get', '/get', '/get']            // httpbin fallback
  : ['/users', '/products', '/orders']; // forge-ops จริง

export default function () {
  for (const path of endpoints) {
    const res = http.get(`${BASE_URL}${path}`);
    check(res, {
      'status is 200': (r) => r.status === 200,
      'response time OK': (r) => r.timings.duration < (IS_CI ? 2000 : 500),
    });
    sleep(1);
  }
}