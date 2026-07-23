import PropTypes from 'prop-types';

/* ─── Variant maps ──────────────────────────────────────────────────────── */

/**
 * Light style: token-50 background, token-700 text.
 * Used by all variants in their default (non-solid) mode.
 */
const LIGHT_CLASSES = {
  primary:   'bg-primary-50   text-primary-800   dark:bg-primary-100 dark:!text-primary-950',
  secondary: 'bg-secondary-100 text-secondary-800 dark:bg-secondary-200 dark:!text-secondary-950',
  success:   'bg-success-50   text-success-800   dark:bg-success-100 dark:!text-success-950',
  danger:    'bg-danger-50    text-danger-800    dark:bg-danger-100 dark:!text-danger-950',
  warning:   'bg-warning-50   text-warning-800   dark:bg-warning-100 dark:!text-warning-950',
  info:      'bg-info-50      text-info-800      dark:bg-info-100 dark:!text-info-950',
  ai:        'bg-ai-50        text-ai-800        dark:bg-ai-100 dark:!text-ai-950',
};

const SIZE_CLASSES = {
  sm: 'text-caption px-2 py-0.5 gap-1',
  md: 'text-body-sm px-2.5 py-1 gap-1.5',
};

/**
 * Badge — a pill-shaped label for statuses, tags, and counts.
 *
 * All variants use the light (-50 bg / -700 text) convention by default.
 * For solid badges use `StatusBadge`, which handles the solid/light distinction
 * based on statusConfig.js rules.
 *
 * @param {'primary'|'secondary'|'success'|'danger'|'warning'|'info'|'ai'} variant
 * @param {'sm'|'md'} [size='md']
 * @param {React.ReactNode} [icon]  – Small icon rendered before the label.
 * @param {React.ReactNode} children
 * @param {string} [className]
 */
export function Badge({
  variant = 'secondary',
  size = 'md',
  icon,
  children,
  className = '',
}) {
  return (
    <span
      className={[
        'inline-flex items-center rounded-full font-semibold leading-none whitespace-nowrap',
        SIZE_CLASSES[size],
        LIGHT_CLASSES[variant],
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {icon && <span className="shrink-0 leading-none">{icon}</span>}
      {children}
    </span>
  );
}

Badge.propTypes = {
  variant: PropTypes.oneOf(['primary', 'secondary', 'success', 'danger', 'warning', 'info', 'ai']),
  size: PropTypes.oneOf(['sm', 'md']),
  icon: PropTypes.node,
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

export default Badge;
