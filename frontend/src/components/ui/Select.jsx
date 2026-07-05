import PropTypes from 'prop-types';
import { useId } from 'react';
import { ChevronDown } from 'lucide-react';

/**
 * Select — styled native <select> with a custom chevron icon.
 *
 * Keeping this as a native select preserves full keyboard + screen-reader
 * accessibility without needing a custom popover. A full custom dropdown
 * is out of scope for v1.
 *
 * @param {{ value: string, label: string }[]} options    – Option list.
 * @param {string}   [label]       – Visible label above the select.
 * @param {string}   [error]       – Error message; switches to danger styling.
 * @param {string}   [placeholder] – Unselectable hint shown as the first option.
 * @param {string}   [className]   – Extra wrapper classes.
 */
export function Select({
  options = [],
  label,
  error,
  placeholder,
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

      <div className="relative">
        <select
          id={autoId}
          aria-invalid={hasError ? 'true' : undefined}
          aria-describedby={error ? helperId : undefined}
          className={[
            'w-full appearance-none rounded-button border bg-white',
            'px-3 py-2 pr-9 text-body-lg text-secondary-900',
            'transition-colors duration-base',
            'focus-ring',
            hasError
              ? 'border-danger-400 focus-visible:ring-danger-500'
              : 'border-secondary-300 hover:border-secondary-400',
            rest.disabled
              ? 'opacity-40 cursor-not-allowed bg-secondary-50'
              : 'cursor-pointer',
          ]
            .filter(Boolean)
            .join(' ')}
          {...rest}
        >
          {placeholder && (
            <option value="" disabled hidden>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {/* Custom chevron — pointer-events-none so clicks pass through to the <select> */}
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-secondary-400">
          <ChevronDown size={16} strokeWidth={1.75} />
        </span>
      </div>

      {hasError && (
        <p id={helperId} className="text-caption text-danger-600">
          {error}
        </p>
      )}
    </div>
  );
}

Select.propTypes = {
  options: PropTypes.arrayOf(
    PropTypes.shape({ value: PropTypes.string.isRequired, label: PropTypes.string.isRequired })
  ).isRequired,
  label: PropTypes.string,
  error: PropTypes.string,
  placeholder: PropTypes.string,
  className: PropTypes.string,
};

export default Select;
