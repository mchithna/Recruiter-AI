import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Briefcase, Calendar, FileCheck, MessageSquare, CheckCheck, ExternalLink, X } from 'lucide-react';
import { notificationsApi } from '../../lib/notificationsApi';
import { useAuth } from '../../contexts/AuthContext';

const NOTIFICATION_REFRESH_INTERVAL_MS = 5000;

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

  const fetchUnreadCount = useCallback(async () => {
    try {
      const count = await notificationsApi.getUnreadCount();
      setUnreadCount(count || 0);
    } catch {
      // Ignore background fetch errors
    }
  }, []);

  const fetchRecentNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const data = await notificationsApi.getNotifications(false, 5);
      setNotifications(data || []);
    } catch {
      // Ignore background fetch errors
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const refreshOnFocus = () => {
      fetchUnreadCount();
    };
    const refreshWhenVisible = () => {
      if (document.visibilityState === 'visible') {
        fetchUnreadCount();
      }
    };

    fetchUnreadCount();
    const interval = window.setInterval(fetchUnreadCount, NOTIFICATION_REFRESH_INTERVAL_MS);
    window.addEventListener('focus', refreshOnFocus);
    document.addEventListener('visibilitychange', refreshWhenVisible);

    return () => {
      window.clearInterval(interval);
      window.removeEventListener('focus', refreshOnFocus);
      document.removeEventListener('visibilitychange', refreshWhenVisible);
    };
  }, [fetchUnreadCount]);

  useEffect(() => {
    if (!isOpen) return undefined;

    fetchRecentNotifications();
    const interval = window.setInterval(fetchRecentNotifications, NOTIFICATION_REFRESH_INTERVAL_MS);

    return () => window.clearInterval(interval);
  }, [fetchRecentNotifications, isOpen]);

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
    <div className="relative inline-block z-50" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="View notifications"
        className="relative inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white/70 text-secondary-600 transition-all hover:bg-white hover:text-primary-700 dark:bg-white/10 dark:text-secondary-300 dark:hover:bg-white/20 dark:hover:text-white"
      >
        <Bell size={18} strokeWidth={1.75} />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white shadow-sm animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="notification-panel-popover fixed inset-x-3 top-[4.75rem] z-[99999] flex max-h-[calc(100dvh-5.75rem)] flex-col overflow-hidden rounded-2xl border border-secondary-200 p-3 shadow-[0_20px_50px_rgba(0,0,0,0.4)] dark:border-slate-700/80 sm:absolute sm:inset-x-auto sm:right-0 sm:top-auto sm:mt-2 sm:max-h-none sm:w-96 sm:p-4 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-start justify-between gap-3 border-b border-secondary-100 pb-3 dark:border-slate-700/80">
            <div className="flex min-w-0 flex-wrap items-center gap-2">
              <h3 className="text-body font-bold text-secondary-900 dark:text-white">Notifications</h3>
              {unreadCount > 0 && (
                <span className="rounded-full bg-primary-100 px-2 py-0.5 text-caption font-semibold text-primary-700 dark:bg-primary-500/20 dark:text-primary-300">
                  {unreadCount} new
                </span>
              )}
            </div>
            <div className="flex shrink-0 items-center gap-1">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAllRead}
                  className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-caption font-medium text-secondary-500 hover:bg-secondary-100 hover:text-primary-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-primary-300"
                >
                  <CheckCheck size={14} />
                  <span className="hidden min-[360px]:inline">Mark all read</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-secondary-400 hover:bg-secondary-100 hover:text-secondary-700 dark:hover:bg-slate-800 dark:hover:text-white"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          <div className="mt-3 min-h-0 flex-1 space-y-2 overflow-y-auto pr-1 sm:max-h-80">
            {loading ? (
              <div className="py-8 text-center text-body-sm text-secondary-400 dark:text-slate-400">Loading notifications...</div>
            ) : notifications.length === 0 ? (
              <div className="py-8 text-center text-body-sm text-secondary-400 dark:text-slate-400">No notifications found</div>
            ) : (
              notifications.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleMarkAsRead(item.id, { stopPropagation: () => {} })}
                  className={[
                    'group relative flex gap-3 rounded-xl p-3 text-left transition-all cursor-pointer',
                    item.isRead
                      ? 'bg-secondary-50/50 hover:bg-secondary-100/70 dark:bg-slate-800/40 dark:hover:bg-slate-800/80'
                      : 'bg-primary-50/80 hover:bg-primary-100/80 dark:bg-indigo-950/50 dark:hover:bg-indigo-900/60 border border-primary-100 dark:border-indigo-500/20',
                  ].join(' ')}
                >
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm dark:bg-slate-800">
                    {getEventIcon(item.type)}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <p className={`truncate text-body-sm font-semibold ${item.isRead ? 'text-secondary-700 dark:text-slate-300' : 'text-secondary-900 dark:text-white'}`}>
                        {item.title}
                      </p>
                      <span className="shrink-0 text-[10px] text-secondary-400 dark:text-slate-400">
                        {formatRelativeTime(item.sentAt)}
                      </span>
                    </div>
                    <p className="mt-0.5 line-clamp-2 text-caption text-secondary-600 dark:text-slate-300">
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

          <div className="mt-3 shrink-0 border-t border-secondary-100 pt-3 dark:border-slate-700/80">
            <button
              type="button"
              onClick={handleViewAll}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-secondary-100/80 px-3 py-2 text-body-sm font-semibold text-primary-700 transition-colors hover:bg-primary-100 dark:bg-slate-800 dark:text-primary-300 dark:hover:bg-slate-700"
            >
              <span className="min-w-0 truncate">View all notifications</span>
              <ExternalLink size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
