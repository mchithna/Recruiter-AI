import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, ClipboardList, Sparkles, ChevronRight } from 'lucide-react';
import {
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui';
import StatusBadge from './components/StatusBadge';
import { getShortlistedApplications, getInterviewsForApplication } from './services/mockData';

const formatScheduledTime = (scheduledTime) => {
  if (!scheduledTime) return 'Not scheduled';

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(scheduledTime));
};

export function Queue() {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isActive = true;

    async function loadQueueData() {
      try {
        setIsLoading(true);
        const shortlisted = await getShortlistedApplications();
        
        // Fetch interviews for each application to extract scheduledTime if it exists
        const appsWithInterviews = await Promise.all(
          shortlisted.map(async (app) => {
            const interviews = await getInterviewsForApplication(app.id);
            // Select active or first available interview
            const activeInterview = interviews.find(
              (int) => int.status === 'Scheduled' || int.status === 'Confirmed' || int.status === 'Rescheduled'
            ) || interviews[0];

            return {
              ...app,
              scheduledTime: activeInterview ? activeInterview.scheduledTime : null,
            };
          })
        );

        if (isActive) {
          setApplications(appsWithInterviews);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Failed to load hiring manager queue data', error);
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    loadQueueData();

    return () => {
      isActive = false;
    };
  }, []);

  return (
    <div className="relative z-10 space-y-6 animate-slide-up">
      {/* Header section with background cover */}
      <section className="glass-card-heavy relative overflow-hidden rounded-3xl border-none p-6">
        <img
          src="/images/card-bg-candidate.png"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover opacity-15 dark:opacity-35 dark:mix-blend-screen"
        />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Badge variant="ai" size="sm" icon={<Sparkles size={12} strokeWidth={1.75} />}>
              Hiring Manager Queue
            </Badge>
            <h1 className="mt-3 text-h1 text-secondary-900 dark:text-white">Review & Decision Queue</h1>
            <p className="mt-2 max-w-2xl text-body-sm text-secondary-500 dark:text-secondary-300">
              Manage candidates who are shortlisted or scheduled for interviews. Click on any row to view full details and submit decisions.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <span className="rounded-full bg-white/70 px-3 py-1 text-caption font-semibold text-primary-700 dark:bg-white/10 dark:text-primary-300">
                {applications.length} candidates pending review
              </span>
            </div>
          </div>
          <div className="hidden h-24 w-24 items-center justify-center rounded-3xl bg-primary-500 text-white shadow-glow-primary sm:flex">
            <ClipboardList size={42} strokeWidth={1.5} />
          </div>
        </div>
      </section>

      {/* Main Table Card */}
      <Card className="glass-card-heavy overflow-hidden border-none p-0">
        <CardHeader className="mb-0 p-6 pb-4">
          <div>
            <CardTitle>Shortlisted Candidates</CardTitle>
            <CardDescription>
              A complete list of active applicants assigned to your decision workflow.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3 p-6 pt-0">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : applications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <div className="rounded-full bg-secondary-100 p-3 text-secondary-500 dark:bg-white/5 dark:text-secondary-400">
                <ClipboardList size={24} />
              </div>
              <h3 className="mt-4 text-body-lg font-semibold text-secondary-900 dark:text-white">Queue is empty</h3>
              <p className="mt-2 text-body-sm text-secondary-500 dark:text-secondary-400">
                There are no shortlisted candidates to review at this time.
              </p>
            </div>
          ) : (
            <Table density="comfortable">
              <TableHeader>
                <TableRow isHeader>
                  <TableHead>Candidate</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Interview Schedule</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {applications.map((app) => (
                  <TableRow
                    key={app.id}
                    className="cursor-pointer group hover:bg-secondary-50/50 dark:hover:bg-white/5"
                    onClick={() => navigate(`/hiring-manager/applications/${app.id}`)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        navigate(`/hiring-manager/applications/${app.id}`);
                      }
                    }}
                    role="link"
                    tabIndex={0}
                  >
                    <TableCell className="font-semibold text-secondary-900 dark:text-white">
                      {app.candidateName}
                    </TableCell>
                    <TableCell className="text-secondary-600 dark:text-secondary-300">
                      {app.jobTitle}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={app.status} />
                    </TableCell>
                    <TableCell className="text-secondary-600 dark:text-secondary-300">
                      {app.scheduledTime ? (
                        <span className="flex items-center gap-1.5">
                          <Calendar size={14} className="text-primary-500" />
                          {formatScheduledTime(app.scheduledTime)}
                        </span>
                      ) : (
                        <span className="text-secondary-400 dark:text-secondary-500 italic">Not scheduled yet</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <ChevronRight size={16} className="text-secondary-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default Queue;
