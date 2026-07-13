import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, User, Sparkles } from 'lucide-react';
import {
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Skeleton,
  Button,
} from '../../components/ui';
import CandidateProfileView from './components/CandidateProfileView';
import InterviewCard from './components/InterviewCard';
import StatusBadge from './components/StatusBadge';
import { getApplication, getInterviewsForApplication } from './services/mockData';

export function ApplicationDetail() {
  const { applicationId } = useParams();
  const navigate = useNavigate();
  const [application, setApplication] = useState(null);
  const [interviews, setInterviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isActive = true;

    async function loadApplicationData() {
      try {
        setIsLoading(true);
        const appData = await getApplication(applicationId);
        const interviewData = await getInterviewsForApplication(applicationId);

        if (isActive) {
          setApplication(appData);
          setInterviews(interviewData);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Failed to load application detail', error);
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    loadApplicationData();

    return () => {
      isActive = false;
    };
  }, [applicationId]);

  if (isLoading) {
    return (
      <div className="space-y-6 animate-slide-up">
        <Skeleton className="h-16 w-full rounded-2xl" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Skeleton className="h-96 w-full rounded-2xl" />
          </div>
          <div>
            <Skeleton className="h-64 w-full rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="text-center py-12 animate-slide-up">
        <h2 className="text-h2 text-secondary-900 dark:text-white">Application not found</h2>
        <p className="mt-2 text-body-sm text-secondary-500">The application may have been removed or does not exist.</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate('/hiring-manager/queue')}>
          Back to Queue
        </Button>
      </div>
    );
  }

  return (
    <div className="relative z-10 space-y-6 animate-slide-up">
      {/* Header section with back navigation and status */}
      <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            leftIcon={<ArrowLeft size={16} />}
            onClick={() => navigate('/hiring-manager/queue')}
          >
            Back to Queue
          </Button>
          <div className="h-6 w-px bg-secondary-200 dark:bg-white/10 hidden sm:block" />
          <div>
            <span className="text-caption font-semibold uppercase tracking-wide text-secondary-400">
              Candidate Application
            </span>
            <h1 className="text-h2 text-secondary-900 dark:text-white">
              {application.candidateName}
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-3 bg-white/70 dark:bg-white/5 border border-secondary-100 dark:border-white/5 px-4 py-2 rounded-2xl backdrop-blur-md shadow-sm">
          <span className="text-body-sm font-semibold text-secondary-500 dark:text-secondary-400">
            Application Status:
          </span>
          <StatusBadge status={application.status} size="md" />
        </div>
      </section>

      {/* Main Grid View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Profile Card View */}
        <div className="lg:col-span-2">
          <CandidateProfileView candidateProfile={application.candidateProfile} />
        </div>

        {/* Interviews Side list */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-h3 font-semibold text-secondary-900 dark:text-white">
              Interviews ({interviews.length})
            </h3>
            {interviews.length > 0 && (
              <Badge variant="primary" size="sm" icon={<Calendar size={12} />}>
                Scheduled Loops
              </Badge>
            )}
          </div>

          {interviews.length === 0 ? (
            <Card className="glass-card border-none bg-white/60 dark:bg-white/5">
              <CardContent className="text-secondary-500 text-body-sm py-8 text-center">
                No interviews scheduled for this candidate yet.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {interviews.map((interview) => (
                <Link
                  key={interview.id}
                  to={`/hiring-manager/interviews/${interview.id}`}
                  className="block transition-transform hover:-translate-y-1 focus:outline-none"
                >
                  <InterviewCard interview={interview} />
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ApplicationDetail;
