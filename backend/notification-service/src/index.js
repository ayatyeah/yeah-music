const { createServiceApp } = require('@yeahmusic/common/serviceApp');

const PORT = process.env.PORT ? Number(process.env.PORT) : 4006;
const SERVICE = 'notification-service';

const { app } = createServiceApp({ serviceName: SERVICE });

const sent = [];

app.post('/notify', (req, res) => {
  // Accept both "our" notifications and Alertmanager webhook payloads.
  const body = req.body || {};
  const channel = typeof body.channel === 'string' ? body.channel : 'webhook';
  const message =
    typeof body.message === 'string'
      ? body.message
      : Array.isArray(body.alerts)
        ? `ALERTS:${body.alerts.length}`
        : 'event';

  const item = { id: String(sent.length + 1), channel, message, ts: Date.now(), body };
  sent.push(item);
  req.log.info({ item }, 'Notification sent (simulated)');
  res.json({ ok: true, item });
});

app.get('/sent', (req, res) => {
  res.json({ items: sent.slice(-50) });
});

app.get('/alerts', (req, res) => {
  const alerts = sent.filter((x) => x.channel === 'webhook').slice(-50);
  res.json({ items: alerts });
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`${SERVICE} listening on :${PORT}`);
});

