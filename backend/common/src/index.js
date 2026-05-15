const client = require('prom-client');

function createMetrics(serviceName) {
  const register = new client.Registry();
  client.collectDefaultMetrics({ register, prefix: 'node_' });

  const httpRequestDurationSeconds = new client.Histogram({
    name: 'http_request_duration_seconds',
    help: 'Duration of HTTP requests in seconds',
    labelNames: ['service', 'method', 'route', 'status_code'],
    buckets: [0.01, 0.025, 0.05, 0.1, 0.2, 0.5, 1, 2, 5]
  });

  const httpRequestsTotal = new client.Counter({
    name: 'http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['service', 'method', 'route', 'status_code']
  });

  const serviceDegraded = new client.Gauge({
    name: 'service_degraded',
    help: 'Whether the service is intentionally degraded (incident simulation)',
    labelNames: ['service']
  });

  register.registerMetric(httpRequestDurationSeconds);
  register.registerMetric(httpRequestsTotal);
  register.registerMetric(serviceDegraded);

  serviceDegraded.labels(serviceName).set(0);

  return {
    client,
    register,
    httpRequestDurationSeconds,
    httpRequestsTotal,
    serviceDegraded
  };
}

module.exports = { createMetrics };

