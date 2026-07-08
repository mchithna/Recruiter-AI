import PropTypes from 'prop-types';
import { useId } from 'react';

/**
 * Switch — an accessible toggle control.
 *
 * The thumb slides via `transition-transform duration-base` so the motion
 * feels smooth, not instant. The track transitions between secondary-200 (off)
 * and primary-500 (on) with `transition-colors duration-base`.
 *
 * Implemented as a visually-hidden checkbox `role="switch"` so keyboard users
 * can toggle with Space and screen readers announce on/off state.
 *
 * @param {string}   [label]    – Visible label placed to the right of the track.
 * @param {boolean}  checked    – Controlled on/off state.
 * @param {function} onChange   – Called with the synthetic change event.
 * @param {boolean}  [disabled] – Dims the control and blocks interaction.
 * @param {string}   [className]– Extra wrapper classes.
 */
export function Switch({ label, checked = false, onChange, disabled = false, className = '' }) {
  const id = useId();

  return (
    <label
      htmlFor={id}
      className={[
        'inline-flex items-center gap-3 select-none',
        disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {/* Hidden native checkbox for semantics & keyboard toggle (Space key) */}
      <input
        id={id}
        type="checkbox"
        role="switch"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className="sr-only"
        aria-checked={checked}
      />

      {/* Track */}
      <span
        aria-hidden="true"
        className={[
          'relative inline-flex h-6 w-11 shrink-0 rounded-full',
          'transition-colors duration-base',
          'focus-ring',
          checked ? 'bg-primary-500' : 'bg-secondary-200',
        ].join(' ')}
      >
        {/* Thumb */}
        <span
          className={[
            'absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow',
            'transition-transform duration-base',
            checked ? 'translate-x-5' : 'translate-x-0',
          ].join(' ')}
        />
      </span>

      {label && (
        <span className="text-body-sm text-secondary-800">{label}</span>
      )}
    </label>
  );
}

Switch.propTypes = {
  label: PropTypes.string,
  checked: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  className: PropTypes.string,
};

export default Switch;
