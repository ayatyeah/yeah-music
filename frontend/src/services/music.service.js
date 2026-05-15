import { mockApi } from './mockApi';

export const musicService = {
	fetchSongs: (songs) => mockApi.execute(songs, { latencyMin: 300, latencyMax: 900 }),
	fetchPlaylists: (playlists) => mockApi.execute(playlists, { latencyMin: 400, latencyMax: 1200 }),
	search: (results) => mockApi.execute(results, { latencyMin: 250, latencyMax: 800 }),
};
