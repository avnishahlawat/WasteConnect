import { api } from '../lib/axios';
export const authorityApi = {
    getDashboard: () => api.get('/authority/dashboard'),
    getIssues: (params) => api.get('/authority/issues', { params }),
    getIssueById: (id) => api.get(`/authority/issues/${id}`),
    triageIssue: (id, data) => api.put(`/authority/issues/${id}/triage`, data),
    assignIssue: (id, data) => api.put(`/authority/issues/${id}/assign`, data),
    resolveIssue: (id, data) => api.put(`/authority/issues/${id}/resolve`, data),
    getHotspots: () => api.get('/authority/hotspots'),
    recalculateHotspots: () => api.post('/authority/hotspots/recalculate'),
    getAnalytics: () => api.get('/authority/analytics'),
    getAnnouncements: () => api.get('/authority/announcements'),
    createAnnouncement: (data) => api.post('/authority/announcements', data),
};
