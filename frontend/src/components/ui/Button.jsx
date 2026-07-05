import PropTypes from 'prop-types';

/**
 * Inline SVG spinner for the loading state.
 * Uses `currentColor` so it inherits the button's text color.
 */
function Spinner() {
  return (
    <svg
      className="animate-spin h-4 w-4 shrink-0"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
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

/** Base classes shared across ALL variants. */
const BASE =
  'inline-flex items-center justify-center gap-2 font-semibold select-none ' +
  'rounded-button border border-transparent ' +
  'transition-colors duration-base ' +
  'focus-ring ' +
  'active:scale-95 ' +
  'disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none';

const VARIANT_CLASSES = {
  primary:
    'bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800',
  secondary:
    'bg-secondary-100 text-secondary-800 hover:bg-secondary-200 active:bg-secondary-300',
  outline:
    'border-secondary-300 bg-transparent text-secondary-700 ' +
    'hover:bg-secondary-50 hover:border-secondary-400 active:bg-secondary-100',
  danger:
    'bg-danger-600 text-white hover:bg-danger-700 active:bg-danger-800',
  ghost:
    'bg-transparent text-secondary-600 hover:bg-secondary-100 active:bg-secondary-200',
  ai:
    'bg-ai-600 text-white hover:bg-ai-700 active:bg-ai-800 shadow-row-hover',
};

const SIZE_CLASSES = {
  sm: 'h-8 px-3 text-body-sm gap-1.5',
  md: 'h-10 px-4 text-body-lg',
  lg: 'h-12 px-6 text-h4',
};

/**
 * Button — the primary interactive element for the design system.
 *
 * @param {'primary'|'secondary'|'outline'|'danger'|'ghost'|'ai'} variant
 *   Visual treatment. Use 'ai' exclusively for actions that invoke AI features.
 * @param {'sm'|'md'|'lg'} size
 * @param {boolean} isLoading
 *   Shows an inline spinner, prevents interaction, preserves button width.
 * @param {boolean} disabled
 * @param {React.ReactNode} leftIcon  – Icon rendered before label text.
 * @param {React.ReactNode} rightIcon – Icon rendered after label text.
 * @param {React.ReactNode} children  – Button label (required).
 * @param {string} className          – Optional extra Tailwind classes.
 */
export function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  children,
  className = '',
  ...rest
}) {
  const isDisabled = disabled || isLoading;

  return (
    <button
      className={[
        BASE,
        VARIANT_CLASSES[variant],
        SIZE_CLASSES[size],
        'transition-transform duration-fast',
        className,
      ].join(' ')}
      disabled={isDisabled}
      aria-busy={isLoading || undefined}
      {...rest}
    >
      {isLoading ? (
        <>
          <Spinner />
          <span>{children}</span>
        </>
      ) : (
        <>
          {leftIcon && <span className="shrink-0 leading-none">{leftIcon}</span>}
          <span>{children}</span>
          {rightIcon && <span className="shrink-0 leading-none">{rightIcon}</span>}
        </>
      )}
    </button>
  );
}

Button.propTypes = {
  variant: PropTypes.oneOf(['primary', 'secondary', 'outline', 'danger', 'ghost', 'ai']),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  isLoading: PropTypes.bool,
  disabled: PropTypes.bool,
  leftIcon: PropTypes.node,
  rightIcon: PropTypes.node,
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

export default Button;
