import { api } from '../lib/axios';
export const sharedApi = {
    getCategories: () => api.get('/categories'),
    getServiceAreas: () => api.get('/service-areas'),
    getNotifications: (params) => api.get('/notifications', { params }),
    markNotificationRead: (id) => api.put(`/notifications/${id}/read`),
    markAllRead: () => api.put('/notifications/read-all'),
    markAllNotificationsRead: () => api.put('/notifications/read-all'),
};
