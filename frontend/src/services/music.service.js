import api from './api';

export const musicService = {
	fetchSongs: async () => api.get('/music/tracks'),
	createSong: async (payload) => api.post('/music/tracks', payload),
	updateSong: async (trackId, payload) => api.put(`/music/tracks/${trackId}`, payload),
	deleteSong: async (trackId) => api.delete(`/music/tracks/${trackId}`),
};
