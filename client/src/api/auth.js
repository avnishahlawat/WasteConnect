import { api } from '../lib/axios';
export const authApi = {
    login: (credentials) => api.post('/auth/login', credentials),
    googleLogin: (data) => api.post('/auth/google', data),
    register: (credentials) => api.post('/auth/register', credentials),
    logout: () => api.post('/auth/logout'),
    getMe: () => api.get('/auth/me'),
    updateProfile: (data) => api.put('/auth/profile', data),
    changePassword: (data) => api.put('/auth/change-password', data),
};
