import PropTypes from 'prop-types';
import { useId } from 'react';

/**
 * RadioGroup — accessible group of radio buttons with keyboard navigation
 * via native radio semantics (arrow keys move focus/selection automatically).
 *
 * The selected dot fades in with `transition-opacity duration-fast`.
 *
 * Usage:
 * ```jsx
 * <RadioGroup
 *   label="Employment Type"
 *   name="employment"
 *   value={selected}
 *   onChange={setSelected}
 *   options={[
 *     { value: 'full-time', label: 'Full-time' },
 *     { value: 'contract', label: 'Contract' },
 *   ]}
 * />
 * ```
 *
 * @param {{ value: string, label: string }[]} options – Radio options.
 * @param {string}   name      – `name` attribute shared across all inputs (required for native arrow-key behaviour).
 * @param {string}   value     – Currently selected value (controlled).
 * @param {function} onChange  – Called with the new string value on change.
 * @param {string}   [label]   – Group label rendered above the options.
 * @param {string}   [className] – Extra classes on the fieldset.
 */
export function RadioGroup({
  options = [],
  name,
  value,
  onChange,
  label,
  className = '',
}) {
  const groupId = useId();

  return (
    <fieldset className={`flex flex-col gap-2 ${className}`}>
      {label && (
        <legend className="text-body-sm font-semibold text-secondary-700 mb-0.5 select-none">
          {label}
        </legend>
      )}

      {options.map((opt) => {
        const optId = `${groupId}-${opt.value}`;
        const isSelected = opt.value === value;

        return (
          <Radio
            key={opt.value}
            id={optId}
            name={name}
            value={opt.value}
            label={opt.label}
            checked={isSelected}
            onChange={() => onChange(opt.value)}
          />
        );
      })}
    </fieldset>
  );
}

RadioGroup.propTypes = {
  options: PropTypes.arrayOf(
    PropTypes.shape({ value: PropTypes.string.isRequired, label: PropTypes.string.isRequired })
  ).isRequired,
  name: PropTypes.string.isRequired,
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  label: PropTypes.string,
  className: PropTypes.string,
};

/* ─────────────────────────────────────────────────────────────────────────── */

/**
 * Radio — individual radio button. Can be used standalone but is primarily
 * consumed by RadioGroup.
 *
 * @param {string}   id       – Unique id linking label and input.
 * @param {string}   name     – Shared `name` attribute.
 * @param {string}   value    – This option's value.
 * @param {string}   label    – Visible label text.
 * @param {boolean}  checked  – Whether this option is selected.
 * @param {function} onChange – Called when this option is selected.
 * @param {boolean}  [disabled]
 */
export function Radio({ id, name, value, label, checked, onChange, disabled = false }) {
  return (
    <label
      htmlFor={id}
      className={[
        'inline-flex items-center gap-2.5 select-none',
        disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer group',
      ].join(' ')}
    >
      {/* Hidden native input — provides arrow-key navigation for free */}
      <input
        id={id}
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className="sr-only"
      />

      {/* Custom radio circle */}
      <span
        aria-hidden="true"
        className={[
          'relative flex h-5 w-5 shrink-0 items-center justify-center',
          'rounded-full border-2 transition-colors duration-base',
          checked
            ? 'border-primary-500'
            : 'border-secondary-300 group-hover:border-primary-400',
        ].join(' ')}
      >
        {/* Inner dot — fades in when selected */}
        <span
          className={[
            'h-2.5 w-2.5 rounded-full bg-primary-500',
            'transition-opacity duration-fast',
            checked ? 'opacity-100' : 'opacity-0',
          ].join(' ')}
        />
      </span>

      <span className="text-body-sm text-secondary-800">{label}</span>
    </label>
  );
}

Radio.propTypes = {
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  checked: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
};

export default RadioGroup;
