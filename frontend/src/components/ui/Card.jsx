import PropTypes from 'prop-types';

/* ─── Sub-component context ─────────────────────────────────────────────── */

/**
 * Card — a surface container for grouped content.
 *
 * Sub-components: CardHeader, CardTitle, CardDescription, CardContent, CardFooter.
 *
 * @param {boolean} [hoverable=false] – Adds hover:shadow-md for clickable card contexts.
 * @param {string}  [className]       – Extra Tailwind classes on the root element.
 * @param {React.ReactNode} children
 */
export function Card({ hoverable = false, className = '', children }) {
  return (
    <div
      className={[
        'bg-surface rounded-xl shadow-sm p-6',
        hoverable
          ? 'cursor-pointer hover:shadow-md transition-shadow duration-base'
          : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </div>
  );
}

Card.propTypes = {
  hoverable: PropTypes.bool,
  className: PropTypes.string,
  children: PropTypes.node,
};

/* ─── CardHeader ────────────────────────────────────────────────────────── */

/**
 * CardHeader — flex row housing CardTitle + CardDescription, plus optional
 * trailing actions (e.g. a button or badge).
 */
export function CardHeader({ className = '', children }) {
  return (
    <div className={`flex items-start justify-between gap-4 mb-4 ${className}`}>
      {children}
    </div>
  );
}

CardHeader.propTypes = { className: PropTypes.string, children: PropTypes.node };

/* ─── CardTitle ─────────────────────────────────────────────────────────── */

/**
 * CardTitle — renders as an `<h3>` using the `text-h3` type scale.
 */
export function CardTitle({ className = '', children }) {
  return (
    <h3 className={`text-h3 text-secondary-900 ${className}`}>{children}</h3>
  );
}

CardTitle.propTypes = { className: PropTypes.string, children: PropTypes.node };

/* ─── CardDescription ───────────────────────────────────────────────────── */

/**
 * CardDescription — supplemental copy, body-sm, muted secondary-500.
 */
export function CardDescription({ className = '', children }) {
  return (
    <p className={`text-body-sm text-secondary-500 mt-0.5 ${className}`}>{children}</p>
  );
}

CardDescription.propTypes = { className: PropTypes.string, children: PropTypes.node };

/* ─── CardContent ───────────────────────────────────────────────────────── */

/**
 * CardContent — main content area; no extra styling by default so consumers
 * can lay things out freely.
 */
export function CardContent({ className = '', children }) {
  return <div className={className}>{children}</div>;
}

CardContent.propTypes = { className: PropTypes.string, children: PropTypes.node };

/* ─── CardFooter ────────────────────────────────────────────────────────── */

/**
 * CardFooter — separated from body by a top border. Typically holds actions
 * or summary metrics.
 */
export function CardFooter({ className = '', children }) {
  return (
    <div
      className={`border-t border-secondary-100 pt-4 mt-4 flex items-center gap-3 ${className}`}
    >
      {children}
    </div>
  );
}

CardFooter.propTypes = { className: PropTypes.string, children: PropTypes.node };

export default Card;
