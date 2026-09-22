import { api } from '../lib/axios';
import type { ApiResponse, User, PublicIssue, PickupRequest, ServiceArea, WasteCategory } from '../types';

export const adminApi = {
  getDashboard: () => api.get<ApiResponse<any>>('/admin/dashboard'),

  getUsers: (params?: { role?: string; isActive?: boolean; search?: string; page?: number; limit?: number }) =>
    api.get<ApiResponse<User[]>>('/admin/users', { params }),

  toggleUserStatus: (id: string) =>
    api.put<ApiResponse<{ id: string; isActive: boolean }>>(`/admin/users/${id}/toggle-status`),

  getCollectors: () => api.get<ApiResponse<any[]>>('/admin/collectors'),

  getAllIssues: (params?: { status?: string; severity?: string; page?: number; limit?: number }) =>
    api.get<ApiResponse<PublicIssue[]>>('/admin/issues', { params }),

  getAllPickups: (params?: { status?: string; page?: number; limit?: number }) =>
    api.get<ApiResponse<PickupRequest[]>>('/admin/pickups', { params }),

  getAuditLogs: (params?: { action?: string; page?: number; limit?: number }) =>
    api.get<ApiResponse<any[]>>('/admin/audit-logs', { params }),

  createServiceArea: (data: Partial<ServiceArea>) =>
    api.post<ApiResponse<ServiceArea>>('/admin/service-areas', data),

  updateServiceArea: (id: string, data: Partial<ServiceArea>) =>
    api.put<ApiResponse<ServiceArea>>(`/admin/service-areas/${id}`, data),

  createWasteCategory: (data: Partial<WasteCategory>) =>
    api.post<ApiResponse<WasteCategory>>('/admin/categories', data),

  updateWasteCategory: (id: string, data: Partial<WasteCategory>) =>
    api.put<ApiResponse<WasteCategory>>(`/admin/categories/${id}`, data),

  getAnalytics: () => api.get<ApiResponse<any>>('/admin/analytics'),
};
