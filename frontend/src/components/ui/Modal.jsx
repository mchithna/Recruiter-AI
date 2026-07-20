import PropTypes from 'prop-types';
import { useEffect, useRef, useCallback } from 'react';
import { X } from 'lucide-react';

const SIZE_CLASSES = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
};

/**
 * Modal — an accessible dialog with focus management, body-scroll lock,
 * keyboard dismissal (Escape), and enter/exit CSS transitions.
 *
 * Transition strategy:
 * The panel starts at scale-95/opacity-0 and receives the `entered` class
 * after a 10 ms useEffect delay, which triggers the CSS transition to
 * scale-100/opacity-100. This avoids the "snap to end state" problem that
 * occurs when you mount an element that is already at its final class.
 *
 * @param {boolean}         isOpen   – Controls visibility.
 * @param {function}        onClose  – Called when the user dismisses the modal.
 * @param {string}          title    – Dialog heading (required for aria-labelledby).
 * @param {React.ReactNode} children – Dialog body content.
 * @param {'sm'|'md'|'lg'|'xl'} [size='md']
 * @param {React.ReactNode} [footer] – Optional footer slot (e.g. Cancel / Confirm buttons).
 */
export function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  footer,
}) {
  const panelRef = useRef(null);
  const triggerRef = useRef(null); // captures the element focused before open
  const titleId = `modal-title-${Math.random().toString(36).slice(2, 8)}`;

  /* ── Store the element that opened the modal so focus can be restored ── */
  useEffect(() => {
    if (isOpen) {
      triggerRef.current = document.activeElement;
    }
  }, [isOpen]);

  /* ── Body-scroll lock ─────────────────────────────────────────────────── */
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  /* ── Move focus into the panel on open; restore on close ─────────────── */
  useEffect(() => {
    if (!isOpen) {
      // Return focus to the element that triggered the modal.
      triggerRef.current?.focus();
      return;
    }

    // Small delay so the DOM transition has started before we move focus.
    const id = setTimeout(() => {
      const focusable = panelRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusable?.length) {
        focusable[0].focus();
      } else {
        panelRef.current?.focus();
      }
    }, 50);
    return () => clearTimeout(id);
  }, [isOpen]);

  /* ── Keyboard handler — Escape closes ────────────────────────────────── */
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  return (
    /* Backdrop — z-overlay (40) */
    <div
      className={[
        'fixed inset-0 flex items-center justify-center p-4',
        'bg-black/50',
        'z-overlay',
        'transition-opacity duration-base',
      ].join(' ')}
      onClick={onClose}
      aria-hidden="true"
    >
      {/* Panel — z-modal (50), stops backdrop click from propagating */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        className={[
          'relative flex max-h-[calc(100dvh-2rem)] w-full flex-col overflow-hidden bg-surface rounded-xl shadow-modal',
          'z-modal',
          SIZE_CLASSES[size],
          // Transition classes — enters from scale-95/opacity-0
          'transition-all duration-base',
          'scale-100 opacity-100',
          'outline-none',
        ].join(' ')}
        aria-hidden="false"
      >
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between gap-4 px-6 pt-6 pb-4 border-b border-secondary-100">
          <h2 id={titleId} className="text-h3 text-secondary-900">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className={[
              'flex items-center justify-center h-8 w-8 rounded-button',
              'text-secondary-400 hover:text-secondary-600 hover:bg-secondary-100',
              'transition-colors duration-fast focus-ring',
            ].join(' ')}
          >
            <X size={18} strokeWidth={1.75} />
          </button>
        </div>

        {/* Body */}
        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5 text-body-lg text-secondary-800">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="shrink-0 px-6 pb-6 pt-4 border-t border-secondary-100 flex items-center justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

Modal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  children: PropTypes.node,
  size: PropTypes.oneOf(['sm', 'md', 'lg', 'xl', '2xl']),
  footer: PropTypes.node,
};

export default Modal;
