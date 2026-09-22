import { api } from '../lib/axios';
import type { ApiResponse, PublicIssue, IssueEvent, ServiceArea } from '../types';

export interface TriageDto {
  status?: string;
  priority?: string;
  severity?: string;
  assignedTeam?: string;
  internalNotes?: string;
  duplicateOf?: string;
}

export interface ResolveDto {
  resolutionNotes: string;
  resolutionEvidence?: string[];
}

export interface HotspotSummary {
  areas: ServiceArea[];
  criticalCount: number;
  highCount: number;
  averageScore: number;
  topHotspot: ServiceArea | null;
}

export const authorityApi = {
  getDashboard: () => api.get<ApiResponse<any>>('/authority/dashboard'),

  getIssues: (params?: {
    status?: string;
    severity?: string;
    priority?: string;
    isOverdue?: boolean;
    serviceArea?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) => api.get<ApiResponse<PublicIssue[]>>('/authority/issues', { params }),

  getIssueById: (id: string) =>
    api.get<ApiResponse<{ issue: PublicIssue; events: IssueEvent[] }>>(`/authority/issues/${id}`),

  triageIssue: (id: string, data: TriageDto) =>
    api.put<ApiResponse<PublicIssue>>(`/authority/issues/${id}/triage`, data),

  assignIssue: (id: string, data: { assignedAuthority: string; assignedTeam?: string }) =>
    api.put<ApiResponse<PublicIssue>>(`/authority/issues/${id}/assign`, data),

  resolveIssue: (id: string, data: ResolveDto) =>
    api.put<ApiResponse<PublicIssue>>(`/authority/issues/${id}/resolve`, data),

  getHotspots: () => api.get<ApiResponse<HotspotSummary>>('/authority/hotspots'),

  recalculateHotspots: () => api.post<ApiResponse<any>>('/authority/hotspots/recalculate'),

  getAnalytics: () => api.get<ApiResponse<any>>('/authority/analytics'),

  getAnnouncements: () => api.get<ApiResponse<any[]>>('/authority/announcements'),

  createAnnouncement: (data: {
    title: string;
    content: string;
    type: 'INFO' | 'WARNING' | 'ALERT' | 'SCHEDULE';
    targetRole?: string;
    targetServiceArea?: string;
  }) => api.post<ApiResponse<any>>('/authority/announcements', data),
};
