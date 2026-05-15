import { create } from 'zustand';

export const useTelemetryStore = create((set, get) => ({
  requestCount: 0,
  errorCount: 0,
  totalLatency: 0,
  lastLatency: 0,
  bytesTransferred: 0,
  firstRequestAt: null,
  lastRequestAt: null,
  alerts: [],

  recordRequest: ({ latencyMs, bytes, success }) => {
    const now = Date.now();
    set((state) => ({
      requestCount: state.requestCount + 1,
      errorCount: success ? state.errorCount : state.errorCount + 1,
      totalLatency: state.totalLatency + (latencyMs || 0),
      lastLatency: latencyMs || 0,
      bytesTransferred: state.bytesTransferred + (bytes || 0),
      firstRequestAt: state.firstRequestAt || now,
      lastRequestAt: now,
    }));

    if (!success) {
      const nextAlert = {
        id: `alert_${Date.now()}`,
        type: 'error',
        message: 'Service request failed',
        createdAt: new Date().toISOString(),
      };
      set((state) => ({ alerts: [nextAlert, ...state.alerts].slice(0, 8) }));
    }
  },

  clearAlerts: () => set({ alerts: [] }),
}));
