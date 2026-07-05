import PropTypes from 'prop-types';
import { useId, useRef, useCallback } from 'react';

/**
 * Textarea — multi-line text input with the same label/error/helperText
 * contract as Input, plus an optional auto-resize behaviour.
 *
 * @param {string}  label        – Visible label above the textarea.
 * @param {string}  [error]      – Error message. Switches to danger styling when set.
 * @param {string}  [helperText] – Supplemental hint shown when no error is present.
 * @param {boolean} [autoResize] – When true the textarea expands with content up to maxHeight.
 * @param {string}  [maxHeight]  – CSS max-height for autoResize mode (default '320px').
 * @param {string}  [className]  – Extra classes on the outer wrapper div.
 */
export function Textarea({
  label,
  error,
  helperText,
  autoResize = false,
  maxHeight = '320px',
  className = '',
  ...rest
}) {
  const autoId = useId();
  const helperId = `${autoId}-helper`;
  const textareaRef = useRef(null);
  const hasError = Boolean(error);

  /** Grows the element to fit its content while respecting maxHeight. */
  const handleInput = useCallback(() => {
    if (!autoResize || !textareaRef.current) return;
    const el = textareaRef.current;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, [autoResize]);

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

      <textarea
        id={autoId}
        ref={textareaRef}
        rows={4}
        aria-invalid={hasError ? 'true' : undefined}
        aria-describedby={error || helperText ? helperId : undefined}
        onInput={autoResize ? handleInput : undefined}
        style={autoResize ? { maxHeight, overflowY: 'auto', transition: 'height 200ms ease' } : undefined}
        className={[
          'w-full rounded-button border bg-white px-3 py-2 text-body-lg text-secondary-900 resize-none',
          'placeholder:text-secondary-400',
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

Textarea.propTypes = {
  label: PropTypes.string,
  error: PropTypes.string,
  helperText: PropTypes.string,
  autoResize: PropTypes.bool,
  maxHeight: PropTypes.string,
  className: PropTypes.string,
};

export default Textarea;
