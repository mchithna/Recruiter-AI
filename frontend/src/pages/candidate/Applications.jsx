import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Spinner, StatusBadge } from '../../components/ui';
import { getMyApplications } from './services/mockData';
import { Sparkles, Calendar } from 'lucide-react';

export default function Applications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    setLoading(true);
    const data = await getMyApplications();
    setApplications(data);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6 pb-16">
      <div>
        <h2 className="text-h2 text-secondary-900 dark:text-white">My Applications</h2>
        <p className="text-body-sm text-secondary-600 dark:text-secondary-400 mt-2">
          Track the status of your job applications.
        </p>
      </div>

      <div className="space-y-4">
        {applications.length > 0 ? (
          applications.map(app => (
            <div 
              key={app.id} 
              onClick={() => navigate(`/candidate/applications/${app.id}`)}
              className="group relative flex cursor-pointer flex-col sm:flex-row sm:items-center justify-between gap-4 overflow-hidden rounded-2xl border border-white/60 bg-white/75 p-6 shadow-glass backdrop-blur-xl dark:border-white/10 dark:bg-secondary-950/55 dark:shadow-glass-dark transition-all duration-300 hover:-translate-y-1 hover:shadow-glass-hover"
            >
              {/* Liquid glass effect overlay */}
              <div className="absolute inset-0 z-0 bg-gradient-to-br from-white/40 to-white/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 dark:from-white/10 dark:to-transparent pointer-events-none" />
              
              <div className="relative z-10 flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-h3 text-secondary-900 dark:text-white truncate">{app.jobTitle}</h3>
                  <StatusBadge status={app.status} />
                </div>
                
                <div className="mt-2 flex items-center gap-4 text-body-sm text-secondary-500 dark:text-secondary-400">
                  <div className="flex items-center gap-1.5">
                    <Calendar size={16} />
                    Applied {new Date(app.appliedAt).toLocaleDateString()}
                  </div>
                  {app.aiMatchScore && (
                    <div className="flex items-center gap-1.5 text-ai-600 dark:text-ai-400">
                      <Sparkles size={14} />
                      {app.aiMatchScore}% Match
                    </div>
                  )}
                </div>
              </div>
              
              <div className="relative z-10 text-primary-600 dark:text-primary-400 font-semibold text-body-sm transition-transform group-hover:translate-x-1">
                View status &rarr;
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-2xl border border-dashed border-secondary-300 p-12 text-center dark:border-secondary-700">
            <p className="text-body text-secondary-500 dark:text-secondary-400">You haven't applied to any jobs yet.</p>
            <Link to="/candidate/jobs" className="mt-4 inline-block text-primary-600 hover:underline">
              Browse jobs
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
