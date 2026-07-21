import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowLeft,
  BrainCircuit,
  Camera,
  CheckCircle2,
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
  const latestConcern = latestInsight?.potentialConcern || 'No concern recorded yet.';
  const confidence = latestInsight?.confidence || (isListening ? 'Listening live' : 'Waiting for answer');

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
      setCaptureStatus('Listening live. Candidate speech is being added to the transcript.');
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
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true,
      });
      mediaStreamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      stream.getTracks().forEach((track) => {
        track.onended = stopCapture;
      });
      shouldListenRef.current = true;
      setCameraOn(true);
      setCaptureMode('meeting');
      setCaptureStatus('Meeting tab is captured. Keep candidate audio audible, or paste the meeting transcript below.');
      startSpeechRecognition();
    } catch (err) {
      setError('Meeting tab capture was cancelled or blocked. Share the meeting tab/window with audio enabled and try again.');
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
      setError(err?.response?.data?.message || 'AI could not generate a question from the provider. The local fallback should still be available after refreshing the session.');
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
      setError('Start live capture or add answer notes before analyzing.');
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
    <div className="relative z-10 mx-auto max-w-[1500px] space-y-5 animate-slide-up">
      <section className="relative overflow-hidden rounded-[28px] border border-white/10 bg-gradient-to-br from-secondary-950 via-slate-950 to-primary-950/60 p-5 shadow-glass">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary-500 via-ai-500 to-success-400" />
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" leftIcon={<ArrowLeft size={16} />} onClick={() => navigate(backPath)}>
            Back
          </Button>
          <div>
            <Badge variant="primary" size="sm" icon={<BrainCircuit size={12} />}>
              Vertex-ready AI interviewer
            </Badge>
            <h1 className="mt-2 text-h1 text-white">Live Interview Copilot</h1>
            <p className="mt-1 text-body-sm text-secondary-300">
              Capture the remote candidate answer, analyze it with AI, and end the meeting cleanly.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Badge variant={isListening ? 'success' : 'secondary'} size="sm" icon={<Clock size={12} />}>
            {elapsed}
          </Badge>
          <Button variant="danger" size="sm" leftIcon={<PhoneOff size={14} />} disabled={!session || session.status === 'Ended'} isLoading={loadingAction === 'end'} onClick={endSession}>
            End Meeting
          </Button>
        </div>
        </div>
      </section>

      {error && (
        <div className="rounded-2xl border border-danger-500/30 bg-danger-950/20 px-4 py-3 text-body-sm font-semibold text-danger-200">
          {error}
        </div>
      )}

      {!session ? (
        <Card className="overflow-hidden border-white/10 bg-secondary-950/40">
          <div className="h-1.5 bg-gradient-to-r from-primary-500 via-ai-500 to-success-400" />
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

          <Card className="overflow-hidden border-white/10 bg-secondary-950/40">
            <div className="h-1.5 bg-gradient-to-r from-primary-500 via-ai-500 to-success-400" />
            <CardHeader>
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <CardTitle>Interview Workspace</CardTitle>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" leftIcon={<Video size={14} />} disabled={!context?.meetingLink} onClick={joinMeeting}>
                    Join Link
                  </Button>
                  <Button variant="outline" size="sm" leftIcon={<MonitorUp size={14} />} onClick={startMeetingCapture}>
                    Capture Meeting Tab
                  </Button>
                  <Button variant={isListening ? 'danger' : 'ai'} size="sm" leftIcon={isListening ? <MicOff size={14} /> : <Mic size={14} />} onClick={isListening ? stopCapture : startCapture}>
                    {isListening ? 'Stop Capture' : 'My Camera + Mic'}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
                <div className="overflow-hidden rounded-2xl border border-white/10 bg-black shadow-[0_20px_80px_rgba(79,70,229,0.18)]">
                  <div className="aspect-video w-full">
                    <video ref={videoRef} autoPlay muted playsInline className="h-full w-full object-cover" />
                    {!cameraOn && (
                      <div className="-mt-[56.25%] flex aspect-video items-center justify-center text-center text-body-sm text-secondary-400">
                        <div>
                          <Camera size={28} className="mx-auto mb-2 text-secondary-500" />
                          Remote meeting preview off
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center justify-between border-t border-white/10 px-3 py-2 text-caption text-secondary-300">
                    <span className="inline-flex items-center gap-1.5">
                      <Radio size={11} className={isListening ? 'animate-pulse text-success-400' : 'text-secondary-500'} />
                      {captureMode === 'meeting' ? 'Meeting tab' : isListening ? 'Interviewer mic' : 'Manual mode'}
                    </span>
                    <span>{speechSupported ? 'Speech ready' : 'Speech unsupported'}</span>
                  </div>
                </div>

                <div className="rounded-2xl border border-primary-500/20 bg-gradient-to-br from-primary-950/30 to-ai-950/10 p-5 shadow-inner">
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
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="flex items-center gap-2 text-caption font-bold uppercase text-secondary-400">
                      <Captions size={13} /> Candidate answer transcript
                    </p>
                    <p className="text-caption text-secondary-500">{captureStatus}</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => { setAnswerNotes(''); setLiveInterim(''); }}>
                    Clear
                  </Button>
                </div>
                <Textarea
                  label="Candidate answer transcript and notes"
                  rows={7}
                  value={transcriptText}
                  onChange={(event) => {
                    setAnswerNotes(event.target.value);
                    setLiveInterim('');
                  }}
                  placeholder="For a remote candidate, capture the meeting tab with audio, paste the meeting transcript, or type the candidate's answer here before AI analysis."
                />
              </div>

              <div className="flex flex-wrap gap-2">
                <Button variant="primary" size="sm" leftIcon={<CheckCircle2 size={14} />} disabled={!currentQuestion} isLoading={loadingAction === 'Asked'} onClick={() => updateQuestion('Asked')}>
                  Mark Asked
                </Button>
                <Button variant="ai" size="sm" leftIcon={<Sparkles size={14} />} disabled={!session || !currentQuestion} isLoading={loadingAction === 'answer'} onClick={submitAnswer}>
                  Analyze Live Answer
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

          <Card className="overflow-hidden border-primary-500/20 bg-primary-950/20">
            <div className="h-1.5 bg-gradient-to-r from-ai-500 to-primary-400" />
            <CardHeader>
              <CardTitle>AI Command Center</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid grid-cols-2 gap-3">
                <Info label="Listening" value={isListening ? 'ON' : 'OFF'} />
                <Info label="Confidence" value={confidence} />
                <Info label="Asked" value={askedCount} />
                <Info label="Skipped" value={skippedCount} />
              </div>

              {latestInsight && (
                <div className="grid grid-cols-3 gap-2">
                  <Score label="Relevant" value={latestInsight.relevanceScore} />
                  <Score label="Depth" value={latestInsight.depthScore} />
                  <Score label="Clarity" value={latestInsight.clarityScore} />
                </div>
              )}

              <Textarea
                label="Detected topic"
                rows={2}
                value={currentTopic}
                onChange={(event) => setCurrentTopic(event.target.value)}
                placeholder="Detected from speech, or type a topic..."
              />

              <div className="rounded-2xl border border-danger-500/20 bg-danger-950/10 p-4">
                <p className="flex items-center gap-2 text-caption font-bold uppercase text-danger-300">
                  <AlertTriangle size={14} /> Possible concern
                </p>
                <p className="mt-2 text-body-sm text-secondary-700 dark:text-secondary-200">{latestConcern}</p>
              </div>

              {latestInsight?.suggestedFollowUpQuestion && (
                <button
                  type="button"
                  className="w-full rounded-2xl border border-ai-500/20 bg-ai-950/10 p-4 text-left transition hover:border-ai-400"
                  onClick={() => generateQuestion('Ask Follow-up')}
                >
                  <p className="text-caption font-bold uppercase text-ai-300">Suggested follow-up</p>
                  <p className="mt-2 text-body-sm font-semibold text-secondary-900 dark:text-white">{latestInsight.suggestedFollowUpQuestion}</p>
                </button>
              )}

              <div className="grid grid-cols-1 gap-2">
                <Button variant="ai" leftIcon={<Sparkles size={16} />} isLoading={loadingAction === 'Generate'} onClick={() => generateQuestion('Generate')}>
                  Generate Question
                </Button>
                <Button variant="outline" leftIcon={<Gauge size={16} />} onClick={() => generateQuestion('Make Easier')}>
                  Make Easier
                </Button>
                <Button variant="outline" leftIcon={<Gauge size={16} />} onClick={() => generateQuestion('Make Harder')}>
                  Make Harder
                </Button>
                <Button variant="outline" leftIcon={<MessageSquare size={16} />} onClick={() => generateQuestion('Ask Follow-up')}>
                  Follow Up
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

function Score({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-center">
      <p className="text-caption font-bold uppercase text-secondary-400">{label}</p>
      <p className="mt-1 text-h3 text-secondary-900 dark:text-white">{value ?? '-'}</p>
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
