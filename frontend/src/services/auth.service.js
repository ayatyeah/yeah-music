import api from './api';

const fallback = async (fn, fallbackData) => {
  try {
    return await fn();
  } catch (err) {
    // If API fails, return fallback for offline/demo mode
    if (fallbackData) return fallbackData;
    throw err;
  }
};

export const authService = {
  async register(payload) {
    return fallback(async () => {
      const { data } = await api.post('/auth/register', payload);
      return data;
    });
  },

  async login(credentials) {
    return fallback(async () => {
      const { data } = await api.post('/auth/login', credentials);
      return data;
    });
  },

  async me() {
    return fallback(async () => {
      const { data } = await api.get('/auth/me');
      return data;
    });
  }
};
