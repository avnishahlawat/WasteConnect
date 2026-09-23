import { api } from '../lib/axios';
export const pickupsApi = {
    // Citizen
    requestPickup: (data) => api.post('/citizen/pickups', data),
    getCitizenPickups: (params) => api.get('/citizen/pickups', { params }),
    getPickupDetail: (id) => api.get(`/citizen/pickups/${id}`),
    cancelPickup: (id, reason) => api.put(`/citizen/pickups/${id}/cancel`, { reason }),
    submitFeedback: (id, data) => api.post(`/citizen/pickups/${id}/feedback`, data),
    // Collector
    getAvailablePickups: (params) => api.get('/collector/available-pickups', { params }),
    getCollectorPickups: (params) => api.get('/collector/pickups', { params }),
    acceptPickup: (id) => api.post(`/collector/pickups/${id}/accept`),
    startPickup: (id) => api.post(`/collector/pickups/${id}/start`),
    completePickup: (id, data) => api.post(`/collector/pickups/${id}/complete`, data),
    updateAvailability: (availability) => api.put('/collector/availability', { availability }),
    getCollectorHistory: (params) => api.get('/collector/history', { params }),
    // AI assistant preview
    classifyWasteAi: (description) => api.post('/citizen/ai/classify-waste', { description }),
};
