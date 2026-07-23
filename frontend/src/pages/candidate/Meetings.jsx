import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Briefcase,
  CalendarClock,
  CheckCircle2,
  Clock,
  ExternalLink,
  MapPin,
  MessageSquare,
  Sparkles,
  Timer,
  UserRound,
  Video,
  XCircle,
} from 'lucide-react';
import { Badge, EmptyState, Skeleton, StatusBadge } from '../../components/ui';
import { getMyInterviews } from './services/candidateApi';

/* ───────────── helpers ───────────── */

const activeStatuses = new Set(['Scheduled', 'Confirmed', 'Rescheduled']);

const formatDateTime = (value) => {
  if (!value) return 'Time not set';
  return new Intl.DateTimeFormat(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value));
};

const formatDate = (value) => {
  if (!value) return '';
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value));
};

const formatCountdown = (ms) => {
  if (ms <= 0) return { h: '00', m: '00', s: '00', past: true };
  const totalSecs = Math.floor(ms / 1000);
  const h = Math.floor(totalSecs / 3600);
  const m = Math.floor((totalSecs % 3600) / 60);
  const s = totalSecs % 60;
  return {
    h: String(h).padStart(2, '0'),
    m: String(m).padStart(2, '0'),
    s: String(s).padStart(2, '0'),
    past: false,
    days: Math.floor(h / 24),
  };
};

const isActiveMeeting = (m) => activeStatuses.has(m.status);

const getMeetingTime = (m) => {
  const v = new Date(m.scheduledTime).getTime();
  return Number.isFinite(v) ? v : Number.MAX_SAFE_INTEGER;
};

const dayLabel = (scheduledTime) => {
  if (!scheduledTime) return { top: '?', mid: '—', bot: '' };
  const d = new Date(scheduledTime);
  return {
    top: d.toLocaleDateString(undefined, { weekday: 'short' }).toUpperCase(),
    mid: d.getDate(),
    bot: d.toLocaleDateString(undefined, { month: 'short' }),
  };
};

/* ───────────── CountdownBlock ───────────── */

function CountdownBlock({ scheduledTime }) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const target = new Date(scheduledTime).getTime();
  const diff = target - now;
  const { h, m, s, past, days } = formatCountdown(diff);

  if (past) return null;
  if (days >= 7) return null; // only show within a week

  return (
    <div className="mt-5 flex items-center gap-2">
      <Timer size={14} className="text-primary-500 dark:text-primary-300 shrink-0" />
      <span className="text-caption font-semibold uppercase tracking-wide text-secondary-500 dark:text-secondary-400">
        Starts in
      </span>
      <div className="flex items-center gap-1">
        {days > 0 ? (
          <span className="rounded-lg bg-primary-50 px-2 py-0.5 text-body-sm font-bold tabular-nums text-primary-700 dark:bg-primary-500/15 dark:text-primary-300">
            {days}d {h}h
          </span>
        ) : (
          <>
            {[h, m, s].map((unit, i) => (
              <span key={i} className="flex items-center gap-0.5">
                <span className="min-w-[2.2rem] rounded-lg bg-primary-50 px-2 py-0.5 text-center text-body-sm font-bold tabular-nums text-primary-700 dark:bg-primary-500/15 dark:text-primary-300">
                  {unit}
                </span>
                {i < 2 && <span className="text-secondary-400 font-bold">:</span>}
              </span>
            ))}
          </>
        )}
      </div>
    </div>
  );
}

/* ───────────── Detail tile ───────────── */

function Detail({ icon: Icon, label, value, accent = false }) {
  return (
    <div
      className={[
        'flex items-start gap-3 rounded-2xl p-4 transition-colors duration-200',
        accent
          ? 'border border-primary-200/60 bg-primary-50/80 dark:border-primary-500/20 dark:bg-primary-500/10'
          : 'border border-secondary-100 bg-white/70 dark:border-white/10 dark:bg-white/[0.04]',
      ].join(' ')}
    >
      <span
        className={[
          'mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl',
          accent
            ? 'bg-primary-100 text-primary-600 dark:bg-primary-500/20 dark:text-primary-300'
            : 'bg-secondary-100 text-secondary-500 dark:bg-white/10 dark:text-secondary-300',
        ].join(' ')}
      >
        <Icon size={15} strokeWidth={1.75} />
      </span>
      <span className="min-w-0">
        <span className="block text-[10px] font-bold uppercase tracking-widest text-secondary-400 dark:text-secondary-500">
          {label}
        </span>
        <span className="mt-0.5 block break-words text-body-sm font-semibold leading-snug text-secondary-800 dark:text-secondary-100">
          {value}
        </span>
      </span>
    </div>
  );
}

/* ───────────── FeaturedMeetingCard ───────────── */

function FeaturedMeetingCard({ meeting }) {
  const hasMeetingLink = Boolean(meeting.meetingLink);
  const { top, mid, bot } = dayLabel(meeting.scheduledTime);

  return (
    <article className="relative overflow-hidden rounded-3xl border border-white/70 bg-white/90 shadow-glass backdrop-blur-2xl transition-all duration-300 hover:shadow-xl dark:border-white/10 dark:bg-secondary-950/70">
      {/* top accent bar */}
      <div className="h-1.5 w-full bg-gradient-to-r from-primary-500 via-violet-500 to-ai-500" />

      {/* ambient glow */}
      <div className="pointer-events-none absolute -right-32 -top-32 h-64 w-64 rounded-full bg-primary-400/15 blur-3xl dark:bg-primary-500/10" />
      <div className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-violet-400/10 blur-3xl" />

      <div className="relative grid gap-6 p-6 sm:p-7 xl:grid-cols-[minmax(0,1fr)_180px]">
        {/* ── Left ── */}
        <div className="min-w-0">
          {/* header row */}
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="ai" size="sm" icon={<CalendarClock size={12} strokeWidth={1.75} />}>
                {meeting.interviewType || 'Interview'}
              </Badge>
              <StatusBadge status={meeting.status?.toLowerCase().replace(/ /g, '_')} />
            </div>
            {/* calendar chip */}
            <div className="flex items-center gap-2 rounded-2xl border border-secondary-100 bg-secondary-50 px-3 py-2 dark:border-white/10 dark:bg-white/[0.05]">
              <div className="flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-xl bg-primary-500 text-white shadow-glow-primary">
                <span className="text-[9px] font-bold uppercase leading-none tracking-widest opacity-80">{top}</span>
                <span className="text-lg font-extrabold leading-tight">{mid}</span>
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-secondary-400">{bot}</p>
                <p className="text-caption font-semibold text-secondary-700 dark:text-secondary-200">
                  {new Date(meeting.scheduledTime).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          </div>

          <h3 className="text-h2 font-extrabold leading-tight text-secondary-900 dark:text-white">
            {meeting.jobTitle}
          </h3>
          <p className="mt-1 text-body-sm text-secondary-500 dark:text-secondary-400">
            {meeting.companyName || 'Hiring team'}
            {meeting.departmentName ? ` · ${meeting.departmentName}` : ''}
          </p>

          <CountdownBlock scheduledTime={meeting.scheduledTime} />

          {/* detail grid */}
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            <Detail icon={Clock} label="When" value={formatDateTime(meeting.scheduledTime)} accent />
            <Detail icon={Video} label="Duration" value={`${meeting.durationMinutes || 0} minutes`} />
            <Detail icon={UserRound} label="Interviewer" value={meeting.interviewerName || 'Hiring team'} />
            <Detail icon={MapPin} label="Location" value={hasMeetingLink ? 'Online meeting' : 'To be confirmed'} />
          </div>

          {/* preparation note */}
          {meeting.notes && (
            <div className="mt-5 flex gap-3 rounded-2xl border border-amber-200/60 bg-amber-50/70 p-4 dark:border-amber-500/20 dark:bg-amber-500/10">
              <Sparkles size={16} className="mt-0.5 shrink-0 text-amber-500" />
              <div>
                <p className="text-caption font-bold uppercase tracking-widest text-amber-700 dark:text-amber-300">
                  Preparation note
                </p>
                <p className="mt-1 text-body-sm leading-relaxed text-secondary-700 dark:text-secondary-200">
                  {meeting.notes}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* ── Right CTA column ── */}
        <div className="flex shrink-0 flex-row gap-3 sm:flex-row xl:flex-col xl:justify-start xl:pt-16">
          {hasMeetingLink ? (
            <a
              href={meeting.meetingLink}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-12 w-full items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-primary-600 to-violet-600 px-5 text-body-sm font-bold text-white shadow-glow-primary transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl"
            >
              <ExternalLink size={16} />
              Join Meeting
            </a>
          ) : (
            <button
              type="button"
              disabled
              className="inline-flex h-12 w-full cursor-not-allowed items-center justify-center gap-2.5 rounded-2xl border border-secondary-200 px-5 text-body-sm font-bold text-secondary-400 opacity-60 dark:border-white/10"
            >
              <ExternalLink size={16} />
              Join Meeting
            </button>
          )}
          <Link
            to={`/candidate/applications/${meeting.applicationId}`}
            className="inline-flex h-12 w-full items-center justify-center gap-2.5 rounded-2xl border border-secondary-200 bg-white/50 px-5 text-body-sm font-bold text-secondary-700 transition-all duration-200 hover:-translate-y-0.5 hover:border-secondary-300 hover:bg-secondary-50 hover:shadow-md dark:border-white/15 dark:bg-white/[0.03] dark:text-secondary-200 dark:hover:bg-white/10"
          >
            <MessageSquare size={16} />
            Application
          </Link>
        </div>
      </div>
    </article>
  );
}

/* ───────────── Compact MeetingCard (scheduled grid) ───────────── */

function MeetingCard({ meeting }) {
  const hasMeetingLink = Boolean(meeting.meetingLink);
  const { top, mid, bot } = dayLabel(meeting.scheduledTime);

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-3xl border border-white/70 bg-white/90 shadow-glass backdrop-blur-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-white/10 dark:bg-secondary-950/70">
      <div className="h-1 w-full bg-gradient-to-r from-primary-500 via-ai-500 to-indigo-500" />
      <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-primary-400/10 blur-3xl dark:bg-primary-500/10" />

      <div className="relative flex flex-1 flex-col p-5">
        {/* top row */}
        <div className="flex items-start justify-between gap-3">
          {/* calendar blob */}
          <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-violet-600 text-white shadow-glow-primary">
            <span className="text-[8px] font-bold uppercase leading-none tracking-widest opacity-80">{top}</span>
            <span className="text-xl font-extrabold leading-tight">{mid}</span>
            <span className="text-[8px] font-semibold uppercase leading-none opacity-70">{bot}</span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <StatusBadge status={meeting.status?.toLowerCase().replace(/ /g, '_')} />
          </div>
        </div>

        {/* meta */}
        <div className="mt-4">
          <Badge variant="ai" size="sm" icon={<CalendarClock size={11} strokeWidth={1.75} />} className="mb-2">
            {meeting.interviewType || 'Interview'}
          </Badge>
          <h3 className="truncate text-body-lg font-bold text-secondary-900 dark:text-white">
            {meeting.jobTitle}
          </h3>
          <p className="mt-0.5 truncate text-caption text-secondary-500 dark:text-secondary-400">
            {meeting.companyName || 'Hiring team'}
            {meeting.departmentName ? ` · ${meeting.departmentName}` : ''}
          </p>
        </div>

        {/* detail row */}
        <div className="mt-4 grid grid-cols-2 gap-2">
          <div className="flex items-center gap-2 rounded-xl border border-secondary-100 bg-secondary-50/70 px-3 py-2 dark:border-white/10 dark:bg-white/[0.04]">
            <Clock size={12} className="shrink-0 text-secondary-400" />
            <span className="truncate text-caption font-semibold text-secondary-700 dark:text-secondary-200">
              {meeting.scheduledTime
                ? new Date(meeting.scheduledTime).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
                : '—'}
            </span>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-secondary-100 bg-secondary-50/70 px-3 py-2 dark:border-white/10 dark:bg-white/[0.04]">
            <Video size={12} className="shrink-0 text-secondary-400" />
            <span className="truncate text-caption font-semibold text-secondary-700 dark:text-secondary-200">
              {meeting.durationMinutes || 0} min
            </span>
          </div>
          <div className="col-span-2 flex items-center gap-2 rounded-xl border border-secondary-100 bg-secondary-50/70 px-3 py-2 dark:border-white/10 dark:bg-white/[0.04]">
            <UserRound size={12} className="shrink-0 text-secondary-400" />
            <span className="truncate text-caption font-semibold text-secondary-700 dark:text-secondary-200">
              {meeting.interviewerName || 'Hiring team'}
            </span>
          </div>
        </div>

        <CountdownBlock scheduledTime={meeting.scheduledTime} />

        {/* spacer */}
        <div className="flex-1" />

        {/* CTA buttons */}
        <div className="mt-5 flex gap-2">
          {hasMeetingLink ? (
            <a
              href={meeting.meetingLink}
              target="_blank"
              rel="noreferrer"
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary-600 to-violet-600 py-2.5 text-caption font-bold text-white shadow-glow-primary transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
            >
              <ExternalLink size={13} />
              Join
            </a>
          ) : (
            <button
              type="button"
              disabled
              className="inline-flex flex-1 cursor-not-allowed items-center justify-center gap-2 rounded-xl border border-secondary-200 py-2.5 text-caption font-bold text-secondary-400 opacity-60 dark:border-white/10"
            >
              <ExternalLink size={13} />
              Join
            </button>
          )}
          <Link
            to={`/candidate/applications/${meeting.applicationId}`}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-secondary-200 bg-white/50 py-2.5 text-caption font-bold text-secondary-700 transition-all duration-200 hover:border-secondary-300 hover:bg-secondary-50 dark:border-white/15 dark:bg-white/[0.03] dark:text-secondary-200 dark:hover:bg-white/10"
          >
            <MessageSquare size={13} />
            App
          </Link>
        </div>
      </div>
    </article>
  );
}

/* ───────────── Past meeting row ───────────── */

function PastRow({ meeting }) {
  const isPast = new Date(meeting.scheduledTime).getTime() < Date.now();
  const isCompleted = meeting.status?.toLowerCase() === 'completed';
  const isCancelled = ['cancelled', 'rejected'].includes(meeting.status?.toLowerCase());

  return (
    <Link
      to={`/candidate/applications/${meeting.applicationId}`}
      className="group flex items-center gap-4 border-b border-secondary-100/70 px-5 py-4 transition-colors last:border-b-0 hover:bg-secondary-50/80 dark:border-white/[0.06] dark:hover:bg-white/[0.04]"
    >
      {/* icon */}
      <span
        className={[
          'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl',
          isCompleted
            ? 'bg-success-50 text-success-600 dark:bg-success-500/15 dark:text-success-400'
            : isCancelled
            ? 'bg-danger-50 text-danger-500 dark:bg-danger-500/15 dark:text-danger-400'
            : 'bg-secondary-100 text-secondary-500 dark:bg-white/10 dark:text-secondary-400',
        ].join(' ')}
      >
        {isCompleted ? (
          <CheckCircle2 size={16} />
        ) : isCancelled ? (
          <XCircle size={16} />
        ) : (
          <Briefcase size={16} />
        )}
      </span>

      {/* text */}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="truncate text-body-sm font-semibold text-secondary-900 dark:text-white">
            {meeting.jobTitle}
          </h3>
          <StatusBadge status={meeting.status?.toLowerCase().replace(/ /g, '_')} />
        </div>
        <p className="mt-0.5 truncate text-caption text-secondary-500 dark:text-secondary-400">
          {formatDateTime(meeting.scheduledTime)}
          {meeting.interviewType ? ` · ${meeting.interviewType}` : ''}
          {meeting.interviewerName ? ` · ${meeting.interviewerName}` : ''}
        </p>
      </div>

      <ArrowRight
        size={15}
        className="shrink-0 text-secondary-400 transition-transform group-hover:translate-x-1 dark:text-secondary-500"
      />
    </Link>
  );
}

/* ───────────── Hero stat pill ───────────── */

function StatPill({ icon: Icon, label, value, highlight = false }) {
  return (
    <div
      className={[
        'flex items-center gap-3 rounded-2xl border px-4 py-3',
        highlight
          ? 'border-primary-200/70 bg-primary-50/80 dark:border-primary-500/20 dark:bg-primary-500/10'
          : 'border-secondary-100/70 bg-white/70 dark:border-white/10 dark:bg-white/[0.04]',
      ].join(' ')}
    >
      <span
        className={[
          'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl',
          highlight
            ? 'bg-primary-100 text-primary-600 dark:bg-primary-500/20 dark:text-primary-300'
            : 'bg-secondary-100 text-secondary-500 dark:bg-white/10 dark:text-secondary-300',
        ].join(' ')}
      >
        <Icon size={16} strokeWidth={1.75} />
      </span>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-secondary-400 dark:text-secondary-500">
          {label}
        </p>
        <p
          className={[
            'text-h3 font-extrabold',
            highlight ? 'text-primary-600 dark:text-primary-300' : 'text-secondary-900 dark:text-white',
          ].join(' ')}
        >
          {value}
        </p>
      </div>
    </div>
  );
}

/* ───────────── Main page ───────────── */

export default function CandidateMeetings() {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    let isActive = true;

    async function loadMeetings() {
      setLoading(true);
      setLoadError('');
      try {
        const data = await getMyInterviews();
        if (!isActive) return;
        setMeetings(data || []);
      } catch (err) {
        console.error('Failed to load candidate meetings:', err);
        if (isActive) setLoadError('We could not load your meetings right now. Please try again.');
      } finally {
        if (isActive) setLoading(false);
      }
    }

    loadMeetings();
    return () => { isActive = false; };
  }, []);

  const { active, other, nextMeeting, completed } = useMemo(() => {
    const now = Date.now();
    const activeMeetings = meetings
      .filter(isActiveMeeting)
      .sort((a, b) => {
        const aTime = getMeetingTime(a);
        const bTime = getMeetingTime(b);
        const aD = aTime >= now ? aTime - now : Number.MAX_SAFE_INTEGER + (now - aTime);
        const bD = bTime >= now ? bTime - now : Number.MAX_SAFE_INTEGER + (now - bTime);
        return aD - bD;
      });
    const otherMeetings = meetings
      .filter((m) => !isActiveMeeting(m))
      .sort((a, b) => getMeetingTime(b) - getMeetingTime(a));
    return {
      active: activeMeetings,
      other: otherMeetings,
      nextMeeting: activeMeetings[0] || null,
      completed: otherMeetings.filter((m) => m.status?.toLowerCase() === 'completed').length,
    };
  }, [meetings]);

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl space-y-6 pb-16">
        <Skeleton height="11rem" />
        <Skeleton height="22rem" />
        <div className="grid gap-4 lg:grid-cols-2">
          <Skeleton height="16rem" />
          <Skeleton height="16rem" />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-16">

      {/* ── Hero header ── */}
      <section className="relative overflow-hidden rounded-3xl border border-white/70 bg-white/85 p-6 shadow-glass backdrop-blur-2xl dark:border-white/10 dark:bg-secondary-950/60 dark:shadow-glass-dark sm:p-8">
        {/* decorative blobs */}
        <div className="pointer-events-none absolute inset-y-0 right-0 w-1/2 bg-gradient-to-l from-primary-100/60 to-transparent dark:from-primary-500/10" />
        <div className="pointer-events-none absolute -top-20 right-20 h-56 w-56 rounded-full bg-violet-400/20 blur-3xl dark:bg-violet-500/10" />
        <div className="pointer-events-none absolute -bottom-12 left-0 h-32 w-48 rounded-full bg-ai-400/15 blur-3xl" />

        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Badge variant="ai" size="sm" icon={<Video size={12} strokeWidth={1.75} />}>
              Interview meetings
            </Badge>
            <h1 className="mt-3 text-h1 font-extrabold text-secondary-900 dark:text-white">
              Meetings
            </h1>
            <p className="mt-2 max-w-lg text-body-sm leading-relaxed text-secondary-600 dark:text-secondary-300">
              Your scheduled interviews, meeting links, interviewers, and preparation notes — all in one place.
            </p>
          </div>

          {/* stat pills */}
          <div className="flex flex-wrap gap-3">
            <StatPill
              icon={CalendarClock}
              label="Scheduled"
              value={active.length}
              highlight={active.length > 0}
            />
            <StatPill
              icon={CheckCircle2}
              label="Completed"
              value={completed}
            />
          </div>
        </div>
      </section>

      {/* ── Error banner ── */}
      {loadError && (
        <div className="rounded-2xl border border-danger-200 bg-danger-50 p-4 text-body-sm text-danger-700 dark:border-danger-500/30 dark:bg-danger-500/10 dark:text-danger-200">
          {loadError}
        </div>
      )}

      {/* ── Next meeting ── */}
      {nextMeeting ? (
        <section className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 animate-pulse rounded-full bg-primary-500" />
              <h2 className="text-h3 font-bold text-secondary-900 dark:text-white">Next Meeting</h2>
            </div>
            <span className="rounded-full border border-secondary-200 bg-white/80 px-3 py-1 text-caption font-semibold text-secondary-500 dark:border-white/10 dark:bg-white/5 dark:text-secondary-400">
              {formatDate(nextMeeting.scheduledTime)}
            </span>
          </div>
          <FeaturedMeetingCard meeting={nextMeeting} />
        </section>
      ) : (
        <EmptyState
          icon={CalendarClock}
          title="No scheduled meetings yet"
          description="When a recruiter schedules an interview, the meeting details and join link will appear here."
          className="rounded-3xl border border-dashed border-secondary-200 bg-white/60 py-16 dark:border-white/10 dark:bg-white/[0.03]"
        />
      )}

      {/* ── More scheduled meetings ── */}
      {active.length > 1 && (
        <section className="space-y-4">
          <h2 className="text-h3 font-bold text-secondary-900 dark:text-white">Upcoming Meetings</h2>
          <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
            {active.slice(1).map((meeting) => (
              <MeetingCard key={meeting.id} meeting={meeting} />
            ))}
          </div>
        </section>
      )}

      {/* ── Past & other meetings ── */}
      {other.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-h3 font-bold text-secondary-900 dark:text-white">
            Past &amp; Other Meetings
          </h2>
          <div className="overflow-hidden rounded-3xl border border-white/70 bg-white/85 shadow-glass backdrop-blur-2xl dark:border-white/10 dark:bg-secondary-950/60 dark:shadow-glass-dark">
            {other.map((meeting) => (
              <PastRow key={meeting.id} meeting={meeting} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
