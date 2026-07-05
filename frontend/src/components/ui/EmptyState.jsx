import PropTypes from 'prop-types';
import { Button } from './Button';

/**
 * EmptyState — a centered, illustrative placeholder for empty list/table views.
 *
 * Content convention (enforced by consumers via props, not this component):
 * – `title` should be an invitation, not an apology.  e.g. "Post your first job" ✓
 *   not "No jobs found" ✗.
 * – `description` should hint at what the user gains, e.g.
 *   "Job postings you create will appear here."
 *
 * @param {React.ElementType} icon        – A Lucide icon *component* (e.g. `Briefcase`).
 * @param {string}            title       – Short, inviting heading (h4 scale).
 * @param {string}            [description] – Supporting copy (body-sm, secondary-500).
 * @param {{ label: string, onClick: function }} [action]
 *   – When provided, renders a primary Button below the description.
 * @param {string} [className]            – Extra wrapper classes.
 */
export function EmptyState({ icon: Icon, title, description, action, className = '' }) {
  return (
    <div
      className={[
        'flex flex-col items-center justify-center gap-4 py-16 px-6 text-center',
        className,
      ].join(' ')}
    >
      {/* Icon in a muted circle */}
      {Icon && (
        <span
          aria-hidden="true"
          className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary-100"
        >
          <Icon size={32} strokeWidth={1.75} className="text-secondary-400" />
        </span>
      )}

      <div className="flex flex-col gap-1.5 max-w-xs">
        <h4 className="text-h4 text-secondary-800">{title}</h4>
        {description && (
          <p className="text-body-sm text-secondary-500">{description}</p>
        )}
      </div>

      {action && (
        <Button variant="primary" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
}

EmptyState.propTypes = {
  icon: PropTypes.elementType,
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  action: PropTypes.shape({
    label: PropTypes.string.isRequired,
    onClick: PropTypes.func.isRequired,
  }),
  className: PropTypes.string,
};

export default EmptyState;
