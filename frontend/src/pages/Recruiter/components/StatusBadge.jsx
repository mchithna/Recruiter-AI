import React from 'react';
import PropTypes from 'prop-types';
import { Badge } from '../../../components/ui';

const positiveStatuses = new Set([
  'shortlisted',
  'offer_extended',
  'offer extended',
  'hired',
  'confirmed',
  'completed',
  'accepted',
  'sent',
  'open',
]);

const warningStatuses = new Set([
  'applied',
  'under_review',
  'under review',
  'interview_scheduled',
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
  'closed',
]);

const getVariant = (status) => {
  if (!status) return 'secondary';
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

  // Replace underscores with spaces for prettier display labels
  const displayLabel = status.replace(/_/g, ' ');

  return (
    <Badge variant={getVariant(status)} size={size}>
      {displayLabel}
    </Badge>
  );
}

StatusBadge.propTypes = {
  status: PropTypes.string,
  size: PropTypes.oneOf(['sm', 'md']),
};

export default StatusBadge;
