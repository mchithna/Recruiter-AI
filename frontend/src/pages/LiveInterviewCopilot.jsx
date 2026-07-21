import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowLeft,
  BrainCircuit,
  CheckCircle2,
  Clock,
  FileText,
  Gauge,
  MessageSquare,
  Mic,
  Save,
  ShieldAlert,
  SkipForward,
  Sparkles,
  Video,
} from 'lucide-react';
import {
  Avatar,
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Select,
  Textarea,
} from '../components/ui';
import liveInterviewApi from '../lib/liveInterviewApi';

const MODE_OPTIONS = [
  { value: 'Balanced', label: 'Balanced' },
  { value: 'Technical', label: 'Technical' },
  { value: 'Behavioural', label: 'Behavioural' },
  { value: 'Adaptive', label: 'Adaptive' },
  { value: 'Skill-gap', label: 'Skill-gap' },
];

const DIFFICULTY_OPTIONS = [
  { value: 'Beginner', label: 'Beginner' },
  { value: 'Intermediate', label: 'Intermediate' },
  { value: 'Advanced', label: 'Advanced' },
];

const formatElapsed = (startedAt) => {
  if (!startedAt) return '00:00';
  const seconds = Math.max(0, Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000));
  const minutes = Math.floor(seconds / 60).toString().padStart(2, '0');
  const remainder = (seconds % 60).toString().padStart(2, '0');
  return `${minutes}:${remainder}`;
};

export default function LiveInterviewCopilot() {
  const { interviewId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isHiringManager = location.pathname.startsWith('/hiring-manager');
  const backPath = isHiringManager ? `/hiring-manager/interviews/${interviewId}` : '/recruiter/interviews';

  const [mode, setMode] = useState('Adaptive');
  const [difficulty, setDifficulty] = useState('Intermediate');
  const [consentRecorded, setConsentRecorded] = useState(false);
  const [session, setSession] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [answerNotes, setAnswerNotes] = useState('');
  const [currentTopic, setCurrentTopic] = useState('');
  const [latestInsight, setLatestInsight] = useState(null);
  const [summary, setSummary] = useState(null);
  const [elapsed, setElapsed] = useState('00:00');
  const [loadingAction, setLoadingAction] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!session?.startedAt || session.status === 'Ended') return undefined;
    const interval = window.setInterval(() => setElapsed(formatElapsed(session.startedAt)), 1000);
    setElapsed(formatElapsed(session.startedAt));
    return () => window.clearInterval(interval);
  }, [session?.startedAt, session?.status]);

  const questions = session?.questions || [];
  const context = session?.context;
  const askedCount = questions.filter((q) => q.status === 'Asked').length;
  const skippedCount = questions.filter((q) => q.status === 'Skipped').length;

  const latestConcern = latestInsight?.potentialConcern || 'No concern recorded yet.';
  const confidence = latestInsight?.confidence || 'Waiting for answer notes';

  const startSession = async () => {
    setLoadingAction('start');
    setError('');
    try {
      const data = await liveInterviewApi.start({
        interviewId: Number(interviewId),
        difficulty,
        questionMode: mode,
        consentRecorded,
      });
      setSession(data);
      setCurrentQuestion(data.questions?.at(-1) || null);
    } catch (err) {
      setError(err?.response?.data?.message || 'Could not start the AI interview assistant.');
    } finally {
      setLoadingAction('');
    }
  };

  const refreshSession = async (sessionId = session?.sessionId) => {
    if (!sessionId) return;
    const data = await liveInterviewApi.getSession(sessionId);
    setSession(data);
    setCurrentQuestion(data.questions?.at(-1) || null);
  };

  const generateQuestion = async (controlAction = 'Generate') => {
    if (!session) return;
    setLoadingAction(controlAction);
    setError('');
    try {
      const question = await liveInterviewApi.generateQuestion(session.sessionId, {
        mode,
        difficulty,
        controlAction,
        currentTopic,
        latestAnswerNotes: answerNotes,
      });
      setCurrentQuestion(question);
      await refreshSession(session.sessionId);
    } catch (err) {
      setError(err?.response?.data?.message || 'The AI assistant is temporarily unavailable. Continue manually and retry shortly.');
    } finally {
      setLoadingAction('');
    }
  };

  const updateQuestion = async (action) => {
    if (!session || !currentQuestion) return;
    setLoadingAction(action);
    setError('');
    try {
      const apiCall = {
        Asked: liveInterviewApi.markAsked,
        Skipped: liveInterviewApi.skip,
        Saved: liveInterviewApi.save,
        Rejected: liveInterviewApi.report,
      }[action];
      const updated = await apiCall(session.sessionId, currentQuestion.questionId);
      setCurrentQuestion(updated);
      await refreshSession(session.sessionId);
    } catch (err) {
      setError(err?.response?.data?.message || 'Could not update the question.');
    } finally {
      setLoadingAction('');
    }
  };

  const submitAnswer = async () => {
    if (!session || !currentQuestion) return;
    if (!answerNotes.trim()) {
      setError('Add short answer notes or paste a transcript first.');
      return;
    }

    setLoadingAction('answer');
    setError('');
    try {
      const insight = await liveInterviewApi.submitAnswer(session.sessionId, {
        questionId: currentQuestion.questionId,
        interviewerNotes: answerNotes,
        transcript: answerNotes,
      });
      setLatestInsight(insight);
      setCurrentTopic(currentQuestion.skill || currentQuestion.category || currentTopic);
      setAnswerNotes('');
    } catch (err) {
      setError(err?.response?.data?.message || 'Could not analyze the answer right now.');
    } finally {
      setLoadingAction('');
    }
  };

  const endSession = async () => {
    if (!session) return;
    setLoadingAction('end');
    setError('');
    try {
      const result = await liveInterviewApi.end(session.sessionId);
      setSummary(result);
      await refreshSession(session.sessionId);
    } catch (err) {
      setError(err?.response?.data?.message || 'Could not end the interview session.');
    } finally {
      setLoadingAction('');
    }
  };

  const expectedPoints = useMemo(() => currentQuestion?.expectedPoints || [], [currentQuestion]);

  return (
    <div className="relative z-10 mx-auto max-w-[1500px] space-y-5 animate-slide-up">
      <section className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" leftIcon={<ArrowLeft size={16} />} onClick={() => navigate(backPath)}>
            Back
          </Button>
          <div>
            <Badge variant="primary" size="sm" icon={<BrainCircuit size={12} />}>
              Private interviewer assistant
            </Badge>
            <h1 className="mt-2 text-h1 text-secondary-900 dark:text-white">Live Interview Copilot</h1>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Badge variant="secondary" size="sm" icon={<Clock size={12} />}>
            {elapsed}
          </Badge>
          <Button variant="danger" size="sm" disabled={!session || session.status === 'Ended'} isLoading={loadingAction === 'end'} onClick={endSession}>
            End Interview
          </Button>
        </div>
      </section>

      {error && (
        <div className="rounded-2xl border border-danger-500/30 bg-danger-950/20 px-4 py-3 text-body-sm font-semibold text-danger-200">
          {error}
        </div>
      )}

      {!session ? (
        <Card className="border-white/10 bg-secondary-950/40">
          <CardHeader>
            <CardTitle>Start AI Interview Assistant</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-4">
            <Select label="Question mode" value={mode} onChange={(event) => setMode(event.target.value)} options={MODE_OPTIONS} />
            <Select label="Difficulty" value={difficulty} onChange={(event) => setDifficulty(event.target.value)} options={DIFFICULTY_OPTIONS} />
            <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-body-sm font-semibold text-secondary-700 dark:text-secondary-200 md:mt-6">
              <input type="checkbox" checked={consentRecorded} onChange={(event) => setConsentRecorded(event.target.checked)} />
              Consent recorded
            </label>
            <Button variant="ai" className="md:mt-6" leftIcon={<Sparkles size={16} />} isLoading={loadingAction === 'start'} onClick={startSession}>
              Start Assistant
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-5 xl:grid-cols-[300px_minmax(0,1fr)_360px]">
          <Card className="border-white/10 bg-secondary-950/40">
            <CardHeader>
              <CardTitle>Candidate</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="flex items-center gap-3">
                <Avatar name={context?.candidateName || 'Candidate'} src={context?.candidatePhotoUrl} size="lg" />
                <div className="min-w-0">
                  <h2 className="truncate text-h3 text-secondary-900 dark:text-white">{context?.candidateName}</h2>
                  <p className="truncate text-body-sm text-secondary-500 dark:text-secondary-400">{context?.position}</p>
                </div>
              </div>
              <Info label="Experience" value={context?.experienceYears ? `${context.experienceYears} years` : 'Not listed'} />
              <Info label="Stage" value={context?.interviewStage || 'Interview'} />
              <Info label="Duration" value={`${context?.interviewDurationMinutes || 0} minutes`} />
              <Info label="Previous score" value={context?.previousInterviewScore ? `${context.previousInterviewScore}/100` : 'Not available'} />
              <SectionList title="Candidate skills" items={context?.candidateSkills || []} />
              <SectionList title="Required skills" items={context?.requiredJobSkills || []} />
              <div>
                <p className="text-caption font-bold uppercase text-secondary-400">CV summary</p>
                <p className="mt-2 text-body-sm leading-relaxed text-secondary-600 dark:text-secondary-300">
                  {context?.cvSummary || 'No CV summary is available yet.'}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-secondary-950/40">
            <CardHeader>
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <CardTitle>Interview Workspace</CardTitle>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" leftIcon={<Video size={14} />} disabled={!context?.meetingLink} onClick={() => context?.meetingLink && window.open(context.meetingLink, '_blank', 'noreferrer')}>
                    Join
                  </Button>
                  <Button variant="outline" size="sm" leftIcon={<Mic size={14} />} disabled title="Live audio is planned for a future enhancement.">
                    Listening OFF
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="rounded-2xl border border-primary-500/20 bg-primary-950/10 p-5">
                <p className="text-caption font-bold uppercase text-primary-300">Current question</p>
                <h2 className="mt-2 text-h3 leading-snug text-secondary-900 dark:text-white">
                  {currentQuestion?.question || 'Generate the first adaptive question when you are ready.'}
                </h2>
                {currentQuestion?.reason && (
                  <p className="mt-3 text-body-sm text-secondary-500 dark:text-secondary-300">{currentQuestion.reason}</p>
                )}
                {expectedPoints.length > 0 && (
                  <details className="mt-4 rounded-xl border border-white/10 bg-white/5 p-3 text-body-sm text-secondary-600 dark:text-secondary-300">
                    <summary className="cursor-pointer font-bold text-secondary-900 dark:text-white">Expected points</summary>
                    <ul className="mt-2 list-disc space-y-1 pl-5">
                      {expectedPoints.map((point) => <li key={point}>{point}</li>)}
                    </ul>
                  </details>
                )}
              </div>

              <Textarea
                label="Candidate answer notes or transcript"
                rows={7}
                value={answerNotes}
                onChange={(event) => setAnswerNotes(event.target.value)}
                placeholder="Type short answer notes here. Example: Candidate explained DI registration but missed scoped lifetime risks."
              />

              <div className="flex flex-wrap gap-2">
                <Button variant="primary" size="sm" leftIcon={<CheckCircle2 size={14} />} disabled={!currentQuestion} isLoading={loadingAction === 'Asked'} onClick={() => updateQuestion('Asked')}>
                  Mark as Asked
                </Button>
                <Button variant="ai" size="sm" leftIcon={<Sparkles size={14} />} disabled={!session} isLoading={loadingAction === 'answer'} onClick={submitAnswer}>
                  Analyze Answer
                </Button>
                <Button variant="outline" size="sm" leftIcon={<SkipForward size={14} />} disabled={!currentQuestion} onClick={() => updateQuestion('Skipped')}>
                  Skip
                </Button>
                <Button variant="outline" size="sm" leftIcon={<Save size={14} />} disabled={!currentQuestion} onClick={() => updateQuestion('Saved')}>
                  Save
                </Button>
                <Button variant="outline" size="sm" leftIcon={<ShieldAlert size={14} />} disabled={!currentQuestion} onClick={() => updateQuestion('Rejected')}>
                  Report
                </Button>
              </div>

              <div>
                <h3 className="text-h4 text-secondary-900 dark:text-white">Question history</h3>
                <div className="mt-3 max-h-72 space-y-3 overflow-y-auto pr-2">
                  {questions.length === 0 ? (
                    <p className="rounded-2xl border border-dashed border-white/10 p-5 text-center text-body-sm text-secondary-500">No questions generated yet.</p>
                  ) : questions.map((question) => (
                    <button
                      key={question.questionId}
                      type="button"
                      className="w-full rounded-2xl border border-white/10 bg-white/5 p-4 text-left transition hover:border-primary-400/50"
                      onClick={() => setCurrentQuestion(question)}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="line-clamp-2 text-body-sm font-semibold text-secondary-900 dark:text-white">{question.question}</p>
                        <Badge variant="secondary" size="sm">{question.status}</Badge>
                      </div>
                      <p className="mt-1 text-caption text-secondary-400">{question.skill || question.category || 'General'}</p>
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-primary-500/20 bg-primary-950/20">
            <CardHeader>
              <CardTitle>AI Copilot Panel</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid grid-cols-2 gap-3">
                <Info label="Listening" value="OFF" />
                <Info label="Confidence" value={confidence} />
                <Info label="Asked" value={askedCount} />
                <Info label="Skipped" value={skippedCount} />
              </div>
              <Textarea
                label="Current topic detected"
                rows={2}
                value={currentTopic}
                onChange={(event) => setCurrentTopic(event.target.value)}
                placeholder="ASP.NET dependency injection"
              />
              <div className="rounded-2xl border border-danger-500/20 bg-danger-950/10 p-4">
                <p className="flex items-center gap-2 text-caption font-bold uppercase text-danger-300">
                  <AlertTriangle size={14} /> Possible concern
                </p>
                <p className="mt-2 text-body-sm text-secondary-700 dark:text-secondary-200">{latestConcern}</p>
              </div>
              {latestInsight?.suggestedFollowUpQuestion && (
                <div className="rounded-2xl border border-ai-500/20 bg-ai-950/10 p-4">
                  <p className="text-caption font-bold uppercase text-ai-300">Suggested follow-up</p>
                  <p className="mt-2 text-body-sm font-semibold text-secondary-900 dark:text-white">{latestInsight.suggestedFollowUpQuestion}</p>
                </div>
              )}

              <div className="grid grid-cols-1 gap-2">
                <Button variant="ai" leftIcon={<Sparkles size={16} />} isLoading={loadingAction === 'Generate'} onClick={() => generateQuestion('Generate')}>
                  Generate Another
                </Button>
                <Button variant="outline" leftIcon={<Gauge size={16} />} onClick={() => generateQuestion('Make Easier')}>
                  Make Easier
                </Button>
                <Button variant="outline" leftIcon={<Gauge size={16} />} onClick={() => generateQuestion('Make Harder')}>
                  Make Harder
                </Button>
                <Button variant="outline" leftIcon={<MessageSquare size={16} />} onClick={() => generateQuestion('Ask Follow-up')}>
                  Ask Follow-up
                </Button>
                <Button variant="outline" leftIcon={<FileText size={16} />} onClick={() => generateQuestion('Change Topic')}>
                  Change Topic
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {summary && (
        <Card className="border-success-500/20 bg-success-950/10">
          <CardHeader>
            <CardTitle>Interview Summary</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-5 md:grid-cols-3">
            <SectionList title="Strong areas" items={summary.strongAreas || []} />
            <SectionList title="Areas requiring validation" items={summary.areasRequiringValidation || []} />
            <div>
              <p className="text-caption font-bold uppercase text-secondary-400">AI recommendation</p>
              <p className="mt-2 text-body-sm font-semibold text-secondary-900 dark:text-white">{summary.aiRecommendation}</p>
              <p className="mt-3 text-caption text-secondary-500">{summary.disclaimer}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
      <p className="text-caption font-bold uppercase text-secondary-400">{label}</p>
      <p className="mt-1 text-body-sm font-semibold text-secondary-900 dark:text-white">{value}</p>
    </div>
  );
}

function SectionList({ title, items }) {
  return (
    <div>
      <p className="text-caption font-bold uppercase text-secondary-400">{title}</p>
      {items.length > 0 ? (
        <div className="mt-2 flex flex-wrap gap-2">
          {items.map((item) => (
            <Badge key={item} variant="secondary" size="sm">{item}</Badge>
          ))}
        </div>
      ) : (
        <p className="mt-2 text-body-sm text-secondary-500">Not available</p>
      )}
    </div>
  );
}
