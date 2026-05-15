import { X } from 'lucide-react';
import { useEffect, useMemo, useRef } from 'react';
import { usePlayerStore } from '../../store/usePlayerStore';
import { getTrackCover } from '../../utils/cover';
import { getActiveLyricIndex, parseLyrics } from '../../utils/lyrics';

export default function LyricsOverlay() {
  const { currentTrack, currentTime, showLyrics, closeLyrics, seekTo } = usePlayerStore();
  const activeLineRef = useRef(null);
  const parsed = useMemo(() => parseLyrics(currentTrack?.lyrics), [currentTrack?.lyrics]);
  const activeIndex = parsed.isTimed ? getActiveLyricIndex(parsed.lines, currentTime) : -1;

  useEffect(() => {
    if (!showLyrics || !activeLineRef.current) return;
    activeLineRef.current.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    });
  }, [activeIndex, showLyrics]);

  if (!showLyrics || !currentTrack) return null;

  const hasLyrics = parsed.lines.length > 0;

  return (
    <div className="fixed inset-0 z-40 bg-[#0b0b0b]/95 backdrop-blur-xl pb-24">
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between gap-4 px-6 py-4 border-b border-white/10">
          <div className="flex items-center gap-3 min-w-0">
            <img src={getTrackCover(currentTrack)} alt="" className="w-12 h-12 rounded-md object-cover" />
            <div className="min-w-0">
              <p className="text-white font-semibold truncate">{currentTrack.title}</p>
              <p className="text-gray-400 text-sm truncate">{currentTrack.artist}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={closeLyrics}
            className="w-10 h-10 rounded-lg bg-white/10 text-white inline-flex items-center justify-center hover:bg-white/15"
            aria-label="Close lyrics"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar px-5 py-8">
          <div className="mx-auto w-full max-w-3xl min-h-full flex flex-col justify-center gap-2">
            {!hasLyrics && (
              <p className="text-center text-gray-500 text-lg font-semibold">No lyrics added yet.</p>
            )}

            {parsed.isTimed
              ? parsed.lines.map((line, index) => {
                  const isActive = index === activeIndex;
                  return (
                    <button
                      type="button"
                      key={`${line.time}-${index}`}
                      ref={isActive ? activeLineRef : null}
                      onClick={() => seekTo(line.time)}
                      className={`w-full text-left px-4 py-3 rounded-lg text-lg md:text-2xl font-black leading-relaxed transition-all ${
                        isActive
                          ? 'bg-white/10 text-white scale-[1.02] opacity-100'
                          : 'text-gray-400 opacity-70 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      {line.text}
                    </button>
                  );
                })
              : parsed.lines.map((line, index) => (
                  <p
                    key={`${line}-${index}`}
                    className="px-4 py-2 text-lg md:text-2xl font-bold leading-relaxed text-gray-300"
                  >
                    {line}
                  </p>
                ))}
          </div>
        </div>
      </div>
    </div>
  );
}
