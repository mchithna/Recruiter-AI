import PropTypes from 'prop-types';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { Card } from './Card';

/**
 * StatCard — a dashboard metric tile.
 *
 * Layout:
 *   ┌──────────────────────────────┐
 *   │ [Icon circle]    (top-right) │
 *   │ Large value (h2/tabular-nums)│
 *   │ Label (body-sm secondary-500)│
 *   │ [Trend arrow + %]            │
 *   └──────────────────────────────┘
 *
 * @param {string}         label           – Metric name (e.g. "Active Jobs").
 * @param {string|number}  value           – The big numeric display value.
 * @param {React.ElementType} icon         – A Lucide icon *component* (not JSX), e.g. `Briefcase`.
 * @param {{ direction: 'up'|'down', value: string }} [trend]
 *   – Optional trend indicator. `direction: 'up'` → success-600, `'down'` → danger-600.
 *   – Pass `trendUpIsGood={false}` if a decrease is the positive signal for this metric.
 * @param {boolean} [trendUpIsGood=true]
 *   – When false, inverts the color mapping: up → danger-600, down → success-600.
 * @param {string}  [className]            – Extra wrapper classes.
 */
export function StatCard({
  label,
  value,
  icon: Icon,
  trend,
  trendUpIsGood = true,
  className = '',
}) {
  /* Derive the trend color based on direction and whether up means good. */
  let trendColorClass = '';
  let TrendIcon = null;

  if (trend) {
    const isPositive =
      (trend.direction === 'up' && trendUpIsGood) ||
      (trend.direction === 'down' && !trendUpIsGood);

    trendColorClass = isPositive ? 'text-success-600' : 'text-danger-600';
    TrendIcon = trend.direction === 'up' ? TrendingUp : TrendingDown;
  }

  return (
    <Card className={`relative ${className}`}>
      {/* Icon — top-right tinted circle */}
      {Icon && (
        <span
          aria-hidden="true"
          className="absolute top-5 right-5 flex h-10 w-10 items-center justify-center rounded-full bg-primary-50"
        >
          <Icon size={20} strokeWidth={1.75} className="text-primary-600" />
        </span>
      )}

      {/* Value */}
      <p className="text-h2 tabular-nums text-secondary-900 font-semibold pr-14">
        {value}
      </p>

      {/* Label */}
      <p className="mt-1 text-body-sm text-secondary-500">{label}</p>

      {/* Trend */}
      {trend && TrendIcon && (
        <div className={`mt-3 inline-flex items-center gap-1 ${trendColorClass}`}>
          <TrendIcon size={14} strokeWidth={1.75} />
          <span className="text-caption font-semibold tabular-nums">{trend.value}</span>
        </div>
      )}
    </Card>
  );
}

StatCard.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  icon: PropTypes.elementType,
  trend: PropTypes.shape({
    direction: PropTypes.oneOf(['up', 'down']).isRequired,
    value: PropTypes.string.isRequired,
  }),
  trendUpIsGood: PropTypes.bool,
  className: PropTypes.string,
};

export default StatCard;
