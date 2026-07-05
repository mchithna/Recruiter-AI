import PropTypes from 'prop-types';
import { useId } from 'react';

/**
 * DateTimeInput — a styled wrapper around a native `<input type="datetime-local">`
 * for interview scheduling.
 *
 * Deliberately keeps the native picker for v1 accessibility & cross-browser support.
 * Visually matches Input.jsx (same label, error, helper text, focus-ring).
 *
 * @param {string}   [label]     – Visible label above the input.
 * @param {string}   [value]     – Controlled datetime value (ISO format: 'YYYY-MM-DDTHH:mm').
 * @param {function} [onChange]  – Change handler receiving the synthetic event.
 * @param {string}   [error]     – Error message; switches to danger styling.
 * @param {string}   [min]       – Minimum selectable datetime (prevents past scheduling).
 *                                 Pass `new Date().toISOString().slice(0, 16)` for "today now".
 * @param {string}   [helperText]– Supplemental hint shown when no error is present.
 * @param {string}   [className] – Extra wrapper classes.
 */
export function DateTimeInput({
  label,
  value,
  onChange,
  error,
  min,
  helperText,
  className = '',
  ...rest
}) {
  const autoId = useId();
  const helperId = `${autoId}-helper`;
  const hasError = Boolean(error);

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && (
        <label
          htmlFor={autoId}
          className="text-body-sm font-semibold text-secondary-700 select-none"
        >
          {label}
        </label>
      )}

      <input
        id={autoId}
        type="datetime-local"
        value={value}
        onChange={onChange}
        min={min}
        aria-invalid={hasError ? 'true' : undefined}
        aria-describedby={error || helperText ? helperId : undefined}
        className={[
          'w-full rounded-button border bg-white px-3 py-2 text-body-lg text-secondary-900',
          // Chromium/WebKit style the picker button; we only control the field itself.
          'transition-colors duration-base',
          'focus-ring',
          hasError
            ? 'border-danger-400 focus-visible:ring-danger-500'
            : 'border-secondary-300 hover:border-secondary-400',
          rest.disabled
            ? 'opacity-40 cursor-not-allowed bg-secondary-50'
            : '',
        ]
          .filter(Boolean)
          .join(' ')}
        {...rest}
      />

      {(error || helperText) && (
        <p
          id={helperId}
          className={`text-caption ${hasError ? 'text-danger-600' : 'text-secondary-500'}`}
        >
          {hasError ? error : helperText}
        </p>
      )}
    </div>
  );
}

DateTimeInput.propTypes = {
  label: PropTypes.string,
  value: PropTypes.string,
  onChange: PropTypes.func,
  error: PropTypes.string,
  min: PropTypes.string,
  helperText: PropTypes.string,
  className: PropTypes.string,
};

export default DateTimeInput;
