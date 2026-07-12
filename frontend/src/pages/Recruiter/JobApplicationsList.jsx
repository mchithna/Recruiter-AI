import { ArrowLeft } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-h2 text-secondary-900">Applications</h1>
          <p className="mt-1 text-body-sm text-secondary-500">
            {job ? job.title : 'Review candidates for this role'}
          </p>
        </div>
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

      <Card className="p-0 overflow-hidden">
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
                      <StatusBadge status={application.status} />
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
