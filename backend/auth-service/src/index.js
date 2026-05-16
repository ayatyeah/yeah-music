const { createServiceApp } = require('@yeahmusic/common/serviceApp');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const PORT = process.env.PORT ? Number(process.env.PORT) : 4001;
const SERVICE = 'auth-service';
const DATABASE_URL =
  process.env.AUTH_DATABASE_URL ||
  process.env.AUTH_DB_URL ||
  process.env.DATABASE_URL ||
  'postgres://auth:authpass@auth-db:5432/auth';
const JWT_SECRET = process.env.AUTH_JWT_SECRET || process.env.JWT_SECRET || 'dev-secret-change-me';

const { app } = createServiceApp({ serviceName: SERVICE });
const pool = new Pool({ connectionString: DATABASE_URL });

const ensureSchema = async () => {
  await pool.query('CREATE EXTENSION IF NOT EXISTS pgcrypto');
  const { rows: idColumns } = await pool.query(`
    SELECT data_type
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'id'
    LIMIT 1
  `);

  if (idColumns[0] && idColumns[0].data_type !== 'uuid') {
    await pool.query('BEGIN');
    try {
      await pool.query('ALTER TABLE users RENAME TO users_legacy_int_id');
      await pool.query(`
        CREATE TABLE users (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          username TEXT NOT NULL,
          email TEXT NOT NULL UNIQUE,
          password_hash TEXT NOT NULL,
          role TEXT NOT NULL DEFAULT 'listener',
          avatar TEXT,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `);
      await pool.query(`
        INSERT INTO users (username, email, password_hash, role, avatar, created_at)
        SELECT username, email, password_hash, role, avatar, created_at
        FROM users_legacy_int_id
        ON CONFLICT (email) DO NOTHING
      `);
      await pool.query('DROP TABLE users_legacy_int_id');
      await pool.query('COMMIT');
    } catch (error) {
      await pool.query('ROLLBACK');
      throw error;
    }
  }

  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      username TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'listener',
      avatar TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
};

const sanitizeUser = (row) => ({
  id: String(row.id),
  username: row.username,
  email: row.email,
  role: row.role,
  avatar: row.avatar || null,
  createdAt: row.created_at
});

const signToken = (user) => {
  return jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, {
    expiresIn: '7d'
  });
};

app.post('/register', async (req, res, next) => {
  try {
    const { username, email, password, role = 'listener', avatar = null } = req.body || {};
    if (!email || !password || !username) return res.status(400).json({ error: 'VALIDATION_ERROR', message: 'username, email and password required' });

    const { rows: exists } = await pool.query('SELECT id FROM users WHERE email = $1 LIMIT 1', [email]);
    if (exists.length > 0) return res.status(409).json({ error: 'ALREADY_EXISTS', message: 'Email already registered' });

    const password_hash = await bcrypt.hash(password, 10);
    const { rows } = await pool.query(
      'INSERT INTO users (username, email, password_hash, role, avatar) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [username, email, password_hash, role, avatar]
    );

    const user = sanitizeUser(rows[0]);
    const token = signToken(user);
    res.status(201).json({ user, token });
  } catch (error) {
    next(error);
  }
});

app.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: 'VALIDATION_ERROR', message: 'email and password required' });

    const { rows } = await pool.query('SELECT * FROM users WHERE email = $1 LIMIT 1', [email]);
    const userRow = rows[0];
    if (!userRow) return res.status(401).json({ error: 'INVALID_CREDENTIALS' });

    const ok = await bcrypt.compare(password, userRow.password_hash);
    if (!ok) return res.status(401).json({ error: 'INVALID_CREDENTIALS' });

    const user = sanitizeUser(userRow);
    const token = signToken(user);
    res.json({ user, token });
  } catch (error) {
    next(error);
  }
});

app.get('/me', async (req, res, next) => {
  try {
    const auth = req.headers.authorization || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
    if (!token) return res.status(401).json({ error: 'UNAUTHORIZED' });

    let payload;
    try {
      payload = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ error: 'INVALID_TOKEN' });
    }

    const { rows } = await pool.query('SELECT * FROM users WHERE id = $1 LIMIT 1', [payload.id]);
    if (!rows[0]) return res.status(404).json({ error: 'NOT_FOUND' });
    const user = sanitizeUser(rows[0]);
    res.json({ user });
  } catch (error) {
    next(error);
  }
});

app.use((err, req, res, next) => {
  try {
    if (req && req.log && typeof req.log.error === 'function') req.log.error({ err }, 'Auth service error');
  } catch (e) {
    // ignore logging errors
  }
  // always print to console for debugging so we see the stack in container logs
  // eslint-disable-next-line no-console
  console.error('Auth service unhandled error:', err);
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
