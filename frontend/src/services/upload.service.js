import { mockApi } from './mockApi';

export const uploadService = {
  uploadTrack: (payload) =>
    mockApi.execute(payload, { latencyMin: 1000, latencyMax: 3000, failureRate: 0.08 }),
};
