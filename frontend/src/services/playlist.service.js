import { mockApi } from './mockApi';

export const playlistService = {
  create: (payload) => mockApi.execute(payload, { latencyMin: 400, latencyMax: 1200 }),
  update: (payload) => mockApi.execute(payload, { latencyMin: 300, latencyMax: 900 }),
  remove: (payload) => mockApi.execute(payload, { latencyMin: 300, latencyMax: 700 }),
};
