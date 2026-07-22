import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Calendar, ClipboardList, ChevronRight, ArrowLeft } from 'lucide-react';
import {
  Button,
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
import { getJobApplications } from './services/hiringManagerApi';

const formatScheduledTime = (scheduledTime) => {
  if (!scheduledTime) return 'Not scheduled';

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(scheduledTime));
};

export function JobApplications() {
  const navigate = useNavigate();
  const { jobId } = useParams();
  const [applications, setApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isActive = true;

    async function loadApplications() {
      try {
        setIsLoading(true);
        const apps = await getJobApplications(jobId);

        if (isActive) {
          setApplications(apps);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Failed to load job applications', error);
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    if (jobId) {
      loadApplications();
    }

    return () => {
      isActive = false;
    };
  }, [jobId]);

  return (
    <div className="relative z-10 space-y-6 animate-slide-up">
      {/* Back button */}
      <div>
        <Button
          variant="ghost"
          leftIcon={<ArrowLeft size={16} />}
          onClick={() => navigate('/hiring-manager/jobs')}
          className="text-secondary-500 hover:text-secondary-900 dark:text-secondary-400 dark:hover:text-white"
        >
          Back to Jobs
        </Button>
      </div>

      {/* Main Table Card */}
      <Card className="glass-card-heavy overflow-hidden border-none p-0">
        <CardHeader className="mb-0 p-6 pb-4 border-b border-secondary-100 dark:border-white/10">
          <div>
            <CardTitle>Job Applicants</CardTitle>
            <CardDescription>
              Review candidates in your pipeline for this specific role.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3 p-6 pt-0 mt-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : applications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <div className="rounded-full bg-secondary-100 p-3 text-secondary-500 dark:bg-white/5 dark:text-secondary-400">
                <ClipboardList size={24} />
              </div>
              <h3 className="mt-4 text-body-lg font-semibold text-secondary-900 dark:text-white">No candidates yet</h3>
              <p className="mt-2 text-body-sm text-secondary-500 dark:text-secondary-400">
                There are no candidates in the pipeline for this job.
              </p>
            </div>
          ) : (
            <Table density="comfortable">
              <TableHeader>
                <TableRow isHeader>
                  <TableHead>Candidate</TableHead>
                  <TableHead>AI Match</TableHead>
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
                    <TableCell>
                      {app.aiMatchScore != null ? (
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-16 overflow-hidden rounded-full bg-secondary-100 dark:bg-secondary-800">
                            <div
                              className={`h-full rounded-full ${
                                app.aiMatchScore >= 80 ? 'bg-success-500'
                                : app.aiMatchScore >= 60 ? 'bg-warning-500'
                                : 'bg-danger-500'
                              }`}
                              style={{ width: `${app.aiMatchScore}%` }}
                            />
                          </div>
                          <span className="text-body-sm font-semibold text-secondary-700 dark:text-secondary-300">
                            {app.aiMatchScore}%
                          </span>
                        </div>
                      ) : (
                        <span className="text-secondary-400 italic">Pending</span>
                      )}
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

export default JobApplications;
