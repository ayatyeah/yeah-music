// Base Axios instance with interceptors
import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true,
});

// Add user ID header on each request (for track ownership checks)
api.interceptors.request.use(
  (config) => {
    const { user, token } = useAuthStore.getState();
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    if (user?.id) {
      config.headers['X-User-Id'] = user.id;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
