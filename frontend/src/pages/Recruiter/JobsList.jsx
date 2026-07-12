import { Edit, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-h2 text-secondary-900">Jobs</h1>
          <p className="mt-1 text-body-sm text-secondary-500">
            Manage open roles and review their applicant pipelines.
          </p>
        </div>
        <Button
          type="button"
          variant="primary"
          leftIcon={<Plus size={18} />}
          onClick={() => navigate('/recruiter/jobs/new')}
          className="w-full sm:w-auto"
        >
          New Job
        </Button>
      </div>

      <Card className="p-0 overflow-hidden">
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
