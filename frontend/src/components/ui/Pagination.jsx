import PropTypes from 'prop-types';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * Generates the page number array with ellipsis markers.
 * Always shows: first page, last page, current ± siblingCount, and '…' gaps.
 *
 * @param {number} current     – 1-based current page.
 * @param {number} total       – Total page count.
 * @param {number} siblings    – Pages shown on each side of current.
 * @returns {(number|'…')[]}
 */
function buildPageRange(current, total, siblings) {
  if (total <= 1) return [1];

  const range = new Set([1, total]);
  for (let i = current - siblings; i <= current + siblings; i++) {
    if (i >= 1 && i <= total) range.add(i);
  }

  const sorted = Array.from(range).sort((a, b) => a - b);
  const result = [];

  let prev = 0;
  for (const page of sorted) {
    if (page - prev > 1) result.push('…');
    result.push(page);
    prev = page;
  }
  return result;
}

/* ─── PageButton ─────────────────────────────────────────────────────────── */

function PageButton({ page, isActive, onClick }) {
  return (
    <button
      type="button"
      onClick={() => onClick(page)}
      aria-label={`Page ${page}`}
      aria-current={isActive ? 'page' : undefined}
      className={[
        'inline-flex h-8 w-8 items-center justify-center rounded-button',
        'text-body-sm font-medium transition-colors duration-fast focus-ring',
        isActive
          ? 'bg-primary-500 text-white'
          : 'text-secondary-600 hover:bg-secondary-50',
      ].join(' ')}
    >
      {page}
    </button>
  );
}

PageButton.propTypes = {
  page: PropTypes.number.isRequired,
  isActive: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired,
};

/* ─── Pagination ─────────────────────────────────────────────────────────── */

/**
 * Pagination — prev/next buttons with numbered page controls and ellipsis
 * for large page counts.
 *
 * @param {number}   currentPage              – 1-based current page number.
 * @param {number}   totalPages               – Total number of pages.
 * @param {function} onPageChange             – Called with the new page number.
 * @param {number}   [siblingCount=1]         – Pages visible on each side of current.
 * @param {string}   [className]
 */
export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  siblingCount = 1,
  className = '',
}) {
  if (totalPages <= 1) return null;

  const pages = buildPageRange(currentPage, totalPages, siblingCount);

  const isFirst = currentPage <= 1;
  const isLast = currentPage >= totalPages;

  const NAV_BUTTON_BASE = [
    'inline-flex h-8 w-8 items-center justify-center rounded-button',
    'text-secondary-500 transition-colors duration-fast focus-ring',
    'disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none',
    'hover:bg-secondary-100',
  ].join(' ');

  return (
    <nav
      role="navigation"
      aria-label="Pagination"
      className={`flex items-center gap-1 ${className}`}
    >
      {/* Prev */}
      <button
        type="button"
        onClick={() => !isFirst && onPageChange(currentPage - 1)}
        disabled={isFirst}
        aria-label="Previous page"
        className={NAV_BUTTON_BASE}
      >
        <ChevronLeft size={16} strokeWidth={1.75} />
      </button>

      {/* Page numbers + ellipsis */}
      {pages.map((p, i) =>
        p === '…' ? (
          <span
            key={`ellipsis-${i}`}
            aria-hidden="true"
            className="inline-flex h-8 w-8 items-center justify-center text-secondary-400 text-body-sm select-none"
          >
            …
          </span>
        ) : (
          <PageButton
            key={p}
            page={p}
            isActive={p === currentPage}
            onClick={onPageChange}
          />
        )
      )}

      {/* Next */}
      <button
        type="button"
        onClick={() => !isLast && onPageChange(currentPage + 1)}
        disabled={isLast}
        aria-label="Next page"
        className={NAV_BUTTON_BASE}
      >
        <ChevronRight size={16} strokeWidth={1.75} />
      </button>
    </nav>
  );
}

Pagination.propTypes = {
  currentPage: PropTypes.number.isRequired,
  totalPages: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
  siblingCount: PropTypes.number,
  className: PropTypes.string,
};

export default Pagination;
