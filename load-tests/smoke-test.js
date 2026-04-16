import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 1,
  duration: '30s',
  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<500'],
  },
}

const BASE_URL = 'http://forge-ops.local:8888';

export default function () {
  const endpoints = [
    `${BASE_URL}/users`,
    `${BASE_URL}/products`,
    `${BASE_URL}/orders`,
  ];

  for (const url of endpoints) {
    const res = http.get(url);
    check(res, {
      'status is 200': (r) => r.status === 200,
      'response time < 500ms': (r) => r.timings.duration < 500,
    });
    sleep(1);
  }
}