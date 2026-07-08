import PropTypes from 'prop-types';
import { useCallback, useEffect, useRef, useState } from 'react';

/* ─── useClickOutside hook ─────────────────────────────────────────────────
 * Calls `handler` whenever a click occurs outside `ref`.
 */
function useClickOutside(ref, handler) {
  useEffect(() => {
    function listener(event) {
      if (!ref.current || ref.current.contains(event.target)) return;
      handler(event);
    }
    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);
    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler]);
}

/* ─── DropdownMenuItem ──────────────────────────────────────────────────── */

/**
 * DropdownMenuItem — a single action within a DropdownMenu.
 *
 * @param {function}        onClick  – Called when the item is selected.
 * @param {React.ReactNode} [icon]   – Optional leading icon.
 * @param {boolean}         [danger] – Destructive style (text-danger-600, hover:bg-danger-50).
 * @param {React.ReactNode} children – Item label.
 */
export function DropdownMenuItem({ onClick, icon, danger = false, children, className = '' }) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className={[
        'flex w-full items-center gap-2.5 px-3 py-2 text-body-sm rounded-button',
        'transition-colors duration-fast focus-ring outline-none',
        danger
          ? 'text-danger-600 hover:bg-danger-50'
          : 'text-secondary-700 hover:bg-secondary-50',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {icon && <span className="shrink-0 text-current">{icon}</span>}
      <span>{children}</span>
    </button>
  );
}

DropdownMenuItem.propTypes = {
  onClick: PropTypes.func,
  icon: PropTypes.node,
  danger: PropTypes.bool,
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

/* ─── DropdownMenu ──────────────────────────────────────────────────────── */

/**
 * DropdownMenu — manages its own open/closed state internally.
 * Closes on: item click, click outside, or Escape.
 * Keyboard navigation: ArrowDown/Up moves focus between items; Enter/Space
 * selects; Escape closes and restores focus to the trigger.
 *
 * @param {React.ReactNode} trigger  – The element that opens the menu on click.
 * @param {React.ReactNode} children – DropdownMenuItems (or any content).
 * @param {'left'|'right'} [align='left'] – Menu alignment relative to trigger.
 * @param {string} [className]            – Extra wrapper classes.
 */
export function DropdownMenu({ trigger, children, align = 'left', className = '' }) {
  const [open, setOpen] = useState(false);
  const [rendered, setRendered] = useState(false); // drives scale/opacity transition
  const containerRef = useRef(null);
  const triggerRef = useRef(null);
  const menuRef = useRef(null);

  /* Close on click outside */
  useClickOutside(containerRef, () => close());

  function openMenu() {
    setOpen(true);
    setTimeout(() => setRendered(true), 10);
  }

  const close = useCallback(() => {
    setRendered(false);
    // Wait for exit transition (duration-fast ≈ 150 ms) before unmounting
    setTimeout(() => setOpen(false), 160);
    // Return focus to trigger
    triggerRef.current?.focus();
  }, []);

  /* Keyboard: Escape */
  useEffect(() => {
    if (!open) return;
    function onKey(e) {
      if (e.key === 'Escape') close();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, close]);

  /* Keyboard: ArrowDown / ArrowUp roving focus inside the menu */
  function handleMenuKeyDown(e) {
    const items = Array.from(
      menuRef.current?.querySelectorAll('[role="menuitem"]') ?? []
    );
    if (!items.length) return;
    const current = document.activeElement;
    const idx = items.indexOf(current);

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      items[(idx + 1) % items.length].focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      items[(idx - 1 + items.length) % items.length].focus();
    }
  }

  /* Auto-focus first item when menu opens */
  useEffect(() => {
    if (!open || !rendered) return;
    const first = menuRef.current?.querySelector('[role="menuitem"]');
    first?.focus();
  }, [open, rendered]);

  const alignClass = align === 'right' ? 'right-0' : 'left-0';

  return (
    <div ref={containerRef} className={`relative inline-flex ${className}`}>
      {/* Trigger wrapper — captures ref and click */}
      <div
        ref={triggerRef}
        onClick={() => (open ? close() : openMenu())}
        className="inline-flex"
      >
        {trigger}
      </div>

      {/* Menu panel */}
      {open && (
        <div
          ref={menuRef}
          role="menu"
          aria-orientation="vertical"
          onKeyDown={handleMenuKeyDown}
          className={[
            'absolute top-full mt-1 min-w-[10rem] py-1',
            alignClass,
            'bg-surface rounded-dropdown shadow-dropdown',
            'z-dropdown',
            'origin-top transition-all duration-fast',
            rendered ? 'scale-100 opacity-100' : 'scale-95 opacity-0',
            'outline-none',
          ].join(' ')}
        >
          {/* Wrap each child so clicking any item also closes the menu */}
          {Array.isArray(children)
            ? children.map((child, i) => (
                <div key={i} onClick={close}>
                  {child}
                </div>
              ))
            : <div onClick={close}>{children}</div>}
        </div>
      )}
    </div>
  );
}

DropdownMenu.propTypes = {
  trigger: PropTypes.node.isRequired,
  children: PropTypes.node.isRequired,
  align: PropTypes.oneOf(['left', 'right']),
  className: PropTypes.string,
};

export default DropdownMenu;
