import api from '../api';

export const liveInterviewApi = {
  async start(payload) {
    const response = await api.post('/live-interviews/start', payload);
    return response.data;
  },

  async getSession(sessionId) {
    const response = await api.get(`/live-interviews/${sessionId}`);
    return response.data;
  },

  async generateQuestion(sessionId, payload) {
    const response = await api.post(`/live-interviews/${sessionId}/questions/generate`, payload);
    return response.data;
  },

  async submitAnswer(sessionId, payload) {
    const response = await api.post(`/live-interviews/${sessionId}/answers`, payload);
    return response.data;
  },

  async markAsked(sessionId, questionId) {
    const response = await api.post(`/live-interviews/${sessionId}/questions/${questionId}/ask`);
    return response.data;
  },

  async skip(sessionId, questionId) {
    const response = await api.post(`/live-interviews/${sessionId}/questions/${questionId}/skip`);
    return response.data;
  },

  async save(sessionId, questionId) {
    const response = await api.post(`/live-interviews/${sessionId}/questions/${questionId}/save`);
    return response.data;
  },

  async report(sessionId, questionId) {
    const response = await api.post(`/live-interviews/${sessionId}/questions/${questionId}/report`);
    return response.data;
  },

  async end(sessionId) {
    const response = await api.post(`/live-interviews/${sessionId}/end`);
    return response.data;
  },

  async getSummary(sessionId) {
    const response = await api.get(`/live-interviews/${sessionId}/summary`);
    return response.data;
  },
};

export default liveInterviewApi;
