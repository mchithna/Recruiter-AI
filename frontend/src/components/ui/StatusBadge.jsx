import PropTypes from 'prop-types';
import { APPLICATION_STATUS, JOB_STATUS } from '../../lib/statusConfig';
import { Badge } from './Badge';

/**
 * Statuses that should render as solid (bg-{token}-500, white text) rather
 * than the default light (-50/-700) style.
 * Per design doc: 'hired' and 'open' are milestones/confirmations worthy of
 * a stronger visual treatment.
 */
const SOLID_STATUSES = new Set(['hired', 'open']);

/**
 * Solid variant classes indexed by token name.
 * Only used for the entries in SOLID_STATUSES above.
 */
const SOLID_CLASSES = {
  primary:   'bg-primary-500   text-white',
  secondary: 'bg-secondary-500 text-white',
  success:   'bg-success-500   text-white',
  danger:    'bg-danger-500    text-white',
  warning:   'bg-warning-500   text-white',
  info:      'bg-info-500      text-white',
  ai:        'bg-ai-500        text-white',
};

/**
 * StatusBadge — the **single source of truth** for rendering application and
 * job statuses with the correct label and color token.
 *
 * Imports from `statusConfig.js` and delegates rendering to `Badge`.
 * Nothing else in the app should look up or hardcode status colors.
 *
 * @param {string}              status – A key from APPLICATION_STATUS or JOB_STATUS.
 * @param {'application'|'job'} type   – Which config map to look up.
 * @param {'sm'|'md'}           [size] – Passed through to Badge.
 */
export function StatusBadge({ status, type = 'application', size = 'md' }) {
  const map = type === 'job' ? JOB_STATUS : APPLICATION_STATUS;
  const config = map[status];

  if (!config) {
    // Unknown status — render a neutral fallback so the UI never breaks.
    return (
      <Badge variant="secondary" size={size}>
        {status}
      </Badge>
    );
  }

  const { label, token } = config;
  const isSolid = SOLID_STATUSES.has(status);

  if (isSolid) {
    return (
      <span
        className={[
          'inline-flex items-center rounded-full font-semibold leading-none whitespace-nowrap',
          size === 'sm' ? 'text-caption px-2 py-0.5' : 'text-body-sm px-2.5 py-1',
          SOLID_CLASSES[token] ?? SOLID_CLASSES.secondary,
        ].join(' ')}
      >
        {label}
      </span>
    );
  }

  return (
    <Badge variant={token} size={size}>
      {label}
    </Badge>
  );
}

StatusBadge.propTypes = {
  status: PropTypes.string.isRequired,
  type: PropTypes.oneOf(['application', 'job']),
  size: PropTypes.oneOf(['sm', 'md']),
};

export default StatusBadge;
