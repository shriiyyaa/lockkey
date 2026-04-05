import axios from 'axios';

const api = axios.create({
  baseURL: 'https://lockkey-h8ib.onrender.com/api',
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add auth token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('lockkey_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Performance interceptor to detect cold starts
api.interceptors.request.use((config) => {
  config.metadata = { startTime: new Date() };
  return config;
});

api.interceptors.response.use(
  (response) => {
    const duration = new Date() - response.config.metadata.startTime;
    if (duration > 3000) {
      console.warn(`[API] SLOW_RESPONSE: ${response.config.url} took ${duration}ms (Potential Cold Start)`);
    }
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('lockkey_token');
      localStorage.removeItem('lockkey_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
