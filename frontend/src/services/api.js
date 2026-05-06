import axios from 'axios';

// All API calls go through this single axios instance
const api = axios.create({
  baseURL: 'http://localhost:8000/api',
});

// Before every request → attach the JWT token from localStorage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// If server returns 401 (token expired/invalid) → kick user back to login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
