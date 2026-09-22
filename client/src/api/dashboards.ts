import { api } from '../lib/axios';
import type { ApiResponse } from '../types';

export const dashboardsApi = {
  getCitizenDashboard: () => api.get<ApiResponse<any>>('/citizen/dashboard'),
  getCollectorDashboard: () => api.get<ApiResponse<any>>('/collector/dashboard'),
  getAuthorityDashboard: () => api.get<ApiResponse<any>>('/authority/dashboard'),
  getAdminDashboard: () => api.get<ApiResponse<any>>('/admin/dashboard'),
};
