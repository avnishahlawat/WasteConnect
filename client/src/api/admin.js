import { api } from '../lib/axios';
export const adminApi = {
    getDashboard: () => api.get('/admin/dashboard'),
    getUsers: (params) => api.get('/admin/users', { params }),
    createUser: (data) => api.post('/admin/users', data),
    toggleUserStatus: (id) => api.put(`/admin/users/${id}/toggle-status`),
    getCollectors: () => api.get('/admin/collectors'),
    getAllIssues: (params) => api.get('/admin/issues', { params }),
    getAllPickups: (params) => api.get('/admin/pickups', { params }),
    getAuditLogs: (params) => api.get('/admin/audit-logs', { params }),
    createServiceArea: (data) => api.post('/admin/service-areas', data),
    updateServiceArea: (id, data) => api.put(`/admin/service-areas/${id}`, data),
    createWasteCategory: (data) => api.post('/admin/categories', data),
    updateWasteCategory: (id, data) => api.put(`/admin/categories/${id}`, data),
    getAnalytics: () => api.get('/admin/analytics'),
};
