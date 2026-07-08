import PropTypes from 'prop-types';
import { Search, X } from 'lucide-react';

/**
 * SearchInput — single-line search field with an inset Search icon and a
 * clear button that fades in only when the field has a value.
 *
 * Fully controlled: the parent owns `value` and `onChange`.
 *
 * @param {string}   value        – Current input value (controlled).
 * @param {function} onChange     – Called with the synthetic change event.
 * @param {string}   [placeholder]– Input placeholder text.
 * @param {function} [onClear]    – Called when the ✕ button is clicked.
 *                                  If omitted the ✕ button calls `onChange`
 *                                  with a synthetic-style empty-value event.
 * @param {string}   [className]  – Extra classes on the wrapper div.
 */
export function SearchInput({
  value,
  onChange,
  placeholder = 'Search…',
  onClear,
  className = '',
  ...rest
}) {
  const hasValue = Boolean(value);

  const handleClear = () => {
    if (onClear) {
      onClear();
    } else {
      // Synthesise an event so the parent's onChange handler works generically.
      onChange({ target: { value: '' } });
    }
  };

  return (
    <div className={`relative flex items-center ${className}`}>
      {/* Search icon — always visible on the left */}
      <span className="pointer-events-none absolute left-3 text-secondary-400 leading-none">
        <Search size={16} strokeWidth={1.75} />
      </span>

      <input
        type="search"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={[
          'w-full rounded-button border border-secondary-300 bg-white',
          'pl-9 pr-9 py-2 text-body-lg text-secondary-900',
          'placeholder:text-secondary-400',
          'transition-colors duration-base',
          'hover:border-secondary-400',
          'focus-ring',
        ].join(' ')}
        {...rest}
      />

      {/* Clear button — fades in only when there is a value */}
      <button
        type="button"
        onClick={handleClear}
        aria-label="Clear search"
        tabIndex={hasValue ? 0 : -1}
        className={[
          'absolute right-2.5 flex items-center justify-center',
          'h-5 w-5 rounded-full text-secondary-400 hover:text-secondary-600',
          'transition-all duration-fast',
          hasValue ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
        ].join(' ')}
      >
        <X size={14} strokeWidth={1.75} />
      </button>
    </div>
  );
}

SearchInput.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  onClear: PropTypes.func,
  className: PropTypes.string,
};

export default SearchInput;
