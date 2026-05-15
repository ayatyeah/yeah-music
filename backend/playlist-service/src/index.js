const { createServiceApp } = require('@yeahmusic/common/serviceApp');

const PORT = process.env.PORT ? Number(process.env.PORT) : 4003;
const SERVICE = 'playlist-service';

const { app } = createServiceApp({ serviceName: SERVICE });

const playlists = [
  { id: 'p1', name: 'SRE Focus', trackIds: ['t2', 't3'] },
  { id: 'p2', name: 'Daily Mix', trackIds: ['t1', 't2'] }
];

app.get('/playlists', (req, res) => {
  res.json({ items: playlists });
});

app.post('/playlists/:id/tracks', (req, res) => {
  const pl = playlists.find((p) => p.id === req.params.id);
  if (!pl) return res.status(404).json({ error: 'NOT_FOUND' });
  const { trackId } = req.body || {};
  if (!trackId) return res.status(400).json({ error: 'trackId_required' });
  pl.trackIds.push(String(trackId));
  res.json({ ok: true, playlist: pl });
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`${SERVICE} listening on :${PORT}`);
});

