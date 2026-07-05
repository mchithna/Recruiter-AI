import { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import {
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  Info,
  X,
} from 'lucide-react';
import { useToast } from '../../lib/ToastContext';

/* ─── Variant config ─────────────────────────────────────────────────────── */

const VARIANT_CONFIG = {
  success: {
    icon: CheckCircle,
    border: 'border-success-500',
    iconClass: 'text-success-500',
  },
  danger: {
    icon: AlertCircle,
    border: 'border-danger-500',
    iconClass: 'text-danger-500',
  },
  warning: {
    icon: AlertTriangle,
    border: 'border-warning-500',
    iconClass: 'text-warning-500',
  },
  info: {
    icon: Info,
    border: 'border-info-500',
    iconClass: 'text-info-500',
  },
};

/* ─── Single Toast item ──────────────────────────────────────────────────── */

/**
 * ToastItem — renders one toast notification.
 *
 * Manages its own enter/exit CSS transition lifecycle:
 * – Enter: mounts invisible (translate-y-2 opacity-0), gets `entered` class
 *   after 10 ms to trigger the slide-up + fade-in.
 * – Exit: on auto-dismiss or manual close, reverts to translate-y-2 opacity-0,
 *   then calls `onDismiss` after transition finishes (duration-base = 200 ms).
 */
function ToastItem({ id, title, description, variant, duration, onDismiss }) {
  const [entered, setEntered] = useState(false);
  const [exiting, setExiting] = useState(false);
  const exitTimerRef = useRef(null);
  const autoTimerRef = useRef(null);

  /* Enter transition */
  useEffect(() => {
    const id = setTimeout(() => setEntered(true), 10);
    return () => clearTimeout(id);
  }, []);

  /* Auto-dismiss */
  useEffect(() => {
    if (!duration) return;
    autoTimerRef.current = setTimeout(() => startExit(), duration);
    return () => clearTimeout(autoTimerRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [duration]);

  function startExit() {
    clearTimeout(autoTimerRef.current);
    setExiting(true);
    // Wait for exit transition (duration-base ≈ 200 ms) before removing from state
    exitTimerRef.current = setTimeout(() => onDismiss(id), 220);
  }

  useEffect(() => () => clearTimeout(exitTimerRef.current), []);

  const config = VARIANT_CONFIG[variant] ?? VARIANT_CONFIG.info;
  const Icon = config.icon;

  return (
    <div
      role="alert"
      aria-live="polite"
      className={[
        'flex items-start gap-3 w-full max-w-sm',
        'bg-surface rounded-lg shadow-modal',
        'border-l-4', config.border,
        'px-4 py-3',
        'transition-all duration-base',
        entered && !exiting
          ? 'translate-y-0 opacity-100'
          : 'translate-y-2 opacity-0',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {/* Icon */}
      <Icon size={18} strokeWidth={1.75} className={`shrink-0 mt-0.5 ${config.iconClass}`} />

      {/* Body */}
      <div className="min-w-0 flex-1">
        <p className="text-body-sm font-semibold text-secondary-900">{title}</p>
        {description && (
          <p className="mt-0.5 text-caption text-secondary-500">{description}</p>
        )}
      </div>

      {/* Close */}
      <button
        type="button"
        onClick={startExit}
        aria-label="Dismiss notification"
        className={[
          'shrink-0 flex items-center justify-center h-6 w-6 rounded',
          'text-secondary-400 hover:text-secondary-600 hover:bg-secondary-100',
          'transition-colors duration-fast focus-ring',
        ].join(' ')}
      >
        <X size={14} strokeWidth={1.75} />
      </button>
    </div>
  );
}

ToastItem.propTypes = {
  id: PropTypes.number.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  variant: PropTypes.oneOf(['success', 'danger', 'warning', 'info']),
  duration: PropTypes.number,
  onDismiss: PropTypes.func.isRequired,
};

/* ─── Toast container — rendered by ToastProvider consumers ─────────────── */

/**
 * ToastContainer — renders the fixed-position stack of toasts.
 * Place this once in your app, typically inside `<ToastProvider>` or right
 * before `</body>`.
 *
 * Example in main.jsx (after wrapping with ToastProvider):
 * ```jsx
 * <ToastProvider>
 *   <App />
 *   <ToastContainer />
 * </ToastProvider>
 * ```
 */
export function ToastContainer() {
  const { toasts, dismiss } = useToast();

  return (
    <div
      aria-live="polite"
      aria-atomic="false"
      className={[
        'fixed bottom-4 right-4 flex flex-col gap-2 items-end',
        'z-toast pointer-events-none',
      ].join(' ')}
    >
      {toasts.map((t) => (
        <div key={t.id} className="pointer-events-auto">
          <ToastItem {...t} onDismiss={dismiss} />
        </div>
      ))}
    </div>
  );
}

export default ToastContainer;
