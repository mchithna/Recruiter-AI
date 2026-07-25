import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  Briefcase,
  Calendar,
  FileCheck,
  MessageSquare,
  CheckCheck,
  Trash2,
  ExternalLink
} from 'lucide-react';
import { notificationsApi } from '../lib/notificationsApi';
import { useAuth } from '../contexts/AuthContext';
import { Button, Card, EmptyState, Badge, Spinner } from '../components/ui';

const NOTIFICATION_REFRESH_INTERVAL_MS = 5000;

function getEventIcon(type) {
  switch (type) {
    case 'InterviewScheduled':
    case 'InterviewRescheduled':
    case 'InterviewAssigned':
      return <Calendar className="h-5 w-5 text-purple-600 dark:text-purple-400" />;
    case 'OfferIssued':
    case 'OfferRespondedByCandidate':
      return <FileCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />;
    case 'NewMessageReceived':
    case 'NewCandidateMessage':
      return <MessageSquare className="h-5 w-5 text-blue-600 dark:text-blue-400" />;
    case 'ApplicationStatusUpdated':
    case 'NewJobApplicationSubmitted':
    case 'NewApplicationInDepartment':
    case 'AiScreeningCompleted':
    default:
      return <Briefcase className="h-5 w-5 text-primary-600 dark:text-primary-400" />;
  }
}

function formatFullTime(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export default function NotificationsPage() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'unread'
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const role = profile?.role || 'Guest';

  const fetchNotifications = useCallback(async ({ showLoading = false } = {}) => {
    try {
      if (showLoading) setLoading(true);
      const data = await notificationsApi.getNotifications(activeTab === 'unread', 100);
      setNotifications(data || []);
    } catch {
      // Ignore background fetch error
    } finally {
      if (showLoading) setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    const refreshOnFocus = () => {
      fetchNotifications();
    };
    const refreshWhenVisible = () => {
      if (document.visibilityState === 'visible') {
        fetchNotifications();
      }
    };

    fetchNotifications({ showLoading: true });
    const interval = window.setInterval(fetchNotifications, NOTIFICATION_REFRESH_INTERVAL_MS);
    window.addEventListener('focus', refreshOnFocus);
    document.addEventListener('visibilitychange', refreshWhenVisible);

    return () => {
      window.clearInterval(interval);
      window.removeEventListener('focus', refreshOnFocus);
      document.removeEventListener('visibilitychange', refreshWhenVisible);
    };
  }, [fetchNotifications]);

  const handleMarkAsRead = async (id) => {
    try {
      await notificationsApi.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch {
      // Ignore error
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationsApi.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch {
      // Ignore error
    }
  };

  const handleDelete = async (id) => {
    try {
      await notificationsApi.deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch {
      // Ignore error
    }
  };

  const getTargetRoute = (item) => {
    if (!item.relatedEntityType || !item.relatedEntityId) return null;
    const type = item.relatedEntityType;
    const id = item.relatedEntityId;

    if (role === 'Candidate') {
      if (type === 'Application' || type === 'Offer') return `/candidate/applications/${id}`;
      if (type === 'Interview') return '/candidate/meetings';
      if (type === 'Job') return `/candidate/jobs/${id}`;
    } else if (role === 'Recruiter') {
      if (type === 'Application') return `/recruiter/applications/${id}`;
      if (type === 'Interview') return `/recruiter/interviews/${id}`;
      if (type === 'Message') return '/recruiter/messages';
      if (type === 'Job') return `/recruiter/jobs/${id}/applications`;
    } else if (role === 'HiringManager') {
      if (type === 'Application') return `/hiring-manager/applications/${id}`;
      if (type === 'Interview') return `/hiring-manager/interviews/${id}`;
      if (type === 'Offer') return '/hiring-manager/offers';
    }
    return null;
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-h2 font-bold text-secondary-900 dark:text-white sm:text-h1">Notifications</h1>
          <p className="mt-1 text-body-sm text-secondary-500 dark:text-secondary-400">
            Track your recruitment alerts, application status changes, and scheduled meetings.
          </p>
        </div>

        {unreadCount > 0 && (
          <Button
            type="button"
            variant="glass"
            size="sm"
            leftIcon={<CheckCheck size={16} />}
            onClick={handleMarkAllRead}
          >
            Mark all as read
          </Button>
        )}
      </div>

      {/* Tabs / Filters */}
      <div className="flex items-center gap-2 border-b border-secondary-200 pb-2 dark:border-white/10">
        <button
          type="button"
          onClick={() => setActiveTab('all')}
          className={[
            'flex items-center gap-2 rounded-xl px-4 py-2 text-body-sm font-semibold transition-all',
            activeTab === 'all'
              ? 'bg-primary-600 text-white shadow-glow-primary'
              : 'text-secondary-600 hover:bg-secondary-100 dark:text-secondary-300 dark:hover:bg-white/10',
          ].join(' ')}
        >
          <span>All Notifications</span>
          <Badge variant="neutral" size="sm">
            {notifications.length}
          </Badge>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('unread')}
          className={[
            'flex items-center gap-2 rounded-xl px-4 py-2 text-body-sm font-semibold transition-all',
            activeTab === 'unread'
              ? 'bg-primary-600 text-white shadow-glow-primary'
              : 'text-secondary-600 hover:bg-secondary-100 dark:text-secondary-300 dark:hover:bg-white/10',
          ].join(' ')}
        >
          <span>Unread Only</span>
          {unreadCount > 0 && (
            <span className="rounded-full bg-red-500 px-2 py-0.5 text-[11px] font-bold text-white">
              {unreadCount}
            </span>
          )}
        </button>
      </div>

      {/* Main List Area */}
      {loading ? (
        <Card className="flex h-64 items-center justify-center p-8">
          <Spinner size="lg" />
        </Card>
      ) : notifications.length === 0 ? (
        <Card className="p-12 text-center">
          <EmptyState
            icon={Bell}
            title={activeTab === 'unread' ? 'No unread notifications' : 'No notifications'}
            description="You're all caught up! New notifications regarding applications and interviews will appear here."
          />
        </Card>
      ) : (
        <div className="space-y-3">
          {notifications.map((item) => {
            const targetRoute = getTargetRoute(item);

            return (
              <Card
                key={item.id}
                className={[
                  'group relative flex flex-col gap-4 p-5 transition-all sm:flex-row sm:items-center sm:justify-between',
                  item.isRead
                    ? 'bg-white/80 dark:bg-secondary-900/60'
                    : 'border-l-4 border-l-primary-500 bg-primary-50/40 dark:bg-primary-950/20',
                ].join(' ')}
              >
                <div className="flex min-w-0 items-start gap-4">
                  <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white shadow-sm dark:bg-secondary-800">
                    {getEventIcon(item.type)}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className={`text-body font-semibold ${item.isRead ? 'text-secondary-800 dark:text-secondary-200' : 'text-secondary-900 dark:text-white'}`}>
                        {item.title}
                      </h3>
                      {!item.isRead && (
                        <span className="rounded-full bg-primary-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary-700 dark:bg-primary-500/20 dark:text-primary-300">
                          New
                        </span>
                      )}
                    </div>

                    <p className="mt-1 text-body-sm text-secondary-600 dark:text-secondary-300">
                      {item.body}
                    </p>

                    <p className="mt-2 text-caption text-secondary-400">
                      {formatFullTime(item.sentAt)}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex shrink-0 items-center gap-2 border-t border-secondary-100 pt-3 dark:border-white/10 sm:border-0 sm:pt-0">
                  {targetRoute && (
                    <Button
                      type="button"
                      variant="glass"
                      size="sm"
                      rightIcon={<ExternalLink size={14} />}
                      onClick={() => navigate(targetRoute)}
                    >
                      View Details
                    </Button>
                  )}

                  {!item.isRead && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      leftIcon={<CheckCheck size={14} />}
                      onClick={() => handleMarkAsRead(item.id)}
                    >
                      Mark read
                    </Button>
                  )}

                  <button
                    type="button"
                    aria-label="Delete notification"
                    onClick={() => handleDelete(item.id)}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-xl text-secondary-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30 dark:hover:text-red-400"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
