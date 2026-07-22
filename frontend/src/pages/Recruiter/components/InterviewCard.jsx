import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import {
  CalendarClock,
  Clock,
  ExternalLink,
  FileText,
  Sparkles,
  User,
  Video,
} from 'lucide-react';
import { Button, StatusBadge } from '../../../components/ui';

/* ── helpers ──────────────────────────────────────────────── */
const formatDate = (scheduledTime) => {
  if (!scheduledTime) return { day: '—', time: '—', full: 'Not scheduled', year: '' };
  const d = new Date(scheduledTime);
  return {
    day: d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' }),
    time: d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }),
    year: d.getFullYear(),
  };
};

const avatarPalettes = [
  'from-violet-500 to-indigo-600',
  'from-blue-500 to-cyan-500',
  'from-emerald-500 to-teal-500',
  'from-rose-500 to-pink-500',
  'from-amber-500 to-orange-500',
];
const getGradient = (name) => {
  const code = (name || '').split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return avatarPalettes[code % avatarPalettes.length];
};
const getInitials = (name) => {
  const parts = (name || '?').trim().split(' ');
  return (parts.length >= 2 ? parts[0][0] + parts[parts.length - 1][0] : parts[0].slice(0, 2)).toUpperCase();
};

/* ── component ────────────────────────────────────────────── */
export function InterviewCard({ interview, action, onStartCopilot }) {
  const navigate = useNavigate();
  if (!interview) return null;

  const {
    id,
    interviewType,
    scheduledTime,
    durationMinutes,
    status,
    candidateName,
    jobTitle,
    interviewerName,
    meetingLink,
  } = interview;

  const normalizedStatus = status ? status.toString().trim().toLowerCase().replace(/ /g, '_') : '';
  const isCompleted = normalizedStatus === 'completed';
  const { day, time, year } = formatDate(scheduledTime);
  const gradient = getGradient(candidateName);

  const handleActionClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (action?.onClick) { action.onClick(e); return; }
    if (isCompleted) { navigate(`/recruiter/interviews/${id}`); return; }
    if (meetingLink) window.open(meetingLink, '_blank');
    if (onStartCopilot) onStartCopilot(interview);
    else navigate(`/recruiter/interviews/${id}/live-copilot`);
  };

  const actionLabel   = action?.label   || (isCompleted ? 'View Copilot Notes'        : 'Start Interview & Live Copilot');
  const actionVariant = action?.variant || 'ai';
  const actionIcon    = action?.icon    || (isCompleted ? <FileText size={14} />       : <Sparkles size={14} />);

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-secondary-200/50 bg-white shadow-sm transition-all duration-200 hover:shadow-md dark:border-white/10 dark:bg-secondary-900/80">

      {/* Coloured top stripe */}
      <div className="h-1 w-full bg-gradient-to-r from-primary-500 via-ai-500 to-indigo-500" />

      {/* ── Header ── */}
      <div className="relative px-5 pb-3 pt-4">
        {/* Status badge — top right */}
        <div className="absolute right-4 top-4">
          <StatusBadge status={normalizedStatus} />
        </div>

        {/* Avatar + names */}
        <div className="flex items-center gap-3 pr-24">
          <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${gradient} text-sm font-bold text-white shadow-md ring-2 ring-white dark:ring-secondary-900`}>
            {getInitials(candidateName)}
          </div>
          <div className="min-w-0">
            <p className="truncate text-body-sm font-bold leading-tight text-secondary-900 dark:text-white">
              {interviewType}
            </p>
            <p className="mt-0.5 truncate text-caption font-medium text-secondary-500 dark:text-secondary-400">
              {candidateName}
            </p>
          </div>
        </div>

        {/* Job role pill */}
        {jobTitle && (
          <p className="mt-3 truncate rounded-lg bg-secondary-50 px-3 py-1.5 text-caption font-medium text-secondary-600 dark:bg-white/5 dark:text-secondary-300">
            <span className="text-secondary-400 dark:text-secondary-500">for</span>{' '}
            {jobTitle}
          </p>
        )}
      </div>

      {/* Divider */}
      <div className="mx-5 border-t border-secondary-100 dark:border-white/10" />

      {/* ── Date / time row ── */}
      <div className="flex items-stretch gap-3 px-5 py-3">
        {/* Day icon box */}
        <div className="flex shrink-0 flex-col items-center justify-center rounded-xl bg-primary-50 px-3 py-2 dark:bg-primary-900/30">
          <CalendarClock size={15} strokeWidth={1.75} className="mb-1 text-primary-600 dark:text-primary-400" />
          <span className="text-[10px] font-bold uppercase leading-none tracking-wide text-primary-600 dark:text-primary-400">
            {day?.split(',')[0]}
          </span>
        </div>

        {/* Date + duration */}
        <div className="min-w-0 flex-1 self-center">
          <p className="truncate text-body-sm font-semibold text-secondary-800 dark:text-white">
            {day?.split(',').slice(1).join(',').trim()}, {year}
          </p>
          <div className="mt-0.5 flex items-center gap-3 text-caption text-secondary-500 dark:text-secondary-400">
            <span className="flex items-center gap-1">
              <Clock size={11} strokeWidth={1.75} className="shrink-0" />
              {time}
            </span>
            <span className="text-secondary-300 dark:text-secondary-600">·</span>
            <span>{durationMinutes} min</span>
          </div>
        </div>

        {/* Join button */}
        {meetingLink && (
          <a
            href={meetingLink}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex shrink-0 items-center gap-1.5 self-center rounded-full border border-primary-200 bg-primary-50 px-3 py-1.5 text-caption font-semibold text-primary-700 transition-colors hover:bg-primary-100 dark:border-primary-700/40 dark:bg-primary-900/20 dark:text-primary-300 dark:hover:bg-primary-900/40"
          >
            <Video size={12} />
            Join
            <ExternalLink size={9} />
          </a>
        )}
      </div>

      {/* ── Interviewer row ── */}
      {interviewerName && (
        <div className="mx-5 flex items-center gap-1.5 pb-3 text-caption text-secondary-500 dark:text-secondary-400">
          <User size={12} strokeWidth={1.75} className="shrink-0" />
          <span className="truncate">{interviewerName}</span>
        </div>
      )}

      {/* ── CTA ── */}
      <div className="border-t border-secondary-100 px-5 py-4 dark:border-white/10">
        <Button
          type="button"
          variant={actionVariant}
          size="sm"
          className="w-full justify-center gap-2 min-h-9 font-semibold"
          leftIcon={actionIcon}
          onClick={handleActionClick}
        >
          {actionLabel}
        </Button>
      </div>
    </div>
  );
}

InterviewCard.propTypes = {
  interview: PropTypes.shape({
    id: PropTypes.string,
    applicationId: PropTypes.string,
    candidateName: PropTypes.string,
    jobTitle: PropTypes.string,
    interviewerId: PropTypes.string,
    interviewerName: PropTypes.string,
    interviewType: PropTypes.string,
    scheduledTime: PropTypes.string,
    durationMinutes: PropTypes.number,
    meetingLink: PropTypes.string,
    status: PropTypes.string,
    notes: PropTypes.string,
  }),
  action: PropTypes.shape({
    label: PropTypes.string.isRequired,
    icon: PropTypes.node,
    onClick: PropTypes.func.isRequired,
    variant: PropTypes.string,
  }),
  onStartCopilot: PropTypes.func,
};

InterviewCard.defaultProps = {
  interview: null,
  action: null,
  onStartCopilot: null,
};

export default InterviewCard;
