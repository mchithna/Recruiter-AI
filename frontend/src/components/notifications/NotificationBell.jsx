import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Briefcase, Calendar, FileCheck, MessageSquare, CheckCheck, ExternalLink, X } from 'lucide-react';
import { notificationsApi } from '../../lib/notificationsApi';
import { useAuth } from '../../contexts/AuthContext';

function getEventIcon(type) {
  switch (type) {
    case 'InterviewScheduled':
    case 'InterviewRescheduled':
    case 'InterviewAssigned':
      return <Calendar className="h-4 w-4 text-purple-600 dark:text-purple-400" />;
    case 'OfferIssued':
    case 'OfferRespondedByCandidate':
      return <FileCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />;
    case 'NewMessageReceived':
    case 'NewCandidateMessage':
      return <MessageSquare className="h-4 w-4 text-blue-600 dark:text-blue-400" />;
    case 'ApplicationStatusUpdated':
    case 'NewJobApplicationSubmitted':
    case 'NewApplicationInDepartment':
    case 'AiScreeningCompleted':
    default:
      return <Briefcase className="h-4 w-4 text-primary-600 dark:text-primary-400" />;
  }
}

function formatRelativeTime(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  return date.toLocaleDateString();
}

export default function NotificationBell() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef(null);

  const role = profile?.role || 'Guest';

  const getRoleNotificationPath = () => {
    switch (role) {
      case 'Admin':
        return '/admin/notifications';
      case 'Recruiter':
        return '/recruiter/notifications';
      case 'HiringManager':
        return '/hiring-manager/notifications';
      case 'Candidate':
        return '/candidate/notifications';
      default:
        return '/dashboard';
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const count = await notificationsApi.getUnreadCount();
      setUnreadCount(count || 0);
    } catch {
      // Ignore background fetch errors
    }
  };

  const fetchRecentNotifications = async () => {
    try {
      setLoading(true);
      const data = await notificationsApi.getNotifications(false, 5);
      setNotifications(data || []);
    } catch {
      // Ignore background fetch errors
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000); // 30s light poll
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchRecentNotifications();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id, event) => {
    event.stopPropagation();
    try {
      await notificationsApi.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {
      // Ignore error
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationsApi.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {
      // Ignore error
    }
  };

  const handleViewAll = () => {
    setIsOpen(false);
    navigate(getRoleNotificationPath());
  };

  return (
    <div className="relative inline-block" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="View notifications"
        className="relative inline-flex h-8 w-8 items-center justify-center rounded-xl bg-white/70 text-secondary-600 transition-all hover:bg-white hover:text-primary-700 dark:bg-white/10 dark:text-secondary-300 dark:hover:bg-white/20 dark:hover:text-white sm:h-9 sm:w-9"
      >
        <Bell size={18} strokeWidth={1.75} />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white shadow-sm animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-secondary-200 bg-white p-4 shadow-2xl dark:border-white/10 dark:bg-secondary-900 z-[9999] animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between border-b border-secondary-100 pb-3 dark:border-white/10">
            <div className="flex items-center gap-2">
              <h3 className="text-body font-bold text-secondary-900 dark:text-white">Notifications</h3>
              {unreadCount > 0 && (
                <span className="rounded-full bg-primary-100 px-2 py-0.5 text-caption font-semibold text-primary-700 dark:bg-primary-500/20 dark:text-primary-300">
                  {unreadCount} new
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAllRead}
                  className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-caption font-medium text-secondary-500 hover:bg-secondary-100 hover:text-primary-700 dark:text-secondary-400 dark:hover:bg-white/10 dark:hover:text-primary-300"
                >
                  <CheckCheck size={14} />
                  <span>Mark all read</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-secondary-400 hover:bg-secondary-100 hover:text-secondary-700 dark:hover:bg-white/10 dark:hover:text-white"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          <div className="mt-3 max-h-80 space-y-2 overflow-y-auto pr-1">
            {loading ? (
              <div className="py-8 text-center text-body-sm text-secondary-400">Loading notifications...</div>
            ) : notifications.length === 0 ? (
              <div className="py-8 text-center text-body-sm text-secondary-400">No notifications found</div>
            ) : (
              notifications.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleMarkAsRead(item.id, { stopPropagation: () => {} })}
                  className={[
                    'group relative flex gap-3 rounded-xl p-3 text-left transition-all cursor-pointer',
                    item.isRead
                      ? 'bg-transparent hover:bg-secondary-50 dark:hover:bg-white/5'
                      : 'bg-primary-50/60 dark:bg-primary-950/30 hover:bg-primary-50 dark:hover:bg-primary-900/40',
                  ].join(' ')}
                >
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm dark:bg-secondary-800">
                    {getEventIcon(item.type)}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <p className={`text-body-sm font-semibold truncate ${item.isRead ? 'text-secondary-700 dark:text-secondary-300' : 'text-secondary-900 dark:text-white'}`}>
                        {item.title}
                      </p>
                      <span className="shrink-0 text-[10px] text-secondary-400">
                        {formatRelativeTime(item.sentAt)}
                      </span>
                    </div>
                    <p className="mt-0.5 line-clamp-2 text-caption text-secondary-500 dark:text-secondary-400">
                      {item.body}
                    </p>
                  </div>

                  {!item.isRead && (
                    <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary-500" />
                  )}
                </div>
              ))
            )}
          </div>

          <div className="mt-3 border-t border-secondary-100 pt-3 dark:border-white/10">
            <button
              type="button"
              onClick={handleViewAll}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-secondary-50 py-2 text-body-sm font-semibold text-primary-700 hover:bg-primary-100 dark:bg-white/5 dark:text-primary-300 dark:hover:bg-white/10"
            >
              <span>View all notifications</span>
              <ExternalLink size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
