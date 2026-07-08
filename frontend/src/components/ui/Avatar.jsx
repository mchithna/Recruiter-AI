import PropTypes from 'prop-types';
import { useState } from 'react';

/* ─── Deterministic color palette for initials avatars ───────────────────── */

/**
 * A fixed set of background/text pairs drawn from the design system's semantic
 * palette. We intentionally avoid picking from raw Tailwind defaults.
 */
const PALETTE = [
  { bg: 'bg-primary-100', text: 'text-primary-700' },
  { bg: 'bg-success-100', text: 'text-success-700' },
  { bg: 'bg-ai-100',      text: 'text-ai-700' },
  { bg: 'bg-info-100',    text: 'text-info-700' },
  { bg: 'bg-warning-100', text: 'text-warning-700' },
];

/**
 * Hashes a string to a stable index into PALETTE so the same name always
 * maps to the same color — no randomness on re-render.
 * @param {string} str
 */
function hashName(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) >>> 0; // keep unsigned 32-bit
  }
  return hash % PALETTE.length;
}

/**
 * Extracts up to two initials: first char of the first word + first char of
 * the last word (if different). Examples:
 *   "Ada Lovelace"  → "AL"
 *   "Alice"         → "A"
 *   "Jean-Paul S."  → "JS"
 * @param {string} name
 */
function getInitials(name = '') {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (!words.length) return '?';
  if (words.length === 1) return words[0][0].toUpperCase();
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}

/* ─── Size map ──────────────────────────────────────────────────────────── */

const SIZE = {
  sm: { wrapper: 'h-8 w-8 text-caption',   img: 'h-8 w-8' },
  md: { wrapper: 'h-10 w-10 text-body-sm', img: 'h-10 w-10' },
  lg: { wrapper: 'h-14 w-14 text-h4',      img: 'h-14 w-14' },
};

/**
 * Avatar — displays a user's photo or, if unavailable, their initials on a
 * deterministically-colored circle.
 *
 * @param {string} [src]       – Image URL. Falls back to initials on error or if omitted.
 * @param {string} name        – Full name used for initials + alt text.
 * @param {'sm'|'md'|'lg'} [size='md']
 * @param {string} [className] – Extra classes on the root element.
 */
export function Avatar({ src, name = '', size = 'md', className = '' }) {
  const [imgError, setImgError] = useState(false);
  const showImage = src && !imgError;

  const initials = getInitials(name);
  const { bg, text } = PALETTE[hashName(name)];
  const { wrapper, img: imgSize } = SIZE[size];

  if (showImage) {
    return (
      <img
        src={src}
        alt={name}
        onError={() => setImgError(true)}
        className={[
          imgSize,
          'rounded-full object-cover shrink-0 ring-2 ring-white',
          className,
        ].join(' ')}
      />
    );
  }

  return (
    <span
      aria-label={name}
      role="img"
      className={[
        wrapper,
        bg,
        text,
        'inline-flex items-center justify-center rounded-full font-semibold shrink-0 ring-2 ring-white select-none',
        className,
      ].join(' ')}
    >
      {initials}
    </span>
  );
}

Avatar.propTypes = {
  src: PropTypes.string,
  name: PropTypes.string.isRequired,
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  className: PropTypes.string,
};

export default Avatar;
