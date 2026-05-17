const { createServiceApp } = require('@yeahmusic/common/serviceApp');
const { createProxyMiddleware } = require('http-proxy-middleware');
const jwt = require('jsonwebtoken');

const PORT = process.env.PORT ? Number(process.env.PORT) : 4010;
const SERVICE = 'api-gateway';

const AUTH_URL = process.env.AUTH_URL || 'http://auth-service:4001';
const MUSIC_URL = process.env.MUSIC_URL || 'http://music-service:4002';
const UPLOAD_URL = process.env.UPLOAD_URL || 'http://upload-service:4004';
const ANALYTICS_URL = process.env.ANALYTICS_URL || 'http://analytics-service:4005';
const NOTIFY_URL = process.env.NOTIFY_URL || 'http://notification-service:4006';
const JWT_SECRET = process.env.AUTH_JWT_SECRET || process.env.JWT_SECRET || 'dev-secret-change-me';

const { app } = createServiceApp({ serviceName: SERVICE });

app.use((req, res, next) => {
  if (req.path.startsWith('/music') || req.path.startsWith('/playlists')) {
    delete req.headers['if-none-match'];
    delete req.headers['if-modified-since'];
    res.setHeader('Cache-Control', 'no-store');
  }
  next();
});

// When express.json() runs before the proxy, the request body stream is consumed.
// Add `onProxyReq` to copy the parsed body back into the proxied request so
// upstream services receive the JSON payload and Content-Length header.
function proxyOptions(target, prefix) {
  const options = {
    target,
    changeOrigin: true,
    on: {
      proxyReq(proxyReq, req, res) {
        try {
          if (req.user) {
            proxyReq.setHeader('X-User-Id', req.user.id);
            proxyReq.setHeader('X-User-Role', req.user.role);
            proxyReq.setHeader('X-Username', req.user.username || '');
          }
          if (!req.body || !Object.keys(req.body).length) return;
          const bodyData = JSON.stringify(req.body);
          proxyReq.setHeader('Content-Type', 'application/json');
          proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
          proxyReq.write(bodyData);
        } catch (e) {
          // best-effort; don't crash the gateway
          req.log && req.log.warn({ err: e }, 'Failed to write proxied body');
        }
      }
    }
  };
  if (prefix) options.pathRewrite = { [`^/${prefix}`]: '' };
  return options;
}

function optionalAuth(req, res, next) {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  if (!token) return next();

  try {
    req.user = jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return res.status(401).json({ error: 'INVALID_TOKEN' });
  }
  return next();
}

function requireArtistForMusicWrites(req, res, next) {
  const isMutation = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method);
  if (!isMutation) return next();
  if (!req.user) return res.status(401).json({ error: 'UNAUTHORIZED', message: 'Authentication is required.' });
  if (req.user.role !== 'artist') {
    return res.status(403).json({ error: 'ARTIST_ROLE_REQUIRED', message: 'Only artists can upload or modify tracks.' });
  }
  return next();
}

app.get('/', (req, res) => {
  res.json({
    ok: true,
    service: SERVICE,
    routes: [
      '/auth/*',
      '/music/*',
      '/playlists/*',
      '/uploads/*',
      '/analytics/*',
      '/notify/*'
    ]
  });
});

app.use('/auth', createProxyMiddleware(proxyOptions(AUTH_URL, 'auth')));
app.use('/music', optionalAuth, requireArtistForMusicWrites, createProxyMiddleware(proxyOptions(MUSIC_URL, 'music')));
app.use(
  '/playlists',
  optionalAuth,
  (req, res, next) => {
    req.url = `/playlists${req.url === '/' ? '' : req.url}`;
    next();
  },
  createProxyMiddleware(proxyOptions(MUSIC_URL))
);
app.use('/uploads', optionalAuth, requireArtistForMusicWrites, createProxyMiddleware(proxyOptions(UPLOAD_URL, 'uploads')));
app.use('/analytics', optionalAuth, createProxyMiddleware(proxyOptions(ANALYTICS_URL, 'analytics')));
app.use('/notify', optionalAuth, createProxyMiddleware(proxyOptions(NOTIFY_URL, 'notify')));

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`${SERVICE} listening on :${PORT}`);
});

