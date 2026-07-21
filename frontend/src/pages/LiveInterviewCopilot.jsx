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
  { value: 'Balanced',   label: 'Balanced'   },
  { value: 'Technical',  label: 'Technical'  },
  { value: 'Behavioral', label: 'Behavioral' },
  { value: 'Adaptive',   label: 'Adaptive'   },
  { value: 'Skill-gap',  label: 'Skill gap'  },
];
const DIFFICULTY_OPTIONS = [
  { value: 'Beginner',     label: 'Beginner'     },
  { value: 'Intermediate', label: 'Intermediate' },
  { value: 'Advanced',     label: 'Advanced'     },
];
const STATUS_BADGE = {
  Asked:    'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
  Skipped:  'border-amber-500/30  bg-amber-500/10  text-amber-400',
  Saved:    'border-violet-500/30  bg-violet-500/10  text-violet-400',
  Rejected: 'border-red-500/30    bg-red-500/10    text-red-400',
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
    .filter(w => w.length > 4 && !['about','because','there','their','would','could','should','candidate'].includes(w))
    .slice(-4).join(' ');

const scoreStyle = (v) => {
  if (v == null) return { ring: 'border-white/10',      text: 'text-white/30',  bar: '' };
  if (v >= 75)   return { ring: 'border-emerald-500/60', text: 'text-emerald-400', bar: 'bg-emerald-500' };
  if (v >= 50)   return { ring: 'border-amber-500/60',   text: 'text-amber-400',   bar: 'bg-amber-500' };
  return           { ring: 'border-red-500/60',        text: 'text-red-400',     bar: 'bg-red-500' };
};

/* ════════════════════════════════════════ COMPONENT ═══════════════════════════ */
export default function LiveInterviewCopilot() {
  const { interviewId } = useParams();
  const navigate        = useNavigate();
  const location        = useLocation();
  const isHM            = location.pathname.startsWith('/hiring-manager');
  const backPath        = isHM ? `/hiring-manager/interviews/${interviewId}` : '/recruiter/interviews';

  const videoRef       = useRef(null);
  const recRef         = useRef(null);
  const streamRef      = useRef(null);
  const meetRef        = useRef(null);
  const shouldListen   = useRef(false);

  const [mode,        setMode]        = useState('Adaptive');
  const [difficulty,  setDifficulty]  = useState('Intermediate');
  const [consent,     setConsent]     = useState(false);
  const [session,     setSession]     = useState(null);
  const [question,    setQuestion]    = useState(null);
  const [notes,       setNotes]       = useState('');
  const [interim,     setInterim]     = useState('');
  const [topic,       setTopic]       = useState('');
  const [insight,     setInsight]     = useState(null);
  const [summary,     setSummary]     = useState(null);
  const [elapsed,     setElapsed]     = useState('00:00');
  const [loading,     setLoading]     = useState('');
  const [error,       setError]       = useState('');
  const [listening,   setListening]   = useState(false);
  const [cameraOn,    setCameraOn]    = useState(false);
  const [capMode,     setCapMode]     = useState('manual');
  const [speechOk,    setSpeechOk]    = useState(Boolean(getSpeech()));
  const [capStatus,   setCapStatus]   = useState('Camera and speech capture are off.');

  const questions   = session?.questions || [];
  const context     = session?.context;
  const askedCount  = questions.filter(q => q.status === 'Asked').length;
  const skippedCount= questions.filter(q => q.status === 'Skipped').length;
  const expPoints   = useMemo(() => question?.expectedPoints || [], [question]);
  const transcript  = [notes, interim].filter(Boolean).join('\n');
  const concern     = insight?.potentialConcern || null;
  const confidence  = insight?.confidence || (listening ? 'Listening…' : 'Waiting…');

  /* ── stop capture ── */
  const stopCapture = useCallback(() => {
    shouldListen.current = false;
    recRef.current?.stop?.();   recRef.current  = null;
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
    r.onend   = () => { if (!shouldListen.current) return; try { r.start(); } catch {} };
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
      const ins = await liveInterviewApi.submitAnswer(session.sessionId, { questionId: question.questionId, interviewerNotes: notes, transcript });
      setInsight(ins);
      setTopic(question.skill || question.category || topic || detectTopic(transcript));
      setNotes(''); setInterim('');
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
    <div className="mx-auto max-w-[1600px] space-y-5">

      {/* ── HEADER ── */}
      <header className="relative overflow-hidden rounded-2xl border border-white/[0.07]"
        style={{ background: 'linear-gradient(135deg, #0c0d1a 0%, #0f1025 50%, #0e0e20 100%)' }}>
        {/* top rainbow bar */}
        <div className="absolute inset-x-0 top-0 h-[2px] rounded-t-2xl"
          style={{ background: 'linear-gradient(90deg, #8b5cf6, #6366f1, #22d3ee, #34d399)' }} />
        {/* glow accents */}
        <div className="pointer-events-none absolute right-12 top-2 h-36 w-64 rounded-full opacity-25 blur-3xl"
          style={{ background: 'radial-gradient(ellipse, #6366f1, transparent)' }} />

        <div className="relative flex flex-col gap-4 px-7 py-5 sm:flex-row sm:items-center sm:justify-between">
          {/* left: back + title */}
          <div className="flex items-start gap-4">
            <button type="button" onClick={() => navigate(backPath)}
              className="mt-0.5 inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.05] px-3 py-2 text-[12px] font-semibold text-white/60 transition hover:bg-white/[0.09] hover:text-white">
              <ArrowLeft size={13} /> Back
            </button>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-400/25 bg-violet-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-violet-300">
                  <BrainCircuit size={10} className="animate-pulse" /> AI Copilot Active
                </span>
                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/25 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-bold text-emerald-400">
                  <Zap size={9} /> Vertex AI
                </span>
              </div>
              <h1 className="mt-2 text-[22px] font-bold tracking-tight text-white">Live Interview Copilot</h1>
              <p className="mt-0.5 text-[12px] text-white/30">
                Real-time AI assistance · question generation · live answer analysis
              </p>
            </div>
          </div>
          {/* right: timer + counts + end */}
          <div className="flex flex-wrap items-center gap-3">
            <div className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2 font-mono text-[15px] font-bold tabular-nums
                ${session && session.status !== 'Ended'
                  ? 'border-emerald-500/30 bg-emerald-500/[0.08] text-emerald-300 shadow-[0_0_16px_rgba(52,211,153,0.12)]'
                  : 'border-white/[0.07] bg-white/[0.03] text-white/30'}`}>
              <Radio size={11} className={session && session.status !== 'Ended' ? 'animate-pulse text-emerald-400' : 'text-white/20'} />
              {elapsed}
            </div>
            {session && (
              <div className="flex items-center gap-2 rounded-xl border border-white/[0.07] bg-white/[0.03] px-4 py-2 text-[12px] font-semibold">
                <span className="text-violet-400">{askedCount}</span>
                <span className="text-white/25">asked</span>
                <span className="text-white/15 mx-0.5">·</span>
                <span className="text-amber-400">{skippedCount}</span>
                <span className="text-white/25">skipped</span>
              </div>
            )}
            <button type="button" onClick={endSession}
              disabled={!session || session.status === 'Ended' || loading === 'end'}
              className="inline-flex items-center gap-2 rounded-xl border border-red-500/35 bg-red-500/12 px-4 py-2 text-[13px] font-bold text-red-400 transition hover:bg-red-500/20 hover:text-red-300 shadow-[0_0_18px_rgba(239,68,68,0.15)] disabled:cursor-not-allowed disabled:opacity-40">
              <PhoneOff size={13} />
              {loading === 'end' ? 'Ending…' : 'End Session'}
            </button>
          </div>
        </div>
      </header>

      {/* ── ERROR ── */}
      {error && (
        <div className="flex items-start gap-3 rounded-2xl border border-red-500/20 bg-red-500/[0.06] px-5 py-4 text-[13px] font-medium text-red-300">
          <AlertTriangle size={15} className="mt-0.5 shrink-0 text-red-400" />
          <span className="flex-1">{error}</span>
          <button type="button" onClick={() => setError('')} className="text-red-400/50 hover:text-red-300"><X size={14} /></button>
        </div>
      )}

      {/* ── PRE-SESSION SETUP ── */}
      {!session ? (
        <div className="relative overflow-hidden rounded-2xl border border-white/[0.07] p-8"
          style={{ background: 'linear-gradient(135deg, #0c0d1a, #0f1025)' }}>
          <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full opacity-10 blur-3xl"
            style={{ background: 'radial-gradient(ellipse, #8b5cf6, transparent)' }} />
          <div className="relative mb-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl shadow-[0_0_30px_rgba(139,92,246,0.5)]"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}>
              <Sparkles size={28} className="text-white" />
            </div>
            <h2 className="text-xl font-bold text-white">Configure AI Interview Assistant</h2>
            <p className="mt-1 text-[13px] text-white/35">Set up question mode, difficulty and consent before starting.</p>
          </div>
          <div className="relative grid items-end gap-4 sm:grid-cols-4">
            <Select label="Question mode" value={mode} onChange={e => setMode(e.target.value)} options={MODE_OPTIONS} />
            <Select label="Difficulty" value={difficulty} onChange={e => setDifficulty(e.target.value)} options={DIFFICULTY_OPTIONS} />
            <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.03] px-4 py-3 transition hover:bg-white/[0.05]">
              <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-colors
                  ${consent ? 'border-violet-500 bg-violet-500' : 'border-white/20'}`}>
                {consent && <CheckCircle2 size={13} className="text-white" />}
              </span>
              <input type="checkbox" className="sr-only" checked={consent} onChange={e => setConsent(e.target.checked)} />
              <div>
                <p className="text-[13px] font-semibold text-white">Consent recorded</p>
                <p className="text-[10px] text-white/30">Candidate agreed to recording</p>
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
        /* ── ACTIVE SESSION: 3-column grid ── */
        <div className="grid gap-5 xl:grid-cols-[280px_minmax(0,1fr)_300px]">

          {/* ══════════ LEFT: CANDIDATE ══════════ */}
          <aside className="space-y-4">
            {/* Candidate card */}
            <div className="overflow-hidden rounded-2xl border border-white/[0.07]"
              style={{ background: 'linear-gradient(160deg, #0f1025 0%, #0c0d1a 100%)' }}>

              {/* Avatar area */}
              <div className="flex flex-col items-center gap-3 px-6 pt-7 pb-5 text-center">
                <div className="relative">
                  <div className="h-[68px] w-[68px] overflow-hidden rounded-[18px] ring-2 ring-white/10 ring-offset-2 ring-offset-[#0f1025]">
                    <Avatar name={context?.candidateName || 'C'} src={context?.candidatePhotoUrl} size="lg" className="h-full w-full object-cover" />
                  </div>
                  <span className="absolute -bottom-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full border-2 border-[#0f1025] bg-emerald-500">
                    <Radio size={9} className="animate-pulse text-white" />
                  </span>
                </div>
                <div>
                  <h2 className="text-[15px] font-bold text-white">{context?.candidateName || 'Candidate'}</h2>
                  <p className="mt-0.5 text-[12px] text-white/35">{context?.position || 'Position not specified'}</p>
                </div>
              </div>

              {/* Stats grid — fixed equal height cells */}
              <div className="grid grid-cols-2 gap-px border-y border-white/[0.05] bg-white/[0.05]">
                {[
                  ['EXPERIENCE', context?.experienceYears ? `${context.experienceYears} yrs` : '—'],
                  ['STAGE',      context?.interviewStage || 'Interview'],
                  ['DURATION',   `${context?.interviewDurationMinutes || 0} min`],
                  ['PRIOR SCORE',context?.previousInterviewScore ? `${context.previousInterviewScore}/100` : '—'],
                ].map(([label, value]) => (
                  <div key={label} className="flex flex-col items-center justify-center gap-1 bg-[#0c0d1a] px-3 py-4">
                    <p className="text-[9px] font-bold uppercase tracking-widest text-white/25">{label}</p>
                    <p className="text-center text-[13px] font-bold leading-tight text-white/80">{value}</p>
                  </div>
                ))}
              </div>

              {/* Skills + CV */}
              <div className="space-y-5 px-5 py-5">
                {context?.candidateSkills?.length > 0 && (
                  <div>
                    <p className="mb-2.5 text-[9px] font-bold uppercase tracking-widest text-white/25">Candidate Skills</p>
                    <div className="flex flex-wrap gap-1.5">
                      {context.candidateSkills.map(s => (
                        <span key={s} className="rounded-full border border-violet-500/20 bg-violet-500/[0.08] px-2.5 py-1 text-[11px] font-semibold text-violet-300">{s}</span>
                      ))}
                    </div>
                  </div>
                )}
                {context?.requiredJobSkills?.length > 0 && (
                  <div>
                    <p className="mb-2.5 text-[9px] font-bold uppercase tracking-widest text-white/25">Required Skills</p>
                    <div className="flex flex-wrap gap-1.5">
                      {context.requiredJobSkills.map(s => (
                        <span key={s} className="rounded-full border border-cyan-500/20 bg-cyan-500/[0.08] px-2.5 py-1 text-[11px] font-semibold text-cyan-300">{s}</span>
                      ))}
                    </div>
                  </div>
                )}
                {context?.cvSummary && (
                  <div>
                    <p className="mb-2 text-[9px] font-bold uppercase tracking-widest text-white/25">CV Summary</p>
                    <p className="text-[12px] leading-relaxed text-white/40">{context.cvSummary}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Meeting link */}
            {context?.meetingLink && (
              <button type="button" onClick={joinMeeting}
                className="group flex w-full items-center justify-between gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.02] px-4 py-3.5 text-left transition hover:border-violet-500/20 hover:bg-violet-500/[0.05]">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-violet-500/15">
                    <Video size={14} className="text-violet-400" />
                  </div>
                  <div>
                    <p className="text-[12px] font-bold text-white/70">Meeting Link</p>
                    <p className="text-[10px] text-white/25">Open in new tab</p>
                  </div>
                </div>
                <ChevronRight size={14} className="text-white/25 transition-transform group-hover:translate-x-0.5" />
              </button>
            )}
          </aside>

          {/* ══════════ CENTER: WORKSPACE ══════════ */}
          <div className="min-w-0 space-y-4">

            {/* ── Capture toolbar ── */}
            <div className="flex flex-wrap items-center gap-2.5 rounded-2xl border border-white/[0.07] bg-[#0c0d1a] px-5 py-3.5">
              <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-white/20 mr-1">
                <Camera size={10} /> Capture
              </span>
              <button type="button" onClick={startMeetCapture}
                className="inline-flex items-center gap-1.5 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3.5 py-2 text-[12px] font-semibold text-white/50 transition hover:bg-white/[0.07] hover:text-white">
                <MonitorUp size={12} /> Capture Meeting Tab
              </button>
              <button type="button" onClick={listening ? stopCapture : startCapture}
                className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-[12px] font-bold transition
                    ${listening
                      ? 'border border-red-500/25 bg-red-500/12 text-red-400 hover:bg-red-500/20'
                      : 'text-white shadow-[0_0_14px_rgba(139,92,246,0.25)]'}`}
                style={!listening ? { background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' } : undefined}>
                {listening ? <MicOff size={12} /> : <Mic size={12} />}
                {listening ? 'Stop Capture' : 'My Camera + Mic'}
              </button>
              <div className="ml-auto flex items-center gap-2.5 text-[11px] text-white/25">
                <span className={`flex items-center gap-1 ${listening ? 'text-emerald-400' : ''}`}>
                  <Radio size={10} className={listening ? 'animate-pulse' : ''} />
                  {capMode === 'meeting' ? 'Meeting tab' : listening ? 'Mic active' : 'Manual'}
                </span>
                <span>·&nbsp;{speechOk ? 'Speech ready' : 'Speech unsupported'}</span>
              </div>
            </div>

            {/* ── Video preview + Current Question ── */}
            <div className="grid gap-4 md:grid-cols-[200px_minmax(0,1fr)]">
              {/* Camera */}
              <div className="overflow-hidden rounded-2xl border border-white/[0.07] bg-black">
                <div className="relative w-full" style={{ aspectRatio: '16/9' }}>
                  <video ref={videoRef} autoPlay muted playsInline className="h-full w-full object-cover" />
                  {!cameraOn && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[#080a12]">
                      <Camera size={22} className="text-white/10" />
                      <p className="text-[11px] text-white/15">Preview off</p>
                    </div>
                  )}
                  {listening && (
                    <span className="absolute bottom-2 left-2 flex items-center gap-1 rounded-full border border-emerald-500/30 bg-black/80 px-2 py-0.5 text-[9px] font-bold text-emerald-400">
                      <Radio size={7} className="animate-pulse" /> LIVE
                    </span>
                  )}
                </div>
                <div className="px-3 py-2 text-[10px] leading-snug text-white/20">{capStatus}</div>
              </div>

              {/* Current question */}
              <div className="relative overflow-hidden rounded-2xl border border-violet-500/15 p-5"
                style={{ background: 'linear-gradient(135deg, #11133a 0%, #0e1028 60%, #0c0d1a 100%)' }}>
                <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full opacity-20 blur-2xl"
                  style={{ background: 'radial-gradient(ellipse, #8b5cf6, transparent)' }} />
                <div className="relative h-full flex flex-col">
                  <div className="mb-3 flex items-center gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-violet-500/15">
                      <Target size={11} className="text-violet-400" />
                    </div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-violet-400">Current Question</p>
                    <span className="inline-flex items-center gap-1 rounded-full border border-violet-400/25 bg-violet-500/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-violet-300">
                      <Sparkles size={9} /> AI GENERATED RESPONSE
                    </span>
                    {question?.skill && (
                      <span className="ml-auto rounded-full border border-white/[0.07] bg-white/[0.03] px-2.5 py-0.5 text-[10px] text-white/30">{question.skill}</span>
                    )}
                  </div>
                  <p className="flex-1 text-[14px] font-semibold leading-relaxed text-white">
                    {question?.question || 'Generate the first AI-adaptive question when you are ready.'}
                  </p>
                  {question?.reason && (
                    <p className="mt-3 text-[11px] leading-relaxed text-white/30">💡 {question.reason}</p>
                  )}
                  {expPoints.length > 0 && (
                    <details className="mt-3 rounded-xl border border-white/[0.07] bg-white/[0.02] p-3">
                      <summary className="cursor-pointer text-[11px] font-bold text-white/40 hover:text-white transition-colors">
                        Expected points ({expPoints.length})
                      </summary>
                      <ul className="mt-2.5 space-y-1.5">
                        {expPoints.map((p, i) => (
                          <li key={p} className="flex items-start gap-2 text-[11px] text-white/35">
                            <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-violet-500/15 text-[8px] font-bold text-violet-400">{i + 1}</span>
                            {p}
                          </li>
                        ))}
                      </ul>
                    </details>
                  )}
                </div>
              </div>
            </div>

            {/* ── Transcript ── */}
            <div className="overflow-hidden rounded-2xl border border-white/[0.07] bg-[#0c0d1a]">
              <div className="flex items-center justify-between gap-3 border-b border-white/[0.05] px-5 py-3.5">
                <div className="flex items-center gap-2">
                  <Captions size={13} className="text-white/25" />
                  <p className="text-[13px] font-bold text-white">Candidate Answer Transcript</p>
                </div>
                <button type="button" onClick={() => { setNotes(''); setInterim(''); }}
                  className="rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-[11px] font-semibold text-white/35 transition hover:bg-white/[0.07] hover:text-white">
                  Clear
                </button>
              </div>
              {interim && (
                <p className="animate-pulse border-b border-white/[0.04] px-5 py-2.5 text-[12px] italic text-violet-300/50">{interim}</p>
              )}
              <Textarea label="" rows={6} value={transcript}
                onChange={e => { setNotes(e.target.value); setInterim(''); }}
                placeholder="For a remote interview, capture the meeting tab with audio enabled, paste the transcript, or type the candidate's answer before AI analysis."
                className="resize-none rounded-none border-0 bg-transparent font-mono text-[12px] focus:ring-0" />
            </div>

            {/* ── Action buttons ── */}
            <div className="flex flex-wrap gap-2.5">
              <Btn onClick={() => updateQ('Asked')} disabled={!question} loading={loading === 'Asked'}
                className="bg-violet-600 text-white hover:bg-violet-500 shadow-[0_0_12px_rgba(139,92,246,0.25)]"
                icon={<CheckCircle2 size={13} />} label="Mark Asked" />
              <Btn onClick={analyze} disabled={!session || !question} loading={loading === 'answer'}
                style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}
                icon={<Sparkles size={13} />} label="Analyze Live Answer" />
              <Btn onClick={() => updateQ('Skipped')} disabled={!question} icon={<SkipForward size={13} />} label="Skip" />
              <Btn onClick={() => updateQ('Saved')}   disabled={!question} icon={<Save size={13} />}        label="Save" />
              <Btn onClick={() => updateQ('Rejected')} disabled={!question} icon={<ShieldAlert size={13} />} label="Report" />
            </div>

            {/* ── Question history ── */}
            <div className="overflow-hidden rounded-2xl border border-white/[0.07] bg-[#0c0d1a]">
              <div className="flex items-center justify-between border-b border-white/[0.05] px-5 py-3.5">
                <p className="text-[13px] font-bold text-white">Question History</p>
                <span className="rounded-full border border-white/[0.07] bg-white/[0.03] px-2.5 py-1 text-[10px] font-semibold text-white/25">
                  {questions.length} generated
                </span>
              </div>
              <div className="max-h-52 space-y-1.5 overflow-y-auto p-3">
                {questions.length === 0 ? (
                  <p className="py-7 text-center text-[12px] text-white/15">No questions generated yet.</p>
                ) : questions.map(q => {
                  const active = q.questionId === question?.questionId;
                  return (
                    <button key={q.questionId} type="button" onClick={() => setQuestion(q)}
                      className={`w-full rounded-xl border p-3.5 text-left transition-all
                          ${active ? 'border-violet-500/25 bg-violet-500/[0.07]' : 'border-white/[0.04] bg-white/[0.02] hover:border-white/[0.08] hover:bg-white/[0.04]'}`}>
                      <div className="flex items-start justify-between gap-3">
                        <p className="line-clamp-2 text-[12px] font-medium text-white/65">{q.question}</p>
                        <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[9px] font-bold ${STATUS_BADGE[q.status] || 'border-white/10 bg-white/5 text-white/30'}`}>
                          {q.status || 'Pending'}
                        </span>
                      </div>
                      <p className="mt-1 text-[10px] text-white/20">{q.skill || q.category || 'General'}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ══════════ RIGHT: AI COMMAND CENTER ══════════ */}
          <aside className="space-y-4">

            {/* Command Center card */}
            <div className="overflow-hidden rounded-2xl border border-violet-500/12"
              style={{ background: 'linear-gradient(160deg, #110f2a 0%, #0e0f1f 60%, #0c0d1a 100%)' }}>

              {/* glow */}
              <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full opacity-10 blur-3xl"
                style={{ background: 'radial-gradient(ellipse, #8b5cf6, transparent)' }} />

              {/* header row */}
              <div className="flex items-center gap-3 border-b border-white/[0.05] px-5 py-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[11px] shadow-[0_0_14px_rgba(139,92,246,0.4)]"
                  style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}>
                  <BrainCircuit size={17} className="text-white" />
                </div>
                <div>
                  <p className="text-[14px] font-bold text-white">AI Command Center</p>
                  <p className="text-[11px] text-violet-400/60">Real-time intelligence</p>
                </div>
              </div>

              <div className="space-y-4 p-5">
                {/* 2×2 metrics — fixed height, no text wrap */}
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: 'MIC',        value: listening ? 'Live' : 'Off', accent: listening ? 'emerald' : 'neutral' },
                    { label: 'CONFIDENCE', value: confidence,                  accent: 'violet'  },
                    { label: 'ASKED',      value: askedCount,                  accent: 'violet'  },
                    { label: 'SKIPPED',    value: skippedCount,                accent: 'amber'   },
                  ].map(({ label, value, accent }) => (
                    <Metric key={label} label={label} value={String(value)} accent={accent} />
                  ))}
                </div>

                {/* Score rings */}
                {insight && (
                  <div className="grid grid-cols-3 gap-2">
                    <Ring label="Relevant" value={insight.relevanceScore} />
                    <Ring label="Depth"    value={insight.depthScore}     />
                    <Ring label="Clarity"  value={insight.clarityScore}   />
                  </div>
                )}

                {/* Concern */}
                {concern && (
                  <div className="rounded-xl border border-red-500/12 bg-red-500/[0.05] p-3.5">
                    <p className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest text-red-400">
                      <AlertTriangle size={9} /> Potential Concern
                    </p>
                    <p className="mt-2 text-[12px] leading-relaxed text-white/45">{concern}</p>
                  </div>
                )}

                {/* Follow-up suggestion */}
                {insight?.suggestedFollowUpQuestion && (
                  <button type="button" onClick={() => generate('Ask Follow-up')}
                    className="w-full rounded-xl border border-cyan-500/12 bg-cyan-500/[0.04] p-3.5 text-left transition hover:border-cyan-500/25 hover:bg-cyan-500/[0.07]">
                    <p className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest text-cyan-400">
                      <TrendingUp size={9} /> Suggested Follow-up
                    </p>
                    <p className="mt-2 text-[12px] font-semibold leading-snug text-white/65">{insight.suggestedFollowUpQuestion}</p>
                    <p className="mt-2 text-[10px] text-cyan-400/40">Click to use this question →</p>
                  </button>
                )}

                {/* Topic input */}
                <Textarea label="Detected topic / hint" rows={2} value={topic}
                  onChange={e => setTopic(e.target.value)}
                  placeholder="Auto-detected from speech, or type a topic…"
                  className="text-[12px]" />
              </div>
            </div>

            {/* Question controls */}
            <div className="overflow-hidden rounded-2xl border border-white/[0.07] bg-[#0c0d1a] p-5">
              <p className="mb-3.5 text-[9px] font-bold uppercase tracking-widest text-white/20">Question Controls</p>
              <div className="space-y-2.5">
                <button type="button" onClick={() => generate('Generate')} disabled={loading === 'Generate'}
                  className="flex w-full items-center justify-center gap-2 rounded-xl py-3 text-[13px] font-bold text-white shadow-[0_0_16px_rgba(139,92,246,0.25)] transition hover:opacity-90 disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}>
                  <Sparkles size={14} />
                  {loading === 'Generate' ? 'Generating…' : 'Generate Next Question'}
                </button>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { icon: <Gauge size={12} />,         label: 'Easier',     action: 'Make Easier'  },
                    { icon: <Gauge size={12} />,         label: 'Harder',     action: 'Make Harder'  },
                    { icon: <MessageSquare size={12} />, label: 'Follow-up',  action: 'Ask Follow-up' },
                    { icon: <FileText size={12} />,      label: 'New Topic',  action: 'Change Topic' },
                  ].map(({ icon, label, action }) => (
                    <button key={action} type="button" onClick={() => generate(action)}
                      disabled={loading === action}
                      className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-white/[0.07] bg-white/[0.02] py-2.5 text-[12px] font-bold text-white/45 transition hover:bg-white/[0.06] hover:text-white disabled:opacity-40">
                      {icon}
                      {loading === action ? '…' : label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </aside>
        </div>
      )}

      {/* ── POST-SESSION SUMMARY ── */}
      {summary && (
        <div className="relative overflow-hidden rounded-2xl border border-emerald-500/12 p-7"
          style={{ background: 'linear-gradient(135deg, #071912 0%, #0c0d1a 100%)' }}>
          <div className="pointer-events-none absolute -right-20 -top-20 h-60 w-60 rounded-full opacity-8 blur-3xl"
            style={{ background: 'radial-gradient(ellipse, #10b981, transparent)' }} />
          <div className="relative mb-6 flex items-center gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[13px] bg-emerald-500/15">
              <CheckCircle2 size={22} className="text-emerald-400" />
            </div>
            <div>
              <h2 className="text-[16px] font-bold text-white">Interview Summary</h2>
              <p className="text-[11px] text-white/25">AI-generated post-session analysis</p>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {[
              { title: 'Strong Areas',         items: summary.strongAreas || [],                dot: 'bg-emerald-500' },
              { title: 'Areas for Validation', items: summary.areasRequiringValidation || [],   dot: 'bg-amber-500'   },
            ].map(({ title, items, dot }) => (
              <div key={title} className="rounded-2xl border border-white/[0.05] bg-white/[0.02] p-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/25">{title}</p>
                {items.length > 0 ? (
                  <ul className="mt-3 space-y-2">
                    {items.map(i => (
                      <li key={i} className="flex items-start gap-2 text-[12px] text-white/45">
                        <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${dot}`} />
                        {i}
                      </li>
                    ))}
                  </ul>
                ) : <p className="mt-2 text-[12px] text-white/15">Not available</p>}
              </div>
            ))}
            <div className="rounded-2xl border border-white/[0.05] bg-white/[0.02] p-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/25">AI Recommendation</p>
              <p className="mt-2 text-[13px] font-semibold leading-relaxed text-white/75">{summary.aiRecommendation}</p>
              {summary.disclaimer && <p className="mt-3 text-[10px] text-white/20">{summary.disclaimer}</p>}
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
      className={`inline-flex items-center gap-2 rounded-xl border border-white/[0.07] bg-white/[0.03] px-3.5 py-2.5 text-[12px] font-bold text-white/45 transition hover:bg-white/[0.07] hover:text-white disabled:cursor-not-allowed disabled:opacity-35 ${className}`}
      style={style}>
      {icon}
      {isLoading ? 'Working…' : label}
    </button>
  );
}

function Metric({ label, value, accent }) {
  const styles = {
    emerald: 'border-emerald-500/20 bg-emerald-500/[0.06] text-emerald-400',
    violet:  'border-violet-500/15  bg-violet-500/[0.05]  text-violet-300',
    amber:   'border-amber-500/20   bg-amber-500/[0.06]   text-amber-400',
    neutral: 'border-white/[0.06]  bg-white/[0.02]       text-white/30',
  };
  return (
    <div className={`flex flex-col items-center justify-center gap-1.5 rounded-xl border px-3 py-3.5 ${styles[accent] || styles.neutral}`}>
      <p className="text-[9px] font-bold uppercase tracking-widest opacity-50">{label}</p>
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
    <div className="flex flex-col items-center gap-1.5 rounded-xl border border-white/[0.05] bg-white/[0.02] p-3">
      <div className={`relative flex h-12 w-12 items-center justify-center rounded-full border-2 ${ring}`}
        style={{ background: `conic-gradient(${col} ${deg}deg, transparent 0deg)` }}>
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0c0d1a]">
          <span className={`text-[12px] font-bold tabular-nums ${text}`}>{v ?? '—'}</span>
        </div>
      </div>
      <p className="text-[9px] font-bold uppercase tracking-widest text-white/20">{label}</p>
    </div>
  );
}
