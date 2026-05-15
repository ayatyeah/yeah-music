import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { mockApi } from '../services/mockApi';
import { musicService } from '../services/music.service';
import { seedArtists, seedLibrary, seedPlaylists } from '../utils/mockData';
import { useNotificationStore } from './useNotificationStore';

const buildArtistsFromLibrary = (library, currentArtists = []) => {
  const artistsByKey = new Map();

  currentArtists.forEach((artist) => {
    const key = artist.id || artist.name;
    if (key) artistsByKey.set(key, artist);
  });

  library.forEach((track) => {
    const artistKey = track.artistId || track.artist;
    if (!artistKey || artistsByKey.has(artistKey)) return;

    artistsByKey.set(artistKey, {
      id: track.artistId || `artist_${String(track.artist || '').toLowerCase().replace(/[^a-z0-9]+/g, '_')}`,
      name: track.artist,
      verified: false,
      avatar: track.cover || '',
      followers: 0,
    });
  });

  return Array.from(artistsByKey.values());
};

export const useDataStore = create(
  persist(
    (set, get) => ({
      library: seedLibrary,
      artists: seedArtists,
      playlists: seedPlaylists,
      likedSongs: [],
      history: [],
      followedArtists: [],
      recentSearches: [],
      uploadQueue: 0,
      isLoading: false,
      error: null,

      loadLibrary: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await musicService.fetchSongs();
          const items = response.data?.items || [];
          set((state) => ({
            library: items,
            artists: buildArtistsFromLibrary(items, state.artists),
            isLoading: false,
          }));
          return items;
        } catch (error) {
          set({ isLoading: false, error: error.message });
          useNotificationStore.getState().addToast({
            type: 'error',
            title: 'Library load failed',
            message: error.message,
          });
          throw error;
        }
      },

      likeTrack: async (trackId) => {
        const { likedSongs } = get();
        const isLiked = likedSongs.includes(trackId);

        set({
          likedSongs: isLiked ? likedSongs.filter((id) => id !== trackId) : [...likedSongs, trackId],
        });

        try {
          await mockApi.execute({ trackId, action: isLiked ? 'unlike' : 'like' });
          useNotificationStore.getState().addToast({
            type: 'success',
            title: isLiked ? 'Removed from likes' : 'Added to likes',
            message: isLiked ? 'Track removed from your favorites.' : 'Track saved to your favorites.',
          });
        } catch (error) {
          set({ likedSongs });
          useNotificationStore.getState().addToast({
            type: 'error',
            title: 'Like failed',
            message: error.message,
          });
          throw error;
        }
      },

      addToHistory: (track) => {
        const entry = { ...track, lastPlayedAt: new Date().toISOString() };
        set((state) => ({
          history: [entry, ...state.history.filter((t) => t.id !== track.id)].slice(0, 50),
        }));
      },

      incrementPlays: (trackId) => {
        set((state) => ({
          library: state.library.map((track) =>
            track.id === trackId ? { ...track, plays: (track.plays || 0) + 1 } : track
          ),
        }));
      },

      updateTrack: async (trackId, updates, userId) => {
        const original = get().library;
        const target = original.find((track) => track.id === trackId);

        if (!target) throw new Error('Track not found.');
        if (userId && target.artistId && target.artistId !== userId) {
          throw new Error('Only the track owner can edit this release.');
        }

        const nextTrack = {
          ...target,
          ...updates,
          id: target.id,
          artist: target.artist,
          artistId: target.artistId,
          updatedAt: new Date().toISOString(),
        };

        set({ isLoading: true, error: null });
        try {
          const response = await musicService.updateSong(trackId, nextTrack);
          const updatedTrack = response.data?.item || response.data;
          set((state) => ({
            library: state.library.map((track) => (track.id === trackId ? updatedTrack : track)),
            playlists: state.playlists.map((playlist) => ({
              ...playlist,
              tracks: playlist.tracks.map((track) => (track.id === trackId ? updatedTrack : track)),
            })),
            artists: buildArtistsFromLibrary(
              state.library.map((track) => (track.id === trackId ? updatedTrack : track)),
              state.artists
            ),
            isLoading: false,
          }));
          useNotificationStore.getState().addToast({
            type: 'success',
            title: 'Release updated',
            message: `"${updatedTrack.title}" was saved.`,
          });
          return updatedTrack;
        } catch (error) {
          set({ library: original, isLoading: false, error: error.message });
          useNotificationStore.getState().addToast({
            type: 'error',
            title: 'Update failed',
            message: error.message,
          });
          throw error;
        }
      },

      createPlaylist: async (payload) => {
        set({ isLoading: true, error: null });
        try {
          const playlist = {
            id: `pl_${Date.now()}`,
            name: payload.name,
            description: payload.description || '',
            cover: payload.cover || payload.tracks?.[0]?.cover || '',
            tracks: payload.tracks || [],
            isPublic: payload.isPublic ?? true,
            createdAt: new Date().toISOString(),
          };
          const response = await mockApi.execute(playlist, { latencyMin: 400, latencyMax: 1200 });
          set((state) => ({ playlists: [response.data, ...state.playlists], isLoading: false }));
          useNotificationStore.getState().addToast({
            type: 'success',
            title: 'Playlist created',
            message: `"${playlist.name}" is ready.`,
          });
          return response.data;
        } catch (error) {
          set({ isLoading: false, error: error.message });
          useNotificationStore.getState().addToast({
            type: 'error',
            title: 'Playlist failed',
            message: error.message,
          });
          throw error;
        }
      },

      updatePlaylist: (playlistId, updates) => {
        set((state) => ({
          playlists: state.playlists.map((playlist) =>
            playlist.id === playlistId ? { ...playlist, ...updates } : playlist
          ),
        }));
      },

      deletePlaylist: (playlistId) => {
        set((state) => ({ playlists: state.playlists.filter((playlist) => playlist.id !== playlistId) }));
        useNotificationStore.getState().addToast({
          type: 'info',
          title: 'Playlist deleted',
          message: 'Your playlist was removed.',
        });
      },

      addTrackToPlaylist: (playlistId, track) => {
        set((state) => ({
          playlists: state.playlists.map((playlist) => {
            if (playlist.id !== playlistId) return playlist;
            const exists = playlist.tracks.some((entry) => entry.id === track.id);
            const nextTracks = exists ? playlist.tracks : [track, ...playlist.tracks];
            return {
              ...playlist,
              tracks: nextTracks,
              cover: playlist.cover || track.cover,
            };
          }),
        }));
        useNotificationStore.getState().addToast({
          type: 'success',
          title: 'Added to playlist',
          message: `"${track.title}" added to playlist.`,
        });
      },

      removeTrackFromPlaylist: (playlistId, trackId) => {
        set((state) => ({
          playlists: state.playlists.map((playlist) =>
            playlist.id === playlistId
              ? { ...playlist, tracks: playlist.tracks.filter((track) => track.id !== trackId) }
              : playlist
          ),
        }));
      },

      toggleFollowArtist: (artistId) => {
        set((state) => ({
          followedArtists: state.followedArtists.includes(artistId)
            ? state.followedArtists.filter((id) => id !== artistId)
            : [...state.followedArtists, artistId],
        }));
      },

      addRecentSearch: (term) => {
        set((state) => ({
          recentSearches: [term, ...state.recentSearches.filter((entry) => entry !== term)].slice(0, 6),
        }));
      },

      uploadTrack: async (trackData) => {
        set((state) => ({ isLoading: true, error: null, uploadQueue: state.uploadQueue + 1 }));
        try {
          const newTrack = {
            ...trackData,
            id: `tr_${Date.now()}`,
            plays: 0,
            createdAt: new Date().toISOString(),
          };
          const response = await musicService.createSong(newTrack);
          const createdTrack = response.data?.item || response.data;

          set((state) => ({
            library: [createdTrack, ...state.library],
            artists: buildArtistsFromLibrary([createdTrack, ...state.library], state.artists),
            isLoading: false,
            uploadQueue: Math.max(0, state.uploadQueue - 1),
          }));
          useNotificationStore.getState().addToast({
            type: 'success',
            title: 'Upload complete',
            message: `"${createdTrack.title}" is now live.`,
          });
          return createdTrack;
        } catch (error) {
          set((state) => ({
            isLoading: false,
            error: error.message,
            uploadQueue: Math.max(0, state.uploadQueue - 1),
          }));
          useNotificationStore.getState().addToast({
            type: 'error',
            title: 'Upload failed',
            message: error.message,
          });
          throw error;
        }
      },
    }),
    {
      name: 'yeahmusic-storage',
      version: 3,
      partialize: (state) => ({
        likedSongs: state.likedSongs,
        history: state.history,
        followedArtists: state.followedArtists,
        recentSearches: state.recentSearches,
        playlists: state.playlists,
      }),
      migrate: (state) => ({
        likedSongs: state?.likedSongs || [],
        history: state?.history || [],
        followedArtists: state?.followedArtists || [],
        recentSearches: state?.recentSearches || [],
        playlists: state?.playlists || seedPlaylists,
      }),
    }
  )
);
