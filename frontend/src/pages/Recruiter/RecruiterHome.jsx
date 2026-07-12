import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, Users, CalendarClock, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '../../../components/ui';
import StatusBadge from './components/StatusBadge';
import { getJobs, getAllApplications, getAllInterviews } from './services/mockData';

export default function RecruiterHome() {
  const [stats, setStats] = useState({
    openJobs: 0,
    appsNeedingReview: 0,
    upcomingInterviews: 0,
  });
  const [recentApplications, setRecentApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      setLoading(true);
      try {
        const [jobs, applications, interviews] = await Promise.all([
          getJobs(),
          getAllApplications(),
          getAllInterviews(),
        ]);

        const now = new Date();

        const openJobsCount = jobs.filter(j => j.status === 'Open').length;
        
        const appsReviewCount = applications.filter(
          a => a.status === 'Applied' || a.status === 'Under Review'
        ).length;

        const upcomingInterviewsCount = interviews.filter(
          i => (i.status === 'Scheduled' || i.status === 'Confirmed') &&
               i.scheduledTime && new Date(i.scheduledTime) > now
        ).length;

        setStats({
          openJobs: openJobsCount,
          appsNeedingReview: appsReviewCount,
          upcomingInterviews: upcomingInterviewsCount,
        });

        // Sort applications by most recent first
        const sortedApps = [...applications].sort((a, b) => new Date(b.appliedAt) - new Date(a.appliedAt));
        setRecentApplications(sortedApps.slice(0, 5));

      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Dashboard Overview</h1>
        <p className="text-slate-500 dark:text-slate-400">Here is what's happening with your hiring pipeline today.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-lg flex items-center justify-center">
                <Briefcase size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Open Jobs</p>
                <p className="text-3xl font-bold text-slate-900 dark:text-white">{stats.openJobs}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400 rounded-lg flex items-center justify-center">
                <Users size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Needs Review</p>
                <p className="text-3xl font-bold text-slate-900 dark:text-white">{stats.appsNeedingReview}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 rounded-lg flex items-center justify-center">
                <CalendarClock size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Upcoming Interviews</p>
                <p className="text-3xl font-bold text-slate-900 dark:text-white">{stats.upcomingInterviews}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Applications */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Recent Applications</h2>
        <Card>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {recentApplications.map((app) => (
              <Link 
                key={app.id} 
                to={`/recruiter/applications/${app.id}`}
                className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group"
              >
                <div>
                  <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {app.candidateName}
                  </h3>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500 dark:text-slate-400">
                    <span>{app.jobTitle}</span>
                    <span>•</span>
                    <span>Applied {new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(new Date(app.appliedAt))}</span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <StatusBadge status={app.status} />
                  <ChevronRight size={20} className="text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors" />
                </div>
              </Link>
            ))}
            {recentApplications.length === 0 && (
              <div className="p-8 text-center text-slate-500 dark:text-slate-400">
                No recent applications found.
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
