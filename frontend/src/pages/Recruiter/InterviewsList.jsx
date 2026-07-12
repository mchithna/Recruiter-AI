import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  CalendarClock,
  CheckCircle2,
  Clock,
  Filter,
  Video,
} from 'lucide-react';
import {
  Avatar,
  Badge,
  Card,
  EmptyState,
  Select,
  Skeleton,
  StatCard,
} from '../../components/ui';
import StatusBadge from './components/StatusBadge';
import { getAllInterviews } from './services/mockData';

const formatScheduledTime = (scheduledTime) => {
  if (!scheduledTime) return 'Not scheduled';
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(scheduledTime));
};

const formatRelativeDay = (scheduledTime) => {
  if (!scheduledTime) return '';
  const now = new Date();
  const date = new Date(scheduledTime);
  const diffMs = date - now;
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays > 1 && diffDays <= 7) return `In ${diffDays} days`;
  if (diffDays < 0) return `${Math.abs(diffDays)} days ago`;
  return '';
};

export default function InterviewsList() {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState('upcoming');
  const [statusFilter, setStatusFilter] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    let isActive = true;

    async function fetchInterviews() {
      setLoading(true);

      try {
        const data = await getAllInterviews();
        if (!isActive) return;

        setInterviews(
          [...data].sort((a, b) => new Date(a.scheduledTime) - new Date(b.scheduledTime))
        );
      } catch (error) {
        console.error('Failed to fetch interviews:', error);
      } finally {
        if (isActive) setLoading(false);
      }
    }

    fetchInterviews();

    return () => {
      isActive = false;
    };
  }, []);

  const filteredInterviews = useMemo(() => {
    const now = new Date();

    return interviews.filter((interview) => {
      if (statusFilter !== 'all' && interview.status.toLowerCase() !== statusFilter) {
        return false;
      }

      if (timeFilter === 'all' || !interview.scheduledTime) {
        return true;
      }

      const interviewTime = new Date(interview.scheduledTime);
      if (timeFilter === 'upcoming') return interviewTime >= now;
      if (timeFilter === 'past') return interviewTime < now;

      return true;
    });
  }, [interviews, timeFilter, statusFilter]);

  const statusOptions = useMemo(() => {
    const statuses = Array.from(new Set(interviews.map((interview) => interview.status)));

    return [
      { value: 'all', label: 'All Statuses' },
      ...statuses.map((status) => ({ value: status.toLowerCase(), label: status })),
    ];
  }, [interviews]);

  const stats = useMemo(() => {
    const now = new Date();
    const upcoming = interviews.filter(
      (i) =>
        ['Scheduled', 'Confirmed'].includes(i.status) &&
        i.scheduledTime &&
        new Date(i.scheduledTime) > now
    );
    const completed = interviews.filter((i) => i.status === 'Completed');
    const today = interviews.filter((i) => {
      if (!i.scheduledTime) return false;
      const d = new Date(i.scheduledTime);
      return (
        d.getFullYear() === now.getFullYear() &&
        d.getMonth() === now.getMonth() &&
        d.getDate() === now.getDate()
      );
    });

    return { upcoming: upcoming.length, completed: completed.length, today: today.length };
  }, [interviews]);

  return (
    <div className="relative z-10 mx-auto max-w-7xl space-y-8 animate-slide-up">
      {/* Hero Banner */}
      <section className="glass-card-heavy relative overflow-hidden rounded-3xl border-none p-0">
        <img
          src="/images/card-bg-global-network.png"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover opacity-20 mix-blend-multiply dark:opacity-35 dark:mix-blend-screen"
        />
        <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-primary-500/20 blur-[70px]" />
        <div className="absolute -bottom-16 left-1/4 h-48 w-48 rounded-full bg-ai-500/20 blur-[80px]" />

        <div className="relative flex flex-col gap-5 p-8 sm:flex-row sm:items-center sm:justify-between lg:p-10">
          <div>
            <Badge variant="primary" size="sm" icon={<Calendar size={12} strokeWidth={1.75} />}>
              Interview center
            </Badge>
            <h1 className="mt-3 text-h1 text-secondary-900 dark:text-white">Interviews</h1>
            <p className="mt-2 max-w-2xl text-body-sm text-secondary-500 dark:text-secondary-300">
              Schedule, track and manage all candidate interviews in one polished view.
            </p>
          </div>
          <div className="hidden h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-primary-500 to-ai-600 text-white shadow-glow-primary sm:flex">
            <Video size={42} strokeWidth={1.5} />
          </div>
        </div>
      </section>

      {/* Stat Cards */}
      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard
          label="Upcoming"
          value={stats.upcoming}
          icon={CalendarClock}
          trend={{ direction: 'up', value: 'next 7 days' }}
          className="animate-counter glass-card-heavy border-none"
        />
        <StatCard
          label="Completed"
          value={stats.completed}
          icon={CheckCircle2}
          trend={{ direction: 'up', value: 'total done' }}
          className="animate-counter glass-card-heavy border-none"
        />
        <StatCard
          label="Today"
          value={stats.today}
          icon={Clock}
          trend={{ direction: 'up', value: 'on calendar' }}
          className="animate-counter glass-card-heavy border-none"
        />
      </section>

      {/* Filters */}
      <section className="glass-card-heavy flex flex-col items-start gap-4 rounded-2xl border-none p-5 sm:flex-row sm:items-end">
        <div className="flex items-center gap-2 text-caption font-semibold uppercase tracking-wide text-primary-700 dark:text-primary-300">
          <Filter size={14} strokeWidth={1.75} />
          Filters
        </div>
        <div className="grid w-full grid-cols-1 gap-3 sm:w-auto sm:grid-cols-2">
          <Select
            label="Date Range"
            value={timeFilter}
            onChange={(event) => setTimeFilter(event.target.value)}
            options={[
              { value: 'all', label: 'All Dates' },
              { value: 'upcoming', label: 'Upcoming' },
              { value: 'past', label: 'Past' },
            ]}
          />
          <Select
            label="Status"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            options={statusOptions}
          />
        </div>
      </section>

      {/* Interview Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          <Skeleton height="12rem" className="rounded-2xl" />
          <Skeleton height="12rem" className="rounded-2xl" />
          <Skeleton height="12rem" className="rounded-2xl" />
        </div>
      ) : filteredInterviews.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredInterviews.map((interview, index) => {
            const relDay = formatRelativeDay(interview.scheduledTime);

            return (
              <div
                key={interview.id}
                onClick={() => navigate(`/recruiter/applications/${interview.applicationId}`)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    navigate(`/recruiter/applications/${interview.applicationId}`);
                  }
                }}
                role="link"
                tabIndex={0}
                className="glass-card-heavy group block h-full cursor-pointer overflow-hidden rounded-2xl border-none p-0 transition-all duration-base hover:-translate-y-1"
                style={{ animationDelay: `${index * 60}ms` }}
              >
                {/* Gradient accent bar */}
                <div className="h-1.5 w-full bg-gradient-to-r from-primary-500 via-ai-500 to-primary-400" />

                <div className="p-5">
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <Avatar name={interview.candidateName} size="md" />
                      <div className="min-w-0">
                        <h3 className="truncate text-body-lg font-semibold text-secondary-900 transition-colors group-hover:text-primary-700 dark:text-white dark:group-hover:text-primary-300">
                          {interview.candidateName}
                        </h3>
                        <p className="truncate text-body-sm text-secondary-500 dark:text-secondary-300">
                          {interview.jobTitle}
                        </p>
                      </div>
                    </div>
                    <StatusBadge status={interview.status} />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2 rounded-xl bg-secondary-50 p-3 dark:bg-white/5">
                      <CalendarClock
                        size={16}
                        strokeWidth={1.75}
                        className="shrink-0 text-primary-600 dark:text-primary-400"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-body-sm font-semibold text-secondary-800 dark:text-white">
                          {formatScheduledTime(interview.scheduledTime)}
                        </p>
                        <p className="text-caption text-secondary-500 dark:text-secondary-300">
                          {interview.durationMinutes} min · {interview.interviewType}
                        </p>
                      </div>
                      {relDay && (
                        <Badge variant="ai" size="sm">
                          {relDay}
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <p className="text-caption text-secondary-500 dark:text-secondary-400">
                        with {interview.interviewerName}
                      </p>
                      {interview.meetingLink && (
                        <Badge variant="primary" size="sm" icon={<Video size={10} />}>
                          Video
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <Card className="glass-card-heavy border-none">
          <EmptyState
            icon={CalendarClock}
            title="No interviews match these filters"
            description="Adjust the date or status filters to review more scheduled interviews."
          />
        </Card>
      )}
    </div>
  );
}
