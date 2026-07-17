import api from '../api';

export const chatApi = {
  getContext: async (path) => {
    const response = await api.get('/chat/context', { params: { path } });
    return response.data;
  },

  getSessions: async (contextKey) => {
    const response = await api.get('/chat/sessions', { params: { contextKey } });
    return response.data;
  },

  getSession: async (id, contextKey) => {
    const response = await api.get(`/chat/sessions/${id}`, { params: { contextKey } });
    return response.data;
  },

  sendMessage: async (message, sessionId = null, path = '/') => {
    const response = await api.post('/chat/message', {
      message,
      sessionId,
      path
    });
    return response.data;
  }
};
