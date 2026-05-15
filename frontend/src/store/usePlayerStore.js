import { create } from 'zustand';

export const usePlayerStore = create((set, get) => ({
  currentTrack: null,
  queue: [],
  history: [],
  isPlaying: false,
  volume: 80,
  progress: 0,
  currentTime: 0,
  duration: 0,
  seekTarget: null,
  showLyrics: false,
  shuffle: false,
  repeatMode: 'off',

  playTrack: (track, newQueue = []) => {
    set({
      currentTrack: track,
      isPlaying: true,
      queue: newQueue.length > 0 ? newQueue : get().queue,
      progress: 0,
      currentTime: 0,
    });
  },

  togglePlay: () =>
    set((state) => ({ isPlaying: !state.isPlaying && state.currentTrack !== null })),

  previousTrack: () => {
    const { history } = get();
    if (history.length === 0) return;
    const previous = history[history.length - 1];
    set((state) => ({
      currentTrack: previous,
      history: state.history.slice(0, -1),
      isPlaying: true,
      progress: 0,
      currentTime: 0,
    }));
  },

  nextTrack: () => {
    const { queue, currentTrack } = get();
    if (queue.length === 0) return;

    set((state) => ({
      history: currentTrack ? [...state.history, currentTrack] : state.history,
      currentTrack: queue[0],
      queue: queue.slice(1),
      isPlaying: true,
      progress: 0,
      currentTime: 0,
    }));
  },

  addToQueue: (track) => set((state) => ({ queue: [...state.queue, track] })),

  addToQueueNext: (track) =>
    set((state) => ({ queue: [track, ...state.queue] })),

  setProgress: (value) =>
    set((state) => ({ progress: typeof value === 'function' ? value(state.progress) : value })),

  setPlaybackTime: (value) => set({ currentTime: value, progress: Math.floor(value) }),

  setDuration: (value) => set({ duration: value }),

  seekTo: (value) => set({ seekTarget: value, currentTime: value, progress: Math.floor(value) }),

  clearSeekTarget: () => set({ seekTarget: null }),

  toggleLyrics: () => set((state) => ({ showLyrics: !state.showLyrics })),

  closeLyrics: () => set({ showLyrics: false }),

  setVolume: (level) => set({ volume: level }),

  toggleShuffle: () => set((state) => ({ shuffle: !state.shuffle })),

  cycleRepeat: () =>
    set((state) => ({
      repeatMode: state.repeatMode === 'off' ? 'all' : state.repeatMode === 'all' ? 'one' : 'off',
    })),
}));
