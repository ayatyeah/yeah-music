// Simulates network latency and random service degradation
import { useTelemetryStore } from '../store/useTelemetryStore';

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const mockApi = {
  async execute(data, options = { failureRate: 0.05, latencyMin: 300, latencyMax: 1200 }) {
    const latency =
      Math.floor(Math.random() * (options.latencyMax - options.latencyMin + 1)) + options.latencyMin;
    await delay(latency);

    const payloadSize = JSON.stringify(data || {}).length;
    if (Math.random() < options.failureRate) {
      useTelemetryStore.getState().recordRequest({
        latencyMs: latency,
        bytes: payloadSize,
        success: false,
      });
      throw new Error('Service Unavailable (503) - Simulated Network Failure');
    }

    const response = {
      status: 200,
      data,
      timestamp: new Date().toISOString(),
      metadata: { latencyMs: latency },
    };

    useTelemetryStore.getState().recordRequest({
      latencyMs: latency,
      bytes: payloadSize,
      success: true,
    });

    return response;
  },
};
