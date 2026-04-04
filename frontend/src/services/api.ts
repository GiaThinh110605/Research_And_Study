import axios from 'axios';

// Automatically detect environments.
// If not running on localhost, fallback to an empty string (which uses the current origin's /api proxy).
const isLocalhost = typeof window !== 'undefined' && window.location.hostname === 'localhost';
const baseURL = isLocalhost ? 'http://localhost:8000' : '';

const api = axios.create({
  baseURL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
