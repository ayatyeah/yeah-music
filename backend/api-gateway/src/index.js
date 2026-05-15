const { createServiceApp } = require('@yeahmusic/common/serviceApp');
const { createProxyMiddleware } = require('http-proxy-middleware');

const PORT = process.env.PORT ? Number(process.env.PORT) : 4010;
const SERVICE = 'api-gateway';

const AUTH_URL = process.env.AUTH_URL || 'http://auth-service:4001';
const MUSIC_URL = process.env.MUSIC_URL || 'http://music-service:4002';
const PLAYLIST_URL = process.env.PLAYLIST_URL || 'http://playlist-service:4003';
const UPLOAD_URL = process.env.UPLOAD_URL || 'http://upload-service:4004';
const ANALYTICS_URL = process.env.ANALYTICS_URL || 'http://analytics-service:4005';
const NOTIFY_URL = process.env.NOTIFY_URL || 'http://notification-service:4006';

const { app } = createServiceApp({ serviceName: SERVICE });

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

app.use('/auth', createProxyMiddleware({ target: AUTH_URL, changeOrigin: true, pathRewrite: { '^/auth': '' } }));
app.use('/music', createProxyMiddleware({ target: MUSIC_URL, changeOrigin: true, pathRewrite: { '^/music': '' } }));
app.use(
  '/playlists',
  createProxyMiddleware({ target: PLAYLIST_URL, changeOrigin: true, pathRewrite: { '^/playlists': '' } })
);
app.use(
  '/uploads',
  createProxyMiddleware({ target: UPLOAD_URL, changeOrigin: true, pathRewrite: { '^/uploads': '' } })
);
app.use(
  '/analytics',
  createProxyMiddleware({ target: ANALYTICS_URL, changeOrigin: true, pathRewrite: { '^/analytics': '' } })
);
app.use('/notify', createProxyMiddleware({ target: NOTIFY_URL, changeOrigin: true, pathRewrite: { '^/notify': '' } }));

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`${SERVICE} listening on :${PORT}`);
});

