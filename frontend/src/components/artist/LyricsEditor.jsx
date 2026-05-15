import { Pause, Play, Save, TimerReset } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { buildTimedLyrics, formatLyricTimestamp, parseLyrics } from '../../utils/lyrics';

const splitLines = (text) => String(text || '').split(/\r?\n/).filter((line) => line.trim());

const stripTimeTags = (text) =>
  String(text || '')
    .split(/\r?\n/)
    .map((line) => line.replace(/^\[\d{1,2}:\d{2}(?:\.\d{1,2})?\]\s*/, ''))
    .join('\n');

const readExistingTimes = (text) => {
  const parsed = parseLyrics(text);
  return parsed.isTimed ? parsed.lines.map((line) => line.time) : [];
};

export default function LyricsEditor({ value, onChange, audioSrc, compact = false }) {
  const audioRef = useRef(null);
  const activePreviewRef = useRef(null);
  const onChangeRef = useRef(onChange);
  const [rawLyrics, setRawLyrics] = useState(() => stripTimeTags(value));
  const [times, setTimes] = useState(() => readExistingTimes(value));
  const [tapIndex, setTapIndex] = useState(0);
  const [isTapping, setIsTapping] = useState(false);
  const [isPreviewPlaying, setIsPreviewPlaying] = useState(false);
  const [previewTime, setPreviewTime] = useState(0);

  const lines = useMemo(() => splitLines(rawLyrics), [rawLyrics]);
  const timedLyrics = useMemo(() => buildTimedLyrics(lines, times), [lines, times]);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  const tapLine = useCallback(() => {
    if (!lines.length || tapIndex >= lines.length) return;
    const audio = audioRef.current;
    const currentTime = audio?.currentTime || 0;

    setTimes((prev) => {
      const next = [...prev];
      next[tapIndex] = currentTime;
      return next;
    });
    setTapIndex((prev) => {
      const next = prev + 1;
      if (next >= lines.length) {
        setIsTapping(false);
        return lines.length;
      }
      return next;
    });
  }, [lines.length, tapIndex]);

  useEffect(() => {
    onChangeRef.current(timedLyrics || rawLyrics);
  }, [rawLyrics, timedLyrics]);

  useEffect(() => {
    if (!isTapping) return undefined;

    const handleKeyDown = (event) => {
      if (event.code !== 'Space') return;
      event.preventDefault();
      tapLine();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isTapping, tapLine]);

  useEffect(() => {
    if (!activePreviewRef.current) return;
    activePreviewRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [tapIndex]);

  const togglePreview = () => {
    const audio = audioRef.current;
    if (!audio || !audioSrc) return;

    if (audio.paused) {
      audio.play().then(() => setIsPreviewPlaying(true)).catch(() => setIsPreviewPlaying(false));
    } else {
      audio.pause();
      setIsPreviewPlaying(false);
    }
  };

  const startTapping = () => {
    const audio = audioRef.current;

    if (isTapping) {
      setIsTapping(false);
      return;
    }

    setTapIndex(0);
    setIsTapping(true);

    if (audio && audioSrc && audio.paused) {
      audio.play().then(() => setIsPreviewPlaying(true)).catch(() => setIsPreviewPlaying(false));
    }
  };

  const resetTaps = () => {
    setTimes([]);
    setTapIndex(0);
    setIsTapping(false);
  };

  const handleRawChange = (nextValue) => {
    setRawLyrics(nextValue);
    setTimes((prev) => prev.slice(0, splitLines(nextValue).length));
    setTapIndex(0);
  };

  const handleTimedChange = (nextValue) => {
    setRawLyrics(stripTimeTags(nextValue));
    setTimes(readExistingTimes(nextValue));
    onChange(nextValue);
  };

  return (
    <div className="space-y-4">
      {audioSrc && (
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={togglePreview}
            className="w-10 h-10 rounded-lg bg-white text-black inline-flex items-center justify-center"
            aria-label={isPreviewPlaying ? 'Pause lyric timing preview' : 'Play lyric timing preview'}
          >
            {isPreviewPlaying ? <Pause size={18} fill="black" /> : <Play size={18} fill="black" />}
          </button>
          <audio
            ref={audioRef}
            src={audioSrc}
            onTimeUpdate={(event) => setPreviewTime(event.currentTarget.currentTime)}
            onPause={() => setIsPreviewPlaying(false)}
            onEnded={() => {
              setIsPreviewPlaying(false);
              setIsTapping(false);
            }}
          />
          <span className="w-12 text-xs font-mono text-gray-400">{formatLyricTimestamp(previewTime)}</span>
          <button
            type="button"
            onClick={startTapping}
            disabled={!lines.length}
            className={`px-4 py-2 rounded-lg text-sm font-bold disabled:opacity-50 ${
              isTapping ? 'bg-yeah-accent text-black' : 'bg-[#242424] text-white'
            }`}
          >
            {isTapping ? 'Tapping' : 'Start Tap'}
          </button>
          <button
            type="button"
            onClick={tapLine}
            disabled={!isTapping || !lines.length || tapIndex >= lines.length}
            className="w-10 h-10 rounded-lg bg-[#242424] text-white inline-flex items-center justify-center disabled:opacity-50"
            aria-label="Tap current lyric line"
          >
            <Save size={17} />
          </button>
          <button
            type="button"
            onClick={resetTaps}
            className="w-10 h-10 rounded-lg bg-[#242424] text-gray-300 inline-flex items-center justify-center"
            aria-label="Reset lyric timings"
          >
            <TimerReset size={17} />
          </button>
        </div>
      )}

      <div className={`grid grid-cols-1 ${compact ? '' : 'xl:grid-cols-2'} gap-4`}>
        <div>
          <label className="text-xs uppercase text-gray-500">Lyrics</label>
          <textarea
            value={rawLyrics}
            onChange={(event) => handleRawChange(event.target.value)}
            rows={compact ? 8 : 12}
            className="mt-2 w-full resize-none bg-[#1c1c1c] text-white rounded-lg px-3 py-3 border border-gray-800 focus:border-yeah-accent outline-none leading-relaxed"
            placeholder="First line&#10;Second line&#10;Third line"
          />
        </div>

        <div>
          <label className="text-xs uppercase text-gray-500">Timed Preview</label>
          <div className="mt-2 h-72 overflow-y-auto no-scrollbar rounded-lg border border-gray-800 bg-[#101010] p-3">
            {lines.length === 0 ? (
              <p className="text-gray-600 text-sm">No lines yet.</p>
            ) : (
              lines.map((line, index) => (
                <div
                  key={`${line}-${index}`}
                  ref={index === tapIndex ? activePreviewRef : null}
                  className={`flex items-start gap-3 rounded-lg px-3 py-2 transition-all ${
                    index === tapIndex && isTapping ? 'bg-white/10 text-white' : 'text-gray-400'
                  }`}
                >
                  <span className="w-12 shrink-0 text-xs text-gray-500 pt-1">
                    {times[index] == null ? '--:--' : formatLyricTimestamp(times[index])}
                  </span>
                  <span className="text-sm leading-relaxed">{line}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div>
        <label className="text-xs uppercase text-gray-500">Saved Format</label>
        <textarea
          value={timedLyrics || rawLyrics}
          onChange={(event) => handleTimedChange(event.target.value)}
          rows={5}
          className="mt-2 w-full resize-none bg-[#101010] text-gray-300 rounded-lg px-3 py-3 border border-gray-800 focus:border-yeah-accent outline-none font-mono text-xs leading-relaxed"
        />
      </div>
    </div>
  );
}
