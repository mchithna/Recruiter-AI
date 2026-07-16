import {
  Briefcase,
  ChevronRight,
  Edit,
  MapPin,
  Plus,
  Sparkles,
  Users,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  Badge,
  Button,
  Skeleton,
  StatCard,
} from '../../components/ui';
import { StatusBadge } from '../../components/ui';
import { useRecruiterJobs } from './useRecruiterJobs';

const formatDeadline = (deadline) => {
  if (!deadline) return 'No deadline';

  return new Intl.DateTimeFormat(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(deadline));
};

const getDeadlineUrgency = (deadline) => {
  if (!deadline) return null;
  const now = new Date();
  const deadlineDate = new Date(deadline);
  const diffDays = Math.ceil((deadlineDate - now) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return 'expired';
  if (diffDays <= 7) return 'urgent';
  if (diffDays <= 14) return 'soon';
  return 'safe';
};

const workModeIcon = {
  Remote: '🌍',
  Hybrid: '🏢',
  'On-site': '📍',
};

export function JobsList() {
  const navigate = useNavigate();
  const { jobs, isLoading } = useRecruiterJobs();
  const openJobs = jobs.filter((job) => job.status === 'Open').length;
  const draftJobs = jobs.filter((job) => job.status === 'Draft').length;
  const pausedJobs = jobs.filter((job) => job.status === 'Paused').length;

  return (
    <div className="relative z-10 mx-auto max-w-7xl space-y-8 animate-slide-up">
      {/* Hero Banner */}
      <section className="glass-card-heavy relative overflow-hidden rounded-3xl border-none p-0">
        <img
          src="/images/card-bg-company.png"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover opacity-15 dark:opacity-35 dark:mix-blend-screen"
        />
        <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-primary-500/20 blur-[70px]" />
        <div className="absolute -bottom-16 left-1/4 h-48 w-48 rounded-full bg-ai-500/15 blur-[80px]" />

        <div className="relative flex flex-col gap-5 p-8 sm:flex-row sm:items-center sm:justify-between lg:p-10">
          <div>
            <Badge variant="primary" size="sm" icon={<Sparkles size={12} strokeWidth={1.75} />}>
              Role portfolio
            </Badge>
            <h1 className="mt-3 text-h1 text-secondary-900 dark:text-white">Jobs</h1>
            <p className="mt-2 max-w-2xl text-body-sm text-secondary-500 dark:text-secondary-300">
              Manage open roles, draft future positions, and jump into each applicant pipeline.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-primary-500 to-ai-600 text-white shadow-glow-primary sm:flex">
              <Briefcase size={42} strokeWidth={1.5} />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Row */}
      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard
          label="Open Roles"
          value={openJobs}
          icon={Briefcase}
          trend={{ direction: 'up', value: 'actively hiring' }}
          className="animate-counter glass-card-heavy border-none"
        />
        <StatCard
          label="Drafts"
          value={draftJobs}
          icon={Edit}
          trend={{ direction: 'up', value: 'in progress' }}
          className="animate-counter glass-card-heavy border-none"
        />
        <StatCard
          label="Paused"
          value={pausedJobs}
          icon={Users}
          trend={{ direction: 'down', value: 'on hold' }}
          trendUpIsGood={false}
          className="animate-counter glass-card-heavy border-none"
        />
      </section>

      {/* Action Bar */}
      <div className="flex justify-end">
        <Button
          type="button"
          variant="glass"
          leftIcon={<Plus size={18} />}
          onClick={() => navigate('/recruiter/jobs/new')}
          className="w-full sm:w-auto"
        >
          New Job
        </Button>
      </div>

      {/* Job Cards Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <Skeleton height="14rem" className="rounded-2xl" />
          <Skeleton height="14rem" className="rounded-2xl" />
          <Skeleton height="14rem" className="rounded-2xl" />
          <Skeleton height="14rem" className="rounded-2xl" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {jobs.map((job, index) => {
            const urgency = getDeadlineUrgency(job.applicationDeadline);

            return (
              <div
                key={job.id}
                onClick={() => navigate(`/recruiter/jobs/${job.id}/applications`)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    navigate(`/recruiter/jobs/${job.id}/applications`);
                  }
                }}
                role="link"
                tabIndex={0}
                className="glass-card-heavy group cursor-pointer overflow-hidden rounded-2xl border-none p-0 transition-all duration-base hover:-translate-y-1"
                style={{ animationDelay: `${index * 80}ms` }}
              >
                {/* Gradient accent bar */}
                <div
                  className={[
                    'h-1.5 w-full',
                    job.status === 'Open'
                      ? 'bg-gradient-to-r from-success-500 to-success-400'
                      : job.status === 'Draft'
                        ? 'bg-gradient-to-r from-secondary-400 to-secondary-300'
                        : 'bg-gradient-to-r from-warning-500 to-warning-400',
                  ].join(' ')}
                />

                <div className="p-6">
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-h3 text-secondary-900 transition-colors group-hover:text-primary-700 dark:text-white dark:group-hover:text-primary-300">
                        {job.title}
                      </h3>
                      <p className="mt-1 text-body-sm text-secondary-500 dark:text-secondary-300">
                        {job.departmentName}
                      </p>
                    </div>
                    <StatusBadge status={job.status?.toLowerCase().replace(/ /g, '_')} type="job" />
                  </div>

                  <p className="mb-5 line-clamp-2 text-body-sm leading-relaxed text-secondary-600 dark:text-secondary-300">
                    {job.description}
                  </p>

                  <div className="mb-5 flex flex-wrap gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary-100 px-3 py-1 text-caption font-semibold text-secondary-700 dark:bg-white/10 dark:text-secondary-200">
                      {workModeIcon[job.workMode] || '📍'} {job.workMode}
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary-100 px-3 py-1 text-caption font-semibold text-secondary-700 dark:bg-white/10 dark:text-secondary-200">
                      <MapPin size={11} /> {job.location}
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary-100 px-3 py-1 text-caption font-semibold text-secondary-700 dark:bg-white/10 dark:text-secondary-200">
                      {job.employmentType}
                    </span>
                  </div>

                  <div className="flex items-center justify-between border-t border-secondary-100 pt-4 dark:border-white/10">
                    <div className="flex items-center gap-2">
                      <span
                        className={[
                          'text-caption font-semibold',
                          urgency === 'expired'
                            ? 'text-danger-600 dark:text-danger-400'
                            : urgency === 'urgent'
                              ? 'text-warning-600 dark:text-warning-400'
                              : 'text-secondary-500 dark:text-secondary-400',
                        ].join(' ')}
                      >
                        {urgency === 'expired' ? '⚠️ Expired' : `📅 ${formatDeadline(job.applicationDeadline)}`}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        leftIcon={<Edit size={14} />}
                        onClick={(event) => {
                          event.stopPropagation();
                          navigate(`/recruiter/jobs/${job.id}/edit`);
                        }}
                        onKeyDown={(event) => event.stopPropagation()}
                      >
                        Edit
                      </Button>
                      <ChevronRight
                        size={18}
                        className="text-secondary-400 transition-transform group-hover:translate-x-1 group-hover:text-primary-600 dark:group-hover:text-primary-300"
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default JobsList;
