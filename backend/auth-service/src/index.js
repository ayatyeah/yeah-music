const { createServiceApp } = require('@yeahmusic/common/serviceApp');

const PORT = process.env.PORT ? Number(process.env.PORT) : 4001;
const SERVICE = 'auth-service';

const { app } = createServiceApp({ serviceName: SERVICE });

app.post('/login', (req, res) => {
  const { username = 'demo' } = req.body || {};
  // Minimal demo token (NOT secure) for defense purposes only.
  const token = Buffer.from(`${username}:listener`).toString('base64');
  res.json({ token, role: 'listener', username });
});

app.get('/me', (req, res) => {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  const decoded = token ? Buffer.from(token, 'base64').toString('utf8') : 'anonymous:listener';
  const [username, role] = decoded.split(':');
  res.json({ username, role });
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`${SERVICE} listening on :${PORT}`);
});
