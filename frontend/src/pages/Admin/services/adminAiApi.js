import api from '../../../api';

export const adminAiApi = {
  analyticsSummary: async () => {
    const response = await api.post('/admin/ai/analytics-summary');
    return response.data;
  },
  insights: async () => {
    const response = await api.post('/admin/ai/insights');
    return response.data;
  },
  activitySummary: async () => {
    const response = await api.post('/admin/ai/activity-summary');
    return response.data;
  }
};
