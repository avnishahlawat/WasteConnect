import { api } from '../lib/axios';
import type { ApiResponse, PublicIssue, IssueEvent, Severity } from '../types';

export interface ReportIssueDto {
  category: string;
  title: string;
  description: string;
  photos?: string[];
  address: string;
  coordinates: [number, number];
  serviceArea: string;
  severity?: Severity;
}

export const issuesApi = {
  reportIssue: (data: ReportIssueDto) =>
    api.post<ApiResponse<PublicIssue>>('/citizen/issues', data),

  getMyIssues: (params?: { status?: string; page?: number; limit?: number }) =>
    api.get<ApiResponse<PublicIssue[]>>('/citizen/issues', { params }),

  getIssueDetail: (id: string) =>
    api.get<ApiResponse<{ issue: PublicIssue; events: IssueEvent[] }>>(`/citizen/issues/${id}`),

  verifyResolution: (id: string, data: { confirmed: boolean; disputeReason?: string }) =>
    api.put<ApiResponse<PublicIssue>>(`/citizen/issues/${id}/verify`, data),

  classifyIssueAi: (title: string, description: string) =>
    api.post<ApiResponse<{ predictedCategory: string; confidence: number; suggestedSeverity?: string; suggestedAction?: string; explanation: string }>>(
      '/ai/classify-issue',
      { title, description }
    ),
};
