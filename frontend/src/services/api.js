import axios from 'axios';

// All API calls go through this single axios instance
// Automatic API URL selection
const baseURL = window.location.hostname === 'localhost' 
  ? (import.meta.env.VITE_API_URL || 'http://localhost:8000/api')
  : 'https://api.prospectiq.online/api';

const api = axios.create({
  baseURL,
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
