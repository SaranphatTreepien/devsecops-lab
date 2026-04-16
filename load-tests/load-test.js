import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

const errorRate = new Rate('errors');
const userDuration = new Trend('user_service_duration');
const productDuration = new Trend('product_service_duration');
const orderDuration = new Trend('order_service_duration');

export const options = {
  stages: [
    { duration: '1m', target: 10 },   // ramp-up → 10 users
    { duration: '3m', target: 10 },   // stay at 10 users
    { duration: '1m', target: 0 },    // ramp-down
  ],
  thresholds: {
    http_req_failed:          ['rate<0.01'],       // error < 1%
    http_req_duration:        ['p(95)<1000'],      // 95% req < 1s
    user_service_duration:    ['p(95)<800'],
    product_service_duration: ['p(95)<800'],
    order_service_duration:   ['p(95)<1000'],
  },
};

const BASE_URL = 'http://forge-ops.local:8888';

export default function () {
  // User Service
  let res = http.get(`${BASE_URL}/users`);
  check(res, { 'users 200': (r) => r.status === 200 });
  errorRate.add(res.status !== 200);
  userDuration.add(res.timings.duration);
  sleep(0.5);

  // Product Service
  res = http.get(`${BASE_URL}/products`);
  check(res, { 'products 200': (r) => r.status === 200 });
  errorRate.add(res.status !== 200);
  productDuration.add(res.timings.duration);
  sleep(0.5);

  // Order Service
  res = http.get(`${BASE_URL}/orders`);
  check(res, { 'orders 200': (r) => r.status === 200 });
  errorRate.add(res.status !== 200);
  orderDuration.add(res.timings.duration);
  sleep(1);
}