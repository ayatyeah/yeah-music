// Base Axios instance with interceptors
import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true,
  headers: {
    'Cache-Control': 'no-cache',
    Pragma: 'no-cache',
  },
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
    if (user?.role) {
      config.headers['X-User-Role'] = user.role;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url || '';
    if (status === 401 && !url.includes('/auth/login') && !url.includes('/auth/register')) {
      useAuthStore.setState({ user: null, token: null, isAuthenticated: false });
    }
    return Promise.reject(error);
  }
);

export default api;
