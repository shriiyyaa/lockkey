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

// Handle 401 responses
api.interceptors.response.use(
  (response) => response,
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
