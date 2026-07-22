import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Briefcase,
  CalendarClock,
  Clock,
  ExternalLink,
  MapPin,
  MessageSquare,
  UserRound,
  Video,
} from 'lucide-react';
import { Badge, EmptyState, Skeleton, StatusBadge } from '../../components/ui';
import { getMyInterviews } from './services/candidateApi';

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

const isUpcoming = (meeting) =>
  activeStatuses.has(meeting.status) && new Date(meeting.scheduledTime).getTime() >= Date.now();

function MeetingCard({ meeting, featured = false }) {
  const hasMeetingLink = Boolean(meeting.meetingLink);

  return (
    <article
      className={[
        'relative overflow-hidden rounded-3xl border border-white/60 bg-white/80 shadow-glass backdrop-blur-2xl transition-all duration-300 dark:border-white/10 dark:bg-secondary-950/60 dark:shadow-glass-dark',
        featured ? 'p-6 sm:p-7' : 'p-5',
      ].join(' ')}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary-500 via-ai-500 to-info-500" />
      <div className="relative flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <Badge variant="ai" size="sm" icon={<CalendarClock size={12} />}>
              {meeting.interviewType || 'Interview'}
            </Badge>
            <StatusBadge status={meeting.status?.toLowerCase().replace(/ /g, '_')} />
          </div>

          <h3 className={featured ? 'text-h2 text-secondary-900 dark:text-white' : 'text-h3 text-secondary-900 dark:text-white'}>
            {meeting.jobTitle}
          </h3>
          <p className="mt-1 text-body-sm text-secondary-500 dark:text-secondary-400">
            {meeting.companyName || 'Hiring team'}
            {meeting.departmentName ? ` · ${meeting.departmentName}` : ''}
          </p>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <Detail icon={Clock} label="When" value={formatDateTime(meeting.scheduledTime)} />
            <Detail icon={Video} label="Duration" value={`${meeting.durationMinutes || 0} minutes`} />
            <Detail icon={UserRound} label="Interviewer" value={meeting.interviewerName || 'Hiring team'} />
            <Detail icon={MapPin} label="Location" value={hasMeetingLink ? 'Online meeting' : 'To be shared'} />
          </div>

          {meeting.notes && (
            <div className="mt-5 rounded-2xl border border-primary-100 bg-primary-50/70 p-4 dark:border-primary-500/20 dark:bg-primary-500/10">
              <p className="text-caption font-semibold uppercase tracking-wide text-primary-700 dark:text-primary-300">
                Preparation note
              </p>
              <p className="mt-1 text-body-sm leading-relaxed text-secondary-700 dark:text-secondary-200">
                {meeting.notes}
              </p>
            </div>
          )}
        </div>

        <div className="flex shrink-0 flex-col gap-2 sm:flex-row lg:w-48 lg:flex-col">
          {hasMeetingLink ? (
            <a
              href={meeting.meetingLink}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-button bg-primary-600 px-4 text-body-lg font-semibold text-white transition-colors hover:bg-primary-700 focus-ring"
            >
              <ExternalLink size={16} />
              Join Meeting
            </a>
          ) : (
            <button
              type="button"
              disabled
              className="inline-flex h-10 w-full cursor-not-allowed items-center justify-center gap-2 rounded-button border border-secondary-300 px-4 text-body-lg font-semibold text-secondary-400 opacity-60"
            >
              <ExternalLink size={16} />
              Join Meeting
            </button>
          )}
          <Link
            to={`/candidate/applications/${meeting.applicationId}`}
            className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-button border border-secondary-300 px-4 text-body-lg font-semibold text-secondary-700 transition-colors hover:border-secondary-400 hover:bg-secondary-50 focus-ring dark:border-white/15 dark:text-secondary-100 dark:hover:bg-white/10"
          >
            <MessageSquare size={16} />
            Application
          </Link>
        </div>
      </div>
    </article>
  );
}

function Detail({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-secondary-100 bg-white/70 p-3.5 dark:border-white/10 dark:bg-white/[0.04]">
      <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-600 dark:bg-primary-500/15 dark:text-primary-300">
        <Icon size={16} />
      </span>
      <span className="min-w-0">
        <span className="block text-caption font-semibold uppercase tracking-wide text-secondary-400">
          {label}
        </span>
        <span className="mt-0.5 block break-words text-body-sm font-semibold text-secondary-800 dark:text-secondary-100">
          {value}
        </span>
      </span>
    </div>
  );
}

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
      } catch (error) {
        console.error('Failed to load candidate meetings:', error);
        if (isActive) setLoadError('We could not load your meetings right now.');
      } finally {
        if (isActive) setLoading(false);
      }
    }

    loadMeetings();

    return () => {
      isActive = false;
    };
  }, []);

  const { upcoming, past, nextMeeting } = useMemo(() => {
    const ordered = [...meetings].sort((a, b) => new Date(a.scheduledTime) - new Date(b.scheduledTime));
    const upcomingMeetings = ordered.filter(isUpcoming);
    const pastMeetings = ordered
      .filter((meeting) => !isUpcoming(meeting))
      .sort((a, b) => new Date(b.scheduledTime) - new Date(a.scheduledTime));

    return {
      upcoming: upcomingMeetings,
      past: pastMeetings,
      nextMeeting: upcomingMeetings[0] || null,
    };
  }, [meetings]);

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl space-y-6 pb-16">
        <Skeleton height="10rem" />
        <div className="grid gap-4 lg:grid-cols-2">
          <Skeleton height="16rem" />
          <Skeleton height="16rem" />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-16">
      <section className="relative overflow-hidden rounded-3xl border border-white/60 bg-white/80 p-6 shadow-glass backdrop-blur-2xl dark:border-white/10 dark:bg-secondary-950/60 dark:shadow-glass-dark">
        <div className="pointer-events-none absolute inset-y-0 right-0 w-1/2 bg-gradient-to-l from-primary-100/70 to-transparent dark:from-primary-500/10" />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Badge variant="ai" size="sm" icon={<Video size={12} />}>
              Interview meetings
            </Badge>
            <h1 className="mt-3 text-h1 text-secondary-900 dark:text-white">Meetings</h1>
            <p className="mt-2 max-w-2xl text-body-sm text-secondary-600 dark:text-secondary-300">
              Your scheduled interviews, meeting links, interviewers, and preparation notes in one place.
            </p>
          </div>
          <div className="flex items-center gap-3 rounded-2xl border border-secondary-100 bg-white/70 px-4 py-3 dark:border-white/10 dark:bg-white/[0.04]">
            <CalendarClock size={20} className="text-primary-600 dark:text-primary-300" />
            <div>
              <p className="text-caption font-semibold uppercase tracking-wide text-secondary-400">Upcoming</p>
              <p className="text-h3 text-secondary-900 dark:text-white">{upcoming.length}</p>
            </div>
          </div>
        </div>
      </section>

      {loadError && (
        <div className="rounded-2xl border border-danger-200 bg-danger-50 p-4 text-body-sm text-danger-700 dark:border-danger-500/30 dark:bg-danger-500/10 dark:text-danger-200">
          {loadError}
        </div>
      )}

      {nextMeeting ? (
        <section className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-h3 text-secondary-900 dark:text-white">Next Meeting</h2>
            <span className="text-caption font-semibold text-secondary-400">
              {formatDate(nextMeeting.scheduledTime)}
            </span>
          </div>
          <MeetingCard meeting={nextMeeting} featured />
        </section>
      ) : (
        <EmptyState
          icon={CalendarClock}
          title="No scheduled meetings yet"
          description="When a recruiter schedules an interview, the meeting details and join link will appear here."
          className="rounded-3xl border border-dashed border-secondary-200 bg-white/60 py-14 dark:border-white/10 dark:bg-white/[0.03]"
        />
      )}

      {upcoming.length > 1 && (
        <section className="space-y-3">
          <h2 className="text-h3 text-secondary-900 dark:text-white">Upcoming</h2>
          <div className="grid gap-4 lg:grid-cols-2">
            {upcoming.slice(1).map((meeting) => (
              <MeetingCard key={meeting.id} meeting={meeting} />
            ))}
          </div>
        </section>
      )}

      {past.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-h3 text-secondary-900 dark:text-white">Past & Other Meetings</h2>
          <div className="overflow-hidden rounded-3xl border border-white/60 bg-white/75 shadow-glass backdrop-blur-2xl dark:border-white/10 dark:bg-secondary-950/55 dark:shadow-glass-dark">
            {past.map((meeting) => (
              <Link
                key={meeting.id}
                to={`/candidate/applications/${meeting.applicationId}`}
                className="group flex flex-col gap-3 border-b border-secondary-100 p-5 transition-colors last:border-b-0 hover:bg-secondary-50/80 dark:border-white/10 dark:hover:bg-white/[0.04] sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Briefcase size={15} className="text-secondary-400" />
                    <h3 className="truncate text-body-sm font-semibold text-secondary-900 dark:text-white">
                      {meeting.jobTitle}
                    </h3>
                    <StatusBadge status={meeting.status?.toLowerCase().replace(/ /g, '_')} />
                  </div>
                  <p className="mt-1 text-caption text-secondary-500 dark:text-secondary-400">
                    {formatDateTime(meeting.scheduledTime)} · {meeting.interviewType || 'Interview'} · {meeting.interviewerName || 'Hiring team'}
                  </p>
                </div>
                <span className="inline-flex items-center gap-1 text-body-sm font-semibold text-primary-600 transition-transform group-hover:translate-x-1 dark:text-primary-300">
                  Details <ArrowRight size={14} />
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
