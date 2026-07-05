import PropTypes from 'prop-types';
import { useRef, useEffect, useId } from 'react';
import { Check, Minus } from 'lucide-react';

/**
 * Checkbox — custom-styled checkbox with indeterminate support.
 *
 * The visual box is built with Tailwind's accent-primary-500 on the hidden
 * native input, combined with an absolutely-positioned icon overlay for the
 * checkmark / dash, which fades + scales in with a CSS transition.
 *
 * @param {string}   label         – Visible label text.
 * @param {boolean}  checked       – Controlled checked state.
 * @param {boolean}  [indeterminate] – Shows a dash "−" instead of a tick (used for
 *                                    "select-all" rows in tables).
 * @param {function} onChange      – Change handler receiving the synthetic event.
 * @param {boolean}  [disabled]    – Disables the input.
 * @param {string}   [className]   – Extra wrapper classes.
 */
export function Checkbox({
  label,
  checked = false,
  indeterminate = false,
  onChange,
  disabled = false,
  className = '',
}) {
  const id = useId();
  const inputRef = useRef(null);

  /* Sync the indeterminate DOM property — can only be set via JS. */
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.indeterminate = indeterminate;
    }
  }, [indeterminate]);

  const isActive = checked || indeterminate;

  return (
    <label
      htmlFor={id}
      className={[
        'inline-flex items-center gap-2.5 select-none',
        disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer group',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {/* Hidden native input keeps semantics & keyboard behaviour */}
      <input
        ref={inputRef}
        id={id}
        type="checkbox"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className="sr-only"
      />

      {/* Visual box */}
      <span
        aria-hidden="true"
        className={[
          'relative flex h-5 w-5 shrink-0 items-center justify-center',
          'rounded border-2 transition-colors duration-base',
          isActive
            ? 'border-primary-500 bg-primary-500'
            : 'border-secondary-300 bg-white group-hover:border-primary-400',
          'focus-ring',
        ].join(' ')}
      >
        {/* Icon overlay — scale in on active */}
        <span
          className={[
            'absolute inset-0 flex items-center justify-center text-white',
            'transition-all duration-fast',
            isActive ? 'opacity-100 scale-100' : 'opacity-0 scale-50',
          ].join(' ')}
        >
          {indeterminate ? (
            <Minus size={12} strokeWidth={2.5} />
          ) : (
            <Check size={12} strokeWidth={2.5} />
          )}
        </span>
      </span>

      {label && (
        <span className="text-body-sm text-secondary-800">{label}</span>
      )}
    </label>
  );
}

Checkbox.propTypes = {
  label: PropTypes.string,
  checked: PropTypes.bool.isRequired,
  indeterminate: PropTypes.bool,
  onChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  className: PropTypes.string,
};

export default Checkbox;
