import PropTypes from 'prop-types';
import { createContext, useContext } from 'react';

/* ─── Density Context ───────────────────────────────────────────────────── */

const TableDensityContext = createContext('comfortable');

/**
 * Table — semantic HTML table with built-in hover rows, optional density control,
 * and a shared context so every TableRow responds to the top-level `density` prop.
 *
 * Sub-components exported: Table, TableHeader, TableBody, TableRow, TableHead, TableCell.
 *
 * @param {'comfortable'|'compact'} [density='comfortable'] – Controls row vertical padding.
 */
export function Table({ density = 'comfortable', className = '', children }) {
  return (
    <TableDensityContext.Provider value={density}>
      <div className={`w-full overflow-x-auto ${className}`}>
        <table className="w-full border-collapse text-left">{children}</table>
      </div>
    </TableDensityContext.Provider>
  );
}

Table.propTypes = {
  density: PropTypes.oneOf(['comfortable', 'compact']),
  className: PropTypes.string,
  children: PropTypes.node,
};

/* ─── TableHeader ───────────────────────────────────────────────────────── */

/**
 * TableHeader — wraps `<thead>`.
 */
export function TableHeader({ className = '', children }) {
  return (
    <thead className={`border-b border-secondary-200 bg-secondary-50 ${className}`}>
      {children}
    </thead>
  );
}

TableHeader.propTypes = { className: PropTypes.string, children: PropTypes.node };

/* ─── TableBody ─────────────────────────────────────────────────────────── */

/**
 * TableBody — wraps `<tbody>`.
 */
export function TableBody({ className = '', children }) {
  return <tbody className={className}>{children}</tbody>;
}

TableBody.propTypes = { className: PropTypes.string, children: PropTypes.node };

/* ─── TableRow ──────────────────────────────────────────────────────────── */

/**
 * TableRow — `<tr>` with hover highlight and a bottom divider on all but the
 * last row. Reads the density value from context.
 *
 * @param {boolean} [isHeader] – When true, skips the hover/divider styling (used inside <thead>).
 */
export function TableRow({ isHeader = false, className = '', children, ...props }) {
  const density = useContext(TableDensityContext);

  return (
    <tr
      className={[
        !isHeader &&
          'border-b border-secondary-100 last:border-b-0 ' +
          'hover:bg-secondary-50 hover:shadow-row-hover ' +
          'transition-colors duration-fast',
        'align-middle',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {children}
    </tr>
  );
}

TableRow.propTypes = {
  isHeader: PropTypes.bool,
  className: PropTypes.string,
  children: PropTypes.node,
};

/* ─── TableHead ─────────────────────────────────────────────────────────── */

/**
 * TableHead — `<th>` styled with overline text, secondary-500.
 */
export function TableHead({ className = '', children }) {
  return (
    <th
      scope="col"
      className={`px-4 py-3 text-overline font-semibold uppercase tracking-wide text-secondary-500 ${className}`}
    >
      {children}
    </th>
  );
}

TableHead.propTypes = { className: PropTypes.string, children: PropTypes.node };

/* ─── TableCell ─────────────────────────────────────────────────────────── */

/**
 * TableCell — `<td>` with density-aware padding.
 *
 * @param {boolean} [numeric] – Right-aligns and applies `.tabular-nums` for number columns.
 */
export function TableCell({ numeric = false, className = '', children }) {
  const density = useContext(TableDensityContext);
  const py = density === 'compact' ? 'py-2' : 'py-4';

  return (
    <td
      className={[
        `px-4 ${py} text-body-sm text-secondary-800`,
        numeric ? 'tabular-nums text-right' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </td>
  );
}

TableCell.propTypes = {
  numeric: PropTypes.bool,
  className: PropTypes.string,
  children: PropTypes.node,
};
