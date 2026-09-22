import { api } from '../lib/axios';
import type { ApiResponse, User } from '../types';

export interface LoginCredentials { email: string; password: string; }
export interface RegisterCredentials {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'CITIZEN' | 'COLLECTOR';
  phone?: string;
}
export interface AuthData { token: string; user: User; }

export const authApi = {
  login: (credentials: LoginCredentials) =>
    api.post<ApiResponse<AuthData>>('/auth/login', credentials),
  register: (credentials: RegisterCredentials) =>
    api.post<ApiResponse<AuthData>>('/auth/register', credentials),
  logout: () => api.post<ApiResponse>('/auth/logout'),
  getMe: () => api.get<ApiResponse<{ user: User; profile: unknown }>>('/auth/me'),
  updateProfile: (data: Partial<User>) => api.put<ApiResponse<User>>('/auth/profile', data),
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.put<ApiResponse>('/auth/change-password', data),
};
