const escapeXml = (value) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const buildCover = (title = 'YeahMusic', subtitle = '') => {
  const safeTitle = escapeXml(title.slice(0, 24));
  const safeSubtitle = escapeXml(subtitle.slice(0, 24));
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#121212" />
      <stop offset="100%" stop-color="#1b1b1b" />
    </linearGradient>
  </defs>
  <rect width="300" height="300" fill="url(#g)" />
  <rect x="24" y="24" width="252" height="252" rx="24" fill="#0f0f0f" stroke="#2a2a2a" />
  <text x="40" y="140" font-family="Arial, sans-serif" font-size="24" fill="#1ED760" font-weight="700">${safeTitle}</text>
  <text x="40" y="175" font-family="Arial, sans-serif" font-size="14" fill="#9CA3AF">${safeSubtitle}</text>
</svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

export const getTrackCover = (track) => {
  if (track?.cover) return track.cover;
  return buildCover(track?.title || 'Untitled', track?.artist || '');
};

export const getPlaylistCover = (playlist) => {
  if (playlist?.cover) return playlist.cover;
  return buildCover(playlist?.name || 'Playlist', 'YeahMusic');
};
