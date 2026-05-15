// Telemetry service for SRE Health widgets
import api from './api';

export const fetchTelemetry = () => api.get('/telemetry/health');
