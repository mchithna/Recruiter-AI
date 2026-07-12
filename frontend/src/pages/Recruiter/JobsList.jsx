import { Briefcase, Edit, Plus, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
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
import StatusBadge from './components/StatusBadge';
import { useRecruiterJobs } from './useRecruiterJobs';

const formatDeadline = (deadline) => {
  if (!deadline) return 'No deadline';

  return new Intl.DateTimeFormat(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(deadline));
};

export function JobsList() {
  const navigate = useNavigate();
  const { jobs, isLoading } = useRecruiterJobs();
  const openJobs = jobs.filter((job) => job.status === 'Open').length;

  return (
    <div className="relative z-10 space-y-6 animate-slide-up">
      <section className="glass-card-heavy relative overflow-hidden rounded-3xl border-none p-6">
        <img
          src="/images/card-bg-company.png"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover opacity-15 dark:opacity-35 dark:mix-blend-screen"
        />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Badge variant="primary" size="sm" icon={<Sparkles size={12} strokeWidth={1.75} />}>
              Role portfolio
            </Badge>
            <h1 className="mt-3 text-h1 text-secondary-900 dark:text-white">Jobs</h1>
            <p className="mt-2 max-w-2xl text-body-sm text-secondary-500 dark:text-secondary-300">
              Manage open roles, draft future positions, and jump into each applicant pipeline.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <span className="rounded-full bg-white/70 px-3 py-1 text-caption font-semibold text-primary-700 dark:bg-white/10 dark:text-primary-300">
                {openJobs} open roles
              </span>
              <span className="rounded-full bg-white/70 px-3 py-1 text-caption font-semibold text-secondary-600 dark:bg-white/10 dark:text-secondary-300">
                {jobs.length} total roles
              </span>
            </div>
          </div>
          <div className="hidden h-24 w-24 items-center justify-center rounded-3xl bg-primary-500 text-white shadow-glow-primary sm:flex">
            <Briefcase size={42} strokeWidth={1.5} />
          </div>
        </div>
      </section>

      <div className="flex justify-end">
        <Button
          type="button"
          variant="glass"
          leftIcon={<Plus size={18} />}
          onClick={() => navigate('/recruiter/jobs/new')}
          className="w-full sm:w-auto"
        >
          New Job
        </Button>
      </div>

      <Card className="glass-card-heavy overflow-hidden border-none p-0">
        <CardHeader className="mb-0 p-6 pb-4">
          <div>
            <CardTitle>All Jobs</CardTitle>
            <CardDescription>{jobs.length} roles in your workspace</CardDescription>
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
                  <TableHead>Title</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Employment</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Deadline</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {jobs.map((job) => (
                  <TableRow
                    key={job.id}
                    className="cursor-pointer"
                    onClick={() => navigate(`/recruiter/jobs/${job.id}/applications`)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        navigate(`/recruiter/jobs/${job.id}/applications`);
                      }
                    }}
                    role="link"
                    tabIndex={0}
                  >
                    <TableCell className="font-semibold text-secondary-900">
                      {job.title}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={job.status} />
                    </TableCell>
                    <TableCell>{job.employmentType}</TableCell>
                    <TableCell>{job.location}</TableCell>
                    <TableCell>{formatDeadline(job.applicationDeadline)}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        leftIcon={<Edit size={16} />}
                        onClick={(event) => {
                          event.stopPropagation();
                          navigate(`/recruiter/jobs/${job.id}/edit`);
                        }}
                        onKeyDown={(event) => event.stopPropagation()}
                      >
                        Edit
                      </Button>
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

export default JobsList;
