const { createServiceApp } = require('@yeahmusic/common/serviceApp');
const { Pool } = require('pg');

const PORT = process.env.PORT ? Number(process.env.PORT) : 4002;
const SERVICE = 'music-service';
const DATABASE_URL =
  process.env.MUSIC_DB_PRIMARY_URL || process.env.MUSIC_DB_URL || 'postgres://music:musicpass@music-db-primary:5432/music';

const { app } = createServiceApp({ serviceName: SERVICE });

const pool = new Pool({ connectionString: DATABASE_URL });

const seedTracks = [
  { id: 't1', title: 'Yeah Vibes', artist: 'YeahAyat', duration: '3:03', durationSec: 183, plays: 0 },
  { id: 't2', title: 'SRE Nights', artist: 'Ops Crew', duration: '3:34', durationSec: 214, plays: 0 },
  { id: 't3', title: 'Latency Dreams', artist: 'Grafana', duration: '3:21', durationSec: 201, plays: 0 }
];

const mapRowToTrack = (row) => ({
  id: row.id,
  title: row.title,
  artist: row.artist,
  artistId: row.artist_id || '',
  genre: row.genre || '',
  album: row.album || '',
  description: row.description || '',
  lyrics: row.lyrics || '',
  cover: row.cover || '',
  audioId: row.audio_id || '',
  duration: row.duration || '',
  durationSec: row.duration_sec ?? null,
  plays: Number(row.plays || 0),
  createdAt: row.created_at,
  updatedAt: row.updated_at
});

const parseDurationToSeconds = (duration) => {
  if (!duration || typeof duration !== 'string') return null;
  const parts = duration.split(':').map((value) => Number(value));
  if (parts.some((value) => Number.isNaN(value))) return null;
  if (parts.length === 2) {
    const [minutes, seconds] = parts;
    return minutes * 60 + seconds;
  }
  if (parts.length === 3) {
    const [hours, minutes, seconds] = parts;
    return hours * 3600 + minutes * 60 + seconds;
  }
  return null;
};

const ensureSchema = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS tracks (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      artist TEXT NOT NULL,
      artist_id TEXT,
      genre TEXT,
      album TEXT,
      description TEXT,
      lyrics TEXT,
      cover TEXT,
      audio_id TEXT,
      duration TEXT,
      duration_sec INTEGER,
      plays INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  const { rowCount } = await pool.query('SELECT 1 FROM tracks LIMIT 1');
  if (rowCount > 0) return;

  for (const track of seedTracks) {
    await pool.query(
      `INSERT INTO tracks (
        id, title, artist, duration, duration_sec, plays, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW()) ON CONFLICT (id) DO NOTHING`,
      [track.id, track.title, track.artist, track.duration, track.durationSec, track.plays]
    );
  }
};

const readAllTracks = async () => {
  const { rows } = await pool.query('SELECT * FROM tracks ORDER BY created_at DESC, id DESC');
  return rows.map(mapRowToTrack);
};

const persistTrack = async (payload, existingId) => {
  const trackId = existingId || payload.id || `tr_${Date.now()}`;
  const plays = Number.isFinite(Number(payload.plays)) ? Number(payload.plays) : 0;
  const durationSec =
    Number.isFinite(Number(payload.durationSec)) && payload.durationSec !== ''
      ? Number(payload.durationSec)
      : parseDurationToSeconds(payload.duration);

  const values = [
    trackId,
    payload.title,
    payload.artist,
    payload.artistId || null,
    payload.genre || null,
    payload.album || null,
    payload.description || null,
    payload.lyrics || null,
    payload.cover || null,
    payload.audioId || null,
    payload.duration || null,
    durationSec,
    plays
  ];

  const { rows } = await pool.query(
    `INSERT INTO tracks (
      id, title, artist, artist_id, genre, album, description, lyrics, cover, audio_id, duration, duration_sec, plays, created_at, updated_at
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW(), NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
      title = EXCLUDED.title,
      artist = EXCLUDED.artist,
      artist_id = EXCLUDED.artist_id,
      genre = EXCLUDED.genre,
      album = EXCLUDED.album,
      description = EXCLUDED.description,
      lyrics = EXCLUDED.lyrics,
      cover = EXCLUDED.cover,
      audio_id = EXCLUDED.audio_id,
      duration = EXCLUDED.duration,
      duration_sec = EXCLUDED.duration_sec,
      plays = EXCLUDED.plays,
      updated_at = NOW()
    RETURNING *`,
    values
  );

  return rows[0] ? mapRowToTrack(rows[0]) : null;
};

app.get('/tracks', async (req, res, next) => {
  try {
    const items = await readAllTracks();
    res.json({ items });
  } catch (error) {
    next(error);
  }
});

app.post('/tracks', async (req, res, next) => {
  try {
    const payload = req.body || {};
    if (!payload.title || !payload.artist) {
      return res.status(400).json({ error: 'VALIDATION_ERROR', message: 'title and artist are required.' });
    }

    // Determine actor / owner from header if present (X-User-Id)
    const actor = req.headers['x-user-id'] || payload.artistId || null;
    if (actor) payload.artistId = actor;

    const track = await persistTrack(payload);
    res.status(201).json({ item: track });
  } catch (error) {
    next(error);
  }
});

app.put('/tracks/:trackId', async (req, res, next) => {
  try {
    const payload = req.body || {};
    // Enforce ownership: caller must be the original artist to update
    const actor = req.headers['x-user-id'] || payload.artistId || null;

    const { rows } = await pool.query('SELECT * FROM tracks WHERE id = $1 LIMIT 1', [req.params.trackId]);
    const existing = rows[0] || null;
    if (existing && existing.artist_id && actor && existing.artist_id !== actor) {
      return res.status(403).json({ error: 'FORBIDDEN', message: 'You are not the owner of this track.' });
    }

    // Preserve artist_id if already set, or set from actor if provided
    if (existing && existing.artist_id) payload.artistId = existing.artist_id;
    else if (actor) payload.artistId = actor;

    const track = await persistTrack(payload, req.params.trackId);
    res.json({ item: track });
  } catch (error) {
    next(error);
  }
});

app.delete('/tracks/:trackId', async (req, res, next) => {
  try {
    const actor = req.headers['x-user-id'] || null;
    const { rows } = await pool.query('SELECT * FROM tracks WHERE id = $1 LIMIT 1', [req.params.trackId]);
    const existing = rows[0] || null;
    if (!existing) return res.status(404).json({ error: 'NOT_FOUND' });
    if (existing.artist_id && actor && existing.artist_id !== actor) {
      return res.status(403).json({ error: 'FORBIDDEN', message: 'You are not the owner of this track.' });
    }

    await pool.query('DELETE FROM tracks WHERE id = $1', [req.params.trackId]);
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

app.get('/stream/:trackId', async (req, res, next) => {
  try {
    const { rows } = await pool.query('SELECT * FROM tracks WHERE id = $1 LIMIT 1', [req.params.trackId]);
    const track = rows[0] ? mapRowToTrack(rows[0]) : null;
    if (!track) return res.status(404).json({ error: 'NOT_FOUND' });
    // Demo stream response (not real audio)
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.send(`STREAM:${track.id}:${track.title}:${track.artist}`);
  } catch (error) {
    next(error);
  }
});

app.use((err, req, res, next) => {
  req.log?.error({ err }, 'Music service error');
  if (res.headersSent) return next(err);
  res.status(500).json({ error: 'INTERNAL_ERROR', service: SERVICE });
});

async function start() {
  await ensureSchema();
  app.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`${SERVICE} listening on :${PORT}`);
  });
}

start().catch((error) => {
  // eslint-disable-next-line no-console
  console.error(`${SERVICE} failed to start`, error);
  process.exit(1);
});

