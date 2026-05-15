import { mockApi } from './mockApi';

export const notificationService = {
  dispatch: (payload) => mockApi.execute(payload, { latencyMin: 200, latencyMax: 600 }),
};
