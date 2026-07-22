import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Briefcase, Clock, Sparkles } from 'lucide-react';

export default function JobCard({ job, matchScore, recommendationReason, onDismiss }) {
  return (
    <div className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-white/60 bg-white/75 p-6 shadow-glass backdrop-blur-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-glass-hover dark:border-white/10 dark:bg-secondary-950/55 dark:shadow-glass-dark">
      {/* Liquid glass effect overlay */}
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-white/40 to-white/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 dark:from-white/10 dark:to-transparent pointer-events-none" />
      
      <div className="relative z-10 flex-1">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-2">
          <h3 className="text-h3 text-secondary-900 dark:text-white">{job.jobTitle}</h3>
          {matchScore && (
            <div className="flex self-start items-center gap-1.5 rounded-full bg-ai-50 px-3 py-1 text-caption font-semibold text-ai-700 ring-1 ring-ai-200 dark:bg-ai-500/20 dark:text-ai-300 dark:ring-ai-500/30 shrink-0">
              <Sparkles size={14} className="text-ai-500" />
              <span>{matchScore}% Match</span>
            </div>
          )}
        </div>
        
        <div className="mb-4 flex flex-wrap gap-y-2 gap-x-4 text-body-sm text-secondary-500 dark:text-secondary-400">
          <div className="flex items-center gap-1.5">
            <Briefcase size={16} />
            {job.employmentType}
          </div>
          <div className="flex items-center gap-1.5">
            <MapPin size={16} />
            {job.location}
          </div>
          <div className="flex items-center gap-1.5">
            <Clock size={16} />
            {job.workMode}
          </div>
        </div>

        {recommendationReason && (
          <p className="text-body-sm text-secondary-600 dark:text-secondary-300 mb-4 line-clamp-2">
            <span className="font-semibold text-ai-600 dark:text-ai-400">Why this fits: </span>
            {recommendationReason}
          </p>
        )}
      </div>

      <div className="relative z-10 mt-4 flex items-center justify-between border-t border-secondary-100 pt-4 dark:border-white/10">
        <Link
          to={`/candidate/jobs/${job.id || job.jobId}`}
          className="text-body-sm font-semibold text-primary-600 transition-colors hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
        >
          View details &rarr;
        </Link>
        
        {onDismiss && (
          <button
            onClick={() => onDismiss(job.id || job.jobId)}
            className="text-body-sm font-medium text-secondary-400 transition-colors hover:text-secondary-600 dark:text-secondary-500 dark:hover:text-secondary-300"
          >
            Dismiss
          </button>
        )}
      </div>
    </div>
  );
}
