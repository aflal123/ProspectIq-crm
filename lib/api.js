import axios from 'axios';

// Single axios instance pointing to local Next.js API routes
const api = axios.create({
  baseURL: '/api',
});

// Attach JWT token from localStorage before every request
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Redirect to login on 401 Unauthorized
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (typeof window !== 'undefined' && error.response?.status === 401) {
      // Don't auto-redirect if already on login/register/verify-otp
      const pathname = window.location.pathname;
      if (!['/login', '/register', '/verify-otp', '/forgot-password'].includes(pathname)) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
