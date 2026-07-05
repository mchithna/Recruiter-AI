import PropTypes from 'prop-types';

const SIZE_CLASSES = {
  sm: 'h-3.5 w-3.5',
  md: 'h-4 w-4',
  lg: 'h-5 w-5',
};

/**
 * Spinner — a circular SVG loading indicator that inherits its color from the
 * parent's `text-*` class via `stroke="currentColor"`.
 *
 * This intentionally has no default color so it works correctly:
 * – Inside solid buttons (text-white flows in automatically).
 * – Standalone, where the consumer sets e.g. `className="text-primary-500"`.
 *
 * @param {'sm'|'md'|'lg'} [size='md']
 * @param {string} [className] – Use for color overrides, e.g. `text-primary-500`.
 */
export function Spinner({ size = 'md', className = '' }) {
  return (
    <svg
      className={['animate-spin shrink-0', SIZE_CLASSES[size], className]
        .filter(Boolean)
        .join(' ')}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
      role="presentation"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="1.75"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}

Spinner.propTypes = {
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  className: PropTypes.string,
};

export default Spinner;
