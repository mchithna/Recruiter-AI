import api from '../api';

export const chatApi = {
  getSessions: async () => {
    const response = await api.get('/chat/sessions');
    return response.data;
  },

  getSession: async (id) => {
    const response = await api.get(`/chat/sessions/${id}`);
    return response.data;
  },

  sendMessage: async (message, sessionId = null) => {
    const response = await api.post('/chat/message', {
      message,
      sessionId
    });
    return response.data;
  }
};
