import PropTypes from 'prop-types';
import { CalendarClock, Clock, User, Video } from 'lucide-react';
import {
  Avatar,
  Badge,
  Button,
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

export function InterviewCard({ interview, action }) {
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
  const cardHeightClass = action ? 'min-h-[284px]' : 'min-h-[230px]';

  return (
    <Card hoverable className={`flex h-full ${cardHeightClass} flex-col overflow-hidden border-none p-0`}>
      {/* Top gradient accent */}
      <div className="mx-5 mt-5 h-1 w-auto rounded-full bg-gradient-to-r from-primary-500 via-ai-500 to-primary-400" />

      <CardHeader className="px-5 pb-3 pt-4">
        <div className="flex items-center gap-3">
          <Avatar name={candidateName} size="md" className="shrink-0" />
          <div className="min-w-0 flex-1">
            <div className="flex min-w-0 items-center gap-2">
              <h3 className="min-w-0 flex-1 truncate text-body-lg font-semibold leading-6 text-secondary-900 dark:text-white">
                {interviewType}
              </h3>
              <div className="shrink-0">
                <StatusBadge status={status} />
              </div>
            </div>
            <p className="mt-0.5 truncate text-body-sm leading-5 text-secondary-500 dark:text-secondary-300">
              {candidateName}
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col px-5 pb-5 pt-0">
        <p className="mb-4 line-clamp-2 min-h-[32px] text-caption leading-4 text-secondary-500 dark:text-secondary-400">
          for {jobTitle}
        </p>

        <div className="flex w-full items-center gap-3 rounded-xl bg-secondary-50 px-3.5 py-3 dark:bg-white/5">
          <CalendarClock
            size={16}
            strokeWidth={1.75}
            className="shrink-0 text-primary-600 dark:text-primary-400"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-body-sm font-semibold leading-5 text-secondary-800 dark:text-white">
              {formatScheduledTime(scheduledTime)}
            </p>
            <div className="mt-1 flex items-center gap-1.5 text-caption leading-4 text-secondary-500 dark:text-secondary-400">
              <Clock size={11} strokeWidth={1.75} className="shrink-0" />
              <span>{durationMinutes} min</span>
            </div>
          </div>
        </div>

        <div className="mt-4 flex min-h-[24px] items-center justify-between gap-3">
          {interviewerName && (
            <div className="flex min-w-0 items-center gap-1.5 text-caption leading-4 text-secondary-500 dark:text-secondary-400">
              <User size={12} strokeWidth={1.75} className="shrink-0" />
              <span className="truncate">{interviewerName}</span>
            </div>
          )}
          {meetingLink && (
            <Badge variant="primary" size="sm" icon={<Video size={10} />}>
              Video
            </Badge>
          )}
        </div>

        {action && (
          <div className="mt-auto pt-4">
            <Button
              type="button"
              variant={action.variant || 'ai'}
              size="sm"
              className="min-h-9 w-full justify-center"
              leftIcon={action.icon}
              onClick={action.onClick}
            >
              {action.label}
            </Button>
          </div>
        )}
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
  action: PropTypes.shape({
    label: PropTypes.string.isRequired,
    icon: PropTypes.node,
    onClick: PropTypes.func.isRequired,
    variant: PropTypes.string,
  }),
};

InterviewCard.defaultProps = {
  interview: null,
  action: null,
};

export default InterviewCard;
