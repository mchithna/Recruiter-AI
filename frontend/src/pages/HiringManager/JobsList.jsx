import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, ChevronRight, Sparkles, UserCheck } from 'lucide-react';
import {
  Badge,
  Skeleton,
} from '../../components/ui';
import { getJobs } from './services/hiringManagerApi';

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
        if (isActive) {
          setJobs(data);
        }
      } catch (err) {
        console.error('Failed to load hiring manager jobs', err);
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    loadJobs();

    return () => {
      isActive = false;
    };
  }, []);

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
              Active Pipelines
            </Badge>
            <h1 className="mt-3 text-h1 text-secondary-900 dark:text-white">Assigned Jobs</h1>
            <p className="mt-2 max-w-2xl text-body-sm text-secondary-500 dark:text-secondary-300">
              Manage your candidate pipelines for the jobs you are overseeing.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-primary-500 to-ai-600 text-white shadow-glow-primary sm:flex">
              <Briefcase size={42} strokeWidth={1.5} />
            </div>
          </div>
        </div>
      </section>

      {/* Job Cards Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <Skeleton height="10rem" className="rounded-2xl" />
          <Skeleton height="10rem" className="rounded-2xl" />
          <Skeleton height="10rem" className="rounded-2xl" />
          <Skeleton height="10rem" className="rounded-2xl" />
        </div>
      ) : jobs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
          <div className="rounded-full bg-secondary-100 p-3 text-secondary-500 dark:bg-white/5 dark:text-secondary-400">
            <Briefcase size={24} />
          </div>
          <h3 className="mt-4 text-body-lg font-semibold text-secondary-900 dark:text-white">No Jobs Assigned</h3>
          <p className="mt-2 text-body-sm text-secondary-500 dark:text-secondary-400">
            You are not currently assigned to any active job pipelines.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {jobs.map((job, index) => (
            <div
              key={job.id}
              onClick={() => navigate(`/hiring-manager/jobs/${job.id}/applications`)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  navigate(`/hiring-manager/jobs/${job.id}/applications`);
                }
              }}
              role="link"
              tabIndex={0}
              className="glass-card-heavy group cursor-pointer overflow-hidden rounded-2xl border-none p-0 transition-all duration-base hover:-translate-y-1"
              style={{ animationDelay: `${index * 80}ms` }}
            >
              {/* Gradient accent bar */}
              <div className="h-1.5 w-full bg-gradient-to-r from-primary-500 to-ai-400" />

              <div className="p-6">
                <div className="mb-4">
                  <h3 className="truncate text-h3 text-secondary-900 transition-colors group-hover:text-primary-700 dark:text-white dark:group-hover:text-primary-300">
                    {job.title}
                  </h3>
                  <p className="mt-1 text-body-sm text-secondary-500 dark:text-secondary-300">
                    {job.departmentName}
                  </p>
                </div>

                <div className="mb-5 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-body-sm text-secondary-600 dark:text-secondary-400">Shortlisted:</span>
                    <span className="font-semibold text-secondary-900 dark:text-white">{job.shortlistedCount}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-body-sm text-secondary-600 dark:text-secondary-400">Interviewing:</span>
                    <span className="font-semibold text-secondary-900 dark:text-white">{job.interviewingCount}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-secondary-100 pt-4 dark:border-white/10">
                  <div className="flex items-center gap-2">
                    <span className="text-caption font-semibold text-primary-600 dark:text-primary-400">
                      View Pipeline
                    </span>
                  </div>
                  <ChevronRight
                    size={18}
                    className="text-primary-500 transition-transform group-hover:translate-x-1"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default JobsList;
