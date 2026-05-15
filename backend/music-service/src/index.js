const { createServiceApp } = require('@yeahmusic/common/serviceApp');

const PORT = process.env.PORT ? Number(process.env.PORT) : 4002;
const SERVICE = 'music-service';

const { app } = createServiceApp({ serviceName: SERVICE });

const tracks = [
  { id: 't1', title: 'Yeah Vibes', artist: 'YeahAyat', durationSec: 183 },
  { id: 't2', title: 'SRE Nights', artist: 'Ops Crew', durationSec: 214 },
  { id: 't3', title: 'Latency Dreams', artist: 'Grafana', durationSec: 201 }
];

app.get('/tracks', (req, res) => {
  res.json({ items: tracks });
});

app.get('/stream/:trackId', (req, res) => {
  const track = tracks.find((t) => t.id === req.params.trackId);
  if (!track) return res.status(404).json({ error: 'NOT_FOUND' });
  // Demo stream response (not real audio)
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.send(`STREAM:${track.id}:${track.title}:${track.artist}`);
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`${SERVICE} listening on :${PORT}`);
});

