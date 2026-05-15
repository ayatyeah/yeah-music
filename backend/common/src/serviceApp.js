const express = require('express');
const pino = require('pino');
const pinoHttp = require('pino-http');

const { createMetrics } = require('./index');

function createServiceApp({ serviceName }) {
  const app = express();
  app.disable('x-powered-by');
  app.use(express.json());

  const logger = pino({ level: process.env.LOG_LEVEL || 'info' });
  app.use(
    pinoHttp({
      logger,
      customLogLevel: function (res, err) {
        if (res.statusCode >= 500 || err) return 'error';
        if (res.statusCode >= 400) return 'warn';
        return 'info';
      }
    })
  );

  const metrics = createMetrics(serviceName);

  const state = {
    degradedUntilMs: 0,
    failMode: 'none' // none | error | latency
  };

  function isDegradedNow() {
    return Date.now() < state.degradedUntilMs && state.failMode !== 'none';
  }

  app.use((req, res, next) => {
    const start = process.hrtime.bigint();
    res.on('finish', () => {
      const route = (req.route && req.route.path) || req.path || 'unknown';
      const seconds = Number(process.hrtime.bigint() - start) / 1e9;
      metrics.httpRequestDurationSeconds
        .labels(serviceName, req.method, route, String(res.statusCode))
        .observe(seconds);
      metrics.httpRequestsTotal
        .labels(serviceName, req.method, route, String(res.statusCode))
        .inc(1);
    });
    next();
  });

  app.get('/healthz', (req, res) => res.status(200).json({ ok: true, service: serviceName }));
  app.get('/readyz', (req, res) => res.status(200).json({ ready: true, service: serviceName }));

  app.get('/metrics', async (req, res) => {
    res.set('Content-Type', metrics.register.contentType);
    res.end(await metrics.register.metrics());
  });

  app.post('/admin/simulate-failure', (req, res) => {
    const { mode = 'error', durationSeconds = 60 } = req.body || {};
    const normalizedMode = mode === 'latency' ? 'latency' : mode === 'none' ? 'none' : 'error';
    state.failMode = normalizedMode;
    state.degradedUntilMs = normalizedMode === 'none' ? 0 : Date.now() + Number(durationSeconds) * 1000;
    metrics.serviceDegraded.labels(serviceName).set(isDegradedNow() ? 1 : 0);
    res.json({ service: serviceName, mode: state.failMode, degradedUntilMs: state.degradedUntilMs });
  });

  app.use(async (req, res, next) => {
    if (!isDegradedNow()) return next();

    metrics.serviceDegraded.labels(serviceName).set(1);
    if (state.failMode === 'latency') {
      const jitter = Math.floor(Math.random() * 400);
      const delay = 800 + jitter;
      await new Promise((r) => setTimeout(r, delay));
      return next();
    }

    res.status(500).json({
      error: 'SIMULATED_INCIDENT',
      service: serviceName
    });
  });

  app.use((err, req, res, next) => {
    req.log.error({ err }, 'Unhandled error');
    res.status(500).json({ error: 'INTERNAL_ERROR', service: serviceName });
  });

  return { app, logger, metrics };
}

module.exports = { createServiceApp };

