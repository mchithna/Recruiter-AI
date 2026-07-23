import PropTypes from 'prop-types';
import { useId } from 'react';

/**
 * Input — single-line text field with label, helper text, error, and optional icons.
 *
 * @param {string}          label       – Visible label rendered above the input.
 * @param {string}          [error]     – Error message. When set, switches to error styling.
 * @param {string}          [helperText]– Supplemental hint shown below when no error.
 * @param {React.ReactNode} [leftIcon]  – Icon node rendered inside the left edge.
 * @param {string}          [type]      – HTML input type. Defaults to 'text'.
 * @param {string}          [id]        – Override the auto-generated id.
 * @param {string}          [className] – Extra classes applied to the outer wrapper.
 */
export function Input({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  type = 'text',
  id: idProp,
  className = '',
  ...rest
}) {
  const autoId = useId();
  const inputId = idProp ?? autoId;
  const helperId = `${inputId}-helper`;
  const hasError = Boolean(error);

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="text-body-sm font-semibold text-secondary-700 select-none"
        >
          {label}
        </label>
      )}

      <div className="relative flex items-center">
        {leftIcon && (
          <span className="pointer-events-none absolute left-3 text-secondary-400 leading-none">
            {leftIcon}
          </span>
        )}
        <input
          id={inputId}
          type={type}
          aria-invalid={hasError ? 'true' : undefined}
          aria-describedby={error || helperText ? helperId : undefined}
          className={[
            'w-full rounded-button border bg-white px-3 py-2 text-body-lg text-secondary-900',
            'placeholder:text-secondary-400',
            'transition-colors duration-base',
            'focus-ring',
            leftIcon ? 'pl-9' : '',
            rightIcon ? 'pr-12' : '',
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
        {rightIcon && (
          <span className="absolute right-3 leading-none">
            {rightIcon}
          </span>
        )}
      </div>

      {/* Helper / Error text */}
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

Input.propTypes = {
  label: PropTypes.string,
  error: PropTypes.string,
  helperText: PropTypes.string,
  leftIcon: PropTypes.node,
  rightIcon: PropTypes.node,
  type: PropTypes.string,
  id: PropTypes.string,
  className: PropTypes.string,
};

export default Input;
