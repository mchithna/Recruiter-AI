import PropTypes from 'prop-types';
import { SCORE_THRESHOLDS } from '../../lib/statusConfig';

/**
 * Maps a token name to Tailwind fill-color classes.
 * Only the three tokens used in SCORE_THRESHOLDS are needed.
 */
const TOKEN_FILL = {
  danger:  'bg-danger-500',
  warning: 'bg-warning-500',
  success: 'bg-success-500',
};

/**
 * Resolves the color token for a given score by walking SCORE_THRESHOLDS.
 * Thresholds are sorted ascending by `max` in statusConfig.js.
 * @param {number} value – 0–100
 * @returns {string} token name
 */
function resolveToken(value) {
  for (const { max, token } of SCORE_THRESHOLDS) {
    if (value <= max) return token;
  }
  return SCORE_THRESHOLDS[SCORE_THRESHOLDS.length - 1].token;
}

const TRACK_HEIGHT = {
  sm: 'h-1.5',
  md: 'h-2.5',
};

/**
 * ProgressBar — an animated progress bar whose fill color is automatically
 * determined by `SCORE_THRESHOLDS` from `statusConfig.js`.
 *
 * The fill width transitions with `transition-all duration-slow ease-out`
 * so it animates smoothly on mount and on value changes.
 *
 * @param {number}  value           – Progress value 0–100.
 * @param {boolean} [showLabel]     – When true, renders the percentage to the right.
 * @param {'sm'|'md'} [size='md']  – Track height variant.
 * @param {string}  [className]     – Extra wrapper classes.
 */
export function ProgressBar({ value = 0, showLabel = false, size = 'md', className = '' }) {
  const clamped = Math.min(100, Math.max(0, value));
  const token = resolveToken(clamped);
  const fillClass = TOKEN_FILL[token] ?? TOKEN_FILL.success;

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Track */}
      <div
        className={`flex-1 overflow-hidden rounded-full bg-secondary-100 ${TRACK_HEIGHT[size]}`}
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        {/* Fill */}
        <div
          className={[
            'h-full rounded-full',
            fillClass,
            'transition-all duration-slow ease-out',
          ].join(' ')}
          style={{ width: `${clamped}%` }}
        />
      </div>

      {/* Optional label */}
      {showLabel && (
        <span className="tabular-nums text-caption font-semibold text-secondary-600 w-8 text-right shrink-0">
          {clamped}%
        </span>
      )}
    </div>
  );
}

ProgressBar.propTypes = {
  value: PropTypes.number.isRequired,
  showLabel: PropTypes.bool,
  size: PropTypes.oneOf(['sm', 'md']),
  className: PropTypes.string,
};

export default ProgressBar;
