import PropTypes from 'prop-types';
import { useId, useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown } from 'lucide-react';

/**
 * Select — Custom styled dropdown to support advanced dark/light mode themes.
 *
 * @param {{ value: string, label: string }[]} options    – Option list.
 * @param {string}   [label]       – Visible label above the select.
 * @param {string}   [error]       – Error message; switches to danger styling.
 * @param {string}   [placeholder] – Unselectable hint shown as the first option.
 * @param {string}   [className]   – Extra wrapper classes.
 * @param {string}   [selectClassName] - Classes for the button trigger.
 * @param {string}   [dropdownClassName] - Classes for the dropdown menu.
 */
export function Select({
  options = [],
  label,
  error,
  placeholder,
  className = '',
  selectClassName = '',
  dropdownClassName = '',
  value,
  onChange,
  disabled,
  ...rest
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState(null);
  const containerRef = useRef(null);
  const buttonRef = useRef(null);
  const menuRef = useRef(null);
  const autoId = useId();
  const helperId = `${autoId}-helper`;
  const hasError = Boolean(error);

  const selectedOption = options.find((opt) => opt.value === value) || null;
  const hasSelectedOption = Boolean(selectedOption);

  useEffect(() => {
    const handleClickOutside = (event) => {
      const clickedTrigger = containerRef.current?.contains(event.target);
      const clickedMenu = menuRef.current?.contains(event.target);

      if (!clickedTrigger && !clickedMenu) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!isOpen) return undefined;

    const updateMenuPosition = () => {
      const rect = buttonRef.current?.getBoundingClientRect();
      if (!rect) return;

      const spaceBelow = window.innerHeight - rect.bottom;
      const menuHeight = Math.min(240, Math.max(44, options.length * 38 + (placeholder && !hasSelectedOption ? 38 : 0)));
      const opensUp = spaceBelow < menuHeight + 12 && rect.top > spaceBelow;

      setMenuPosition({
        left: rect.left,
        top: opensUp ? Math.max(8, rect.top - menuHeight - 8) : rect.bottom + 8,
        width: rect.width,
        maxHeight: opensUp ? Math.max(120, rect.top - 16) : Math.max(120, spaceBelow - 16),
      });
    };

    updateMenuPosition();
    window.addEventListener('resize', updateMenuPosition);
    window.addEventListener('scroll', updateMenuPosition, true);

    return () => {
      window.removeEventListener('resize', updateMenuPosition);
      window.removeEventListener('scroll', updateMenuPosition, true);
    };
  }, [hasSelectedOption, isOpen, options.length, placeholder, value]);

  const handleSelect = (val) => {
    if (onChange) {
      onChange({ target: { value: val, name: rest.name } });
    }
    setIsOpen(false);
  };

  return (
    <div className={`flex flex-col gap-1 ${className}`} ref={containerRef}>
      {label && (
        <label
          htmlFor={autoId}
          className="text-[12px] font-bold text-secondary-700 dark:text-white/90 select-none ml-1"
        >
          {label}
        </label>
      )}

      <div className="relative">
        <button
          ref={buttonRef}
          type="button"
          id={autoId}
          disabled={disabled}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          aria-invalid={hasError ? 'true' : undefined}
          aria-describedby={error ? helperId : undefined}
          className={selectClassName || [
            'w-full appearance-none rounded-button border text-left flex items-center justify-between',
            'px-4 py-2.5 text-sm font-medium',
            'transition-colors duration-base',
            'focus-ring',
            hasError
              ? 'border-danger-400 focus-visible:ring-danger-500 bg-white dark:!bg-[#161b2e]'
              : 'border-secondary-300 hover:border-secondary-400 dark:border-white/10 dark:hover:border-white/20 bg-white dark:!bg-[#161b2e] text-secondary-900 dark:text-white/90',
            disabled
              ? 'opacity-40 cursor-not-allowed bg-secondary-50 dark:bg-secondary-900'
              : 'cursor-pointer shadow-sm',
          ].filter(Boolean).join(' ')}
          {...rest}
        >
          <span className="block truncate">
            {selectedOption ? selectedOption.label : (placeholder || 'Select...')}
          </span>
          <ChevronDown
            size={16}
            strokeWidth={1.75}
            className={`text-secondary-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          />
        </button>

        {isOpen && menuPosition && createPortal(
          <div
            ref={menuRef}
            className={[
              dropdownClassName ||
                'rounded-xl border border-secondary-200 bg-white py-1 shadow-2xl dark:border-[#3a4368] dark:bg-[#111827]',
              'fixed z-[1000] overflow-hidden animate-fade-in',
            ].join(' ')}
            style={{
              left: `${menuPosition.left}px`,
              top: `${menuPosition.top}px`,
              width: `${menuPosition.width}px`,
            }}
          >
            <ul className="overflow-auto" style={{ maxHeight: `${menuPosition.maxHeight}px` }}>
              {placeholder && !hasSelectedOption && (
                <li className="px-3 py-2 text-secondary-400 text-sm select-none cursor-default">
                  {placeholder}
                </li>
              )}
              {options.map((opt) => (
                <li
                  key={opt.value}
                  onClick={() => handleSelect(opt.value)}
                  className={`cursor-pointer select-none px-4 py-2 text-sm transition-colors
                    ${value === opt.value
                      ? 'bg-primary-50 dark:bg-primary-600 text-primary-900 dark:text-white font-medium'
                      : 'text-secondary-700 dark:text-white/90 hover:bg-secondary-50 dark:hover:bg-[#1d4ed8] hover:text-secondary-900 dark:hover:text-white'
                    }
                  `}
                >
                  {opt.label}
                </li>
              ))}
            </ul>
          </div>,
          document.body
        )}
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
  selectClassName: PropTypes.string,
  dropdownClassName: PropTypes.string,
  value: PropTypes.string,
  onChange: PropTypes.func,
  disabled: PropTypes.bool,
};

export default Select;
