const TIMED_LINE_RE = /^\[(\d{1,2}):(\d{2})(?:\.(\d{1,2}))?\]\s*(.*)$/;

export const parseLyrics = (text = '') => {
  const lines = String(text || '').split(/\r?\n/);
  const timed = lines
    .map((line) => {
      const match = line.match(TIMED_LINE_RE);
      if (!match) return null;

      const minutes = Number(match[1]);
      const seconds = Number(match[2]);
      const fraction = match[3] ? Number(`0.${match[3]}`) : 0;

      return {
        time: minutes * 60 + seconds + fraction,
        text: match[4]?.trim() || '♫',
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.time - b.time);

  if (timed.length > 0) {
    return { isTimed: true, lines: timed };
  }

  return {
    isTimed: false,
    lines: lines.map((line) => line.trim()).filter(Boolean),
  };
};

export const getActiveLyricIndex = (lines, currentTime) => {
  let activeIndex = -1;

  for (let index = 0; index < lines.length; index += 1) {
    if (currentTime >= lines[index].time) {
      activeIndex = index;
    } else {
      break;
    }
  }

  return activeIndex;
};

export const formatLyricTimestamp = (time) => {
  const safeTime = Math.max(0, Number(time) || 0);
  const minutes = Math.floor(safeTime / 60);
  const seconds = Math.floor(safeTime % 60);

  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

export const buildTimedLyrics = (lines, times) =>
  lines
    .map((line, index) => {
      const text = line.trim();
      if (!text) return '';

      const time = times[index];
      return time == null ? text : `[${formatLyricTimestamp(time)}] ${text}`;
    })
    .filter(Boolean)
    .join('\n');
