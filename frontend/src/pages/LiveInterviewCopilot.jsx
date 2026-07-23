import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowLeft,
  BrainCircuit,
  Camera,
  CheckCircle2,
  ChevronRight,
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
  X,
} from 'lucide-react';
import { Avatar, Select, Textarea } from '../components/ui';
import liveInterviewApi from '../lib/liveInterviewApi';

/* ── constants ── */
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
const STATUS_BADGE = {
  Asked: 'border-emerald-500/30 bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400',
  Skipped: 'border-amber-500/30  bg-amber-50 text-amber-700 dark:bg-amber-500/10  dark:text-amber-400',
  Saved: 'border-violet-500/30  bg-violet-50 text-violet-700 dark:bg-violet-500/10  dark:text-violet-400',
  Rejected: 'border-red-500/30    bg-red-50 text-red-700 dark:bg-red-500/10    dark:text-red-400',
};

/* ── helpers ── */
const getSpeech = () =>
  typeof window !== 'undefined'
    ? window.SpeechRecognition || window.webkitSpeechRecognition || null
    : null;

const fmtTime = (startedAt) => {
  if (!startedAt) return '00:00';
  const s = Math.max(0, Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000));
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
};

const appendText = (cur, next) => {
  const t = next.trim();
  return t ? `${cur}${cur.trim() ? '\n' : ''}${t}` : cur;
};

const detectTopic = (txt) =>
  txt.toLowerCase().replace(/[^a-z0-9+#.\s-]/g, ' ').split(/\s+/)
    .filter(w => w.length > 4 && !['about', 'because', 'there', 'their', 'would', 'could', 'should', 'candidate'].includes(w))
    .slice(-4).join(' ');

const scoreStyle = (v) => {
  if (v == null) return { ring: 'border-slate-300 dark:border-white/10', text: 'text-slate-400 dark:text-white/30', bar: '' };
  if (v >= 75) return { ring: 'border-emerald-500/80', text: 'text-emerald-600 dark:text-emerald-400', bar: 'bg-emerald-500' };
  if (v >= 50) return { ring: 'border-amber-500/80', text: 'text-amber-600 dark:text-amber-400', bar: 'bg-amber-500' };
  return { ring: 'border-red-500/80', text: 'text-red-600 dark:text-red-400', bar: 'bg-red-500' };
};

/* ════════════════════════════════════════ COMPONENT ═══════════════════════════ */
export default function LiveInterviewCopilot() {
  const { interviewId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isHM = location.pathname.startsWith('/hiring-manager');
  const backPath = isHM ? `/hiring-manager/interviews/${interviewId}` : '/recruiter/interviews';

  const videoRef = useRef(null);
  const recRef = useRef(null);
  const streamRef = useRef(null);
  const meetRef = useRef(null);
  const shouldListen = useRef(false);

  const [mode, setMode] = useState('Adaptive');
  const [difficulty, setDifficulty] = useState('Intermediate');
  const [consent, setConsent] = useState(false);
  const [session, setSession] = useState(null);
  const [question, setQuestion] = useState(null);
  const [notes, setNotes] = useState('');
  const [interim, setInterim] = useState('');
  const [topic, setTopic] = useState('');
  const [insight, setInsight] = useState(null);
  const [summary, setSummary] = useState(null);
  const [elapsed, setElapsed] = useState('00:00');
  const [loading, setLoading] = useState('');
  const [error, setError] = useState('');
  const [listening, setListening] = useState(false);
  const [cameraOn, setCameraOn] = useState(false);
  const [capMode, setCapMode] = useState('manual');
  const [speechOk, setSpeechOk] = useState(Boolean(getSpeech()));
  const [capStatus, setCapStatus] = useState('Camera and speech capture are off.');
  const [activeTab, setActiveTab] = useState('Live Analysis');

  const questions = session?.questions || [];
  const context = session?.context;
  const askedCount = questions.filter(q => q.status === 'Asked').length;
  const skippedCount = questions.filter(q => q.status === 'Skipped').length;
  const expPoints = useMemo(() => question?.expectedPoints || [], [question]);
  const transcript = [notes, interim].filter(Boolean).join('\n');
  const concern = insight?.potentialConcern || null;
  const confidence = insight?.confidence || (listening ? 'Listening…' : 'Waiting…');

  /* ── stop capture ── */
  const stopCapture = useCallback(() => {
    shouldListen.current = false;
    recRef.current?.stop?.(); recRef.current = null;
    streamRef.current?.getTracks().forEach(t => t.stop()); streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setListening(false); setCameraOn(false); setCapMode('manual');
    setInterim(''); setCapStatus('Camera and speech capture are off.');
  }, []);

  useEffect(() => () => stopCapture(), [stopCapture]);

  /* ── timer ── */
  useEffect(() => {
    if (!session?.startedAt || session.status === 'Ended') return;
    const id = setInterval(() => setElapsed(fmtTime(session.startedAt)), 1000);
    setElapsed(fmtTime(session.startedAt));
    return () => clearInterval(id);
  }, [session?.startedAt, session?.status]);

  /* ── auto-load session on mount ── */
  useEffect(() => {
    if (!interviewId) return;
    let isMounted = true;
    const loadSession = async () => {
      try {
        const d = await liveInterviewApi.start({
          interviewId: Number(interviewId),
          difficulty,
          questionMode: mode,
          consentRecorded: consent,
        });
        if (isMounted && d) {
          setSession(d);
          setQuestion(d.questions?.at(-1) || null);
        }
      } catch {
        // User can manually start if interview session isn't initialized
      }
    };
    loadSession();
    return () => { isMounted = false; };
  }, [interviewId]);

  /* ── speech ── */
  const startSpeech = useCallback(() => {
    const R = getSpeech();
    if (!R) { setSpeechOk(false); setCapStatus('Speech not supported in this browser.'); return; }
    const r = new R();
    r.continuous = true; r.interimResults = true; r.lang = 'en-US';
    r.onresult = (e) => {
      let fin = '', int = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0]?.transcript || '';
        if (e.results[i].isFinal) fin += `${t} `; else int += `${t} `;
      }
      if (fin.trim()) { setNotes(c => appendText(c, fin)); const tp = detectTopic(fin); if (tp) setTopic(tp); }
      setInterim(int.trim());
    };
    r.onerror = () => setCapStatus('Speech paused. Keep typing or restart capture.');
    r.onend = () => { if (!shouldListen.current) return; try { r.start(); } catch { } };
    recRef.current = r;
    try { r.start(); setSpeechOk(true); setListening(true); setCapStatus('Live — transcribing in real time.'); }
    catch { setCapStatus('Speech could not start.'); }
  }, []);

  const startCapture = async () => {
    setError('');
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = s;
      if (videoRef.current) videoRef.current.srcObject = s;
      shouldListen.current = true; setCameraOn(true); setCapMode('camera');
      startSpeech();
    } catch (err) { setError('Camera/mic permission blocked. Allow access and try again.'); }
  };

  const startMeetCapture = async () => {
    setError('');
    try {
      const s = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
      streamRef.current = s;
      if (videoRef.current) videoRef.current.srcObject = s;
      s.getTracks().forEach(t => { t.onended = stopCapture; });
      shouldListen.current = true; setCameraOn(true); setCapMode('meeting');
      setCapStatus('Meeting tab captured. Ensure candidate audio is audible.');
      startSpeech();
    } catch { setError('Meeting capture cancelled. Share tab with audio enabled.'); }
  };

  const joinMeeting = () => { if (context?.meetingLink) meetRef.current = window.open(context.meetingLink, '_blank', 'noreferrer'); };

  /* ── API actions ── */
  const startSession = async () => {
    setLoading('start'); setError('');
    try {
      const d = await liveInterviewApi.start({ interviewId: Number(interviewId), difficulty, questionMode: mode, consentRecorded: consent });
      setSession(d); setQuestion(d.questions?.at(-1) || null);
    } catch (err) { setError(err?.response?.data?.message || 'Could not start AI assistant.'); }
    finally { setLoading(''); }
  };

  const refresh = async (sid = session?.sessionId) => {
    if (!sid) return;
    const d = await liveInterviewApi.getSession(sid);
    setSession(d); setQuestion(d.questions?.at(-1) || null);
  };

  const generate = async (action = 'Generate') => {
    if (!session) return;
    setLoading(action); setError('');
    try {
      const q = await liveInterviewApi.generateQuestion(session.sessionId, { mode, difficulty, controlAction: action, currentTopic: topic, latestAnswerNotes: transcript });
      setQuestion(q); await refresh();
    } catch (err) { setError(err?.response?.data?.message || 'AI could not generate a question.'); }
    finally { setLoading(''); }
  };

  const updateQ = async (action) => {
    if (!session || !question) return;
    setLoading(action); setError('');
    try {
      const fn = { Asked: liveInterviewApi.markAsked, Skipped: liveInterviewApi.skip, Saved: liveInterviewApi.save, Rejected: liveInterviewApi.report }[action];
      const u = await fn(session.sessionId, question.questionId);
      setQuestion(u); await refresh();
    } catch (err) { setError(err?.response?.data?.message || 'Could not update question.'); }
    finally { setLoading(''); }
  };

  const analyze = async () => {
    if (!session || !question) return;
    if (!transcript.trim()) { setError('Add answer notes or start live capture before analysis.'); return; }
    setLoading('answer'); setError('');
    try {
      // Auto-mark question as Asked if it hasn't been actioned yet
      if (!question.status || question.status === 'Generated') {
        try { const u = await liveInterviewApi.markAsked(session.sessionId, question.questionId); setQuestion(u); } catch { }
      }
      const ins = await liveInterviewApi.submitAnswer(session.sessionId, { questionId: question.questionId, interviewerNotes: notes, transcript });
      setInsight(ins);
      setTopic(question.skill || question.category || topic || detectTopic(transcript));
      setNotes(''); setInterim('');
      await refresh();
    } catch (err) { setError(err?.response?.data?.message || 'Could not analyze the answer.'); }
    finally { setLoading(''); }
  };

  const endSession = async () => {
    if (!session) return;
    setLoading('end'); setError('');
    stopCapture(); meetRef.current?.close?.();
    try {
      const r = await liveInterviewApi.end(session.sessionId);
      setSummary(r); await refresh();
      setCapStatus('Session ended. Camera and microphone are off.');
    } catch (err) { setError(err?.response?.data?.message || 'Could not end session.'); }
    finally { setLoading(''); }
  };

  /* ════════════════ RENDER ════════════════ */
  return (
    <div className="mx-auto max-w-[1600px] space-y-3">

      {/* ── HEADER ── */}
      <header className="relative mb-1 overflow-hidden rounded-xl border border-slate-200/80 bg-gradient-to-r from-slate-50 via-white to-violet-50/40 shadow-sm dark:border-white/[0.07] dark:bg-gradient-to-br dark:from-[#0c0d1a] dark:via-[#0f1025] dark:to-[#0e0e20]">
        {/* top rainbow bar */}
        <div className="absolute inset-x-0 top-0 h-[2px] rounded-t-xl"
          style={{ background: 'gradient(90deg, #8b5cf6, #6366f1, #22d3ee, #34d399)' }} />
        {/* glow accents */}
        <div className="pointer-events-none absolute right-12 top-2 h-36 w-64 rounded-full opacity-10 blur-3xl dark:opacity-20"
          style={{ background: 'radial-gradient(ellipse, #6366f1, transparent)' }} />

        <div className="relative flex flex-col gap-3 px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between">
          {/* left: back + title */}
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => navigate(backPath)}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50 hover:text-slate-900 dark:border-white/10 dark:bg-white/[0.05] dark:text-white/60 dark:hover:bg-white/[0.09] dark:hover:text-white">
              <ArrowLeft size={12} /> Back
            </button>
            <div className="h-6 w-px bg-slate-200 dark:bg-white/[0.07]" />
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-[17px] font-bold tracking-tight text-slate-900 dark:text-white">Live Interview Copilot</h1>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="inline-flex items-center gap-1 rounded-full border border-violet-500/20 bg-violet-50 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-violet-700 dark:border-violet-400/25 dark:bg-violet-500/10 dark:text-violet-300">
                    <BrainCircuit size={9} className="animate-pulse" /> Active
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-50 px-2 py-0.5 text-[9px] font-bold text-emerald-700 dark:border-emerald-400/25 dark:bg-emerald-500/10 dark:text-emerald-400">
                    <Zap size={8} /> Vertex AI
                  </span>
                </div>
              </div>
              <p className="mt-0.5 text-[10px] text-slate-500 dark:text-white/30">
                Real-time AI assistance · question generation · live answer analysis
              </p>
            </div>
          </div>
          {/* right: timer + counts + end */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-white/[0.07] dark:bg-white/[0.03]">
              <div className={`flex items-center gap-2 px-4 py-2 font-mono text-[14px] font-bold tabular-nums
                  ${session && session.status !== 'Ended' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/[0.08] dark:text-emerald-300' : 'text-slate-400 dark:text-white/30'}`}>
                <Radio size={11} className={session && session.status !== 'Ended' ? 'animate-pulse text-emerald-500 dark:text-emerald-400' : 'text-slate-300 dark:text-white/20'} />
                {elapsed}
              </div>
              {session && (
                <div className="flex items-center gap-1.5 border-l border-slate-200 px-4 py-2 text-[12px] font-semibold dark:border-white/[0.07]">
                  <span className="text-violet-600 dark:text-violet-400">{askedCount}</span>
                  <span className="text-slate-500 dark:text-white/25">asked</span>
                  <span className="text-slate-300 dark:text-white/15">·</span>
                  <span className="text-amber-600 dark:text-amber-400">{skippedCount}</span>
                  <span className="text-slate-500 dark:text-white/25">skipped</span>
                </div>
              )}
              <button type="button" onClick={endSession}
                disabled={!session || session.status === 'Ended' || loading === 'end'}
                className="flex items-center gap-2 border-l border-slate-200 bg-red-50 px-4 py-2 text-[12px] font-bold text-red-600 transition hover:bg-red-100 hover:text-red-700 dark:border-white/[0.07] dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20 dark:hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-40">
                <PhoneOff size={13} />
                {loading === 'end' ? 'Ending…' : 'End Session'}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ── ERROR ── */}
      {error && (
        <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-[13px] font-medium text-red-700 shadow-sm dark:border-red-500/20 dark:bg-red-500/[0.06] dark:text-red-300">
          <AlertTriangle size={15} className="mt-0.5 shrink-0 text-red-500 dark:text-red-400" />
          <span className="flex-1">{error}</span>
          <button type="button" onClick={() => setError('')} className="text-red-400 hover:text-red-700 dark:text-red-400/50 dark:hover:text-red-300"><X size={14} /></button>
        </div>
      )}

      {/* ── PRE-SESSION SETUP ── */}
      {!session ? (
        <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-white/[0.07] dark:bg-gradient-to-br dark:from-[#0c0d1a] dark:to-[#0f1025]">
          <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full opacity-10 blur-3xl"
            style={{ background: 'radial-gradient(ellipse, #8b5cf6, transparent)' }} />
          <div className="relative mb-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl shadow-[0_0_30px_rgba(139,92,246,0.5)]"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}>
              <Sparkles size={28} className="text-white" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Configure AI Interview Assistant</h2>
            <p className="mt-1 text-[13px] text-slate-500 dark:text-white/35">Set up question mode, difficulty and consent before starting.</p>
          </div>
          <div className="relative grid items-end gap-4 sm:grid-cols-4">
            <Select label="Question mode" value={mode} onChange={e => setMode(e.target.value)} options={MODE_OPTIONS} />
            <Select label="Difficulty" value={difficulty} onChange={e => setDifficulty(e.target.value)} options={DIFFICULTY_OPTIONS} />
            <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 transition hover:bg-slate-100 dark:border-white/[0.07] dark:bg-white/[0.03] dark:hover:bg-white/[0.05]">
              <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-colors
                  ${consent ? 'border-violet-600 bg-violet-600 dark:border-violet-500 dark:bg-violet-500' : 'border-slate-300 dark:border-white/20'}`}>
                {consent && <CheckCircle2 size={13} className="text-white" />}
              </span>
              <input type="checkbox" className="sr-only" checked={consent} onChange={e => setConsent(e.target.checked)} />
              <div>
                <p className="text-[13px] font-semibold text-slate-900 dark:text-white">Consent recorded</p>
                <p className="text-[10px] text-slate-500 dark:text-white/30">Candidate agreed to recording</p>
              </div>
            </label>
            <button type="button" onClick={startSession} disabled={loading === 'start'}
              className="inline-flex items-center justify-center gap-2 rounded-2xl px-6 py-3 text-[13px] font-bold text-white shadow-[0_0_24px_rgba(139,92,246,0.35)] transition hover:opacity-90 disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}>
              <Sparkles size={15} />
              {loading === 'start' ? 'Starting…' : 'Start AI Assistant'}
            </button>
          </div>
        </div>
      ) : (
        /* ── ACTIVE SESSION: 2-column grid (60/40) ── */
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_400px]">

          {/* ══════════ LEFT COLUMN: Video, Controls & Tabs ══════════ */}
          <div className="flex min-w-0 flex-col gap-3">

            {/* TOP ROW: Video & AI Command Center */}
            <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_320px]">
              {/* Left cell: Video + Capture Controls */}
              <div className="flex flex-col gap-3">
                {/* 1. Dominant Video Feed */}
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-900 shadow-sm dark:border-white/[0.07] dark:bg-black">
                  <div className="relative w-full" style={{ aspectRatio: '16/9' }}>
                    <video ref={videoRef} autoPlay muted playsInline className="h-full w-full object-cover" />
                    {!cameraOn && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-slate-900 dark:bg-[#080a12]">
                        <Camera size={28} className="text-slate-600 dark:text-white/10" />
                        <p className="text-[13px] text-slate-400 dark:text-white/15">Preview off</p>
                      </div>
                    )}
                  </div>
                  <div className="px-4 py-2.5 text-[11px] leading-snug text-slate-400 bg-slate-800 border-t border-slate-700 dark:bg-[#080a12] dark:text-white/20 dark:border-white/[0.05]">{capStatus}</div>
                </div>

                {/* 2. Capture Controls — recruiter captures candidate's screen/audio */}
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 shadow-sm dark:border-white/[0.07] dark:bg-[#0c0d1a]">
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={listening ? stopCapture : startMeetCapture}
                      className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-[12px] font-bold transition
                          ${listening
                          ? 'border border-red-500/25 bg-red-500/12 text-red-600 dark:text-red-400 hover:bg-red-500/20'
                          : 'text-white shadow-[0_0_14px_rgba(139,92,246,0.25)]'}`}
                      style={!listening ? { background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' } : undefined}>
                      {listening ? <MicOff size={13} /> : <MonitorUp size={13} />}
                      {listening ? 'Stop Capturing' : 'Screen Capture'}
                    </button>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-white/40">
                    <span className={`flex items-center gap-1 ${listening ? 'text-emerald-600 dark:text-emerald-400' : ''}`}>
                      <Radio size={10} className={listening ? 'animate-pulse' : ''} />
                      {capMode === 'meeting' ? 'Meeting tab' : listening ? 'Mic active' : 'Ready'}
                    </span>
                    <span>·</span>
                    <span>{speechOk ? 'Speech ready' : 'Unsupported'}</span>
                  </div>
                </div>
              </div>

              {/* Right cell: AI Command Center */}
              <div className="overflow-hidden rounded-2xl border border-violet-500/20 bg-white shadow-sm flex flex-col dark:border-violet-500/12 dark:bg-gradient-to-br dark:from-[#110f2a] dark:via-[#0e0f1f] dark:to-[#0c0d1a]">

                <div className="flex items-center gap-3 border-b border-slate-200 px-4 py-3 shrink-0 dark:border-white/[0.05]">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[11px] shadow-[0_0_14px_rgba(139,92,246,0.4)]"
                    style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}>
                    <BrainCircuit size={17} className="text-white" />
                  </div>
                  <div>
                    <p className="text-[14px] font-bold text-slate-900 dark:text-white">AI Command Center</p>
                    <p className="text-[11px] text-violet-600 dark:text-violet-400/60">Real-time intelligence</p>
                  </div>
                </div>

                <div className="flex flex-col gap-3 p-4 flex-1 overflow-y-auto min-h-0">

                  {/* ── Mic / Candidate Confidence Hero ── */}
                  <style>{`
                    @keyframes bar-bounce { 0%,100%{transform:scaleY(.4)} 50%{transform:scaleY(1)} }
                  `}</style>
                  <div className={`relative overflow-hidden rounded-2xl shrink-0 p-4 transition-all
                    ${listening
                      ? 'border border-emerald-500/20 bg-emerald-50/60 opacity-70 dark:border-emerald-500/15 dark:bg-[#071912]/60'
                      : 'border border-slate-200 bg-slate-50 dark:border-white/[0.06] dark:bg-white/[0.02]'}`}>

                    <div className="relative z-10 flex items-center justify-between gap-4">
                      {/* Left: Mic status */}
                      <div className="flex flex-col gap-1">
                        <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 dark:text-white/25">MIC</p>
                        <div className="flex items-center gap-2">
                          <span className={`flex h-2.5 w-2.5 shrink-0 rounded-full transition-all ${listening ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.7)] animate-pulse' : 'bg-slate-300 dark:bg-white/15'
                            }`} />
                          <p className={`text-[14px] font-bold ${listening ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-500 dark:text-white/40'
                            }`}>{listening ? 'Live' : 'Off'}</p>
                        </div>
                        {listening && (
                          <div className="mt-1.5 flex items-end gap-[3px] h-5">
                            {[0.6, 1, 0.5, 0.8, 0.4, 0.9, 0.55].map((h, i) => (
                              <span key={i}
                                className="w-[3px] rounded-full bg-emerald-500 origin-bottom"
                                style={{
                                  height: `${Math.round(h * 20)}px`,
                                  animation: `bar-bounce ${0.6 + i * 0.1}s ease-in-out infinite`,
                                  animationDelay: `${i * 0.08}s`,
                                }} />
                            ))}
                          </div>
                        )}
                      </div>


                      {/* Right: Candidate Confidence */}
                      <div className="flex flex-col items-end gap-1">
                        <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 dark:text-white/25">CONFIDENCE</p>
                        <p className={`text-[14px] font-bold ${typeof confidence === 'number'
                          ? confidence >= 70 ? 'text-emerald-600 dark:text-emerald-400'
                            : confidence >= 40 ? 'text-amber-600 dark:text-amber-400'
                              : 'text-red-600 dark:text-red-400'
                          : 'text-slate-400 dark:text-white/30'
                          }`}>
                          {typeof confidence === 'number' ? `${confidence}%` : confidence}
                        </p>
                        {typeof confidence === 'number' && (
                          <div className="mt-1 w-20 h-1.5 rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden">
                            <div className={`h-full rounded-full transition-all ${confidence >= 70 ? 'bg-emerald-500' : confidence >= 40 ? 'bg-amber-500' : 'bg-red-500'
                              }`} style={{ width: `${confidence}%` }} />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* ── Question Generation (with Detected Topic just above) ── */}
                  <div className="mt-auto shrink-0 flex flex-col gap-2">
                    {/* Detected Topic — sits close to generate button */}
                    <Textarea label="Detected topic / hint" rows={2} value={topic}
                      onChange={e => setTopic(e.target.value)}
                      placeholder="Auto-detected from speech, or type a topic…"
                      className="text-[12px]" />

                    <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 dark:text-white/20">Question Generation</p>
                    <button type="button" onClick={() => generate('Generate')} disabled={loading === 'Generate'}
                      className="flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-[13px] font-bold text-white shadow-[0_0_16px_rgba(139,92,246,0.25)] transition hover:opacity-90 disabled:opacity-50"
                      style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}>
                      <Sparkles size={14} />
                      {loading === 'Generate' ? 'Generating…' : 'Generate Next Question'}
                    </button>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { icon: <Gauge size={12} />, label: 'Easier', action: 'Make Easier' },
                        { icon: <Gauge size={12} />, label: 'Harder', action: 'Make Harder' },
                        { icon: <MessageSquare size={12} />, label: 'Follow-up', action: 'Ask Follow-up' },
                        { icon: <FileText size={12} />, label: 'New Topic', action: 'Change Topic' },
                      ].map(({ icon, label, action }) => (
                        <button key={action} type="button" onClick={() => generate(action)}
                          disabled={loading === action}
                          className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 py-2.5 text-[12px] font-bold text-slate-700 transition hover:bg-slate-100 hover:text-slate-900 dark:border-white/[0.07] dark:bg-white/[0.02] dark:text-white/45 dark:hover:bg-white/[0.06] dark:hover:text-white disabled:opacity-40">
                          {icon}
                          {loading === action ? '…' : label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>


            {/* 3. Tab Group */}
            <div className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-white/[0.07] dark:bg-[#0c0d1a]">
              {/* Tabs Header */}
              <div className="flex border-b border-slate-200 bg-slate-50/60 dark:border-white/[0.05] dark:bg-transparent overflow-x-auto">
                {['Live Analysis', 'Meeting details', 'Candidate skills', `History (${questions.length})`].map((tLabel) => {
                  const baseTab = tLabel.split(' (')[0];
                  const isActive = activeTab === baseTab;
                  return (
                    <button
                      key={tLabel}
                      type="button"
                      onClick={() => setActiveTab(baseTab)}
                      className={`relative flex-1 shrink-0 px-4 py-3.5 text-[12px] font-bold transition-colors whitespace-nowrap ${isActive ? 'text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-800 dark:text-white/35 dark:hover:text-white/60'
                        }`}
                    >
                      {tLabel}
                      {isActive && (
                        <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-violet-600 dark:bg-violet-500 shadow-[0_-2px_8px_rgba(139,92,246,0.5)]" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Tabs Content */}
              <div className="flex-1 p-0">
                {activeTab === 'Meeting details' && (
                  <div className="p-4 space-y-4">
                    {/* One-line horizontal card with centered profile & metrics on sides */}
                    <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-50/80 p-4 shadow-sm dark:border-white/[0.07] dark:bg-[#0f1025]">
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">

                        {/* Left Side: Experience & Duration — stacked 2 lines */}
                        <div className="flex flex-col gap-2.5 shrink-0 order-2 sm:order-1 min-w-[80px]">
                          <div className="text-center sm:text-left">
                            <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 dark:text-white/25">EXPERIENCE</p>
                            <p className="mt-0.5 text-[13px] font-bold text-slate-900 dark:text-white/90">
                              {context?.experienceYears ? `${context.experienceYears} yrs` : '—'}
                            </p>
                          </div>
                          <div className="h-px w-full bg-slate-200 dark:bg-white/10" />
                          <div className="text-center sm:text-left">
                            <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 dark:text-white/25">DURATION</p>
                            <p className="mt-0.5 text-[13px] font-bold text-slate-900 dark:text-white/90">
                              {`${context?.interviewDurationMinutes || 0} min`}
                            </p>
                          </div>
                        </div>

                        {/* Center: Profile avatar, Name & Position */}
                        <div className="flex flex-col items-center text-center shrink-0 order-1 sm:order-2 px-2">
                          <div className="relative mb-1">
                            <div className="h-14 w-14 overflow-hidden rounded-[16px] ring-2 ring-slate-200 ring-offset-2 ring-offset-white dark:ring-white/10 dark:ring-offset-[#0f1025]">
                              <Avatar name={context?.candidateName || 'C'} src={context?.candidatePhotoUrl} size="md" className="h-full w-full object-cover" />
                            </div>
                            <span className="absolute -bottom-1 -right-1 flex h-4.5 w-4.5 items-center justify-center rounded-full border-2 border-white bg-emerald-500 dark:border-[#0f1025]">
                              <Radio size={8} className="animate-pulse text-white" />
                            </span>
                          </div>
                          <h2 className="text-[14px] font-bold text-slate-900 dark:text-white">{context?.candidateName || 'Candidate'}</h2>
                          <p className="text-[11px] text-slate-500 dark:text-white/40">{context?.position || 'Position not specified'}</p>
                        </div>

                        {/* Right Side: Stage & Prior Score — stacked 2 lines */}
                        <div className="flex flex-col gap-2.5 shrink-0 order-3 min-w-[80px]">
                          <div className="text-center sm:text-right">
                            <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 dark:text-white/25">STAGE</p>
                            <p className="mt-0.5 text-[13px] font-bold text-slate-900 dark:text-white/90">
                              {context?.interviewStage || 'Interview'}
                            </p>
                          </div>
                          <div className="h-px w-full bg-slate-200 dark:bg-white/10" />
                          <div className="text-center sm:text-right">
                            <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 dark:text-white/25">PRIOR SCORE</p>
                            <p className="mt-0.5 text-[13px] font-bold text-slate-900 dark:text-white/90">
                              {context?.previousInterviewScore ? `${context.previousInterviewScore}/100` : '—'}
                            </p>
                          </div>
                        </div>

                      </div>
                    </div>

                    {/* Meeting Link Button */}
                    {context?.meetingLink && (
                      <button type="button" onClick={joinMeeting}
                        className="group flex w-full items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-left transition hover:border-violet-500/30 hover:bg-violet-50 dark:border-white/[0.07] dark:bg-white/[0.02] dark:hover:border-violet-500/20 dark:hover:bg-violet-500/[0.05]">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-violet-100 dark:bg-violet-500/15">
                            <Video size={14} className="text-violet-600 dark:text-violet-400" />
                          </div>
                          <div>
                            <p className="text-[12px] font-bold text-slate-900 dark:text-white/70">Meeting Link</p>
                            <p className="text-[10px] text-slate-500 dark:text-white/25">Open in new tab</p>
                          </div>
                        </div>
                        <ChevronRight size={14} className="text-slate-400 transition-transform group-hover:translate-x-0.5 dark:text-white/25" />
                      </button>
                    )}
                  </div>
                )}

                {activeTab === 'Candidate skills' && (
                  <div className="space-y-4 p-4">
                    {context?.candidateSkills?.length > 0 && (
                      <div>
                        <p className="mb-2.5 text-[9px] font-bold uppercase tracking-widest text-slate-400 dark:text-white/25">Candidate Skills</p>
                        <div className="flex flex-wrap gap-1.5">
                          {context.candidateSkills.map(s => (
                            <span key={s} className="rounded-full border border-violet-500/30 bg-violet-50 px-2.5 py-1 text-[11px] font-semibold text-violet-700 dark:border-violet-500/20 dark:bg-violet-500/[0.08] dark:text-violet-300">{s}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    {context?.requiredJobSkills?.length > 0 && (
                      <div>
                        <p className="mb-2.5 text-[9px] font-bold uppercase tracking-widest text-slate-400 dark:text-white/25">Required Skills</p>
                        <div className="flex flex-wrap gap-1.5">
                          {context.requiredJobSkills.map(s => (
                            <span key={s} className="rounded-full border border-cyan-500/30 bg-cyan-50 px-2.5 py-1 text-[11px] font-semibold text-cyan-700 dark:border-cyan-500/20 dark:bg-cyan-500/[0.08] dark:text-cyan-300">{s}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    {context?.cvSummary && (
                      <div>
                        <p className="mb-2 text-[9px] font-bold uppercase tracking-widest text-slate-400 dark:text-white/25">CV Summary</p>
                        <p className="text-[12px] leading-relaxed text-slate-600 dark:text-white/40">{context.cvSummary}</p>
                      </div>
                    )}
                    {!context?.candidateSkills?.length && !context?.requiredJobSkills?.length && !context?.cvSummary && (
                      <p className="py-8 text-center text-[12px] text-slate-400 dark:text-white/30">No candidate skill details or CV summary available.</p>
                    )}
                  </div>
                )}

                {(activeTab === 'Live Analysis' || activeTab === 'Transcript') && (
                  <div className="flex flex-col gap-4 p-4">

                    {/* Main side-by-side Grid: Answer Textarea (Left) | Analysis Results (Right) */}
                    <div className="grid gap-4 md:grid-cols-2">
                      {/* Left: Candidate Answer Box */}
                      <div className="flex flex-col gap-2">
                        {/* Title row: label + Clear inline */}
                        <div className="flex items-center justify-between">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-white/30">Candidate Response</p>
                          <button type="button" onClick={() => { setNotes(''); setInterim(''); }}
                            className="rounded-lg border border-slate-200 bg-slate-100 px-2.5 py-1 text-[10px] font-semibold text-slate-500 transition hover:bg-slate-200 hover:text-slate-900 dark:border-white/[0.08] dark:bg-white/[0.03] dark:text-white/35 dark:hover:bg-white/[0.07] dark:hover:text-white">
                            Clear
                          </button>
                        </div>
                        {interim && (
                          <p className="animate-pulse rounded-lg border border-violet-500/20 bg-violet-50 px-3 py-2 text-[11px] italic text-violet-700 dark:border-violet-500/20 dark:bg-violet-500/[0.08] dark:text-violet-300">{interim}</p>
                        )}
                        <Textarea label="" rows={7} value={transcript}
                          onChange={e => { setNotes(e.target.value); setInterim(''); }}
                          placeholder="Candidate answer will transcribe here automatically when mic is active, or type notes manually..."
                          className="min-h-[180px] resize-none rounded-xl border border-slate-200 bg-slate-50/50 p-3.5 font-mono text-[12px] text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-1 focus:ring-violet-500/40 dark:border-white/[0.07] dark:bg-black/30 dark:text-white dark:placeholder:text-white/20" />
                      </div>

                      {/* Right: AI Analysis Results */}
                      <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50/60 p-3.5 dark:border-white/[0.06] dark:bg-white/[0.02]">
                        {/* Title row: label + Analyze inline */}
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-violet-700 dark:text-violet-400/80">AI Answer Evaluation</p>
                          <Btn onClick={analyze} disabled={!session || !question} loading={loading === 'answer'}
                            className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-[0_0_10px_rgba(139,92,246,0.25)] hover:opacity-90 text-[11px] py-1.5 px-2.5"
                            icon={<Sparkles size={11} />} label="Analyze" />
                        </div>

                        {insight ? (
                          <div className="space-y-3">
                            {/* Score rings */}
                            <div className="grid grid-cols-3 gap-2">
                              <Ring label="Relevant" value={insight.relevanceScore} />
                              <Ring label="Depth" value={insight.depthScore} />
                              <Ring label="Clarity" value={insight.clarityScore} />
                            </div>

                            {/* Potential Concern */}
                            {concern && (
                              <div className="rounded-xl border border-red-200 bg-red-50 p-3 dark:border-red-500/15 dark:bg-red-500/[0.06]">
                                <p className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest text-red-600 dark:text-red-400">
                                  <AlertTriangle size={9} /> Potential Concern
                                </p>
                                <p className="mt-1.5 text-[11px] leading-relaxed text-slate-700 dark:text-white/60">{concern}</p>
                              </div>
                            )}

                            {/* Suggested Follow-up */}
                            {insight?.suggestedFollowUpQuestion && (
                              <button type="button" onClick={() => generate('Ask Follow-up')}
                                className="w-full rounded-xl border border-cyan-200 bg-cyan-50/80 p-3 text-left transition hover:bg-cyan-100 dark:border-cyan-500/20 dark:bg-cyan-500/[0.05] dark:hover:border-cyan-500/35 dark:hover:bg-cyan-500/[0.08]">
                                <p className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest text-cyan-700 dark:text-cyan-400">
                                  <TrendingUp size={9} /> Suggested Follow-up
                                </p>
                                <p className="mt-1.5 text-[11px] font-semibold leading-snug text-slate-800 dark:text-white/80">{insight.suggestedFollowUpQuestion}</p>
                                <p className="mt-1 text-[9px] text-cyan-600 dark:text-cyan-400/50">Click to use this question →</p>
                              </button>
                            )}
                          </div>
                        ) : (
                          <div className="flex flex-1 flex-col items-center justify-center py-6 text-center">
                            <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-violet-100 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400">
                              <Sparkles size={16} />
                            </div>
                            <p className="text-[12px] font-medium text-slate-600 dark:text-white/50">No analysis yet</p>
                            <p className="mt-1 max-w-[200px] text-[10px] text-slate-400 dark:text-white/25">Type or capture the answer, then click <span className="text-violet-600 dark:text-violet-300 font-semibold">Analyze</span>.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'History' && (
                  <div className="max-h-[400px] space-y-1.5 overflow-y-auto p-4">
                    {questions.length === 0 ? (
                      <p className="py-10 text-center text-[12px] text-slate-400 dark:text-white/25">No questions generated yet.</p>
                    ) : questions.map(q => {
                      const active = q.questionId === question?.questionId;
                      return (
                        <button key={q.questionId} type="button" onClick={() => setQuestion(q)}
                          className={`w-full rounded-xl border p-4 text-left transition-all
                              ${active ? 'border-violet-500/40 bg-violet-50 dark:border-violet-500/25 dark:bg-violet-500/[0.07]' : 'border-slate-200 bg-white hover:bg-slate-50 dark:border-white/[0.04] dark:bg-white/[0.02] dark:hover:border-white/[0.08] dark:hover:bg-white/[0.04]'}`}>
                          <div className="flex items-start justify-between gap-3">
                            <p className="line-clamp-2 text-[13px] font-medium text-slate-800 dark:text-white/75">{q.question}</p>
                            <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[9px] font-bold ${STATUS_BADGE[q.status] || 'border-slate-200 bg-slate-100 text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-white/30'}`}>
                              {q.status || 'Pending'}
                            </span>
                          </div>
                          <p className="mt-1.5 text-[11px] text-slate-500 dark:text-white/30">{q.skill || q.category || 'General'}</p>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ══════════ RIGHT COLUMN: Question & Command Center ══════════ */}
          <aside className="flex flex-col gap-3">

            {/* Current question + Actions Card */}
            <div className="flex flex-col overflow-hidden rounded-2xl border border-violet-500/20 bg-white shadow-sm dark:border-violet-500/15 dark:bg-gradient-to-br dark:from-[#11133a] dark:via-[#0e1028] dark:to-[#0c0d1a]">
              <div className="relative flex-1 p-4">
                <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full opacity-10 blur-2xl dark:opacity-20"
                  style={{ background: 'radial-gradient(ellipse, #8b5cf6, transparent)' }} />

                <div className="mb-4 flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-500/15">
                    <Target size={13} className="text-violet-600 dark:text-violet-400" />
                  </div>
                  <p className="text-[11px] font-bold uppercase tracking-widest text-violet-700 dark:text-violet-400">Current Question</p>
                  <span className="ml-auto inline-flex items-center gap-1 rounded-full border border-violet-500/20 bg-violet-50 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-violet-700 dark:border-violet-400/25 dark:bg-violet-500/10 dark:text-violet-300">
                    <Sparkles size={9} /> AI GEN
                  </span>
                </div>

                {question?.skill && (
                  <span className="mb-3 inline-block rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 text-[10px] text-slate-600 dark:border-white/[0.07] dark:bg-white/[0.03] dark:text-white/30">{question.skill}</span>
                )}

                <p className="text-[15px] font-semibold leading-relaxed text-slate-900 dark:text-white">
                  {question?.question || 'Generate the first AI-adaptive question when you are ready.'}
                </p>

                {question?.reason && (
                  <p className="mt-4 text-[12px] leading-relaxed text-slate-600 dark:text-white/35">💡 {question.reason}</p>
                )}

                {expPoints.length > 0 && (
                  <details className="mt-4 rounded-xl border border-slate-200 bg-slate-50/70 p-3 dark:border-white/[0.07] dark:bg-white/[0.02]">
                    <summary className="cursor-pointer text-[12px] font-bold text-slate-700 transition-colors hover:text-slate-900 dark:text-white/40 dark:hover:text-white">
                      Expected points ({expPoints.length})
                    </summary>
                    <ul className="mt-3 space-y-2">
                      {expPoints.map((p, i) => (
                        <li key={p} className="flex items-start gap-2 text-[12px] text-slate-700 dark:text-white/40">
                          <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-violet-100 text-[8px] font-bold text-violet-700 dark:bg-violet-500/15 dark:text-violet-400">{i + 1}</span>
                          {p}
                        </li>
                      ))}
                    </ul>
                  </details>
                )}
              </div>

              {/* Action Buttons Row — mutually exclusive, shows active state */}
              <div className="flex flex-wrap gap-2 border-t border-slate-200 bg-slate-50 p-3 dark:border-white/[0.05] dark:bg-black/20">
                {/* Mark Asked — primary, green when active */}
                <button type="button"
                  onClick={() => updateQ('Asked')}
                  disabled={!question || loading === 'Asked' || (question?.status && question.status !== 'Generated')}
                  className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-[12px] font-bold transition
                    ${question?.status === 'Asked'
                      ? 'border border-emerald-500/40 bg-emerald-500 text-white shadow-[0_0_12px_rgba(16,185,129,0.35)] cursor-default'
                      : !question || loading === 'Asked' || (question?.status && question.status !== 'Generated')
                        ? 'border border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed dark:border-white/[0.06] dark:bg-white/[0.02] dark:text-white/20'
                        : 'border border-violet-500/25 bg-violet-600 text-white shadow-[0_0_12px_rgba(139,92,246,0.25)] hover:bg-violet-500'
                    }`}>
                  {loading === 'Asked'
                    ? <span className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    : <CheckCircle2 size={13} />}
                  {question?.status === 'Asked' ? 'Asked ✓' : 'Mark Asked'}
                </button>

                {/* Skip — amber when active */}
                <button type="button"
                  onClick={() => updateQ('Skipped')}
                  disabled={!question || loading === 'Skipped' || (question?.status && question.status !== 'Generated')}
                  className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-[12px] font-bold transition
                    ${question?.status === 'Skipped'
                      ? 'border border-amber-500/40 bg-amber-500/15 text-amber-700 dark:text-amber-400 cursor-default'
                      : !question || loading === 'Skipped' || (question?.status && question.status !== 'Generated')
                        ? 'border border-slate-200 bg-slate-100 text-slate-300 cursor-not-allowed dark:border-white/[0.06] dark:bg-white/[0.02] dark:text-white/15'
                        : 'border border-slate-200 bg-white text-slate-600 hover:border-amber-500/30 hover:bg-amber-50 hover:text-amber-700 dark:border-white/[0.07] dark:bg-white/[0.02] dark:text-white/40 dark:hover:bg-amber-500/[0.08] dark:hover:text-amber-400'
                    }`}>
                  {loading === 'Skipped'
                    ? <span className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    : <SkipForward size={13} />}
                  {question?.status === 'Skipped' ? 'Skipped' : 'Skip'}
                </button>

                {/* Report — red when active */}
                <button type="button"
                  onClick={() => updateQ('Rejected')}
                  disabled={!question || loading === 'Rejected' || (question?.status && question.status !== 'Generated')}
                  className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-[12px] font-bold transition
                    ${question?.status === 'Rejected'
                      ? 'border border-red-500/40 bg-red-500/15 text-red-700 dark:text-red-400 cursor-default'
                      : !question || loading === 'Rejected' || (question?.status && question.status !== 'Generated')
                        ? 'border border-slate-200 bg-slate-100 text-slate-300 cursor-not-allowed dark:border-white/[0.06] dark:bg-white/[0.02] dark:text-white/15'
                        : 'border border-slate-200 bg-white text-slate-600 hover:border-red-500/30 hover:bg-red-50 hover:text-red-700 dark:border-white/[0.07] dark:bg-white/[0.02] dark:text-white/40 dark:hover:bg-red-500/[0.08] dark:hover:text-red-400'
                    }`}>
                  {loading === 'Rejected'
                    ? <span className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    : <ShieldAlert size={13} />}
                  {question?.status === 'Rejected' ? 'Reported' : 'Report'}
                </button>
              </div>
            </div>


          </aside>
        </div>
      )}

      {/* ── POST-SESSION SUMMARY ── */}
      {summary && (
        <div className="relative overflow-hidden rounded-2xl border border-emerald-500/30 bg-emerald-50/50 p-7 shadow-sm dark:border-emerald-500/12 dark:bg-gradient-to-br dark:from-[#071912] dark:to-[#0c0d1a]">
          <div className="pointer-events-none absolute -right-20 -top-20 h-60 w-60 rounded-full opacity-10 blur-3xl dark:opacity-8"
            style={{ background: 'radial-gradient(ellipse, #10b981, transparent)' }} />
          <div className="relative mb-6 flex items-center gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[13px] bg-emerald-100 dark:bg-emerald-500/15">
              <CheckCircle2 size={22} className="text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h2 className="text-[16px] font-bold text-slate-900 dark:text-white">Interview Summary</h2>
              <p className="text-[11px] text-slate-500 dark:text-white/25">AI-generated post-session analysis</p>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {[
              { title: 'Strong Areas', items: summary.strongAreas || [], dot: 'bg-emerald-500' },
              { title: 'Areas for Validation', items: summary.areasRequiringValidation || [], dot: 'bg-amber-500' },
            ].map(({ title, items, dot }) => (
              <div key={title} className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-white/[0.05] dark:bg-white/[0.02]">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-white/25">{title}</p>
                {items.length > 0 ? (
                  <ul className="mt-3 space-y-2">
                    {items.map(i => (
                      <li key={i} className="flex items-start gap-2 text-[12px] text-slate-700 dark:text-white/45">
                        <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${dot}`} />
                        {i}
                      </li>
                    ))}
                  </ul>
                ) : <p className="mt-2 text-[12px] text-slate-400 dark:text-white/15">Not available</p>}
              </div>
            ))}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-white/[0.05] dark:bg-white/[0.02]">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-white/25">AI Recommendation</p>
              <p className="mt-2 text-[13px] font-semibold leading-relaxed text-slate-800 dark:text-white/75">{summary.aiRecommendation}</p>
              {summary.disclaimer && <p className="mt-3 text-[10px] text-slate-400 dark:text-white/20">{summary.disclaimer}</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Sub-components ── */

function Btn({ icon, label, onClick, disabled, loading: isLoading, className = '', style }) {
  return (
    <button type="button" onClick={onClick} disabled={disabled || isLoading}
      className={`inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-[12px] font-bold text-slate-700 transition hover:bg-slate-100 hover:text-slate-900 dark:border-white/[0.07] dark:bg-white/[0.03] dark:text-white/45 dark:hover:bg-white/[0.07] dark:hover:text-white disabled:cursor-not-allowed disabled:opacity-35 ${className}`}
      style={style}>
      {icon}
      {isLoading ? 'Working…' : label}
    </button>
  );
}

function Metric({ label, value, accent }) {
  const styles = {
    emerald: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/[0.06] dark:text-emerald-400',
    violet: 'border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-500/15 dark:bg-violet-500/[0.05] dark:text-violet-300',
    amber: 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/[0.06] dark:text-amber-400',
    neutral: 'border-slate-200 bg-slate-50 text-slate-600 dark:border-white/[0.06] dark:bg-white/[0.02] dark:text-white/30',
  };
  return (
    <div className={`flex flex-col items-center justify-center gap-1.5 rounded-xl border px-3 py-3.5 ${styles[accent] || styles.neutral}`}>
      <p className="text-[9px] font-bold uppercase tracking-widest opacity-60">{label}</p>
      {/* truncate long values so they never wrap */}
      <p className="w-full truncate text-center text-[13px] font-bold">{value}</p>
    </div>
  );
}

function Ring({ label, value }) {
  const v = value == null ? null : Math.max(0, Math.min(100, Number(value)));
  const { ring, text } = scoreStyle(v);
  const deg = v ? v * 3.6 : 0;
  const col = v == null ? 'transparent' : v >= 75 ? '#10b981' : v >= 50 ? '#f59e0b' : '#ef4444';
  return (
    <div className="flex flex-col items-center gap-1.5 rounded-xl border border-slate-200 bg-white p-3 dark:border-white/[0.05] dark:bg-white/[0.02]">
      <div className={`relative flex h-12 w-12 items-center justify-center rounded-full border-2 ${ring}`}
        style={{ background: `conic-gradient(${col} ${deg}deg, transparent 0deg)` }}>
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white dark:bg-[#0c0d1a]">
          <span className={`text-[12px] font-bold tabular-nums ${text}`}>{v ?? '—'}</span>
        </div>
      </div>
      <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 dark:text-white/20">{label}</p>
    </div>
  );
}
