import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserCheck, Calendar, FileCheck, AlertCircle, ChevronRight, Sparkles, ClipboardCheck, CheckCircle2 } from 'lucide-react';
import {
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Skeleton,
  StatCard,
} from '../../components/ui';
import {
  getShortlistedApplications,
  getAllInterviews,
  getAllOffers,
  getEvaluationForInterview,
  getInterviewsForApplication,
} from './services/mockData';

const formatDateTime = (dateTimeString) => {
  if (!dateTimeString) return '';
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(dateTimeString));
};

export function Home() {
  const navigate = useNavigate();
  const [shortlistedCount, setShortlistedCount] = useState(0);
  const [upcomingCount, setUpcomingCount] = useState(0);
  const [activeOffersCount, setActiveOffersCount] = useState(0);
  const [attentionItems, setAttentionItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isActive = true;

    async function loadDashboardData() {
      try {
        setIsLoading(true);

        const shortlisted = await getShortlistedApplications();
        const interviews = await getAllInterviews();
        const offers = await getAllOffers();

        const now = new Date();

        // 1. Calculate counts
        const shortlistedAwaiting = shortlisted.length;

        const upcoming = interviews.filter(
          (i) =>
            ['Scheduled', 'Confirmed', 'Rescheduled'].includes(i.status) &&
            i.scheduledTime &&
            new Date(i.scheduledTime) >= now
        ).length;

        const activeOffers = offers.filter(
          (o) => o.status === 'Pending' || o.status === 'Sent'
        ).length;

        // 2. Build action required list
        const items = [];

        // Condition A: Interviews completed but no evaluation submitted
        const completedInterviews = interviews.filter((i) => i.status === 'Completed');
        for (const interview of completedInterviews) {
          const evalData = await getEvaluationForInterview(interview.id);
          if (!evalData) {
            items.push({
              id: `attn-eval-${interview.id}`,
              type: 'Evaluation Needed',
              title: `Submit feedback for ${interview.candidateName}`,
              description: `${interview.interviewType} was completed on ${formatDateTime(interview.scheduledTime)}.`,
              link: `/hiring-manager/interviews/${interview.id}`,
              severity: 'high',
            });
          }
        }

        // Condition B: Shortlisted candidates with zero interviews scheduled yet
        for (const app of shortlisted) {
          if (app.status === 'Shortlisted') {
            const appInterviews = await getInterviewsForApplication(app.id);
            if (appInterviews.length === 0) {
              items.push({
                id: `attn-sched-${app.id}`,
                type: 'Scheduling Needed',
                title: `Set up interview loop for ${app.candidateName}`,
                description: `Shortlisted candidate for ${app.jobTitle} has no interviews scheduled.`,
                link: `/hiring-manager/applications/${app.id}`,
                severity: 'medium',
              });
            }
          }
        }

        // Sort items by severity (high first) and limit to 5
        items.sort((a, b) => {
          if (a.severity === 'high' && b.severity !== 'high') return -1;
          if (a.severity !== 'high' && b.severity === 'high') return 1;
          return 0;
        });

        if (isActive) {
          setShortlistedCount(shortlistedAwaiting);
          setUpcomingCount(upcoming);
          setActiveOffersCount(activeOffers);
          setAttentionItems(items.slice(0, 5));
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Failed to load dashboard home data', err);
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    loadDashboardData();

    return () => {
      isActive = false;
    };
  }, []);

  return (
    <div className="relative z-10 space-y-6 animate-slide-up">
      {/* Welcome Banner */}
      <section className="glass-card-heavy relative overflow-hidden rounded-3xl border-none p-6">
        <img
          src="/images/card-bg-live-analytics.png"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover opacity-15 dark:opacity-35 dark:mix-blend-screen"
        />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Badge variant="ai" size="sm" icon={<Sparkles size={12} strokeWidth={1.75} />}>
              Hiring Overview
            </Badge>
            <h1 className="mt-3 text-h1 text-secondary-900 dark:text-white">Workspace Dashboard</h1>
            <p className="mt-2 max-w-2xl text-body-sm text-secondary-500 dark:text-secondary-300">
              Review stats, execute pending interview evaluations, and manage active candidate pipelines.
            </p>
          </div>
          <div className="hidden h-24 w-24 items-center justify-center rounded-3xl bg-primary-500 text-white shadow-glow-primary sm:flex">
            <ClipboardCheck size={42} strokeWidth={1.5} />
          </div>
        </div>
      </section>

      {/* Main Stats Rows */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
        </div>
      ) : (
        <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <StatCard
            label="Shortlisted Candidates"
            value={shortlistedCount}
            icon={UserCheck}
            trend={{ direction: 'up', value: 'awaiting review' }}
            className="glass-card-heavy border-none"
          />
          <StatCard
            label="Upcoming Interviews"
            value={upcomingCount}
            icon={Calendar}
            trend={{ direction: 'up', value: 'scheduled' }}
            className="glass-card-heavy border-none"
          />
          <StatCard
            label="Active Packages"
            value={activeOffersCount}
            icon={FileCheck}
            trend={{ direction: 'up', value: 'pending / sent' }}
            className="glass-card-heavy border-none"
          />
        </section>
      )}

      {/* Action Required / Needing Attention */}
      <Card className="glass-card-heavy border-none p-0 overflow-hidden">
        <CardHeader className="p-6 pb-4 border-b border-secondary-100 dark:border-white/5">
          <CardTitle className="flex items-center gap-2 text-h3 text-secondary-900 dark:text-white">
            <AlertCircle className="text-primary-500" size={20} /> Action Required
          </CardTitle>
          <p className="text-body-sm text-secondary-500 dark:text-secondary-400 mt-1">
            Tasks demanding your attention to proceed with candidate workflows.
          </p>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-4">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          ) : attentionItems.length === 0 ? (
            <div className="p-12 text-center text-secondary-500 text-body-sm flex flex-col items-center justify-center">
              <div className="h-12 w-12 rounded-full bg-success-50 dark:bg-success-950/20 border border-success-200 dark:border-success-500/30 flex items-center justify-center text-success-600 dark:text-success-400 mb-3">
                <CheckCircle2 size={24} />
              </div>
              <h4 className="font-bold text-secondary-900 dark:text-white mb-1">All Caught Up!</h4>
              <p className="max-w-xs leading-relaxed text-secondary-500">
                There are no pending interview assessments or scheduling loops needing your approval.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-secondary-100 dark:divide-white/5">
              {attentionItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => navigate(item.link)}
                  className="flex items-center justify-between p-5 hover:bg-secondary-50/50 dark:hover:bg-white/5 cursor-pointer transition-colors group"
                >
                  <div className="flex items-start gap-4">
                    <div className={`rounded-xl p-2 shrink-0 ${
                      item.severity === 'high'
                        ? 'bg-danger-50 text-danger-600 dark:bg-danger-950/30 dark:text-danger-400'
                        : 'bg-warning-50 text-warning-600 dark:bg-warning-950/30 dark:text-warning-400'
                    }`}>
                      <AlertCircle size={20} />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-body-md font-bold text-secondary-900 dark:text-white">
                          {item.title}
                        </h4>
                        <Badge
                          variant={item.severity === 'high' ? 'danger' : 'warning'}
                          size="sm"
                        >
                          {item.type}
                        </Badge>
                      </div>
                      <p className="text-body-sm text-secondary-500 dark:text-secondary-400">
                        {item.description}
                      </p>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-secondary-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default Home;
