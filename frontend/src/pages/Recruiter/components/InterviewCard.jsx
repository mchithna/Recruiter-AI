import PropTypes from 'prop-types';
import { CalendarClock } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
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
  } = interview;

  return (
    <Card hoverable className="h-full">
      <CardHeader>
        <div>
          <CardTitle className="text-body-lg">{interviewType}</CardTitle>
          <CardDescription>
            {candidateName} for {jobTitle}
          </CardDescription>
        </div>
        <StatusBadge status={status} />
      </CardHeader>
      <CardContent className="flex items-center gap-3 text-body-sm text-secondary-600">
        <CalendarClock size={18} strokeWidth={1.75} className="shrink-0 text-primary-600" />
        <div>
          <p className="font-semibold text-secondary-800">{formatScheduledTime(scheduledTime)}</p>
          <p>{durationMinutes} minutes</p>
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
