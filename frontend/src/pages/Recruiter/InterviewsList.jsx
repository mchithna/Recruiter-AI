import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  CalendarClock,
  CheckCircle2,
  Clock,
  Filter,
} from 'lucide-react';
import {
  Badge,
  Card,
  EmptyState,
  Select,
  Skeleton,
  StatCard,
} from '../../components/ui';
import InterviewCard from './components/InterviewCard';
import { recruiterApi } from './services/recruiterApi';

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
        const data = await recruiterApi.getDashboard();
        if (!isActive) return;

        setInterviews(
          [...(data.interviews || [])].sort((a, b) => new Date(a.scheduledTime) - new Date(b.scheduledTime))
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
            <Calendar size={42} strokeWidth={1.5} />
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
          {filteredInterviews.map((interview) => (
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
              className="cursor-pointer transition-transform hover:-translate-y-1 focus:outline-none"
            >
              <InterviewCard interview={interview} />
            </div>
          ))}
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

