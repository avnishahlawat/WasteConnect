import { api } from '../lib/axios';
export const issuesApi = {
    reportIssue: (data) => api.post('/citizen/issues', data),
    getMyIssues: (params) => api.get('/citizen/issues', { params }),
    getIssueDetail: (id) => api.get(`/citizen/issues/${id}`),
    verifyResolution: (id, data) => api.put(`/citizen/issues/${id}/verify`, data),
    classifyIssueAi: (title, description) => api.post('/ai/classify-issue', { title, description }),
};
