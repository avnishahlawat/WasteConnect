import { api } from '../lib/axios';
import type { ApiResponse, WasteCategory, ServiceArea, Notification } from '../types';

export const sharedApi = {
  getCategories: () => api.get<ApiResponse<WasteCategory[]>>('/categories'),
  getServiceAreas: () => api.get<ApiResponse<ServiceArea[]>>('/service-areas'),
  getNotifications: (params?: { page?: number; limit?: number }) =>
    api.get<ApiResponse<Notification[]>>('/notifications', { params }),
  markNotificationRead: (id: string) => api.put<ApiResponse>(`/notifications/${id}/read`),
  markAllRead: () => api.put<ApiResponse>('/notifications/read-all'),
  markAllNotificationsRead: () => api.put<ApiResponse>('/notifications/read-all'),
};
