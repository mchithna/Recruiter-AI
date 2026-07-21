import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, CalendarClock, CheckCircle2, Clock, Filter, Sparkles } from 'lucide-react';
import {
  Badge,
  Card,
  Skeleton,
  Select,
  StatCard,
  EmptyState,
} from '../../components/ui';
import InterviewCard from './components/InterviewCard';
import { getAllInterviews } from './services/hiringManagerApi';

export function Interviews() {
  const navigate = useNavigate();
  const [interviews, setInterviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState('upcoming');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    let isActive = true;

    async function loadInterviews() {
      try {
        setIsLoading(true);
        const data = await getAllInterviews();
        if (isActive) {
          // Sort by date ascending
          const sorted = [...data].sort(
            (a, b) => new Date(a.scheduledTime) - new Date(b.scheduledTime)
          );
          setInterviews(sorted);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Failed to load interviews schedule', error);
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    loadInterviews();

    return () => {
      isActive = false;
    };
  }, []);

  // Filter logic
  const filteredInterviews = useMemo(() => {
    const now = new Date();
    return interviews.filter((interview) => {
      // Status filter
      if (statusFilter !== 'all' && interview.status.toLowerCase() !== statusFilter.toLowerCase()) {
        return false;
      }

      // Time filter
      if (timeFilter !== 'all' && interview.scheduledTime) {
        const interviewTime = new Date(interview.scheduledTime);
        if (timeFilter === 'upcoming' && interviewTime < now) return false;
        if (timeFilter === 'past' && interviewTime >= now) return false;
      }

      return true;
    });
  }, [interviews, timeFilter, statusFilter]);

  // Dynamic status options from data
  const statusOptions = useMemo(() => {
    const statuses = Array.from(new Set(interviews.map((int) => int.status)));
    return [
      { value: 'all', label: 'All Statuses' },
      ...statuses.map((status) => ({
        value: status.toLowerCase(),
        label: status,
      })),
    ];
  }, [interviews]);

  // Statistics calculation
  const stats = useMemo(() => {
    const now = new Date();
    const upcoming = interviews.filter(
      (i) =>
        ['Scheduled', 'Confirmed', 'Rescheduled'].includes(i.status) &&
        i.scheduledTime &&
        new Date(i.scheduledTime) >= now
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

    return {
      upcoming: upcoming.length,
      completed: completed.length,
      today: today.length,
    };
  }, [interviews]);

  return (
    <div className="relative z-10 space-y-6 animate-slide-up">
      {/* Banner */}
      <section className="glass-card-heavy relative overflow-hidden rounded-3xl border-none p-6">
        <img
          src="/images/card-bg-global-network.png"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover opacity-15 dark:opacity-35 dark:mix-blend-screen"
        />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Badge variant="primary" size="sm" icon={<Calendar size={12} strokeWidth={1.75} />}>
              Interview Command Center
            </Badge>
            <h1 className="mt-3 text-h1 text-secondary-900 dark:text-white">Interviews Schedule</h1>
            <p className="mt-2 max-w-2xl text-body-sm text-secondary-500 dark:text-secondary-300">
              Track your upcoming evaluations, panel loops, and historical notes across all active roles.
            </p>
          </div>
          <div className="hidden h-24 w-24 items-center justify-center rounded-3xl bg-primary-500 text-white shadow-glow-primary sm:flex">
            <CalendarClock size={42} strokeWidth={1.5} />
          </div>
        </div>
      </section>

      {/* Quick Statistics */}
      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard
          label="Upcoming Loops"
          value={stats.upcoming}
          icon={CalendarClock}
          trend={{ direction: 'up', value: 'this week' }}
          className="glass-card-heavy border-none"
        />
        <StatCard
          label="Completed Loops"
          value={stats.completed}
          icon={CheckCircle2}
          trend={{ direction: 'up', value: 'archived assessments' }}
          className="glass-card-heavy border-none"
        />
        <StatCard
          label="Interviews Today"
          value={stats.today}
          icon={Clock}
          trend={{ direction: 'up', value: 'on agenda' }}
          className="glass-card-heavy border-none"
        />
      </section>

      {/* Filters Select Panel */}
      <section className="relative flex flex-col items-start gap-4 rounded-3xl border border-secondary-100 bg-white/70 p-6 sm:flex-row sm:items-end shadow-glass dark:border-white/5 dark:bg-[#0b0e1e]">
        <div className="flex h-10 items-center gap-2 text-caption font-bold uppercase tracking-wider text-secondary-500 dark:text-secondary-400">
          <Filter size={15} strokeWidth={2} />
          Filters
        </div>
        <div className="grid w-full grid-cols-1 gap-4 sm:w-auto sm:grid-cols-2">
          <Select
            label="Schedule Timeline"
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value)}
            options={[
              { value: 'all', label: 'All Dates' },
              { value: 'upcoming', label: 'Upcoming' },
              { value: 'past', label: 'Past' },
            ]}
          />
          <Select
            label="Status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={statusOptions}
          />
        </div>
      </section>

      {/* Grid of cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          <Skeleton className="h-48 rounded-2xl" />
          <Skeleton className="h-48 rounded-2xl" />
          <Skeleton className="h-48 rounded-2xl" />
        </div>
      ) : filteredInterviews.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredInterviews.map((interview) => (
            <div
              key={interview.id}
              onClick={() => navigate(`/hiring-manager/interviews/${interview.id}`)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  navigate(`/hiring-manager/interviews/${interview.id}`);
                }
              }}
              role="link"
              tabIndex={0}
              className="h-full cursor-pointer transition-transform hover:-translate-y-1 focus:outline-none"
            >
              <InterviewCard
                interview={interview}
                action={{
                  label: 'Live Copilot',
                  icon: <Sparkles size={14} />,
                  onClick: (event) => {
                    event.stopPropagation();
                    navigate(`/hiring-manager/interviews/${interview.id}/live-copilot`);
                  },
                }}
              />
            </div>
          ))}
        </div>
      ) : (
        <Card className="glass-card-heavy border-none py-12">
          <EmptyState
            icon={CalendarClock}
            title="No matches found"
            description="Adjust your timeline or status filters to view other scheduled interviews."
          />
        </Card>
      )}
    </div>
  );
}

export default Interviews;
