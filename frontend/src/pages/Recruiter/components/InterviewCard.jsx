import PropTypes from 'prop-types';
import { CalendarClock, Clock, User, Video } from 'lucide-react';
import {
  Avatar,
  Badge,
  Card,
  CardContent,
  CardHeader,
} from '../../../components/ui';
import StatusBadge from './StatusBadge';

const formatScheduledTime = (scheduledTime) => {
  if (!scheduledTime) return 'Not scheduled';

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(scheduledTime));
};

export function InterviewCard({ interview }) {
  if (!interview) return null;

  const {
    interviewType,
    scheduledTime,
    durationMinutes,
    status,
    candidateName,
    jobTitle,
    interviewerName,
    meetingLink,
  } = interview;

  return (
    <Card hoverable className="h-full overflow-hidden border-none p-0">
      {/* Top gradient accent */}
      <div className="h-1 w-full bg-gradient-to-r from-primary-500 via-ai-500 to-primary-400" />

      <CardHeader className="px-5 pt-5 pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <Avatar name={candidateName} size="md" />
            <div className="min-w-0">
              <h3 className="truncate text-body-lg font-semibold text-secondary-900 dark:text-white">
                {interviewType}
              </h3>
              <p className="truncate text-body-sm text-secondary-500 dark:text-secondary-300">
                {candidateName}
              </p>
            </div>
          </div>
          <StatusBadge status={status?.toLowerCase().replace(/ /g, '_')} />
        </div>
      </CardHeader>

      <CardContent className="space-y-3 px-5 pb-5 pt-0">
        <p className="text-caption text-secondary-500 dark:text-secondary-400">
          for {jobTitle}
        </p>

        <div className="flex items-center gap-2 rounded-xl bg-secondary-50 p-3 dark:bg-white/5">
          <CalendarClock
            size={16}
            strokeWidth={1.75}
            className="shrink-0 text-primary-600 dark:text-primary-400"
          />
          <div className="min-w-0 flex-1">
            <p className="text-body-sm font-semibold text-secondary-800 dark:text-white">
              {formatScheduledTime(scheduledTime)}
            </p>
            <div className="mt-0.5 flex items-center gap-2 text-caption text-secondary-500 dark:text-secondary-400">
              <Clock size={11} strokeWidth={1.75} />
              <span>{durationMinutes} min</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-1">
          {interviewerName && (
            <div className="flex items-center gap-1.5 text-caption text-secondary-500 dark:text-secondary-400">
              <User size={12} strokeWidth={1.75} />
              <span>{interviewerName}</span>
            </div>
          )}
          {meetingLink && (
            <Badge variant="primary" size="sm" icon={<Video size={10} />}>
              Video
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
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
};

InterviewCard.defaultProps = {
  interview: null,
};

export default InterviewCard;
