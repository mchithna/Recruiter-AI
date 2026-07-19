import api from '../api';

const isHomePath = (path) => {
  const normalized = path || '/';
  return !normalized.startsWith('/candidate')
    && !normalized.startsWith('/recruiter')
    && !normalized.startsWith('/admin')
    && !normalized.startsWith('/hiring-manager')
    && !normalized.startsWith('/dashboard');
};

export const chatApi = {
  getContext: async (path) => {
    const response = await api.get('/chat/context', {
      params: { path },
      skipAuth: isHomePath(path)
    });
    return response.data;
  },

  getSessions: async (contextKey) => {
    const response = await api.get('/chat/sessions', {
      params: { contextKey },
      skipAuth: contextKey === 'home'
    });
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
    }, {
      skipAuth: isHomePath(path)
    });
    return response.data;
  }
};
