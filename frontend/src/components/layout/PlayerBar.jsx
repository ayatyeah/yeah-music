import { Play, Pause, SkipBack, SkipForward, Volume2, Heart, Repeat, Shuffle, Mic2 } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { usePlayerStore } from '../../store/usePlayerStore';
import { useDataStore } from '../../store/useDataStore';
import { formatSeconds, parseDurationToSeconds } from '../../utils/time';
import { useNotificationStore } from '../../store/useNotificationStore';
import { getAudioBlob } from '../../services/localMedia';
import { getTrackCover } from '../../utils/cover';

const STREAM_THRESHOLD_SECONDS = 30;

export default function PlayerBar() {
  const {
    currentTrack,
    isPlaying,
    togglePlay,
    nextTrack,
    previousTrack,
    volume,
    setVolume,
    progress,
    setProgress,
    setPlaybackTime,
    setDuration,
    seekTarget,
    clearSeekTarget,
    toggleLyrics,
    showLyrics,
    shuffle,
    toggleShuffle,
    repeatMode,
    cycleRepeat,
    playTrack,
    queue,
  } = usePlayerStore();
  const { likedSongs, likeTrack, addToHistory, incrementPlays } = useDataStore();
  const addToast = useNotificationStore((state) => state.addToast);
  const audioRef = useRef(null);
  const audioUrlRef = useRef(null);
  const streamCountedRef = useRef(false);
  const listenedSecondsRef = useRef(0);
  const lastPlaybackPositionRef = useRef(null);
  const isSeekingRef = useRef(false);
  const [audioDuration, setAudioDuration] = useState(0);

  const durationSeconds = useMemo(
    () => parseDurationToSeconds(currentTrack?.duration),
    [currentTrack]
  );

  const resetStreamSession = useCallback((position = 0) => {
    streamCountedRef.current = false;
    listenedSecondsRef.current = 0;
    lastPlaybackPositionRef.current = position;
  }, []);

  useEffect(() => {
    if (currentTrack) addToHistory(currentTrack);
    resetStreamSession(0);
  }, [currentTrack, addToHistory, resetStreamSession]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;

    const loadSource = async () => {
      if (audioUrlRef.current) {
        URL.revokeObjectURL(audioUrlRef.current);
        audioUrlRef.current = null;
      }

      let source = currentTrack.audioUrl || currentTrack.previewUrl;
      if (!source && currentTrack.audioId) {
        const blob = await getAudioBlob(currentTrack.audioId);
        if (blob) {
          source = URL.createObjectURL(blob);
          audioUrlRef.current = source;
        }
      }

      if (!source) {
        addToast({
          type: 'error',
          title: 'Playback error',
          message: 'No audio source found for this track.',
        });
        return;
      }

      audio.pause();
      audio.src = source;
      audio.currentTime = 0;
      audio.load();
      setProgress(0);
    };

    loadSource();

    return () => {
      if (audioUrlRef.current) {
        URL.revokeObjectURL(audioUrlRef.current);
        audioUrlRef.current = null;
      }
    };
  }, [currentTrack, setProgress, addToast]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;

    const handleCanPlay = () => {
      if (isPlaying) {
        audio.play().catch(() => {
          addToast({
            type: 'warning',
            title: 'Tap to play',
            message: 'Browser blocked autoplay. Press play to start audio.',
          });
        });
      }
    };

    const handleError = () => {
      addToast({
        type: 'error',
        title: 'Playback failed',
        message: 'Audio failed to load. Try another track.',
      });
    };

    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('error', handleError);
    };
  }, [currentTrack, isPlaying, addToast]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;
    if (isPlaying) {
      audio.play().catch(() => {
        addToast({
          type: 'warning',
          title: 'Tap to play',
          message: 'Click play to start audio.',
        });
      });
    } else {
      audio.pause();
    }
  }, [isPlaying, currentTrack, addToast]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = Number(volume) / 100;
  }, [volume]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || seekTarget == null) return;
    audio.currentTime = seekTarget;
    clearSeekTarget();
  }, [seekTarget, clearSeekTarget]);

  const handleSeek = (value) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = value;
    setPlaybackTime(value);
    lastPlaybackPositionRef.current = value;

    if (streamCountedRef.current && value <= 1) {
      resetStreamSession(value);
    }
  };

  const handleTimeUpdate = (event) => {
    const currentTime = event.currentTarget.currentTime;
    setPlaybackTime(currentTime);

    if (!currentTrack?.id || streamCountedRef.current || isSeekingRef.current) {
      lastPlaybackPositionRef.current = currentTime;
      return;
    }

    const lastPosition = lastPlaybackPositionRef.current;
    if (lastPosition !== null) {
      const playedDelta = currentTime - lastPosition;

      if (playedDelta > 0 && playedDelta <= 5) {
        listenedSecondsRef.current += playedDelta;

        if (listenedSecondsRef.current >= STREAM_THRESHOLD_SECONDS) {
          incrementPlays(currentTrack.id);
          streamCountedRef.current = true;
        }
      }
    }

    lastPlaybackPositionRef.current = currentTime;
  };

  const handleSeeked = (event) => {
    const currentTime = event.currentTarget.currentTime;
    isSeekingRef.current = false;
    lastPlaybackPositionRef.current = currentTime;

    if (streamCountedRef.current && currentTime <= 1) {
      resetStreamSession(currentTime);
    }
  };

  const handleEnded = () => {
    if (repeatMode === 'one') {
      const audio = audioRef.current;
      if (audio) {
        resetStreamSession(0);
        audio.currentTime = 0;
        audio.play().catch(() => {});
      }
      return;
    }

    if (shuffle && queue.length > 1) {
      const random = queue[Math.floor(Math.random() * queue.length)];
      playTrack(random, queue.filter((track) => track.id !== random.id));
      return;
    }

    nextTrack();
  };

  if (!currentTrack) return null;

  const isLiked = likedSongs.includes(currentTrack.id);
  const coverUrl = getTrackCover(currentTrack);

  return (
    <div className="h-24 bg-yeah-surface border-t border-gray-800 px-6 flex items-center justify-between fixed bottom-0 w-full z-50 shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
      <div className="flex items-center gap-4 w-1/3">
        <img src={coverUrl} alt="Cover" className="w-14 h-14 rounded-md shadow-lg" />
        <div>
          <h4 className="text-white font-medium text-sm">{currentTrack.title}</h4>
          <p className="text-gray-400 text-xs">{currentTrack.artist}</p>
        </div>
        <button onClick={() => likeTrack(currentTrack.id)} className="ml-4 transition-transform active:scale-75">
          <Heart size={20} className={isLiked ? 'text-yeah-accent fill-yeah-accent' : 'text-gray-400'} />
        </button>
      </div>

      <div className="flex flex-col items-center justify-center w-1/3 gap-2">
        <div className="flex items-center gap-6">
          <Shuffle
            size={20}
            onClick={toggleShuffle}
            className={`cursor-pointer ${shuffle ? 'text-yeah-accent' : 'text-gray-400 hover:text-white'}`}
          />
          <SkipBack size={24} className="text-gray-400 hover:text-white cursor-pointer" onClick={previousTrack} />
          <button
            onClick={togglePlay}
            className="w-10 h-10 rounded-full bg-white flex items-center justify-center hover:scale-105 transition-transform"
          >
            {isPlaying ? (
              <Pause size={20} className="text-black" fill="black" />
            ) : (
              <Play size={20} className="text-black ml-1" fill="black" />
            )}
          </button>
          <SkipForward size={24} className="text-gray-400 hover:text-white cursor-pointer" onClick={nextTrack} />
          <Repeat
            size={20}
            onClick={cycleRepeat}
            className={`cursor-pointer ${repeatMode !== 'off' ? 'text-yeah-accent' : 'text-gray-400 hover:text-white'}`}
          />
        </div>
        <div className="w-full flex items-center gap-2 max-w-md">
          <span className="text-xs text-gray-400">{formatSeconds(progress)}</span>
          <input
            type="range"
            min="0"
            max={audioDuration || durationSeconds || 0}
            value={Math.min(progress, audioDuration || durationSeconds || 0)}
            onChange={(event) => handleSeek(Number(event.target.value))}
            className="w-full accent-yeah-accent"
          />
          <span className="text-xs text-gray-400">
            {audioDuration ? formatSeconds(audioDuration) : currentTrack.duration}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 w-1/3">
        <Volume2 size={20} className="text-gray-400" />
        <input
          type="range"
          min="0"
          max="100"
          value={volume}
          onChange={(e) => setVolume(e.target.value)}
          className="w-24 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-yeah-accent"
        />
        <button
          type="button"
          onClick={toggleLyrics}
          className={`w-9 h-9 rounded-lg inline-flex items-center justify-center transition-colors ${
            showLyrics ? 'bg-yeah-accent text-black' : 'bg-[#242424] text-gray-300 hover:text-white'
          }`}
          aria-label="Lyrics"
        >
          <Mic2 size={18} />
        </button>
      </div>
      <audio
        ref={audioRef}
        preload="metadata"
        onLoadedMetadata={(event) => {
          const nextDuration = Math.floor(event.currentTarget.duration || 0);
          setAudioDuration(nextDuration);
          setDuration(nextDuration);
        }}
        onPlay={(event) => {
          lastPlaybackPositionRef.current = event.currentTarget.currentTime;
        }}
        onSeeking={() => {
          isSeekingRef.current = true;
        }}
        onSeeked={handleSeeked}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
      />
    </div>
  );
}
