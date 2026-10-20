import axios from 'axios';

const baseURL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD
    ? 'https://api.alveolystudios.site/api'
    : 'http://localhost:5000/api');

const api = axios.create({ baseURL, timeout: 120000, withCredentials: true });

api.interceptors.request.use((config) => {
  const token =
    localStorage.getItem('alveoly_token') ||
    localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('alveoly_token');
      localStorage.removeItem('token');
      localStorage.removeItem('alveoly_user');
    }
    return Promise.reject(err);
  }
);

export default api;