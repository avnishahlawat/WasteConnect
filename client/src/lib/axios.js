import axios from 'axios';
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
export const api = axios.create({
    baseURL: API_BASE_URL,
    headers: { 'Content-Type': 'application/json' },
    timeout: 30000,
});
// Attach JWT token from localStorage
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('wc_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});
// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('wc_token');
      localStorage.removeItem('wc_user');
      const isAuthRoute = window.location.pathname === '/login' || window.location.pathname === '/register';
      const isAuthRequest = error.config?.url?.includes('/auth/login') || error.config?.url?.includes('/auth/register') || error.config?.url?.includes('/auth/google');
      if (!isAuthRoute && !isAuthRequest) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);
