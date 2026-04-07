const express = require('express');
const client = require('prom-client');

const app = express();
const register = new client.Registry();
client.collectDefaultMetrics({ register });

const requestCount = new client.Counter({
  name: 'product_service_requests_total',
  help: 'Total requests',
  labelNames: ['endpoint'],
  registers: [register],
});

app.get('/health', (req, res) => {
  requestCount.labels('/health').inc();
  res.json({ status: 'ok', service: 'product-service' });
});

app.get('/products', (req, res) => {
  requestCount.labels('/products').inc();
  res.json([
    { id: 1, name: 'Laptop', price: 999 },
    { id: 2, name: 'Mouse', price: 29 }
  ]);
});

app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

app.listen(3000, () => console.log('product-service running on port 3000'));