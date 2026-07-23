import api from '../api';

export const notificationsApi = {
  getNotifications: async (unreadOnly = false, limit = 50) => {
    const res = await api.get(`/notifications?unreadOnly=${unreadOnly}&limit=${limit}`);
    return res.data;
  },
  getUnreadCount: async () => {
    const res = await api.get('/notifications/unread-count');
    return res.data.unreadCount;
  },
  markAsRead: async (id) => {
    const res = await api.put(`/notifications/${id}/read`);
    return res.data;
  },
  markAllAsRead: async () => {
    const res = await api.put('/notifications/mark-all-read');
    return res.data;
  },
  deleteNotification: async (id) => {
    const res = await api.delete(`/notifications/${id}`);
    return res.data;
  },
};

export default notificationsApi;
