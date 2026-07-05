import PropTypes from 'prop-types';

/**
 * Skeleton — a shimmer-animated placeholder for content that is loading.
 *
 * The shimmer effect uses `animate-shimmer` defined in `tailwind.config.js`
 * (keyframe: backgroundPosition −1000px → 1000px over 2 s linear).
 *
 * Compose multiple Skeletons side-by-side or stacked to replicate the exact
 * layout of the content that's loading, for a polished perceived-performance UX.
 *
 * @param {'text'|'circle'|'rect'} [variant='rect']
 *   - 'text'   → rounded (small radius), good for single lines of copy.
 *   - 'circle' → rounded-full, good for avatars / icon slots.
 *   - 'rect'   → rounded-lg, good for cards / image blocks.
 * @param {string} [width]     – CSS width value (e.g. '100%', '120px'). Defaults to '100%'.
 * @param {string} [height]    – CSS height value (e.g. '1rem', '48px'). Defaults to '1rem'.
 * @param {string} [className] – Extra classes for fine-grained layout control.
 */
export function Skeleton({ variant = 'rect', width, height, className = '' }) {
  const RADIUS = {
    text:   'rounded',
    circle: 'rounded-full',
    rect:   'rounded-lg',
  };

  return (
    <span
      role="presentation"
      aria-hidden="true"
      className={[
        'block',
        'bg-gradient-to-r from-secondary-100 via-secondary-50 to-secondary-100',
        'bg-[length:1000px_100%]',
        'animate-shimmer',
        RADIUS[variant],
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={{
        width: width ?? '100%',
        height: height ?? '1rem',
      }}
    />
  );
}

Skeleton.propTypes = {
  variant: PropTypes.oneOf(['text', 'circle', 'rect']),
  width: PropTypes.string,
  height: PropTypes.string,
  className: PropTypes.string,
};

export default Skeleton;
