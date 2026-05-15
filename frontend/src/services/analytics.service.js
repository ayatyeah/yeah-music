import { mockApi } from './mockApi';

export const analyticsService = {
  fetchMetrics: (payload) => mockApi.execute(payload, { latencyMin: 600, latencyMax: 1400 }),
};
