import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowLeft,
  BrainCircuit,
  Camera,
  CheckCircle2,
  ChevronRight,
  Clock,
  Captions,
  FileText,
  Gauge,
  MessageSquare,
  Mic,
  MicOff,
  MonitorUp,
  PhoneOff,
  Radio,
  Save,
  ShieldAlert,
  SkipForward,
  Sparkles,
  Target,
  TrendingUp,
  Video,
  Zap,
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
  { value: 'Behavioral', label: 'Behavioral' },
  { value: 'Adaptive', label: 'Adaptive' },
  { value: 'Skill-gap', label: 'Skill gap' },
];

const DIFFICULTY_OPTIONS = [
  { value: 'Beginner', label: 'Beginner' },
  { value: 'Intermediate', label: 'Intermediate' },
  { value: 'Advanced', label: 'Advanced' },
];

const getSpeechRecognition = () => {
  if (typeof window === 'undefined') return null;
  return window.SpeechRecognition || window.webkitSpeechRecognition || null;
};

const formatElapsed = (startedAt) => {
  if (!startedAt) return '00:00';
  const seconds = Math.max(0, Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000));
  const minutes = Math.floor(seconds / 60).toString().padStart(2, '0');
  const remainder = (seconds % 60).toString().padStart(2, '0');
  return `${minutes}:${remainder}`;
};

const appendText = (current, next) => {
  const clean = next.trim();
  if (!clean) return current;
  return `${current}${current.trim() ? '\n' : ''}${clean}`;
};

const detectTopic = (text) => {
  const matches = text
    .toLowerCase()
    .replace(/[^a-z0-9+#.\s-]/g, ' ')
    .split(/\s+/)
    .filter((word) => word.length > 4 && !['about', 'because', 'there', 'their', 'would', 'could', 'should', 'candidate'].includes(word));
  return matches.slice(-4).join(' ');
};

const scoreColor = (val) => {
  if (val == null) return 'text-secondary-400';
  if (val >= 75) return 'text-emerald-400';
  if (val >= 50) return 'text-amber-400';
  return 'text-danger-400';
};

const scoreRing = (val) => {
  if (val == null) return 'border-secondary-600';
  if (val >= 75) return 'border-emerald-500';
  if (val >= 50) return 'border-amber-500';
  return 'border-danger-500';
};

export default function LiveInterviewCopilot() {
  const { interviewId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isHiringManager = location.pathname.startsWith('/hiring-manager');
  const backPath = isHiringManager ? `/hiring-manager/interviews/${interviewId}` : '/recruiter/interviews';

  const videoRef = useRef(null);
  const recognitionRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const meetingWindowRef = useRef(null);
  const shouldListenRef = useRef(false);

  const [mode, setMode] = useState('Adaptive');
  const [difficulty, setDifficulty] = useState('Intermediate');
  const [consentRecorded, setConsentRecorded] = useState(false);
  const [session, setSession] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [answerNotes, setAnswerNotes] = useState('');
  const [liveInterim, setLiveInterim] = useState('');
  const [currentTopic, setCurrentTopic] = useState('');
  const [latestInsight, setLatestInsight] = useState(null);
  const [summary, setSummary] = useState(null);
  const [elapsed, setElapsed] = useState('00:00');
  const [loadingAction, setLoadingAction] = useState('');
  const [error, setError] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [cameraOn, setCameraOn] = useState(false);
  const [captureMode, setCaptureMode] = useState('manual');
  const [speechSupported, setSpeechSupported] = useState(Boolean(getSpeechRecognition()));
  const [captureStatus, setCaptureStatus] = useState('Camera and speech capture are off.');

  const questions = session?.questions || [];
  const context = session?.context;
  const askedCount = questions.filter((q) => q.status === 'Asked').length;
  const skippedCount = questions.filter((q) => q.status === 'Skipped').length;
  const expectedPoints = useMemo(() => currentQuestion?.expectedPoints || [], [currentQuestion]);
  const transcriptText = [answerNotes, liveInterim].filter(Boolean).join('\n');
  const latestConcern = latestInsight?.potentialConcern || null;
  const confidence = latestInsight?.confidence || (isListening ? 'Listening live…' : 'Waiting for answer');

  const stopCapture = useCallback(() => {
    shouldListenRef.current = false;
    recognitionRef.current?.stop?.();
    recognitionRef.current = null;
    mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
    mediaStreamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setIsListening(false);
    setCameraOn(false);
    setCaptureMode('manual');
    setLiveInterim('');
    setCaptureStatus('Camera and speech capture are off.');
  }, []);

  useEffect(() => () => stopCapture(), [stopCapture]);

  useEffect(() => {
    if (!session?.startedAt || session.status === 'Ended') return undefined;
    const interval = window.setInterval(() => setElapsed(formatElapsed(session.startedAt)), 1000);
    setElapsed(formatElapsed(session.startedAt));
    return () => window.clearInterval(interval);
  }, [session?.startedAt, session?.status]);

  const startSpeechRecognition = useCallback(() => {
    const Recognition = getSpeechRecognition();
    if (!Recognition) {
      setSpeechSupported(false);
      setCaptureStatus('Camera is on. Speech detection is not supported in this browser.');
      return;
    }

    const recognition = new Recognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      let finalText = '';
      let interimText = '';
      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        const text = event.results[index][0]?.transcript || '';
        if (event.results[index].isFinal) finalText += `${text} `;
        else interimText += `${text} `;
      }

      if (finalText.trim()) {
        setAnswerNotes((current) => appendText(current, finalText));
        const topic = detectTopic(finalText);
        if (topic) setCurrentTopic(topic);
      }
      setLiveInterim(interimText.trim());
    };

    recognition.onerror = () => {
      setCaptureStatus('Speech detection paused. You can keep typing notes or restart listening.');
    };

    recognition.onend = () => {
      if (!shouldListenRef.current) return;
      try {
        recognition.start();
      } catch {
        setCaptureStatus('Speech detection paused. Click Start capture again.');
      }
    };

    recognitionRef.current = recognition;
    try {
      recognition.start();
      setSpeechSupported(true);
      setIsListening(true);
      setCaptureStatus('Listening live. Candidate speech is being transcribed in real time.');
    } catch {
      setCaptureStatus('Speech detection could not start. Camera is still available.');
    }
  }, []);

  const startCapture = async () => {
    setError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      mediaStreamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      shouldListenRef.current = true;
      setCameraOn(true);
      setCaptureMode('camera');
      startSpeechRecognition();
    } catch (err) {
      setError('Camera or microphone permission was blocked. Allow access and try again.');
      setCaptureStatus(err?.message || 'Camera and microphone could not start.');
    }
  };

  const startMeetingCapture = async () => {
    setError('');
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
      mediaStreamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      stream.getTracks().forEach((track) => { track.onended = stopCapture; });
      shouldListenRef.current = true;
      setCameraOn(true);
      setCaptureMode('meeting');
      setCaptureStatus('Meeting tab captured. Ensure candidate audio is audible, or paste the transcript below.');
      startSpeechRecognition();
    } catch (err) {
      setError('Meeting tab capture was cancelled or blocked. Share the meeting tab/window with audio enabled.');
      setCaptureStatus(err?.message || 'Meeting capture could not start.');
    }
  };

  const joinMeeting = () => {
    if (!context?.meetingLink) return;
    meetingWindowRef.current = window.open(context.meetingLink, '_blank', 'noreferrer');
  };

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
        latestAnswerNotes: transcriptText,
      });
      setCurrentQuestion(question);
      await refreshSession(session.sessionId);
    } catch (err) {
      setError(err?.response?.data?.message || 'AI could not generate a question. Local fallback should still be available.');
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
    if (!transcriptText.trim()) {
      setError('Start live capture or add answer notes before running AI analysis.');
      return;
    }
    setLoadingAction('answer');
    setError('');
    try {
      const insight = await liveInterviewApi.submitAnswer(session.sessionId, {
        questionId: currentQuestion.questionId,
        interviewerNotes: answerNotes,
        transcript: transcriptText,
      });
      setLatestInsight(insight);
      setCurrentTopic(currentQuestion.skill || currentQuestion.category || currentTopic || detectTopic(transcriptText));
      setAnswerNotes('');
      setLiveInterim('');
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
    stopCapture();
    meetingWindowRef.current?.close?.();
    try {
      const result = await liveInterviewApi.end(session.sessionId);
      setSummary(result);
      await refreshSession(session.sessionId);
      setCaptureStatus('Meeting ended. Camera, microphone, and live capture are off.');
    } catch (err) {
      setError(err?.response?.data?.message || 'Could not end the interview session.');
    } finally {
      setLoadingAction('');
    }
  };

  return (
    <div className="relative z-10 mx-auto max-w-[1600px] space-y-5 animate-slide-up">

      {/* ─── TOP HEADER BAR ─── */}
      <header className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-r from-slate-950 via-secondary-950 to-primary-950/70 shadow-[0_8px_60px_rgba(99,102,241,0.18)]">
        {/* Animated gradient top stripe */}
        <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-primary-500 via-ai-500 to-emerald-400 animate-pulse" />
        {/* Subtle background glow */}
        <div className="pointer-events-none absolute -right-32 -top-32 h-64 w-64 rounded-full bg-primary-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -left-32 -bottom-32 h-64 w-64 rounded-full bg-ai-500/10 blur-3xl" />

        <div className="relative flex flex-col gap-4 px-6 py-5 md:flex-row md:items-center md:justify-between">
          {/* Left: Back + Title */}
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<ArrowLeft size={15} />}
              onClick={() => navigate(backPath)}
              className="shrink-0 border-white/15 bg-white/5 text-white/80 hover:bg-white/10 hover:text-white"
            >
              Back
            </Button>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-primary-500/30 bg-primary-500/10 px-3 py-0.5 text-[11px] font-bold uppercase tracking-wider text-primary-300">
                  <BrainCircuit size={11} className="animate-pulse" />
                  AI Copilot Active
                </span>
                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-bold text-emerald-400">
                  <Zap size={10} />
                  Vertex AI
                </span>
              </div>
              <h1 className="mt-1.5 text-2xl font-bold tracking-tight text-white">
                Live Interview Copilot
              </h1>
              <p className="text-[13px] text-secondary-400">
                Real-time AI assistance · question generation · live answer analysis
              </p>
            </div>
          </div>

          {/* Right: Timer + End */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Live timer pill */}
            <div className={`inline-flex items-center gap-2 rounded-2xl border px-4 py-2 font-mono text-base font-bold tabular-nums transition-colors ${session && session.status !== 'Ended' ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300' : 'border-white/10 bg-white/5 text-secondary-400'}`}>
              <Radio size={13} className={session && session.status !== 'Ended' ? 'animate-pulse text-emerald-400' : 'text-secondary-500'} />
              {elapsed}
            </div>

            {session && (
              <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-[13px] font-semibold text-secondary-300">
                <span className="text-primary-400">{askedCount}</span> asked
                <span className="text-secondary-600">·</span>
                <span className="text-amber-400">{skippedCount}</span> skipped
              </div>
            )}

            <Button
              variant="danger"
              size="sm"
              leftIcon={<PhoneOff size={14} />}
              disabled={!session || session.status === 'Ended'}
              isLoading={loadingAction === 'end'}
              onClick={endSession}
              className="shadow-[0_0_20px_rgba(239,68,68,0.3)]"
            >
              End Session
            </Button>
          </div>
        </div>
      </header>

      {/* ─── ERROR BANNER ─── */}
      {error && (
        <div className="flex items-start gap-3 rounded-2xl border border-danger-500/30 bg-danger-950/20 px-5 py-4 text-sm font-medium text-danger-200 shadow-sm">
          <AlertTriangle size={16} className="mt-0.5 shrink-0 text-danger-400" />
          <span>{error}</span>
          <button type="button" onClick={() => setError('')} className="ml-auto text-danger-400 hover:text-danger-200">✕</button>
        </div>
      )}

      {/* ─── PRE-SESSION SETUP ─── */}
      {!session ? (
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-secondary-950/80 via-slate-900/60 to-primary-950/30 p-8 shadow-glass backdrop-blur-xl">
          <div className="pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full bg-primary-500/8 blur-3xl" />
          <div className="pointer-events-none absolute -left-20 -bottom-20 h-80 w-80 rounded-full bg-ai-500/8 blur-3xl" />

          <div className="relative mb-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 via-ai-500 to-primary-600 shadow-[0_0_30px_rgba(99,102,241,0.4)]">
              <Sparkles size={28} className="text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white">Configure AI Interview Assistant</h2>
            <p className="mt-1 text-[14px] text-secondary-400">
              Set up the question mode, difficulty, and consent before starting the live session.
            </p>
          </div>

          <div className="relative grid gap-5 md:grid-cols-4">
            <div className="space-y-1.5">
              <Select
                label="Question mode"
                value={mode}
                onChange={(e) => setMode(e.target.value)}
                options={MODE_OPTIONS}
              />
              <p className="text-[11px] text-secondary-500">How AI selects next questions</p>
            </div>

            <div className="space-y-1.5">
              <Select
                label="Difficulty"
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                options={DIFFICULTY_OPTIONS}
              />
              <p className="text-[11px] text-secondary-500">Adjust question complexity</p>
            </div>

            <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 transition-colors hover:bg-white/8 md:mt-0 md:self-end">
              <div className="relative mt-0.5">
                <input
                  type="checkbox"
                  className="peer sr-only"
                  checked={consentRecorded}
                  onChange={(e) => setConsentRecorded(e.target.checked)}
                />
                <div className={`h-5 w-5 rounded-md border-2 transition-colors ${consentRecorded ? 'border-primary-500 bg-primary-500' : 'border-secondary-600 bg-transparent'}`} />
                {consentRecorded && (
                  <CheckCircle2 size={14} className="absolute inset-0 m-auto text-white" />
                )}
              </div>
              <div>
                <p className="text-[13px] font-semibold text-white">Consent recorded</p>
                <p className="text-[11px] text-secondary-500">Candidate agreed to be recorded</p>
              </div>
            </label>

            <Button
              variant="ai"
              className="md:self-end shadow-[0_0_25px_rgba(99,102,241,0.35)]"
              leftIcon={<Sparkles size={16} />}
              isLoading={loadingAction === 'start'}
              onClick={startSession}
            >
              Start AI Assistant
            </Button>
          </div>
        </div>
      ) : (
        /* ─── ACTIVE SESSION ─── */
        <div className="grid gap-5 xl:grid-cols-[280px_minmax(0,1fr)_340px]">

          {/* ──── LEFT: CANDIDATE CARD ──── */}
          <aside className="space-y-4">
            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-secondary-900/60 to-secondary-950/80 p-5 shadow-glass backdrop-blur-xl">
              {/* Glow */}
              <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-primary-500/8 blur-2xl" />

              {/* Avatar + name */}
              <div className="relative flex flex-col items-center gap-3 text-center">
                <div className="relative">
                  <div className="h-20 w-20 rounded-2xl overflow-hidden ring-2 ring-primary-500/30">
                    <Avatar name={context?.candidateName || 'Candidate'} src={context?.candidatePhotoUrl} size="lg" className="h-full w-full" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border border-white/20 bg-emerald-500 shadow">
                    <Radio size={10} className="animate-pulse text-white" />
                  </div>
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">{context?.candidateName || 'Candidate'}</h2>
                  <p className="text-[12px] text-secondary-400">{context?.position || 'Position not specified'}</p>
                </div>
              </div>

              {/* Stats row */}
              <div className="mt-5 grid grid-cols-2 gap-2">
                <CandidateStat label="Experience" value={context?.experienceYears ? `${context.experienceYears} yrs` : '—'} />
                <CandidateStat label="Stage" value={context?.interviewStage || 'Interview'} />
                <CandidateStat label="Duration" value={`${context?.interviewDurationMinutes || 0} min`} />
                <CandidateStat label="Prior Score" value={context?.previousInterviewScore ? `${context.previousInterviewScore}/100` : '—'} />
              </div>

              {/* Skills */}
              {(context?.candidateSkills?.length > 0 || context?.requiredJobSkills?.length > 0) && (
                <div className="mt-4 space-y-3 border-t border-white/5 pt-4">
                  <SkillChips label="Candidate skills" items={context?.candidateSkills || []} color="primary" />
                  <SkillChips label="Required skills" items={context?.requiredJobSkills || []} color="ai" />
                </div>
              )}

              {/* CV Summary */}
              {context?.cvSummary && (
                <div className="mt-4 rounded-xl border border-white/5 bg-white/3 p-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-secondary-500">CV Summary</p>
                  <p className="mt-1.5 text-[12px] leading-relaxed text-secondary-300">
                    {context.cvSummary}
                  </p>
                </div>
              )}
            </div>

            {/* Meeting join card */}
            {context?.meetingLink && (
              <button
                type="button"
                onClick={joinMeeting}
                className="group w-full rounded-2xl border border-primary-500/20 bg-gradient-to-br from-primary-950/40 to-ai-950/20 p-4 text-left transition-all hover:border-primary-400/40 hover:shadow-[0_0_20px_rgba(99,102,241,0.2)]"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary-500/20">
                      <Video size={15} className="text-primary-400" />
                    </div>
                    <div>
                      <p className="text-[12px] font-bold text-primary-300">Meeting Link</p>
                      <p className="text-[11px] text-secondary-500">Click to open in new tab</p>
                    </div>
                  </div>
                  <ChevronRight size={14} className="text-primary-400 transition-transform group-hover:translate-x-1" />
                </div>
              </button>
            )}
          </aside>

          {/* ──── CENTER: INTERVIEW WORKSPACE ──── */}
          <div className="space-y-4">
            {/* Capture toolbar */}
            <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-white/10 bg-secondary-950/60 px-4 py-3 backdrop-blur-md">
              <div className="flex items-center gap-1.5 text-[12px] font-semibold text-secondary-400 mr-2">
                <Camera size={13} />
                Capture
              </div>
              <Button
                variant="outline"
                size="sm"
                leftIcon={<MonitorUp size={13} />}
                onClick={startMeetingCapture}
                className="border-white/15 bg-white/5 text-white/80"
              >
                Capture Meeting Tab
              </Button>
              <Button
                variant={isListening ? 'danger' : 'ai'}
                size="sm"
                leftIcon={isListening ? <MicOff size={13} /> : <Mic size={13} />}
                onClick={isListening ? stopCapture : startCapture}
              >
                {isListening ? 'Stop Capture' : 'My Camera + Mic'}
              </Button>
              <div className="ml-auto flex items-center gap-2 text-[11px]">
                <span className={`inline-flex items-center gap-1 ${isListening ? 'text-emerald-400' : 'text-secondary-500'}`}>
                  <Radio size={10} className={isListening ? 'animate-pulse' : ''} />
                  {captureMode === 'meeting' ? 'Meeting tab' : isListening ? 'Mic active' : 'Manual'}
                </span>
                <span className={speechSupported ? 'text-secondary-500' : 'text-amber-500'}>
                  {speechSupported ? '· Speech ready' : '· Speech unsupported'}
                </span>
              </div>
            </div>

            {/* Video + current question */}
            <div className="grid gap-4 lg:grid-cols-[260px_minmax(0,1fr)]">
              {/* Camera preview */}
              <div className="overflow-hidden rounded-2xl border border-white/10 bg-black shadow-[0_8px_40px_rgba(0,0,0,0.5)]">
                <div className="aspect-video w-full relative">
                  <video ref={videoRef} autoPlay muted playsInline className="h-full w-full object-cover" />
                  {!cameraOn && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-secondary-950/80 text-center">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
                        <Camera size={22} className="text-secondary-500" />
                      </div>
                      <p className="text-[11px] text-secondary-500">Preview off</p>
                    </div>
                  )}
                  {isListening && (
                    <div className="absolute bottom-2 left-2 flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-950/80 px-2.5 py-1 text-[10px] font-bold text-emerald-400">
                      <Radio size={9} className="animate-pulse" /> LIVE
                    </div>
                  )}
                </div>
                <div className="border-t border-white/5 px-3 py-2 text-[11px] text-secondary-500">
                  {captureStatus}
                </div>
              </div>

              {/* Current question panel */}
              <div className="relative overflow-hidden rounded-2xl border border-primary-500/25 bg-gradient-to-br from-primary-950/50 via-slate-950/60 to-ai-950/20 p-5 shadow-inner">
                <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-primary-500/8 blur-2xl" />
                <div className="relative">
                  <div className="mb-3 flex items-center gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-primary-500/20">
                      <Target size={13} className="text-primary-400" />
                    </div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-primary-400">Current Question</p>
                    {currentQuestion?.skill && (
                      <span className="ml-auto rounded-full bg-white/5 px-2.5 py-0.5 text-[10px] font-semibold text-secondary-400 border border-white/10">
                        {currentQuestion.skill}
                      </span>
                    )}
                  </div>

                  <h2 className="text-[17px] font-semibold leading-snug text-white">
                    {currentQuestion?.question || 'Generate the first AI question when you are ready.'}
                  </h2>

                  {currentQuestion?.reason && (
                    <p className="mt-3 rounded-xl border border-white/5 bg-white/3 px-3 py-2 text-[12px] text-secondary-400">
                      💡 {currentQuestion.reason}
                    </p>
                  )}

                  {expectedPoints.length > 0 && (
                    <details className="mt-4 rounded-xl border border-white/10 bg-white/5 p-3">
                      <summary className="cursor-pointer text-[12px] font-bold text-secondary-300 hover:text-white transition-colors">
                        Expected Answer Points ({expectedPoints.length})
                      </summary>
                      <ul className="mt-3 space-y-1.5">
                        {expectedPoints.map((point, i) => (
                          <li key={point} className="flex items-start gap-2 text-[12px] text-secondary-400">
                            <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary-500/20 text-[9px] font-bold text-primary-400">{i + 1}</span>
                            {point}
                          </li>
                        ))}
                      </ul>
                    </details>
                  )}
                </div>
              </div>
            </div>

            {/* Transcript panel */}
            <div className="rounded-2xl border border-white/10 bg-secondary-950/50 p-4 backdrop-blur-md">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-white/5 border border-white/10">
                    <Captions size={13} className="text-secondary-400" />
                  </div>
                  <div>
                    <p className="text-[12px] font-bold text-white">Candidate Answer Transcript</p>
                    {liveInterim && (
                      <p className="text-[11px] italic text-secondary-500 animate-pulse">
                        {liveInterim}
                      </p>
                    )}
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => { setAnswerNotes(''); setLiveInterim(''); }}
                  className="border-white/10 bg-white/5 text-secondary-400 hover:text-white"
                >
                  Clear
                </Button>
              </div>
              <Textarea
                label=""
                rows={6}
                value={transcriptText}
                onChange={(e) => { setAnswerNotes(e.target.value); setLiveInterim(''); }}
                placeholder="For a remote interview, capture the meeting tab with audio enabled, paste the transcript, or type the candidate's answer before AI analysis."
                className="resize-none font-mono text-[13px]"
              />
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap gap-2">
              <Button
                variant="primary"
                size="sm"
                leftIcon={<CheckCircle2 size={14} />}
                disabled={!currentQuestion}
                isLoading={loadingAction === 'Asked'}
                onClick={() => updateQuestion('Asked')}
              >
                Mark Asked
              </Button>
              <Button
                variant="ai"
                size="sm"
                leftIcon={<Sparkles size={14} />}
                disabled={!session || !currentQuestion}
                isLoading={loadingAction === 'answer'}
                onClick={submitAnswer}
                className="shadow-[0_0_16px_rgba(99,102,241,0.25)]"
              >
                Analyze Live Answer
              </Button>
              <Button variant="outline" size="sm" leftIcon={<SkipForward size={14} />} disabled={!currentQuestion} onClick={() => updateQuestion('Skipped')} className="border-white/10 bg-white/5 text-secondary-300">
                Skip
              </Button>
              <Button variant="outline" size="sm" leftIcon={<Save size={14} />} disabled={!currentQuestion} onClick={() => updateQuestion('Saved')} className="border-white/10 bg-white/5 text-secondary-300">
                Save
              </Button>
              <Button variant="outline" size="sm" leftIcon={<ShieldAlert size={14} />} disabled={!currentQuestion} onClick={() => updateQuestion('Rejected')} className="border-white/10 bg-white/5 text-secondary-300">
                Report
              </Button>
            </div>

            {/* Question history */}
            <div className="rounded-2xl border border-white/10 bg-secondary-950/40 p-4">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-[13px] font-bold text-white">Question History</p>
                <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-[11px] text-secondary-400">
                  {questions.length} generated
                </span>
              </div>
              <div className="max-h-60 space-y-2 overflow-y-auto pr-1">
                {questions.length === 0 ? (
                  <p className="rounded-2xl border border-dashed border-white/10 py-6 text-center text-[13px] text-secondary-500">
                    No questions generated yet.
                  </p>
                ) : (
                  questions.map((question) => {
                    const isActive = question.questionId === currentQuestion?.questionId;
                    return (
                      <button
                        key={question.questionId}
                        type="button"
                        className={`w-full rounded-xl border p-3 text-left transition-all ${isActive ? 'border-primary-500/40 bg-primary-950/30' : 'border-white/5 bg-white/3 hover:border-white/15 hover:bg-white/5'}`}
                        onClick={() => setCurrentQuestion(question)}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <p className="line-clamp-2 text-[12px] font-medium text-secondary-100">{question.question}</p>
                          <StatusPill status={question.status} />
                        </div>
                        <p className="mt-1 text-[11px] text-secondary-500">{question.skill || question.category || 'General'}</p>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* ──── RIGHT: AI COMMAND CENTER ──── */}
          <aside className="space-y-4">
            {/* Header */}
            <div className="relative overflow-hidden rounded-3xl border border-ai-500/25 bg-gradient-to-b from-ai-950/40 via-primary-950/30 to-secondary-950/50 p-5 shadow-[0_4px_30px_rgba(99,102,241,0.12)] backdrop-blur-xl">
              <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-ai-500/8 blur-2xl" />
              <div className="relative mb-4 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-ai-500 to-primary-600 shadow-[0_0_16px_rgba(99,102,241,0.4)]">
                  <BrainCircuit size={18} className="text-white" />
                </div>
                <div>
                  <p className="text-[13px] font-bold text-white">AI Command Center</p>
                  <p className="text-[11px] text-ai-400">Real-time intelligence</p>
                </div>
              </div>

              {/* Status metrics */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                <AiMetric label="Mic" value={isListening ? 'Live' : 'Off'} active={isListening} color={isListening ? 'emerald' : 'secondary'} />
                <AiMetric label="Confidence" value={confidence} color="ai" />
                <AiMetric label="Asked" value={askedCount} color="primary" />
                <AiMetric label="Skipped" value={skippedCount} color="amber" />
              </div>

              {/* Answer scores */}
              {latestInsight && (
                <div className="mb-4 grid grid-cols-3 gap-2">
                  <ScoreRing label="Relevant" value={latestInsight.relevanceScore} />
                  <ScoreRing label="Depth" value={latestInsight.depthScore} />
                  <ScoreRing label="Clarity" value={latestInsight.clarityScore} />
                </div>
              )}

              {/* Concern */}
              {latestConcern && (
                <div className="mb-4 rounded-xl border border-danger-500/20 bg-danger-950/20 p-3">
                  <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-danger-400">
                    <AlertTriangle size={11} />
                    Potential Concern
                  </p>
                  <p className="mt-2 text-[12px] text-secondary-200">{latestConcern}</p>
                </div>
              )}

              {/* Follow-up suggestion */}
              {latestInsight?.suggestedFollowUpQuestion && (
                <button
                  type="button"
                  className="mb-4 w-full rounded-xl border border-ai-500/20 bg-ai-950/20 p-3 text-left transition-all hover:border-ai-400/40 hover:bg-ai-950/30"
                  onClick={() => generateQuestion('Ask Follow-up')}
                >
                  <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-ai-400">
                    <TrendingUp size={11} />
                    Suggested Follow-up
                  </p>
                  <p className="mt-2 text-[12px] font-semibold text-white leading-snug">
                    {latestInsight.suggestedFollowUpQuestion}
                  </p>
                  <p className="mt-1.5 text-[10px] text-ai-500">Click to use this question →</p>
                </button>
              )}

              {/* Topic input */}
              <Textarea
                label="Detected topic / hint"
                rows={2}
                value={currentTopic}
                onChange={(e) => setCurrentTopic(e.target.value)}
                placeholder="Auto-detected from speech, or type a topic…"
                className="text-[12px]"
              />
            </div>

            {/* Generate controls */}
            <div className="rounded-3xl border border-white/10 bg-secondary-950/50 p-4 backdrop-blur-md">
              <p className="mb-3 text-[11px] font-bold uppercase tracking-wider text-secondary-500">Question Controls</p>
              <div className="space-y-2">
                <Button
                  variant="ai"
                  className="w-full shadow-[0_0_20px_rgba(99,102,241,0.25)] justify-center"
                  leftIcon={<Sparkles size={15} />}
                  isLoading={loadingAction === 'Generate'}
                  onClick={() => generateQuestion('Generate')}
                >
                  Generate Next Question
                </Button>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={<Gauge size={13} />}
                    onClick={() => generateQuestion('Make Easier')}
                    className="border-white/10 bg-white/5 text-secondary-300 justify-center"
                  >
                    Easier
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={<Gauge size={13} />}
                    onClick={() => generateQuestion('Make Harder')}
                    className="border-white/10 bg-white/5 text-secondary-300 justify-center"
                  >
                    Harder
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={<MessageSquare size={13} />}
                    onClick={() => generateQuestion('Ask Follow-up')}
                    className="border-white/10 bg-white/5 text-secondary-300 justify-center"
                  >
                    Follow-up
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={<FileText size={13} />}
                    onClick={() => generateQuestion('Change Topic')}
                    className="border-white/10 bg-white/5 text-secondary-300 justify-center"
                  >
                    New Topic
                  </Button>
                </div>
              </div>
            </div>
          </aside>
        </div>
      )}

      {/* ─── POST-SESSION SUMMARY ─── */}
      {summary && (
        <div className="relative overflow-hidden rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-emerald-950/30 via-secondary-950/60 to-slate-950 p-6 shadow-[0_8px_40px_rgba(16,185,129,0.1)]">
          <div className="pointer-events-none absolute -right-20 -top-20 h-60 w-60 rounded-full bg-emerald-500/8 blur-3xl" />
          <div className="relative">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/20">
                <CheckCircle2 size={22} className="text-emerald-400" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Interview Summary</h2>
                <p className="text-[12px] text-secondary-400">AI-generated post-session analysis</p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <SummaryList title="Strong Areas" items={summary.strongAreas || []} color="emerald" />
              <SummaryList title="Areas for Validation" items={summary.areasRequiringValidation || []} color="amber" />
              <div className="rounded-2xl border border-white/5 bg-white/3 p-4">
                <p className="text-[11px] font-bold uppercase tracking-wider text-secondary-500">AI Recommendation</p>
                <p className="mt-2 text-[14px] font-semibold leading-relaxed text-white">{summary.aiRecommendation}</p>
                {summary.disclaimer && (
                  <p className="mt-3 text-[11px] text-secondary-500">{summary.disclaimer}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Helper Sub-components ─── */

function CandidateStat({ label, value }) {
  return (
    <div className="rounded-xl border border-white/5 bg-white/3 p-2.5 text-center">
      <p className="text-[10px] font-bold uppercase tracking-wider text-secondary-500">{label}</p>
      <p className="mt-0.5 text-[13px] font-semibold text-white">{value}</p>
    </div>
  );
}

function SkillChips({ label, items, color }) {
  if (!items.length) return null;
  const colorMap = {
    primary: 'border-primary-500/20 bg-primary-500/10 text-primary-300',
    ai: 'border-ai-500/20 bg-ai-500/10 text-ai-300',
  };
  return (
    <div>
      <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-secondary-500">{label}</p>
      <div className="flex flex-wrap gap-1.5">
        {items.map((item) => (
          <span key={item} className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${colorMap[color] || colorMap.primary}`}>
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

function AiMetric({ label, value, active, color }) {
  const colorMap = {
    emerald: 'text-emerald-400',
    ai: 'text-ai-400',
    primary: 'text-primary-400',
    amber: 'text-amber-400',
    secondary: 'text-secondary-400',
  };
  return (
    <div className={`rounded-xl border p-2.5 text-center transition-colors ${active ? 'border-emerald-500/25 bg-emerald-500/8' : 'border-white/5 bg-white/3'}`}>
      <p className="text-[10px] font-bold uppercase tracking-wider text-secondary-500">{label}</p>
      <p className={`mt-0.5 text-[13px] font-bold ${colorMap[color] || 'text-white'}`}>{value}</p>
    </div>
  );
}

function ScoreRing({ label, value }) {
  return (
    <div className="flex flex-col items-center gap-1.5 rounded-xl border border-white/5 bg-white/3 p-3">
      <div className={`flex h-12 w-12 items-center justify-center rounded-full border-2 ${scoreRing(value)}`}>
        <span className={`text-[14px] font-bold tabular-nums ${scoreColor(value)}`}>
          {value ?? '—'}
        </span>
      </div>
      <p className="text-[10px] font-bold uppercase tracking-wider text-secondary-500">{label}</p>
    </div>
  );
}

function StatusPill({ status }) {
  const map = {
    Asked: 'border-emerald-500/25 bg-emerald-500/10 text-emerald-400',
    Skipped: 'border-amber-500/25 bg-amber-500/10 text-amber-400',
    Saved: 'border-primary-500/25 bg-primary-500/10 text-primary-400',
    Rejected: 'border-danger-500/25 bg-danger-500/10 text-danger-400',
  };
  return (
    <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-bold ${map[status] || 'border-white/10 bg-white/5 text-secondary-400'}`}>
      {status || 'Pending'}
    </span>
  );
}

function SummaryList({ title, items, color }) {
  const colorMap = {
    emerald: 'text-emerald-400 bg-emerald-500/20',
    amber: 'text-amber-400 bg-amber-500/20',
  };
  return (
    <div className="rounded-2xl border border-white/5 bg-white/3 p-4">
      <p className="text-[11px] font-bold uppercase tracking-wider text-secondary-500">{title}</p>
      {items.length > 0 ? (
        <ul className="mt-3 space-y-2">
          {items.map((item) => (
            <li key={item} className="flex items-start gap-2 text-[12px] text-secondary-200">
              <span className={`mt-1 h-1.5 w-1.5 shrink-0 rounded-full ${colorMap[color]?.split(' ')[1] || 'bg-white/20'}`} />
              {item}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-[12px] text-secondary-500">Not available</p>
      )}
    </div>
  );
}
