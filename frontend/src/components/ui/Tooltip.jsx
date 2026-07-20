import PropTypes from 'prop-types';
import { useCallback, useEffect, useId, useRef, useState } from 'react';

/**
 * Tooltip — shows a dark bubble near its trigger on hover and keyboard focus.
 *
 * Accessibility:
 * – The trigger gets `aria-describedby` pointing to the tooltip's id.
 * – Tooltip appears on both `mouseenter` and `focus`, hides on `mouseleave`/`blur`.
 * – A configurable `delay` (default 300 ms) applies only to showing; hiding is instant.
 *
 * Positioning is done with absolute CSS offsets from the trigger wrapper.
 * A small triangular arrow is drawn with a rotated div.
 *
 * @param {string|React.ReactNode} content    – Tooltip text or content.
 * @param {React.ReactNode}        children   – The trigger element.
 * @param {'top'|'bottom'|'left'|'right'} [position='top']
 * @param {number} [delay=300]               – Show delay in ms.
 */
export function Tooltip({ content, children, position = 'top', delay = 300 }) {
  const [visible, setVisible] = useState(false);
  const [rendered, setRendered] = useState(false); // controls CSS enter transition
  const showTimerRef = useRef(null);
  const tooltipId = useId();

  const show = useCallback(() => {
    clearTimeout(showTimerRef.current);
    showTimerRef.current = setTimeout(() => {
      setVisible(true);
      // 10 ms paint delay so the transition actually fires
      setTimeout(() => setRendered(true), 10);
    }, delay);
  }, [delay]);

  const hide = useCallback(() => {
    clearTimeout(showTimerRef.current);
    setRendered(false);
    // Wait for exit transition (duration-fast ≈ 150 ms) before unmounting
    setTimeout(() => setVisible(false), 160);
  }, []);

  useEffect(() => () => clearTimeout(showTimerRef.current), []);

  /* ── Position maps ────────────────────────────────────────────────────── */
  const BUBBLE_POSITION = {
    top:    'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full  left-1/2 -translate-x-1/2 mt-2',
    left:   'right-full top-1/2 -translate-y-1/2 mr-2',
    right:  'left-full  top-1/2 -translate-y-1/2 ml-2',
  };

  /* Tiny arrow — an absolutely-placed rotated square */
  const ARROW_POSITION = {
    top:    'top-full  left-1/2 -translate-x-1/2 -mt-1',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 -mb-1',
    left:   'left-full  top-1/2 -translate-y-1/2 -ml-1',
    right:  'right-full top-1/2 -translate-y-1/2 -mr-1',
  };

  /* Translation for enter/exit */
  const ENTER_TRANSLATE = {
    top:    rendered ? 'opacity-100 translate-y-0'  : 'opacity-0 translate-y-1',
    bottom: rendered ? 'opacity-100 translate-y-0'  : 'opacity-0 -translate-y-1',
    left:   rendered ? 'opacity-100 translate-x-0'  : 'opacity-0 translate-x-1',
    right:  rendered ? 'opacity-100 translate-x-0'  : 'opacity-0 -translate-x-1',
  };

  return (
    <span
      className="relative inline-flex"
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      {/* Clone the child, injecting aria-describedby */}
      {typeof children === 'string' ? (
        <span aria-describedby={visible && content ? tooltipId : undefined}>{children}</span>
      ) : (
        <span
          aria-describedby={visible && content ? tooltipId : undefined}
          className="inline-flex w-full"
        >
          {children}
        </span>
      )}

      {/* Tooltip bubble */}
      {visible && content && (
        <span
          id={tooltipId}
          role="tooltip"
          className={[
            'absolute pointer-events-none z-tooltip',
            'whitespace-nowrap rounded px-2 py-1',
            'bg-secondary-900 text-white text-caption',
            'transition-all duration-fast',
            BUBBLE_POSITION[position],
            ENTER_TRANSLATE[position],
          ].join(' ')}
        >
          {content}
          {/* Arrow */}
          <span
            aria-hidden="true"
            className={[
              'absolute h-2 w-2 rotate-45 bg-secondary-900',
              ARROW_POSITION[position],
            ].join(' ')}
          />
        </span>
      )}
    </span>
  );
}

Tooltip.propTypes = {
  content: PropTypes.oneOfType([PropTypes.string, PropTypes.node]).isRequired,
  children: PropTypes.node.isRequired,
  position: PropTypes.oneOf(['top', 'bottom', 'left', 'right']),
  delay: PropTypes.number,
};

export default Tooltip;
