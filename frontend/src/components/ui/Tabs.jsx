import PropTypes from 'prop-types';
import { createContext, useCallback, useContext, useId, useRef, useState } from 'react';

/* ─── Context ────────────────────────────────────────────────────────────── */

const TabsContext = createContext(null);

function useTabsContext() {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error('Tab components must be used inside <Tabs>.');
  return ctx;
}

/* ─── Tabs ───────────────────────────────────────────────────────────────── */

/**
 * Tabs — controlled or uncontrolled tab container.
 *
 * Controlled: pass `value` + `onChange`.
 * Uncontrolled: pass `defaultValue`; internal state takes over.
 *
 * Note: a sliding-underline animation between tabs (the kind that moves
 * a physical bar from one tab to another) would require measuring DOM positions
 * or an animation library. For v1 the transition-colors border approach reads
 * cleanly and intentionally polished; the sliding bar is a future enhancement.
 *
 * @param {string}   [value]         – Controlled active tab value.
 * @param {function} [onChange]      – Called with new value in controlled mode.
 * @param {string}   [defaultValue]  – Initial value in uncontrolled mode.
 * @param {string}   [className]
 */
export function Tabs({ value: controlledValue, onChange, defaultValue, className = '', children }) {
  const [internalValue, setInternalValue] = useState(defaultValue ?? '');

  const isControlled = controlledValue !== undefined;
  const active = isControlled ? controlledValue : internalValue;

  const setActive = useCallback(
    (v) => {
      if (!isControlled) setInternalValue(v);
      onChange?.(v);
    },
    [isControlled, onChange]
  );

  return (
    <TabsContext.Provider value={{ active, setActive }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
}

Tabs.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func,
  defaultValue: PropTypes.string,
  className: PropTypes.string,
  children: PropTypes.node,
};

/* ─── TabsList ────────────────────────────────────────────────────────────── */

/**
 * TabsList — the horizontal strip containing TabsTrigger buttons.
 */
export function TabsList({ className = '', children }) {
  const listRef = useRef(null);

  /* Keyboard: ArrowLeft/Right roving focus; Home/End jump to ends */
  function handleKeyDown(e) {
    const triggers = Array.from(
      listRef.current?.querySelectorAll('[role="tab"]') ?? []
    );
    if (!triggers.length) return;
    const idx = triggers.indexOf(document.activeElement);

    if (e.key === 'ArrowRight') {
      e.preventDefault();
      triggers[(idx + 1) % triggers.length].focus();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      triggers[(idx - 1 + triggers.length) % triggers.length].focus();
    } else if (e.key === 'Home') {
      e.preventDefault();
      triggers[0].focus();
    } else if (e.key === 'End') {
      e.preventDefault();
      triggers[triggers.length - 1].focus();
    }
  }

  return (
    <div
      ref={listRef}
      role="tablist"
      onKeyDown={handleKeyDown}
      className={[
        'flex items-end gap-0 border-b border-secondary-200',
        className,
      ].join(' ')}
    >
      {children}
    </div>
  );
}

TabsList.propTypes = { className: PropTypes.string, children: PropTypes.node };

/* ─── TabsTrigger ─────────────────────────────────────────────────────────── */

/**
 * TabsTrigger — a single tab button.
 *
 * @param {string}          value    – Must match the corresponding TabsContent value.
 * @param {React.ReactNode} children – Tab label.
 */
export function TabsTrigger({ value, children, className = '' }) {
  const { active, setActive } = useTabsContext();
  const isActive = active === value;
  const panelId = `tabpanel-${useId()}`;
  const tabId = `tab-${useId()}`;

  return (
    <button
      id={tabId}
      type="button"
      role="tab"
      aria-selected={isActive}
      aria-controls={panelId}
      tabIndex={isActive ? 0 : -1}
      onClick={() => setActive(value)}
      className={[
        'relative px-4 py-2.5 text-body-sm font-medium select-none',
        'border-b-2 -mb-px transition-colors duration-fast focus-ring outline-none',
        isActive
          ? 'border-primary-500 text-primary-700'
          : 'border-transparent text-secondary-500 hover:text-secondary-700 hover:border-secondary-300',
        className,
      ].join(' ')}
    >
      {children}
    </button>
  );
}

TabsTrigger.propTypes = {
  value: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

/* ─── TabsContent ─────────────────────────────────────────────────────────── */

/**
 * TabsContent — renders its content only when its value matches the active tab.
 * Non-matching panels are unmounted (not hidden) to keep the DOM lean for v1.
 *
 * @param {string}          value    – Must match the corresponding TabsTrigger value.
 * @param {React.ReactNode} children
 */
export function TabsContent({ value, children, className = '' }) {
  const { active } = useTabsContext();
  if (active !== value) return null;

  return (
    <div
      role="tabpanel"
      tabIndex={0}
      className={`outline-none pt-4 focus-ring ${className}`}
    >
      {children}
    </div>
  );
}

TabsContent.propTypes = {
  value: PropTypes.string.isRequired,
  children: PropTypes.node,
  className: PropTypes.string,
};

export default Tabs;
