import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, CalendarClock, ChevronRight, Users } from 'lucide-react';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
  Skeleton,
  StatCard,
} from '../../components/ui';
import StatusBadge from './components/StatusBadge';
import { getAllApplications, getAllInterviews, getJobs } from './services/mockData';

export default function RecruiterHome() {
  const [stats, setStats] = useState({
    openJobs: 0,
    appsNeedingReview: 0,
    upcomingInterviews: 0,
  });
  const [recentApplications, setRecentApplications] = useState([]);
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

        const now = new Date();
        const openJobs = jobs.filter((job) => job.status === 'Open').length;
        const appsNeedingReview = applications.filter((application) =>
          ['Applied', 'Under Review'].includes(application.status)
        ).length;
        const upcomingInterviews = interviews.filter((interview) =>
          ['Scheduled', 'Confirmed'].includes(interview.status) &&
          interview.scheduledTime &&
          new Date(interview.scheduledTime) > now
        ).length;

        setStats({ openJobs, appsNeedingReview, upcomingInterviews });
        setRecentApplications(
          [...applications]
            .sort((a, b) => new Date(b.appliedAt) - new Date(a.appliedAt))
            .slice(0, 5)
        );
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

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl space-y-6">
        <Skeleton height="5rem" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Skeleton height="8rem" />
          <Skeleton height="8rem" />
          <Skeleton height="8rem" />
        </div>
        <Skeleton height="18rem" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8 animate-slide-up">
      <div className="rounded-xl border border-primary-100 bg-white/80 p-6 shadow-glow-primary backdrop-blur">
        <p className="text-caption font-semibold uppercase tracking-wide text-primary-700">
          Hiring pipeline
        </p>
        <h1 className="mt-2 text-h1 text-secondary-900">Dashboard Overview</h1>
        <p className="mt-2 max-w-2xl text-body-md text-secondary-600">
          Track active roles, candidate review work, and upcoming interviews from one focused workspace.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard
          label="Open Jobs"
          value={stats.openJobs}
          icon={Briefcase}
          trend={{ direction: 'up', value: '+2 this week' }}
          className="animate-counter"
        />
        <StatCard
          label="Needs Review"
          value={stats.appsNeedingReview}
          icon={Users}
          trend={{ direction: 'up', value: 'active queue' }}
          className="animate-counter"
        />
        <StatCard
          label="Upcoming Interviews"
          value={stats.upcomingInterviews}
          icon={CalendarClock}
          trend={{ direction: 'down', value: 'next 7 days' }}
          trendUpIsGood={false}
          className="animate-counter"
        />
      </div>

      <Card className="overflow-hidden p-0">
        <CardHeader className="mb-0 p-6 pb-4">
          <div>
            <CardTitle>Recent Applications</CardTitle>
            <CardDescription>Newest candidate activity across every role.</CardDescription>
          </div>
        </CardHeader>

        <div className="divide-y divide-secondary-100">
          {recentApplications.map((application) => (
            <Link
              key={application.id}
              to={`/recruiter/applications/${application.id}`}
              className="group flex items-center justify-between gap-4 p-4 transition-all duration-base hover:bg-secondary-50"
            >
              <div>
                <h3 className="mb-1 text-body-lg font-semibold text-secondary-900 transition-colors group-hover:text-primary-700">
                  {application.candidateName}
                </h3>
                <div className="flex flex-wrap gap-x-3 gap-y-1 text-body-sm text-secondary-500">
                  <span>{application.jobTitle}</span>
                  <span>
                    Applied{' '}
                    {new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(
                      new Date(application.appliedAt)
                    )}
                  </span>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-3">
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
    </div>
  );
}
