import { createContext, useCallback, useContext, useRef, useState } from 'react';
import PropTypes from 'prop-types';

/* ─── Context ────────────────────────────────────────────────────────────── */

const ToastContext = createContext(null);

/* ─── Provider ───────────────────────────────────────────────────────────── */

/**
 * ToastProvider — wrap your app root with this to make `useToast()` available
 * anywhere in the tree.
 *
 * In main.jsx:
 * ```jsx
 * import { ToastProvider } from './lib/ToastContext';
 *
 * createRoot(document.getElementById('root')).render(
 *   <StrictMode>
 *     <ToastProvider>
 *       <App />
 *     </ToastProvider>
 *   </StrictMode>
 * );
 * ```
 */
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const idRef = useRef(0);

  /**
   * Add a toast.
   *
   * @param {{ title: string, description?: string,
   *            variant?: 'success'|'danger'|'warning'|'info',
   *            duration?: number }} options
   */
  const toast = useCallback(
    ({ title, description = '', variant = 'info', duration = 4000 }) => {
      const id = ++idRef.current;
      setToasts((prev) => [...prev, { id, title, description, variant, duration }]);
    },
    []
  );

  /** Called by the Toast component when its exit transition finishes. */
  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toast, toasts, dismiss }}>
      {children}
    </ToastContext.Provider>
  );
}

ToastProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

/* ─── Hook ───────────────────────────────────────────────────────────────── */

/**
 * useToast — returns the `toast()` trigger function.
 *
 * Usage:
 * ```jsx
 * const { toast } = useToast();
 * toast({ title: 'Saved!', variant: 'success' });
 * ```
 *
 * Throws if used outside a <ToastProvider>.
 */
export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within a <ToastProvider>.');
  }
  return ctx;
}
