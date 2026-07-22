import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Briefcase, Layers, Sparkles, Users } from 'lucide-react';
import { Badge, Skeleton } from '../../components/ui';
import { getJobs } from './services/hiringManagerApi';

/* ── tiny helpers ───────────────────────────────────────────── */
const gradients = [
  { stripe: 'from-violet-500 via-purple-500 to-indigo-500', icon: 'from-violet-500 to-indigo-600', ring: 'ring-violet-500/20' },
  { stripe: 'from-blue-500 via-cyan-500 to-teal-400',       icon: 'from-blue-500 to-cyan-500',     ring: 'ring-blue-500/20'   },
  { stripe: 'from-rose-500 via-pink-500 to-fuchsia-400',    icon: 'from-rose-500 to-fuchsia-500',  ring: 'ring-rose-500/20'   },
  { stripe: 'from-amber-500 via-orange-400 to-yellow-400',  icon: 'from-amber-500 to-orange-500',  ring: 'ring-amber-500/20'  },
  { stripe: 'from-emerald-500 via-teal-400 to-cyan-400',    icon: 'from-emerald-500 to-teal-500',  ring: 'ring-emerald-500/20'},
];
const pickGradient = (id) => gradients[(id ?? 0) % gradients.length];

function StatPill({ icon: Icon, label, value, highlight }) {
  return (
    <div
      className={[
        'flex flex-1 flex-col items-center justify-center gap-1 rounded-xl px-2 py-3 transition-colors min-h-[88px]',
        highlight
          ? 'bg-primary-50 dark:bg-primary-900/25'
          : 'bg-secondary-50 dark:bg-white/5',
      ].join(' ')}
    >
      <Icon
        size={14}
        strokeWidth={2}
        className={highlight ? 'text-primary-600 dark:text-primary-400' : 'text-secondary-400 dark:text-secondary-500'}
      />
      <span className={`text-[22px] font-extrabold leading-none tabular-nums ${highlight ? 'text-primary-700 dark:text-primary-300' : 'text-secondary-800 dark:text-white'}`}>
        {value ?? 0}
      </span>
      <span className="whitespace-nowrap text-[9px] font-bold uppercase tracking-wide text-secondary-400 dark:text-secondary-500">
        {label}
      </span>
    </div>
  );
}

/* ── main page ──────────────────────────────────────────────── */
export function JobsList() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isActive = true;

    async function loadJobs() {
      try {
        setIsLoading(true);
        const data = await getJobs();
        if (isActive) setJobs(data);
      } catch (err) {
        console.error('Failed to load hiring manager jobs', err);
      } finally {
        if (isActive) setIsLoading(false);
      }
    }

    loadJobs();
    return () => { isActive = false; };
  }, []);

  return (
    <div className="relative z-10 mx-auto max-w-7xl space-y-8 animate-slide-up">

      {/* ── Hero Banner ── */}
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
              Active Pipelines
            </Badge>
            <h1 className="mt-3 text-h1 text-secondary-900 dark:text-white">Assigned Jobs</h1>
            <p className="mt-2 max-w-2xl text-body-sm text-secondary-500 dark:text-secondary-300">
              Manage your candidate pipelines for the jobs you are overseeing.
            </p>
          </div>
          <div className="hidden h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-primary-500 to-ai-600 text-white shadow-glow-primary sm:flex">
            <Briefcase size={42} strokeWidth={1.5} />
          </div>
        </div>
      </section>

      {/* ── Cards Grid ── */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((n) => (
            <Skeleton key={n} height="14rem" className="rounded-2xl" />
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="rounded-full bg-secondary-100 p-4 text-secondary-500 dark:bg-white/5 dark:text-secondary-400">
            <Briefcase size={28} />
          </div>
          <h3 className="mt-4 text-body-lg font-semibold text-secondary-900 dark:text-white">No Jobs Assigned</h3>
          <p className="mt-2 text-body-sm text-secondary-500 dark:text-secondary-400">
            You are not currently assigned to any active job pipelines.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {jobs.map((job, index) => {
            const g = pickGradient(index);
            const total = (job.shortlistedCount ?? 0) + (job.interviewingCount ?? 0);

            return (
              <div
                key={job.id}
                onClick={() => navigate(`/hiring-manager/jobs/${job.id}/applications`)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') navigate(`/hiring-manager/jobs/${job.id}/applications`);
                }}
                role="link"
                tabIndex={0}
                style={{ animationDelay: `${index * 80}ms` }}
                className="group relative flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-secondary-200/50 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl focus:outline-none dark:border-white/10 dark:bg-secondary-900/80"
              >
                {/* Coloured top stripe */}
                <div className={`h-1 w-full bg-gradient-to-r ${g.stripe}`} />

                <div className="flex flex-1 flex-col gap-4 p-5">

                  {/* ── Top row: icon + title + department ── */}
                  <div className="flex items-start gap-4">
                    {/* Gradient icon box */}
                    <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${g.icon} shadow-md ring-4 ${g.ring} text-white`}>
                      <Layers size={20} strokeWidth={1.75} />
                    </div>

                    <div className="min-w-0 flex-1 pt-0.5">
                      <h3 className="truncate text-body-lg font-bold leading-snug text-secondary-900 transition-colors group-hover:text-primary-700 dark:text-white dark:group-hover:text-primary-300">
                        {job.title}
                      </h3>
                      <p className="mt-0.5 truncate text-caption font-medium text-secondary-500 dark:text-secondary-400">
                        {job.departmentName}
                      </p>
                    </div>
                  </div>

                  {/* ── Stat pills ── */}
                  <div className="flex gap-2">
                    <StatPill icon={Users}   label="Shortlisted"  value={job.shortlistedCount}  highlight={job.shortlistedCount > 0}  />
                    <StatPill icon={Briefcase} label="Interviewing" value={job.interviewingCount} highlight={job.interviewingCount > 0} />
                    <StatPill icon={Sparkles} label="Total Active" value={total}                 highlight={false}                      />
                  </div>

                  {/* ── Footer CTA ── */}
                  <div className="mt-auto flex items-center justify-between border-t border-secondary-100 pt-4 dark:border-white/10">
                    <span className="text-caption font-semibold text-primary-600 dark:text-primary-400">
                      Review Candidates
                    </span>
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-50 text-primary-600 transition-all group-hover:bg-primary-600 group-hover:text-white dark:bg-primary-900/30 dark:text-primary-400 dark:group-hover:bg-primary-600 dark:group-hover:text-white">
                      <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
                    </span>
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
