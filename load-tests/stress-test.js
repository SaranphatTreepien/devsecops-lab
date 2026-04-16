import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

const errorRate = new Rate('errors');

export const options = {
  stages: [
    { duration: '2m', target: 20 },   // ramp-up
    { duration: '5m', target: 20 },   // hold
    { duration: '2m', target: 50 },   // spike
    { duration: '5m', target: 50 },   // hold at spike
    { duration: '2m', target: 0 },    // ramp-down
  ],
  thresholds: {
    http_req_failed:   ['rate<0.05'],   // ยอมให้ error ได้ 5% ตอน stress
    http_req_duration: ['p(95)<3000'],  // 95% req < 3s
  },
};

const BASE_URL = 'http://forge-ops.local:8888';

export default function () {
  const res = http.get(`${BASE_URL}/users`);
  check(res, { 'status 200': (r) => r.status === 200 });
  errorRate.add(res.status !== 200);
  sleep(0.3);
}