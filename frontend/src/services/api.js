// Base Axios instance with interceptors
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true,
});

// Add interceptors here if needed

export default api;
