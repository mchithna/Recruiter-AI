import PropTypes from 'prop-types';
import { Badge } from '../../../components/ui';

const positiveStatuses = new Set([
  'shortlisted',
  'offer extended',
  'hired',
  'confirmed',
  'completed',
  'accepted',
  'sent',
]);

const warningStatuses = new Set([
  'applied',
  'under review',
  'interview scheduled',
  'scheduled',
  'rescheduled',
  'pending',
]);

const dangerStatuses = new Set([
  'rejected',
  'withdrawn',
  'canceled',
  'cancelled',
  'declined',
  'expired',
]);

const getVariant = (status) => {
  const normalizedStatus = status.toLowerCase();

  if (positiveStatuses.has(normalizedStatus)) return 'success';
  if (warningStatuses.has(normalizedStatus)) return 'warning';
  if (dangerStatuses.has(normalizedStatus)) return 'danger';

  return 'secondary';
};

export function StatusBadge({ status, size = 'sm' }) {
  if (!status) {
    return (
      <Badge variant="secondary" size={size}>
        Unknown
      </Badge>
    );
  }

  return (
    <Badge variant={getVariant(status)} size={size}>
      {status}
    </Badge>
  );
}

StatusBadge.propTypes = {
  status: PropTypes.string,
  size: PropTypes.oneOf(['sm', 'md']),
};

export default StatusBadge;
