import { ArrowLeft, Bot, CalendarClock, FileSearch, MessageSquareText, Sparkles } from 'lucide-react';
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
import { StatusBadge } from '../../components/ui';
import { recruiterApi } from './services/recruiterApi';
import { MessagingThread } from './components/MessagingThread';

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
        <span className="text-body-sm font-semibold text-secondary-700 dark:text-secondary-200">{label}</span>
        <span className="text-body-sm font-semibold tabular-nums text-secondary-900 dark:text-white">
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
      <Card className="glass-card-heavy border-none">
        <CardContent className="text-body-md text-secondary-600 dark:text-secondary-300">
          AI screening context is not available for this application.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card-heavy overflow-hidden border-none">
      <CardHeader className="mb-5 flex-col gap-3 sm:flex-row">
        <div>
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <Badge variant="ai" size="sm">AI Generated</Badge>
            <span className="text-caption font-semibold uppercase tracking-wide text-ai-700 dark:text-ai-300">
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
        <div className="rounded-xl bg-secondary-50 px-5 py-3 text-center dark:bg-white/10">
          <div className="text-h2 tabular-nums text-ai-700 dark:text-ai-300">{result.overallScore}%</div>
          <div className="text-caption font-semibold uppercase tracking-wide text-secondary-500 dark:text-secondary-400">
            Overall
          </div>
        </div>
      </CardHeader>

      <div className="grid gap-4 md:grid-cols-3">
        <ScoreRow label="Skills" value={result.skillsMatchScore} />
        <ScoreRow label="Experience" value={result.experienceMatchScore} />
        <ScoreRow label="Education" value={result.educationMatchScore} />
      </div>

      <div className="mt-5 rounded-xl border border-secondary-100 bg-secondary-50 p-4 dark:border-white/10 dark:bg-white/5">
        <h3 className="text-body-sm font-semibold uppercase tracking-wide text-ai-700 dark:text-ai-300">
          Screening Summary
        </h3>
        <p className="mt-2 text-body-md leading-relaxed text-secondary-700 dark:text-secondary-200">
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
    <div className="relative z-10 space-y-6 animate-slide-up">
      <Card className="glass-card-heavy border-none">
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
  const [messages, setMessages] = useState([]);
  const [draftMessage, setDraftMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [aiPanel, setAiPanel] = useState({ loading: '', error: '', title: '', disclaimer: '', result: null });

  useEffect(() => {
    let isActive = true;
    setIsLoading(true);

    recruiterApi.getApplication(applicationId)
      .then((loadedApplication) => {
        if (!isActive) return;
        setApplication(loadedApplication);
        setScreeningResult(loadedApplication.screeningResult);
        setInterviews(loadedApplication.interviews || []);
        setMessages(loadedApplication.messages || []);
        setDraftMessage('');
        setIsSchedulingOpen(loadedApplication?.status === 'Shortlisted');
        setInterviewForm(emptyInterviewForm);
      })
      .catch((error) => {
        console.error('Failed to load application:', error);
        if (isActive) setApplication(null);
      })
      .finally(() => {
        if (isActive) setIsLoading(false);
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
    if (!window.confirm('Confirm that you want to mark this application as shortlisted?')) return;
    updateApplicationStatus('Shortlisted');
    setIsSchedulingOpen(true);
  };

  const handleReject = () => {
    if (!window.confirm('Confirm that you want to mark this application as rejected?')) return;
    updateApplicationStatus('Rejected');
    setIsSchedulingOpen(false);
  };

  const handleSchedule = () => {
    setIsSchedulingOpen((currentValue) => !currentValue);
  };

  const handleSubmitInterview = (event) => {
    event.preventDefault();
    if (!window.confirm('Confirm that you want to schedule this interview?')) return;

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

  const handleDraftMessageChange = (event) => {
    setDraftMessage(event.target.value);
  };

  const handleSendMessage = (event) => {
    event.preventDefault();
    if (!window.confirm('Confirm that you reviewed and want to send this message?')) return;

    const trimmedMessage = draftMessage.trim();
    if (!trimmedMessage) return;

    setMessages((currentMessages) => [
      ...currentMessages,
      {
        id: `msg-${Date.now()}`,
        sender: 'Current Recruiter',
        body: trimmedMessage,
        sentAt: new Date().toISOString(),
      },
    ]);
    setDraftMessage('');
  };

  const runAiAction = async (action) => {
    setAiPanel({ loading: action, error: '', title: '', disclaimer: '', result: null });
    try {
      const calls = {
        cv: () => recruiterApi.analyzeCv(applicationId),
        match: () => recruiterApi.matchCandidate(applicationId),
        summary: () => recruiterApi.summarizeCandidate(applicationId),
        questions: () => recruiterApi.generateInterviewQuestions(applicationId),
        message: () => recruiterApi.draftMessage({
          applicationId,
          messageType: 'Interview invitation',
          notes: draftMessage || 'Draft a concise interview invitation.',
        }),
      };
      const response = await calls[action]();
      const titles = {
        cv: 'CV Analysis',
        match: 'Candidate-Job Match',
        summary: 'Candidate Summary',
        questions: 'Interview Questions',
        message: 'Message Draft',
      };
      setAiPanel({
        loading: '',
        error: '',
        title: titles[action],
        disclaimer: response.disclaimer,
        result: response.result,
      });
      if (action === 'match' && response.result) {
        setScreeningResult({
          overallScore: response.result.overallMatchScore,
          skillsMatchScore: response.result.skillMatchScore,
          experienceMatchScore: response.result.experienceMatchScore,
          educationMatchScore: response.result.educationMatchScore,
          screeningSummary: response.result.explanation,
        });
      }
      if (action === 'message' && response.result?.body) {
        setDraftMessage(response.result.body);
      }
    } catch (error) {
      setAiPanel({
        loading: '',
        error: error?.response?.data?.message || 'AI could not complete this request right now.',
        title: '',
        disclaimer: '',
        result: null,
      });
    }
  };

  const renderAiValue = (value) => {
    if (Array.isArray(value)) {
      return (
        <ul className="list-disc space-y-1 pl-5">
          {value.map((item) => <li key={String(item)}>{String(item)}</li>)}
        </ul>
      );
    }
    return <p>{String(value || 'Not provided')}</p>;
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
      <Card className="glass-card-heavy border-none">
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
    <div className="relative z-10 space-y-6 animate-slide-up">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-h2 text-secondary-900 dark:text-white">{application.candidateName}</h1>
          <p className="mt-1 text-body-sm text-secondary-500 dark:text-secondary-300">
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

      <Card className="glass-card-heavy border-none">
        <CardHeader className="mb-0 flex-col gap-3 sm:flex-row">
          <div>
            <CardTitle>Application Status</CardTitle>
            <CardDescription>
              Applied {formatAppliedAt(application.appliedAt)}
            </CardDescription>
          </div>
          <StatusBadge status={application.status?.toLowerCase().replace(/ /g, '_')} size="md" />
        </CardHeader>
      </Card>

      <AiScreeningPanel result={screeningResult} />

      <Card className="glass-card-heavy border-none">
        <CardHeader className="mb-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Sparkles size={20} />
              Recruiter AI Actions
            </CardTitle>
            <CardDescription>
              Advisory tools only. Recruiter review is required before any decision or message.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {[
              ['cv', 'Analyze CV', FileSearch],
              ['summary', 'Generate Summary', Bot],
              ['match', 'Match with Job', Sparkles],
              ['questions', 'Generate Interview Questions', CalendarClock],
              ['message', 'Draft Message', MessageSquareText],
            ].map(([action, label, Icon]) => (
              <Button
                key={action}
                type="button"
                variant={action === 'match' ? 'ai' : 'outline'}
                size="sm"
                leftIcon={<Icon size={15} />}
                disabled={Boolean(aiPanel.loading)}
                onClick={() => runAiAction(action)}
              >
                {aiPanel.loading === action ? 'Working...' : label}
              </Button>
            ))}
          </div>
          {(aiPanel.result || aiPanel.error) && (
            <div className="rounded-xl border border-secondary-100 bg-white/70 p-4 dark:border-white/10 dark:bg-white/5">
              <h3 className="text-body-lg font-semibold text-secondary-900 dark:text-white">
                {aiPanel.title || 'AI Assistance'}
              </h3>
              {aiPanel.disclaimer && (
                <p className="mt-1 text-caption font-semibold text-secondary-500 dark:text-secondary-300">
                  {aiPanel.disclaimer}
                </p>
              )}
              {aiPanel.error ? (
                <p className="mt-3 text-body-sm text-danger-600 dark:text-danger-300">{aiPanel.error}</p>
              ) : (
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  {Object.entries(aiPanel.result || {}).map(([key, value]) => (
                    <div key={key} className="rounded-lg bg-secondary-50 p-3 dark:bg-white/10">
                      <p className="text-caption font-semibold uppercase tracking-wide text-secondary-500 dark:text-secondary-300">
                        {key.replace(/([A-Z])/g, ' $1')}
                      </p>
                      <div className="mt-2 text-body-sm leading-relaxed text-secondary-700 dark:text-secondary-200">
                        {renderAiValue(value)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

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

          <MessagingThread
            application={application}
            messages={messages}
            draftMessage={draftMessage}
            onDraftChange={handleDraftMessageChange}
            onSendMessage={handleSendMessage}
          />
        </div>
      </div>
    </div>
  );
}

export default ApplicationDetail;
