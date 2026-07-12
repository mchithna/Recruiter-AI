import { ArrowLeft, Bot, CalendarClock, MessageSquare } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  DateTimeInput,
  Input,
  ProgressBar,
  Select,
  Skeleton,
} from '../../components/ui';
import CalendarConnectButton from './components/CalendarConnectButton';
import CandidateProfileView from './components/CandidateProfileView';
import InterviewCard from './components/InterviewCard';
import StatusBadge from './components/StatusBadge';
import { getAiScreeningResult, getApplication } from './services/mockData';

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

function ScoreRow({ label, value }) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between gap-3">
        <span className="text-body-sm font-semibold text-secondary-700">{label}</span>
        <span className="text-body-sm font-semibold tabular-nums text-secondary-900">
          {value}%
        </span>
      </div>
      <ProgressBar value={value} size="sm" />
    </div>
  );
}

function AiScreeningPanel({ result }) {
  if (!result) {
    return (
      <Card className="border border-ai-100 bg-ai-50/40">
        <CardContent className="text-body-md text-secondary-600">
          AI screening context is not available for this application.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border border-ai-100 bg-ai-50/50 shadow-sm">
      <CardHeader className="mb-5 flex-col gap-3 sm:flex-row">
        <div>
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <Badge variant="ai" size="sm">AI Generated</Badge>
            <span className="text-caption font-semibold uppercase tracking-wide text-ai-700">
              Rank #{result.aiRank}
            </span>
          </div>
          <CardTitle className="flex items-center gap-2">
            <Bot size={22} strokeWidth={1.75} />
            AI Screening
          </CardTitle>
          <CardDescription>
            Assistive screening context for recruiter review.
          </CardDescription>
        </div>
        <div className="rounded-card bg-white px-4 py-3 text-center shadow-sm">
          <div className="text-h2 tabular-nums text-ai-700">{result.overallScore}%</div>
          <div className="text-caption font-semibold uppercase tracking-wide text-secondary-500">
            Overall
          </div>
        </div>
      </CardHeader>

      <div className="grid gap-4 md:grid-cols-3">
        <ScoreRow label="Skills" value={result.skillsMatchScore} />
        <ScoreRow label="Experience" value={result.experienceMatchScore} />
        <ScoreRow label="Education" value={result.educationMatchScore} />
      </div>

      <div className="mt-5 rounded-card border border-ai-100 bg-white p-4">
        <h3 className="text-body-sm font-semibold uppercase tracking-wide text-ai-700">
          Screening Summary
        </h3>
        <p className="mt-2 text-body-md leading-relaxed text-secondary-700">
          {result.screeningSummary}
        </p>
      </div>
    </Card>
  );
}

const interviewTypeOptions = [
  { value: 'Recruiter Screen', label: 'Recruiter Screen' },
  { value: 'Technical Screen', label: 'Technical Screen' },
  { value: 'Portfolio Review', label: 'Portfolio Review' },
  { value: 'Hiring Manager', label: 'Hiring Manager' },
  { value: 'Panel', label: 'Panel' },
];

const emptyInterviewForm = {
  interviewType: 'Recruiter Screen',
  scheduledTime: '',
  durationMinutes: '30',
  meetingLink: '',
};

function StatusAndInterviews({
  application,
  interviewForm,
  interviews,
  isSchedulingOpen,
  onInterviewFormChange,
  onReject,
  onSchedule,
  onShortlist,
  onSubmitInterview,
}) {
  const status = application.status;
  const canShortlist = status === 'Applied' || status === 'Under Review';
  const canReject = !['Rejected', 'Withdrawn', 'Hired'].includes(status);
  const canSchedule = status === 'Shortlisted';

  return (
    <div className="space-y-6">
      <Card className="border border-secondary-100 bg-secondary-50/60">
        <CardHeader className="mb-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-h4">
              <CalendarClock size={18} strokeWidth={1.75} />
              Status & Interviews
            </CardTitle>
            <CardDescription>Phase R4 workspace</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex flex-wrap gap-2">
            {canShortlist && (
              <Button type="button" variant="primary" size="sm" onClick={onShortlist}>
                Shortlist
              </Button>
            )}
            {canSchedule && (
              <Button type="button" variant="primary" size="sm" onClick={onSchedule}>
                Schedule Interview
              </Button>
            )}
            {canReject && (
              <Button type="button" variant="outline" size="sm" onClick={onReject}>
                Reject
              </Button>
            )}
            {!canShortlist && !canSchedule && !canReject && (
              <p className="text-body-sm leading-relaxed text-secondary-600">
                No status actions are available for this application right now.
              </p>
            )}
          </div>

          {isSchedulingOpen && (
            <form
              className="space-y-4 border-t border-secondary-100 pt-5"
              onSubmit={onSubmitInterview}
            >
              <div>
                <h3 className="text-body-md font-semibold text-secondary-900">
                  Schedule Interview
                </h3>
                <p className="mt-1 text-body-sm leading-relaxed text-secondary-600">
                  Connect your calendar to auto-sync this interview.
                </p>
                <div className="mt-3">
                  <CalendarConnectButton />
                </div>
              </div>

              <Select
                label="Interview Type"
                options={interviewTypeOptions}
                value={interviewForm.interviewType}
                onChange={onInterviewFormChange('interviewType')}
                required
              />
              <DateTimeInput
                label="Scheduled Time"
                value={interviewForm.scheduledTime}
                onChange={onInterviewFormChange('scheduledTime')}
                min={new Date().toISOString().slice(0, 16)}
                required
              />
              <Input
                label="Duration Minutes"
                type="number"
                min="15"
                step="15"
                value={interviewForm.durationMinutes}
                onChange={onInterviewFormChange('durationMinutes')}
                required
              />
              <Input
                label="Meeting Link"
                type="url"
                value={interviewForm.meetingLink}
                onChange={onInterviewFormChange('meetingLink')}
                placeholder="https://meet.example.com/interview"
              />

              <Button type="submit" variant="primary" className="w-full">
                Save Interview
              </Button>
            </form>
          )}
        </CardContent>
      </Card>

      {interviews.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-body-lg font-semibold text-secondary-900">
            Scheduled Interviews
          </h2>
          {interviews.map((interview) => (
            <InterviewCard key={interview.id} interview={interview} />
          ))}
        </section>
      )}
    </div>
  );
}

export function ApplicationDetail() {
  const navigate = useNavigate();
  const { applicationId } = useParams();
  const [application, setApplication] = useState(null);
  const [screeningResult, setScreeningResult] = useState(null);
  const [interviews, setInterviews] = useState([]);
  const [isSchedulingOpen, setIsSchedulingOpen] = useState(false);
  const [interviewForm, setInterviewForm] = useState(emptyInterviewForm);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isActive = true;
    setIsLoading(true);

    Promise.all([
      getApplication(applicationId),
      getAiScreeningResult(applicationId),
    ]).then(([mockApplication, mockScreeningResult]) => {
      if (!isActive) return;
      setApplication(mockApplication);
      setScreeningResult(mockScreeningResult);
      setInterviews([]);
      setIsSchedulingOpen(mockApplication?.status === 'Shortlisted');
      setInterviewForm(emptyInterviewForm);
      setIsLoading(false);
    });

    return () => {
      isActive = false;
    };
  }, [applicationId]);

  const updateApplicationStatus = (status) => {
    setApplication((currentApplication) => ({
      ...currentApplication,
      status,
    }));
  };

  const handleInterviewFormChange = (field) => (event) => {
    setInterviewForm((currentForm) => ({
      ...currentForm,
      [field]: event.target.value,
    }));
  };

  const handleShortlist = () => {
    updateApplicationStatus('Shortlisted');
    setIsSchedulingOpen(true);
  };

  const handleReject = () => {
    updateApplicationStatus('Rejected');
    setIsSchedulingOpen(false);
  };

  const handleSchedule = () => {
    setIsSchedulingOpen((currentValue) => !currentValue);
  };

  const handleSubmitInterview = (event) => {
    event.preventDefault();

    const newInterview = {
      id: `int-${Date.now()}`,
      applicationId: application.id,
      candidateName: application.candidateName,
      jobTitle: application.jobTitle,
      interviewerId: 'user-current',
      interviewerName: 'Current Recruiter',
      interviewType: interviewForm.interviewType,
      scheduledTime: new Date(interviewForm.scheduledTime).toISOString(),
      durationMinutes: Number(interviewForm.durationMinutes),
      meetingLink: interviewForm.meetingLink,
      status: 'Scheduled',
      notes: '',
    };

    setInterviews((currentInterviews) => [newInterview, ...currentInterviews]);
    updateApplicationStatus('Interview Scheduled');
    setInterviewForm(emptyInterviewForm);
    setIsSchedulingOpen(false);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton height="2.5rem" className="max-w-md" />
        <Skeleton height="10rem" />
        <Skeleton height="28rem" />
      </div>
    );
  }

  if (!application) {
    return (
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Application not found</CardTitle>
            <CardDescription>
              This application is not available in the current mock dataset.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <Button
            type="button"
            variant="outline"
            leftIcon={<ArrowLeft size={18} />}
            onClick={() => navigate('/recruiter/jobs')}
          >
            Back to Jobs
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-h2 text-secondary-900">{application.candidateName}</h1>
          <p className="mt-1 text-body-sm text-secondary-500">
            {application.jobTitle}
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          leftIcon={<ArrowLeft size={18} />}
          onClick={() => navigate(`/recruiter/jobs/${application.jobId}/applications`)}
          className="w-full sm:w-auto"
        >
          Back to Applications
        </Button>
      </div>

      <Card>
        <CardHeader className="mb-0 flex-col gap-3 sm:flex-row">
          <div>
            <CardTitle>Application Status</CardTitle>
            <CardDescription>
              Applied {formatAppliedAt(application.appliedAt)}
            </CardDescription>
          </div>
          <StatusBadge status={application.status} size="md" />
        </CardHeader>
      </Card>

      <AiScreeningPanel result={screeningResult} />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <CandidateProfileView candidateProfile={application.candidateProfile} />

        <div className="space-y-6">
          <StatusAndInterviews
            application={application}
            interviewForm={interviewForm}
            interviews={interviews}
            isSchedulingOpen={isSchedulingOpen}
            onInterviewFormChange={handleInterviewFormChange}
            onReject={handleReject}
            onSchedule={handleSchedule}
            onShortlist={handleShortlist}
            onSubmitInterview={handleSubmitInterview}
          />

          <Card className="border border-secondary-100 bg-secondary-50/60">
            <CardHeader className="mb-3">
              <div>
                <CardTitle className="flex items-center gap-2 text-h4">
                  <MessageSquare size={18} strokeWidth={1.75} />
                  Messaging
                </CardTitle>
                <CardDescription>Phase R5 workspace</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="text-body-sm leading-relaxed text-secondary-600">
              Candidate messaging and communication history will attach here.
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default ApplicationDetail;
