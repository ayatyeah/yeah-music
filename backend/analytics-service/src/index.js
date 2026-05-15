const { createServiceApp } = require('@yeahmusic/common/serviceApp');

const PORT = process.env.PORT ? Number(process.env.PORT) : 4005;
const SERVICE = 'analytics-service';

const { app } = createServiceApp({ serviceName: SERVICE });

const counters = {
  plays: 0,
  uploads: 0
};

app.post('/event', (req, res) => {
  const { type } = req.body || {};
  if (type === 'play') counters.plays += 1;
  if (type === 'upload') counters.uploads += 1;
  res.json({ ok: true, counters });
});

app.get('/stats', (req, res) => {
  res.json({ counters });
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`${SERVICE} listening on :${PORT}`);
});

