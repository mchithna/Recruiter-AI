import { ArrowLeft, Sparkles, Users } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Badge,
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
import { StatusBadge } from '../../components/ui';
import { getApplicationsByJob } from './services/mockData';
import { useRecruiterJobs } from './useRecruiterJobs';

const formatAppliedAt = (appliedAt) => {
  if (!appliedAt) return 'Unknown';

  return new Intl.DateTimeFormat(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(appliedAt));
};

export function JobApplicationsList() {
  const navigate = useNavigate();
  const { jobId } = useParams();
  const { getJobById } = useRecruiterJobs();
  const [applications, setApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const job = getJobById(jobId);
  const sortedApplications = useMemo(
    () => [...applications].sort((a, b) => b.aiMatchScore - a.aiMatchScore),
    [applications]
  );
  const averageScore = applications.length
    ? Math.round(
        applications.reduce((total, application) => total + application.aiMatchScore, 0) /
          applications.length
      )
    : 0;

  useEffect(() => {
    let isActive = true;
    setIsLoading(true);

    getApplicationsByJob(jobId).then((mockApplications) => {
      if (!isActive) return;
      setApplications(mockApplications);
      setIsLoading(false);
    });

    return () => {
      isActive = false;
    };
  }, [jobId]);

  return (
    <div className="relative z-10 space-y-6 animate-slide-up">
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
              AI-ranked applicants
            </Badge>
            <h1 className="mt-3 text-h1 text-secondary-900 dark:text-white">Applications</h1>
            <p className="mt-2 max-w-2xl text-body-sm text-secondary-500 dark:text-secondary-300">
              {job ? job.title : 'Review candidates for this role'}
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <span className="rounded-full bg-white/70 px-3 py-1 text-caption font-semibold text-primary-700 dark:bg-white/10 dark:text-primary-300">
                {applications.length} candidates
              </span>
              <span className="rounded-full bg-white/70 px-3 py-1 text-caption font-semibold text-ai-700 dark:bg-white/10 dark:text-ai-300">
                {averageScore}% avg AI match
              </span>
            </div>
          </div>
          <div className="hidden h-24 w-24 items-center justify-center rounded-3xl bg-ai-500 text-white shadow-glow-ai sm:flex">
            <Users size={42} strokeWidth={1.5} />
          </div>
        </div>
      </section>

      <div className="flex justify-end">
        <Button
          type="button"
          variant="outline"
          leftIcon={<ArrowLeft size={18} />}
          onClick={() => navigate('/recruiter/jobs')}
          className="w-full sm:w-auto"
        >
          Back to Jobs
        </Button>
      </div>

      <Card className="glass-card-heavy overflow-hidden border-none p-0">
        <CardHeader className="mb-0 p-6 pb-4">
          <div>
            <CardTitle>Applicants</CardTitle>
            <CardDescription>
              Sorted by AI match score from highest to lowest.
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
          ) : (
            <Table density="comfortable">
              <TableHeader>
                <TableRow isHeader>
                  <TableHead>Candidate</TableHead>
                  <TableHead>Applied</TableHead>
                  <TableHead className="text-right">AI Match</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedApplications.map((application) => (
                  <TableRow
                    key={application.id}
                    className="cursor-pointer"
                    onClick={() => navigate(`/recruiter/applications/${application.id}`)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        navigate(`/recruiter/applications/${application.id}`);
                      }
                    }}
                    role="link"
                    tabIndex={0}
                  >
                    <TableCell className="font-semibold text-secondary-900">
                      {application.candidateName}
                    </TableCell>
                    <TableCell>{formatAppliedAt(application.appliedAt)}</TableCell>
                    <TableCell numeric>{application.aiMatchScore}%</TableCell>
                    <TableCell>
                      <StatusBadge status={application.status?.toLowerCase().replace(/ /g, '_')} />
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

export default JobApplicationsList;
