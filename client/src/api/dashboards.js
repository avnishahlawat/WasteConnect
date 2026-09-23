import { api } from '../lib/axios';
export const dashboardsApi = {
    getCitizenDashboard: () => api.get('/citizen/dashboard'),
    getCollectorDashboard: () => api.get('/collector/dashboard'),
    getAuthorityDashboard: () => api.get('/authority/dashboard'),
    getAdminDashboard: () => api.get('/admin/dashboard'),
};
