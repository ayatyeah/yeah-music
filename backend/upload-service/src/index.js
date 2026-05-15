const { createServiceApp } = require('@yeahmusic/common/serviceApp');

const PORT = process.env.PORT ? Number(process.env.PORT) : 4004;
const SERVICE = 'upload-service';

const { app } = createServiceApp({ serviceName: SERVICE });

let queueDepth = 0;

app.get('/queue', (req, res) => {
  res.json({ depth: queueDepth });
});

app.post('/upload', async (req, res) => {
  queueDepth += 1;
  // Simulate async processing
  setTimeout(() => {
    queueDepth = Math.max(0, queueDepth - 1);
  }, 2000 + Math.floor(Math.random() * 2000));

  res.status(202).json({ accepted: true, queued: true });
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`${SERVICE} listening on :${PORT}`);
});

