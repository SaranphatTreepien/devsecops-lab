import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 1,
  duration: '30s',
  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<500'],
  },
};

// Local: ยิงไป forge-ops.local จริง
// CI:    ส่ง BASE_URL=https://httpbin.org ผ่าน env แทน
const BASE_URL = __ENV.BASE_URL || 'http://forge-ops.local:8888';
const IS_CI = __ENV.BASE_URL !== undefined;

const endpoints = IS_CI
  ? ['/get', '/get', '/get']           // httpbin ใช้ /get
  : ['/users', '/products', '/orders']; // forge-ops จริง

export default function () {
  for (const path of endpoints) {
    const res = http.get(`${BASE_URL}${path}`);
    check(res, {
      'status is 200': (r) => r.status === 200,
      'response time < 500ms': (r) => r.timings.duration < 500,
    });
    sleep(1);
  }
}