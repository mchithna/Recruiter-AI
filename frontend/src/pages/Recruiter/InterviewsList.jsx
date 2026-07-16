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
import { StatusBadge } from '../../components/ui';
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

      {/* Filters UI */}
      <section className="relative flex flex-col items-start gap-6 rounded-[20px] border border-white/5 bg-[#0b0e1e] p-6 sm:flex-row sm:items-end shadow-2xl">
        {/* Background Decorative Shapes */}
        <div className="absolute inset-0 overflow-hidden rounded-[20px] pointer-events-none">
          <div className="absolute left-1/3 top-1/2 -translate-y-1/2 h-32 w-32 rotate-12 rounded-[2rem] border-[1.5px] border-white/5 bg-white/[0.01]" />
          <div className="absolute left-[35%] top-1/2 -translate-y-[40%] h-24 w-24 -rotate-6 rounded-[1.5rem] border-[1.5px] border-white/5 bg-white/[0.01] mix-blend-overlay" />
        </div>

        <div className="relative z-10 flex h-[42px] items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-[#a3adc2]">
          <Filter size={15} strokeWidth={2} />
          Filters
        </div>
        
        <div className="relative z-10 grid w-full grid-cols-1 gap-4 sm:w-auto sm:grid-cols-2">
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
                className="group relative block h-full cursor-pointer overflow-hidden rounded-[20px] bg-[#0f1225] border border-white/5 p-0 transition-all duration-base hover:-translate-y-1 shadow-xl"
                style={{ animationDelay: `${index * 60}ms` }}
              >
                {/* Gradient accent bar */}
                <div className="absolute top-0 left-0 right-0 h-[6px] bg-gradient-to-r from-[#6366f1] via-[#8b5cf6] to-[#6366f1]" />

                {/* Sublte glass shine in the background */}
                <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-40 w-40 rotate-12 rounded-[2rem] border-[1.5px] border-white/5 bg-white/[0.01] opacity-50 mix-blend-overlay" />

                <div className="relative p-6 pt-7">
                  <div className="mb-5 flex items-start justify-between gap-3">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      {/* Avatar with specific style for dark UI */}
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white text-sm font-bold tracking-wide text-[#2563eb] shadow-sm">
                        {interview.candidateName
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .toUpperCase()
                          .substring(0, 2)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="truncate text-[16px] font-bold text-white transition-colors group-hover:text-primary-300">
                          {interview.candidateName}
                        </h3>
                        <p className="truncate text-[13px] font-medium text-[#94a3b8] mt-0.5">
                          {interview.jobTitle}
                        </p>
                      </div>
                    </div>
                    <div className="shrink-0">
                      <StatusBadge status={interview.status?.toLowerCase().replace(/ /g, '_')} />
                    </div>
                  </div>

                  <div className="space-y-4">
                    {/* Inner Time Block */}
                    <div className="flex items-center gap-3 rounded-2xl bg-[#191e36] p-4 border border-white/[0.03]">
                      <CalendarClock
                        size={18}
                        strokeWidth={2}
                        className="shrink-0 text-[#8b5cf6]"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-[14px] font-bold text-white">
                          {formatScheduledTime(interview.scheduledTime)}
                        </p>
                        <p className="text-[12px] font-medium text-[#94a3b8] mt-0.5">
                          {interview.durationMinutes} min · {interview.interviewType}
                        </p>
                      </div>
                      {relDay && (
                        <span className="shrink-0 rounded-full bg-white px-2.5 py-1 text-[11px] font-extrabold tracking-wide text-[#8b5cf6] shadow-sm">
                          {relDay}
                        </span>
                      )}
                    </div>

                    {/* Bottom Row */}
                    <div className="flex items-center justify-between pl-1">
                      <p className="text-[13px] font-medium text-[#64748b]">
                        with {interview.interviewerName}
                      </p>
                      {interview.meetingLink && (
                        <div className="flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-[12px] font-bold text-[#6366f1] shadow-sm">
                          <Video size={14} strokeWidth={2.5} />
                          Video
                        </div>
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
