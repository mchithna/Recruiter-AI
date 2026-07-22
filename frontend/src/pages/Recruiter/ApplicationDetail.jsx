import {
  ArrowLeft,
  Bot,
  CalendarClock,
  Check,
  CheckCircle2,
  Code,
  Copy,
  FileSearch,
  MessageSquareText,
  RotateCw,
  Sparkles,
  Target,
  UserCheck,
  Users,
} from 'lucide-react';
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
  Modal,
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
import { useToast } from '../../lib/ToastContext';

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

const safeScore = (value) => Math.max(0, Math.min(100, Number(value ?? 0)));

const hasUsableScreeningData = (result) => {
  if (!result) return false;

  return Boolean(result.screeningSummary?.trim())
    || safeScore(result.overallScore) > 0
    || safeScore(result.skillsMatchScore) > 0
    || safeScore(result.experienceMatchScore) > 0
    || safeScore(result.educationMatchScore) > 0;
};

function ScoreRow({ label, value }) {
  const score = safeScore(value);

  return (
    <div>
      <div className="mb-1 flex items-center justify-between gap-3">
        <span className="text-body-sm font-semibold text-secondary-700 dark:text-secondary-200">{label}</span>
        <span className="text-body-sm font-semibold tabular-nums text-secondary-900 dark:text-white">
          {score}%
        </span>
      </div>
      <ProgressBar value={score} size="sm" />
    </div>
  );
}

function AiScreeningPanel({ result }) {
  if (!hasUsableScreeningData(result)) {
    return (
      <Card className="glass-card-heavy border-none">
        <CardContent className="text-body-md text-secondary-600 dark:text-secondary-300">
          AI screening context is not available yet. Run Match with Job to generate recruiter-reviewed screening scores.
        </CardContent>
      </Card>
    );
  }

  const overallScore = safeScore(result.overallScore);
  const rankLabel = result.aiRank ? `Rank #${result.aiRank}` : 'Rank pending';

  return (
    <Card className="glass-card-heavy overflow-hidden border-none">
      <CardHeader className="mb-5 flex-col gap-3 sm:flex-row">
        <div>
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <Badge variant="ai" size="sm">AI Generated</Badge>
            <span className="text-caption font-semibold uppercase tracking-wide text-ai-700 dark:text-ai-300">
              {rankLabel}
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
          <div className="text-h2 tabular-nums text-ai-700 dark:text-ai-300">{overallScore}%</div>
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
          {result.screeningSummary || 'Review the generated scores alongside the candidate profile and job requirements before making any decision.'}
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
  interviewerId: '',
  interviewType: 'Recruiter Screen',
  scheduledTime: '',
  durationMinutes: '30',
  meetingLink: '',
};


function StatusAndInterviews({
  application,
  onReject,
  onShortlist,
  isStatusUpdating,
}) {
  const status = application.status;
  const isJobClosed = application.jobStatus === 'Closed';
  const canShortlist = status === 'Applied' || status === 'Under Review';
  const canReject = !['Rejected', 'Withdrawn', 'Hired'].includes(status);
  const isShortlisted = status === 'Shortlisted';

  return (
    <div className="relative z-10 space-y-6 animate-slide-up">
      <Card className="glass-card-heavy border-none">
        <CardHeader className="mb-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-h4">
              <CalendarClock size={18} strokeWidth={1.75} />
              Application Status
            </CardTitle>
            <CardDescription>Screening & Decisioning</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex flex-wrap gap-2">
            {canShortlist && (
              <Button type="button" variant="primary" size="sm" onClick={onShortlist} disabled={isStatusUpdating || isJobClosed} title={isJobClosed ? 'Job posting is finalized and closed' : undefined}>
                {isStatusUpdating ? 'Updating...' : 'Shortlist'}
              </Button>
            )}
            {canReject && (
              <Button type="button" variant="outline" size="sm" onClick={onReject} disabled={isStatusUpdating || isJobClosed} title={isJobClosed ? 'Job posting is finalized and closed' : undefined}>
                {isStatusUpdating ? 'Updating...' : 'Reject'}
              </Button>
            )}
            {isJobClosed && (
              <p className="text-xs font-medium text-amber-600 dark:text-amber-400">
                Job posting is finalized & closed. Candidate status actions are locked.
              </p>
            )}
            {!canShortlist && !canReject && !isShortlisted && !isJobClosed && (
              <p className="text-body-sm leading-relaxed text-secondary-600">
                No status actions are available for this application right now.
              </p>
            )}
          </div>

          {isShortlisted && (
            <div className="rounded-xl border border-primary-200/50 bg-primary-500/10 p-4 text-body-sm text-primary-900 dark:text-primary-200">
              <p className="font-semibold mb-1 flex items-center gap-1.5">
                <Sparkles size={16} /> Shortlisted for Interview
              </p>
              <p className="text-xs text-secondary-600 dark:text-secondary-300">
                Interviews for shortlisted candidates can be scheduled from the <strong>Interviews Hub</strong> once the job is closed.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function AiInterviewQuestionsView({ candidateName, jobTitle, result, onRegenerate }) {
  const [copied, setCopied] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);

  if (!result) return null;

  const {
    technicalQuestions = [],
    behavioralQuestions = [],
    situationalQuestions = [],
    candidateSpecificQuestions = [],
    suggestedEvaluationCriteria = [],
  } = result;

  const handleCopyAll = () => {
    const text = [
      `AI INTERVIEW GUIDE FOR ${candidateName.toUpperCase()} (${jobTitle.toUpperCase()})`,
      `==================================================`,
      ``,
      `TECHNICAL QUESTIONS:`,
      ...technicalQuestions.map((q, i) => `${i + 1}. ${q}`),
      ``,
      `CANDIDATE-SPECIFIC DEEP DIVES:`,
      ...candidateSpecificQuestions.map((q, i) => `${i + 1}. ${q}`),
      ``,
      `BEHAVIORAL QUESTIONS:`,
      ...behavioralQuestions.map((q, i) => `${i + 1}. ${q}`),
      ``,
      `SITUATIONAL SCENARIOS:`,
      ...situationalQuestions.map((q, i) => `${i + 1}. ${q}`),
      ``,
      `SUGGESTED EVALUATION CRITERIA:`,
      ...suggestedEvaluationCriteria.map((c) => `• ${c}`),
    ].join('\n');

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyOne = (question, id) => {
    navigator.clipboard.writeText(question);
    setCopiedIndex(id);
    setTimeout(() => setCopiedIndex(null), 1500);
  };

  return (
    <div className="mt-4 space-y-6 rounded-2xl border border-primary-500/30 bg-gradient-to-b from-primary-500/5 via-ai-500/5 to-transparent p-5 sm:p-6 dark:border-primary-400/20 shadow-glass">
      
      {/* Header Banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-secondary-200/60 pb-5 dark:border-white/10">
        <div className="flex items-start gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 via-ai-500 to-indigo-600 text-white shadow-glow-primary">
            <Sparkles size={22} className="animate-pulse" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-ai-500/10 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-ai-600 dark:bg-ai-400/20 dark:text-ai-300">
                🤖 AI Copilot Active
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-success-500/10 px-2 py-0.5 text-[10px] font-bold text-success-600 dark:bg-success-400/20 dark:text-success-300">
                <Check size={11} /> 98% Context Match
              </span>
            </div>
            <h3 className="mt-1 text-h3 text-secondary-900 dark:text-white">
              AI Interview Assessment Kit
            </h3>
            <p className="text-caption text-secondary-500 dark:text-secondary-400">
              Dynamically generated for <span className="font-semibold text-secondary-800 dark:text-white">{candidateName}</span> for the <span className="font-semibold text-secondary-800 dark:text-white">{jobTitle}</span> role.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            leftIcon={copied ? <Check size={14} className="text-success-500" /> : <Copy size={14} />}
            onClick={handleCopyAll}
          >
            {copied ? 'Copied All!' : 'Copy All'}
          </Button>
          {onRegenerate && (
            <Button
              type="button"
              variant="ai"
              size="sm"
              leftIcon={<RotateCw size={14} />}
              onClick={onRegenerate}
            >
              Regenerate
            </Button>
          )}
        </div>
      </div>

      {/* Grid of Categorized Sections */}
      <div className="grid gap-6">

        {/* ⚡ 1. Technical Questions */}
        {technicalQuestions.length > 0 && (
          <div className="space-y-3 rounded-2xl border-l-4 border-l-primary-500 bg-white/80 p-5 shadow-sm dark:bg-secondary-900/60 border border-secondary-100 dark:border-white/5">
            <div className="flex items-center justify-between">
              <h4 className="flex items-center gap-2 text-body-lg font-bold text-secondary-900 dark:text-white">
                <Code size={18} className="text-primary-500" />
                Technical Questions
              </h4>
              <Badge variant="primary" size="sm">Deep Technical</Badge>
            </div>
            <div className="space-y-2.5">
              {technicalQuestions.map((q, idx) => (
                <div key={idx} className="group relative flex items-start justify-between gap-3 rounded-xl bg-secondary-50/80 p-3.5 transition-all hover:bg-secondary-100/60 dark:bg-white/5 dark:hover:bg-white/10">
                  <div className="flex items-start gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-500/10 text-caption font-bold text-primary-600 dark:bg-primary-400/20 dark:text-primary-300">
                      {idx + 1}
                    </span>
                    <p className="text-body-sm font-medium text-secondary-800 dark:text-secondary-100">
                      {q}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopyOne(q, `tech-${idx}`)}
                    className="shrink-0 text-secondary-400 hover:text-primary-600 dark:text-secondary-500 dark:hover:text-primary-400"
                    title="Copy Question"
                  >
                    {copiedIndex === `tech-${idx}` ? <Check size={14} className="text-success-500" /> : <Copy size={14} />}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 👤 2. Candidate-Specific Questions */}
        {candidateSpecificQuestions.length > 0 && (
          <div className="space-y-3 rounded-2xl border-l-4 border-l-ai-500 bg-white/80 p-5 shadow-sm dark:bg-secondary-900/60 border border-secondary-100 dark:border-white/5">
            <div className="flex items-center justify-between">
              <h4 className="flex items-center gap-2 text-body-lg font-bold text-secondary-900 dark:text-white">
                <UserCheck size={18} className="text-ai-500" />
                Candidate Specific Questions (Resume & History)
              </h4>
              <Badge variant="ai" size="sm">Resume Insight</Badge>
            </div>
            <p className="text-caption text-secondary-500 dark:text-secondary-400">
              💡 Questions formulated specifically from <span className="font-semibold text-secondary-700 dark:text-secondary-300">{candidateName}</span>’s career timeline, listed tools, and experience claims.
            </p>
            <div className="space-y-2.5">
              {candidateSpecificQuestions.map((q, idx) => (
                <div key={idx} className="group relative flex items-start justify-between gap-3 rounded-xl bg-ai-500/5 p-3.5 transition-all hover:bg-ai-500/10 border border-ai-500/10 dark:bg-white/5 dark:hover:bg-white/10">
                  <div className="flex items-start gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-ai-500/20 text-caption font-bold text-ai-700 dark:text-ai-300">
                      {idx + 1}
                    </span>
                    <p className="text-body-sm font-medium text-secondary-800 dark:text-secondary-100">
                      {q}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopyOne(q, `cand-${idx}`)}
                    className="shrink-0 text-secondary-400 hover:text-ai-600 dark:text-secondary-500 dark:hover:text-ai-300"
                    title="Copy Question"
                  >
                    {copiedIndex === `cand-${idx}` ? <Check size={14} className="text-success-500" /> : <Copy size={14} />}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 🎭 3. Behavioral Questions */}
        {behavioralQuestions.length > 0 && (
          <div className="space-y-3 rounded-2xl border-l-4 border-l-purple-500 bg-white/80 p-5 shadow-sm dark:bg-secondary-900/60 border border-secondary-100 dark:border-white/5">
            <div className="flex items-center justify-between">
              <h4 className="flex items-center gap-2 text-body-lg font-bold text-secondary-900 dark:text-white">
                <Users size={18} className="text-purple-500" />
                Behavioral & Culture Fit
              </h4>
              <Badge variant="secondary" size="sm">Agile & Leadership</Badge>
            </div>
            <div className="space-y-2.5">
              {behavioralQuestions.map((q, idx) => (
                <div key={idx} className="group relative flex items-start justify-between gap-3 rounded-xl bg-secondary-50/80 p-3.5 transition-all hover:bg-secondary-100/60 dark:bg-white/5 dark:hover:bg-white/10">
                  <div className="flex items-start gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-purple-500/10 text-caption font-bold text-purple-600 dark:bg-purple-400/20 dark:text-purple-300">
                      {idx + 1}
                    </span>
                    <p className="text-body-sm font-medium text-secondary-800 dark:text-secondary-100">
                      {q}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopyOne(q, `beh-${idx}`)}
                    className="shrink-0 text-secondary-400 hover:text-purple-600 dark:text-secondary-500 dark:hover:text-purple-400"
                    title="Copy Question"
                  >
                    {copiedIndex === `beh-${idx}` ? <Check size={14} className="text-success-500" /> : <Copy size={14} />}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 🎯 4. Situational Scenarios */}
        {situationalQuestions.length > 0 && (
          <div className="space-y-3 rounded-2xl border-l-4 border-l-amber-500 bg-white/80 p-5 shadow-sm dark:bg-secondary-900/60 border border-secondary-100 dark:border-white/5">
            <div className="flex items-center justify-between">
              <h4 className="flex items-center gap-2 text-body-lg font-bold text-secondary-900 dark:text-white">
                <Target size={18} className="text-amber-500" />
                Situational Production Scenarios
              </h4>
              <Badge variant="warning" size="sm">Problem Solving</Badge>
            </div>
            <div className="space-y-2.5">
              {situationalQuestions.map((q, idx) => (
                <div key={idx} className="group relative flex items-start justify-between gap-3 rounded-xl bg-secondary-50/80 p-3.5 transition-all hover:bg-secondary-100/60 dark:bg-white/5 dark:hover:bg-white/10">
                  <div className="flex items-start gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-500/10 text-caption font-bold text-amber-600 dark:bg-amber-400/20 dark:text-amber-300">
                      {idx + 1}
                    </span>
                    <p className="text-body-sm font-medium text-secondary-800 dark:text-secondary-100">
                      {q}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopyOne(q, `sit-${idx}`)}
                    className="shrink-0 text-secondary-400 hover:text-amber-600 dark:text-secondary-500 dark:hover:text-amber-400"
                    title="Copy Question"
                  >
                    {copiedIndex === `sit-${idx}` ? <Check size={14} className="text-success-500" /> : <Copy size={14} />}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 📋 5. Suggested Evaluation Criteria */}
        {suggestedEvaluationCriteria.length > 0 && (
          <div className="space-y-3 rounded-2xl border-l-4 border-l-emerald-500 bg-white/80 p-5 shadow-sm dark:bg-secondary-900/60 border border-secondary-100 dark:border-white/5">
            <div className="flex items-center justify-between">
              <h4 className="flex items-center gap-2 text-body-lg font-bold text-secondary-900 dark:text-white">
                <CheckCircle2 size={18} className="text-emerald-500" />
                Suggested Evaluation Criteria & Benchmarks
              </h4>
              <Badge variant="success" size="sm">Scoring Rubric</Badge>
            </div>
            <div className="grid gap-2.5 sm:grid-cols-2">
              {suggestedEvaluationCriteria.map((c, idx) => (
                <div key={idx} className="flex items-start gap-3 rounded-xl bg-emerald-500/5 p-3 border border-emerald-500/10 dark:bg-white/5">
                  <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                  <p className="text-body-sm font-medium text-secondary-800 dark:text-secondary-200">
                    {c}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export function ApplicationDetail() {
  const navigate = useNavigate();
  const { applicationId } = useParams();
  const { toast } = useToast();
  const [application, setApplication] = useState(null);
  const [screeningResult, setScreeningResult] = useState(null);
  const [interviews, setInterviews] = useState([]);
  const [hiringManagers, setHiringManagers] = useState([]);
  const [isSchedulingOpen, setIsSchedulingOpen] = useState(false);
  const [interviewForm, setInterviewForm] = useState(emptyInterviewForm);
  const [messages, setMessages] = useState([]);
  const [draftMessage, setDraftMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isStatusUpdating, setIsStatusUpdating] = useState(false);
  const [isSubmittingInterview, setIsSubmittingInterview] = useState(false);
  const [aiPanel, setAiPanel] = useState({ loading: '', error: '', title: '', disclaimer: '', result: null });

  useEffect(() => {
    let isActive = true;
    setIsLoading(true);

    Promise.all([
      recruiterApi.getApplication(applicationId),
      recruiterApi.getInterviewsByApplication(applicationId).catch(() => []),
      recruiterApi.getApplicationMessages(applicationId).catch(() => []),
      recruiterApi.getHiringManagers().catch(() => []),
    ])
      .then(([loadedApplication, loadedInterviews, loadedMessages, loadedHiringManagers]) => {
        if (!isActive) return;
        setApplication(loadedApplication);
        setScreeningResult(loadedApplication.screeningResult);
        setInterviews(loadedInterviews || []);
        setMessages(loadedMessages || []);
        setHiringManagers((loadedHiringManagers || []).map((manager) => ({
          value: manager.id,
          label: `${manager.firstName} ${manager.lastName}`,
        })));
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

  const updateApplicationStatus = async (status, notes = null) => {
    setIsStatusUpdating(true);
    try {
      await recruiterApi.updateApplicationStatus(applicationId, {
        newStatus: status,
        notes,
      });

      setApplication((currentApplication) => ({
        ...currentApplication,
        status,
      }));

      toast({
        title: `Application moved to ${status}.`,
        variant: 'success',
      });
      return true;
    } catch (error) {
      toast({
        title: error?.response?.data?.message || 'Unable to update application status.',
        variant: 'danger',
      });
      return false;
    } finally {
      setIsStatusUpdating(false);
    }
  };

  const updateLocalApplicationStatus = (status) => {
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

  const handleShortlist = async () => {
    if (!window.confirm('Confirm that you want to mark this application as shortlisted?')) return;
    const updated = await updateApplicationStatus('Shortlisted');
    if (updated) {
      setIsSchedulingOpen(true);
    }
  };

  const handleReject = async () => {
    if (!window.confirm('Confirm that you want to mark this application as rejected?')) return;
    const updated = await updateApplicationStatus('Rejected');
    if (updated) {
      setIsSchedulingOpen(false);
    }
  };

  const handleSchedule = () => {
    setIsSchedulingOpen((currentValue) => !currentValue);
  };

  const handleSubmitInterview = async (event) => {
    event.preventDefault();
    if (!window.confirm('Confirm that you want to schedule this interview?')) return;

    setIsSubmittingInterview(true);
    try {
      const createdInterview = await recruiterApi.createInterview({
        applicationId: Number(applicationId),
        interviewerId: Number(interviewForm.interviewerId),
        interviewType: interviewForm.interviewType,
        scheduledTime: new Date(interviewForm.scheduledTime).toISOString(),
        durationMinutes: Number(interviewForm.durationMinutes),
        meetingLink: interviewForm.meetingLink,
      });

      setInterviews((currentInterviews) => [createdInterview, ...currentInterviews]);
      updateLocalApplicationStatus('Interview Scheduled');
      setInterviewForm(emptyInterviewForm);
      setIsSchedulingOpen(false);
      toast({
        title: 'Interview scheduled successfully.',
        variant: 'success',
      });
    } catch (error) {
      toast({
        title: error?.response?.data?.message || 'Unable to schedule interview.',
        variant: 'danger',
      });
    } finally {
      setIsSubmittingInterview(false);
    }
  };

  const [showSendMessageModal, setShowSendMessageModal] = useState(false);
  const [isSendingMessage, setIsSendingMessage] = useState(false);

  const handleDraftMessageChange = (event) => {
    setDraftMessage(event.target.value);
  };

  const handlePromptSendMessage = (event) => {
    if (event) event.preventDefault();
    const trimmedMessage = draftMessage.trim();
    if (!trimmedMessage || isSendingMessage) return;
    setShowSendMessageModal(true);
  };

  const confirmSendMessage = async () => {
    setShowSendMessageModal(false);
    const trimmedMessage = draftMessage.trim();
    if (!trimmedMessage) return;

    setIsSendingMessage(true);
    try {
      const sentMessage = await recruiterApi.sendApplicationMessage(applicationId, { body: trimmedMessage });
      setMessages((currentMessages) => [...currentMessages, sentMessage]);
      setDraftMessage('');
    } catch (error) {
      toast({
        title: error?.response?.data?.message || 'Unable to send message.',
        variant: 'danger',
      });
    } finally {
      setIsSendingMessage(false);
    }
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

  const humanizeAiKey = (key) => key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (char) => char.toUpperCase())
    .replace(/\bAi\b/g, 'AI')
    .replace(/\bCv\b/g, 'CV');

  const isScoreKey = (key, value) =>
    typeof value === 'number' && /score|match|relevance|depth|clarity/i.test(key);

  const renderAiValue = (value, key = '') => {
    if (isScoreKey(key, value)) {
      return (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-body-sm font-semibold text-secondary-700 dark:text-secondary-200">Score</span>
            <span className="text-body-sm font-bold tabular-nums text-ai-700 dark:text-ai-300">{value}%</span>
          </div>
          <ProgressBar value={value} size="sm" />
        </div>
      );
    }

    if (Array.isArray(value)) {
      if (value.length === 0) return <p className="italic text-secondary-500">Not provided</p>;
      return (
        <ul className="list-disc space-y-1 pl-5">
          {value.map((item, index) => (
            <li key={`${String(item)}-${index}`}>
              {typeof item === 'object' && item !== null ? renderAiObjectInline(item) : String(item)}
            </li>
          ))}
        </ul>
      );
    }

    if (typeof value === 'object' && value !== null) {
      return (
        <div className="space-y-2">
          {Object.entries(value).map(([childKey, childValue]) => (
            <div key={childKey}>
              <span className="font-semibold">{humanizeAiKey(childKey)}: </span>
              {renderAiValue(childValue, childKey)}
            </div>
          ))}
        </div>
      );
    }

    const text = String(value || 'Not provided');
    if (/body|message|summary|explanation/i.test(key)) {
      return <p className="whitespace-pre-wrap leading-relaxed">{text}</p>;
    }

    return <p>{text}</p>;
  };

  const renderAiObjectInline = (value) => Object.entries(value)
    .map(([key, item]) => `${humanizeAiKey(key)}: ${Array.isArray(item) ? item.join(', ') : item}`)
    .join(' | ');

  const aiFieldClass = (key) => {
    if (/body|summary|explanation|technicalQuestions|behavioralQuestions|situationalQuestions|candidateSpecificQuestions|suggestedEvaluationCriteria/i.test(key)) {
      return 'md:col-span-2';
    }
    return '';
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
              This application is not available from the backend right now.
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
              ) : aiPanel.title === 'Interview Questions' ? (
                <AiInterviewQuestionsView
                  candidateName={application.candidateName}
                  jobTitle={application.jobTitle}
                  result={aiPanel.result}
                  onRegenerate={() => runAiAction('questions')}
                />
              ) : (
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  {Object.entries(aiPanel.result || {}).map(([key, value]) => (
                    <div key={key} className={`rounded-lg bg-secondary-50 p-3 dark:bg-white/10 ${aiFieldClass(key)}`}>
                      <p className="text-caption font-semibold uppercase tracking-wide text-secondary-500 dark:text-secondary-300">
                        {humanizeAiKey(key)}
                      </p>
                      <div className="mt-2 text-body-sm leading-relaxed text-secondary-700 dark:text-secondary-200">
                        {renderAiValue(value, key)}
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
            onReject={handleReject}
            onShortlist={handleShortlist}
            isStatusUpdating={isStatusUpdating}
          />

          <MessagingThread
            application={application}
            messages={messages}
            draftMessage={draftMessage}
            onDraftChange={handleDraftMessageChange}
            onSendMessage={handlePromptSendMessage}
          />
        </div>
      </div>

      <Modal
        isOpen={showSendMessageModal}
        onClose={() => setShowSendMessageModal(false)}
        title="Confirm Message Delivery"
        size="md"
        footer={
          <div className="flex items-center justify-end gap-3 w-full">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowSendMessageModal(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              leftIcon={<Send size={16} />}
              onClick={confirmSendMessage}
              isLoading={isSendingMessage}
            >
              Send Message
            </Button>
          </div>
        }
      >
        <div className="space-y-4 py-1">
          <div className="flex items-center gap-3.5 rounded-xl border border-primary-500/20 bg-primary-50/60 p-3.5 dark:border-primary-500/30 dark:bg-primary-500/10">
            <div>
              <h4 className="text-body-sm font-semibold text-secondary-900 dark:text-white">
                Candidate: {application.candidateName}
              </h4>
              <p className="text-caption text-secondary-500 dark:text-secondary-400">
                Application #{applicationId} — {application.jobTitle}
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-secondary-200 bg-secondary-50/70 p-4 dark:border-white/10 dark:bg-white/[0.03]">
            <p className="text-caption font-semibold uppercase tracking-wider text-secondary-500 dark:text-secondary-400 mb-1.5">
              Message Preview
            </p>
            <p className="text-body-sm text-secondary-800 dark:text-secondary-200 whitespace-pre-wrap max-h-36 overflow-y-auto">
              {draftMessage}
            </p>
          </div>

          <p className="text-body-sm text-secondary-600 dark:text-secondary-300">
            Confirm that you have reviewed this message and want to deliver it to the candidate.
          </p>
        </div>
      </Modal>
    </div>
  );
}

export default ApplicationDetail;
