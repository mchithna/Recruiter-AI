import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BarChart2,
  Bot,
  Briefcase,
  CalendarClock,
  ChevronRight,
  Clock,
  MessageSquare,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react';
import {
  Avatar,
  Badge,
  Button,
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
  ProgressBar,
  Skeleton,
  StatCard,
} from '../../components/ui';
import StatusBadge from './components/StatusBadge';
import { getAllApplications, getAllInterviews, getJobs } from './services/mockData';

const pipelineOrder = [
  'Applied',
  'Under Review',
  'Shortlisted',
  'Interview Scheduled',
  'Offer Extended',
  'Hired',
];

const formatDate = (date) =>
  new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
  }).format(new Date(date));

export default function RecruiterHome() {
  const [dashboardData, setDashboardData] = useState({
    jobs: [],
    applications: [],
    interviews: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isActive = true;

    async function loadDashboardData() {
      setLoading(true);

      try {
        const [jobs, applications, interviews] = await Promise.all([
          getJobs(),
          getAllApplications(),
          getAllInterviews(),
        ]);

        if (!isActive) return;
        setDashboardData({ jobs, applications, interviews });
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        if (isActive) setLoading(false);
      }
    }

    loadDashboardData();

    return () => {
      isActive = false;
    };
  }, []);

  const dashboard = useMemo(() => {
    const { jobs, applications, interviews } = dashboardData;
    const now = new Date();
    const futureInterviews = interviews
      .filter((interview) =>
        ['Scheduled', 'Confirmed', 'Rescheduled'].includes(interview.status) &&
        interview.scheduledTime &&
        new Date(interview.scheduledTime) > now
      )
      .sort((a, b) => new Date(a.scheduledTime) - new Date(b.scheduledTime));

    const recentApplications = [...applications]
      .sort((a, b) => new Date(b.appliedAt) - new Date(a.appliedAt))
      .slice(0, 5);

    const topCandidate = [...applications].sort((a, b) => b.aiMatchScore - a.aiMatchScore)[0];
    const closestDeadlineJob = jobs
      .filter((job) => job.applicationDeadline && job.status === 'Open')
      .sort((a, b) => new Date(a.applicationDeadline) - new Date(b.applicationDeadline))[0];

    const avgAiScore = applications.length
      ? Math.round(
          applications.reduce((total, application) => total + application.aiMatchScore, 0) /
            applications.length
        )
      : 0;

    const hiredCount = applications.filter((application) => application.status === 'Hired').length;
    const positiveOutcomes = applications.filter((application) =>
      ['Shortlisted', 'Interview Scheduled', 'Offer Extended', 'Hired'].includes(application.status)
    ).length;

    return {
      stats: {
        openJobs: jobs.filter((job) => job.status === 'Open').length,
        appsNeedingReview: applications.filter((application) =>
          ['Applied', 'Under Review'].includes(application.status)
        ).length,
        upcomingInterviews: futureInterviews.length,
        avgAiScore,
        hiredCount,
        positiveOutcomes,
      },
      recentApplications,
      topCandidate,
      closestDeadlineJob,
      nextInterview: futureInterviews[0],
      pipeline: pipelineOrder.map((status) => ({
        status,
        count: applications.filter((application) => application.status === status).length,
      })),
    };
  }, [dashboardData]);

  if (loading) {
    return (
      <div className="relative z-10 mx-auto max-w-7xl space-y-6">
        <Skeleton height="18rem" className="rounded-2xl" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <Skeleton height="8rem" />
          <Skeleton height="8rem" />
          <Skeleton height="8rem" />
          <Skeleton height="8rem" />
        </div>
        <Skeleton height="24rem" className="rounded-2xl" />
      </div>
    );
  }

  const { stats, recentApplications, topCandidate, closestDeadlineJob, nextInterview, pipeline } =
    dashboard;

  return (
    <div className="relative z-10 mx-auto max-w-7xl space-y-8 animate-slide-up">
      <section className="glass-card-heavy relative overflow-hidden rounded-3xl border-none p-0">
        <img
          src="/images/image_01.jpg"
          alt="AI recruitment dashboard"
          className="absolute inset-0 h-full w-full object-cover opacity-20 mix-blend-multiply dark:opacity-35 dark:mix-blend-screen"
        />
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-primary-500/20 blur-[80px]" />
        <div className="absolute -bottom-24 left-1/3 h-72 w-72 rounded-full bg-ai-500/20 blur-[90px]" />

        <div className="relative grid gap-8 p-8 lg:grid-cols-[minmax(0,1.2fr)_420px] lg:p-10">
          <div className="flex flex-col justify-between gap-8">
            <div>
              <Badge variant="ai" className="inline-flex items-center gap-2 uppercase tracking-widest">
                <span className="h-1.5 w-1.5 rounded-full bg-ai-500 animate-pulse" />
                AI Hiring Command Center
              </Badge>
              <h1 className="mt-6 max-w-3xl text-4xl font-black leading-tight tracking-tight text-secondary-900 dark:text-white md:text-5xl">
                Build your shortlist with{' '}
                <span className="text-gradient-vivid">clarity and speed.</span>
              </h1>
              <p className="mt-5 max-w-2xl text-body-lg leading-relaxed text-secondary-600 dark:text-secondary-300">
                Monitor candidate momentum, AI match quality, interviews, and priority actions from one polished recruiter workspace.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link to="/recruiter/jobs">
                <Button
                  type="button"
                  variant="glass"
                  size="lg"
                  className="rounded-xl"
                  leftIcon={<Briefcase size={18} strokeWidth={1.75} />}
                >
                  Manage Jobs
                </Button>
              </Link>
              <Link to="/recruiter/interviews">
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  className="rounded-xl bg-white/60 dark:bg-white/10"
                  leftIcon={<CalendarClock size={18} strokeWidth={1.75} />}
                >
                  View Interviews
                </Button>
              </Link>
            </div>
          </div>

          <div className="rounded-3xl border border-white/50 bg-secondary-950 p-3 shadow-2xl dark:border-white/15">
            <div className="relative min-h-80 overflow-hidden rounded-2xl bg-secondary-950">
              <img
                src="/images/card-bg-live-analytics.png"
                alt=""
                aria-hidden="true"
                className="absolute inset-0 h-full w-full object-cover opacity-80 mix-blend-screen"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-secondary-950 via-secondary-950/30 to-transparent" />
              <div className="relative flex h-full min-h-80 flex-col justify-end p-6">
                <div className="rounded-2xl border border-white/15 bg-white/10 p-5 text-white shadow-glass backdrop-blur-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-caption font-semibold uppercase tracking-wide text-primary-200">
                        Avg. AI match
                      </p>
                      <p className="mt-1 text-5xl font-black tabular-nums">{stats.avgAiScore}%</p>
                    </div>
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-500 shadow-lg shadow-primary-500/40">
                      <Bot size={28} strokeWidth={1.75} />
                    </div>
                  </div>
                  <div className="mt-5 grid grid-cols-3 gap-3 text-center">
                    <div className="rounded-xl bg-white/10 p-3">
                      <p className="text-2xl font-black tabular-nums">{stats.openJobs}</p>
                      <p className="text-caption text-primary-100">Open</p>
                    </div>
                    <div className="rounded-xl bg-white/10 p-3">
                      <p className="text-2xl font-black tabular-nums">{stats.positiveOutcomes}</p>
                      <p className="text-caption text-primary-100">Progressing</p>
                    </div>
                    <div className="rounded-xl bg-white/10 p-3">
                      <p className="text-2xl font-black tabular-nums">{stats.hiredCount}</p>
                      <p className="text-caption text-primary-100">Hired</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Open Jobs"
          value={stats.openJobs}
          icon={Briefcase}
          trend={{ direction: 'up', value: '+2 this week' }}
          className="animate-counter glass-card-heavy border-none"
        />
        <StatCard
          label="Needs Review"
          value={stats.appsNeedingReview}
          icon={Users}
          trend={{ direction: 'up', value: 'active queue' }}
          className="animate-counter glass-card-heavy border-none"
        />
        <StatCard
          label="Upcoming Interviews"
          value={stats.upcomingInterviews}
          icon={CalendarClock}
          trend={{ direction: 'down', value: 'next 7 days' }}
          trendUpIsGood={false}
          className="animate-counter glass-card-heavy border-none"
        />
        <StatCard
          label="AI Match Quality"
          value={`${stats.avgAiScore}%`}
          icon={TrendingUp}
          trend={{ direction: 'up', value: '+6% vs last batch' }}
          className="animate-counter glass-card-heavy border-none"
        />
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <Card className="glass-card-heavy overflow-hidden border-none p-0">
          <CardHeader className="mb-0 p-6 pb-4">
            <div>
              <div className="mb-2 flex items-center gap-2 text-caption font-semibold uppercase tracking-wide text-primary-700 dark:text-primary-300">
                <BarChart2 size={14} strokeWidth={1.75} />
                Pipeline flow
              </div>
              <CardTitle>Candidate Pipeline</CardTitle>
              <CardDescription>Current application volume by stage.</CardDescription>
            </div>
          </CardHeader>

          <div className="space-y-4 p-6 pt-0">
            {pipeline.map((item) => {
              const maxCount = Math.max(...pipeline.map((stage) => stage.count), 1);
              const value = Math.round((item.count / maxCount) * 100);

              return (
                <div key={item.status} className="grid gap-3 sm:grid-cols-[150px_minmax(0,1fr)_48px] sm:items-center">
                  <div className="flex items-center gap-2">
                    <StatusBadge status={item.status} />
                  </div>
                  <ProgressBar value={value} size="md" />
                  <p className="text-right text-body-sm font-semibold tabular-nums text-secondary-800 dark:text-white">
                    {item.count}
                  </p>
                </div>
              );
            })}
          </div>
        </Card>

        <div className="space-y-6">
          <Card className="glass-card-heavy relative overflow-hidden border-none">
            <img
              src="/images/card-bg-ai-matching.png"
              alt=""
              aria-hidden="true"
              className="absolute inset-0 h-full w-full object-cover opacity-15 dark:opacity-40 dark:mix-blend-screen"
            />
            <div className="relative">
              <div className="flex items-center gap-2 text-caption font-semibold uppercase tracking-wide text-ai-700 dark:text-ai-300">
                <Sparkles size={14} strokeWidth={1.75} />
                AI recommendation
              </div>
              <h2 className="mt-3 text-h3 text-secondary-900 dark:text-white">
                Schedule your strongest match next
              </h2>
              {topCandidate && (
                <div className="mt-5 flex items-center gap-4 rounded-2xl border border-white/50 bg-white/70 p-4 dark:border-white/10 dark:bg-white/10">
                  <Avatar name={topCandidate.candidateName} size="lg" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-body-lg font-semibold text-secondary-900 dark:text-white">
                      {topCandidate.candidateName}
                    </p>
                    <p className="truncate text-body-sm text-secondary-500 dark:text-secondary-300">
                      {topCandidate.jobTitle}
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <Badge variant="ai" size="sm">{topCandidate.aiMatchScore}% AI match</Badge>
                      <StatusBadge status={topCandidate.status} />
                    </div>
                  </div>
                </div>
              )}
              {topCandidate && (
                <Link to={`/recruiter/applications/${topCandidate.id}`}>
                  <Button
                    type="button"
                    variant="ai"
                    className="mt-5 w-full"
                    rightIcon={<ArrowRight size={16} strokeWidth={1.75} />}
                  >
                    Review Candidate
                  </Button>
                </Link>
              )}
            </div>
          </Card>

          <Card className="glass-card-heavy border-none">
            <div className="flex items-center gap-2 text-caption font-semibold uppercase tracking-wide text-warning-700 dark:text-warning-300">
              <Clock size={14} strokeWidth={1.75} />
              Priority watch
            </div>
            {closestDeadlineJob ? (
              <div className="mt-4">
                <p className="text-h4 text-secondary-900 dark:text-white">{closestDeadlineJob.title}</p>
                <p className="mt-1 text-body-sm text-secondary-500 dark:text-secondary-300">
                  Deadline {formatDate(closestDeadlineJob.applicationDeadline)}
                </p>
              </div>
            ) : (
              <p className="mt-4 text-body-sm text-secondary-500 dark:text-secondary-300">
                No urgent deadlines in the mock workspace.
              </p>
            )}
            {nextInterview && (
              <div className="mt-5 rounded-2xl bg-secondary-50 p-4 dark:bg-white/10">
                <p className="text-caption font-semibold uppercase tracking-wide text-secondary-500 dark:text-secondary-300">
                  Next interview
                </p>
                <p className="mt-1 text-body-sm font-semibold text-secondary-900 dark:text-white">
                  {nextInterview.candidateName}
                </p>
                <p className="text-body-sm text-secondary-500 dark:text-secondary-300">
                  {formatDate(nextInterview.scheduledTime)}
                </p>
              </div>
            )}
          </Card>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-[380px_minmax(0,1fr)]">
        <Card className="glass-card-heavy border-none">
          <CardHeader className="mb-4 p-0">
            <div>
              <div className="mb-2 flex items-center gap-2 text-caption font-semibold uppercase tracking-wide text-success-700 dark:text-success-300">
                <Zap size={14} strokeWidth={1.75} />
                Quick actions
              </div>
              <CardTitle>Keep momentum high</CardTitle>
              <CardDescription>Useful shortcuts for the recruiter day.</CardDescription>
            </div>
          </CardHeader>

          <div className="space-y-3">
            {[
              { label: 'Create a new job', path: '/recruiter/jobs/new', icon: Briefcase },
              { label: 'Review interviews', path: '/recruiter/interviews', icon: CalendarClock },
              { label: 'Open messages', path: '/recruiter/messages', icon: MessageSquare },
            ].map((action) => {
              const Icon = action.icon;

              return (
                <Link
                  key={action.label}
                  to={action.path}
                  className="group flex items-center justify-between rounded-2xl border border-secondary-100 bg-white/70 p-4 transition-all duration-base hover:-translate-y-0.5 hover:border-primary-200 hover:shadow-glow-primary dark:border-white/10 dark:bg-white/5"
                >
                  <span className="flex items-center gap-3 text-body-sm font-semibold text-secondary-800 dark:text-white">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-700 dark:bg-primary-500/15 dark:text-primary-300">
                      <Icon size={18} strokeWidth={1.75} />
                    </span>
                    {action.label}
                  </span>
                  <ChevronRight
                    size={18}
                    strokeWidth={1.75}
                    className="text-secondary-400 transition-transform group-hover:translate-x-1 group-hover:text-primary-600"
                  />
                </Link>
              );
            })}
          </div>
        </Card>

        <Card className="glass-card-heavy overflow-hidden border-none p-0">
          <CardHeader className="mb-0 p-6 pb-4">
            <div>
              <div className="mb-2 flex items-center gap-2 text-caption font-semibold uppercase tracking-wide text-primary-700 dark:text-primary-300">
                <Target size={14} strokeWidth={1.75} />
                Live queue
              </div>
              <CardTitle>Recent Applications</CardTitle>
              <CardDescription>Newest candidate activity across every role.</CardDescription>
            </div>
          </CardHeader>

          <div className="divide-y divide-secondary-100 dark:divide-white/10">
            {recentApplications.map((application) => (
              <Link
                key={application.id}
                to={`/recruiter/applications/${application.id}`}
                className="group flex items-center justify-between gap-4 p-4 transition-all duration-base hover:bg-white/70 dark:hover:bg-white/5"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <Avatar name={application.candidateName} size="md" />
                  <div className="min-w-0">
                    <h3 className="truncate text-body-lg font-semibold text-secondary-900 transition-colors group-hover:text-primary-700 dark:text-white dark:group-hover:text-primary-300">
                      {application.candidateName}
                    </h3>
                    <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-body-sm text-secondary-500 dark:text-secondary-300">
                      <span>{application.jobTitle}</span>
                      <span>Applied {formatDate(application.appliedAt)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <Badge variant="ai" size="sm">{application.aiMatchScore}%</Badge>
                  <StatusBadge status={application.status} />
                  <ChevronRight
                    size={20}
                    strokeWidth={1.75}
                    className="text-secondary-400 transition-transform group-hover:translate-x-1 group-hover:text-primary-600"
                  />
                </div>
              </Link>
            ))}

            {recentApplications.length === 0 && (
              <div className="p-8 text-center text-body-sm text-secondary-500">
                No recent applications found.
              </div>
            )}
          </div>
        </Card>
      </section>
    </div>
  );
}
