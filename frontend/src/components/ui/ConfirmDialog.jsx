import PropTypes from 'prop-types';
import { AlertTriangle, CheckCircle2, Info, Trash2 } from 'lucide-react';
import { Button } from './Button';
import { Modal } from './Modal';

const TONE = {
  primary: {
    icon: CheckCircle2,
    badge: 'border-primary-500/20 bg-primary-50 text-primary-700 dark:border-primary-400/30 dark:bg-primary-500/15 dark:text-primary-200',
    confirmVariant: 'primary',
  },
  danger: {
    icon: Trash2,
    badge: 'border-danger-500/20 bg-danger-50 text-danger-700 dark:border-danger-400/30 dark:bg-danger-500/15 dark:text-danger-200',
    confirmVariant: 'danger',
  },
  warning: {
    icon: AlertTriangle,
    badge: 'border-amber-500/25 bg-amber-50 text-amber-700 dark:border-amber-400/30 dark:bg-amber-500/15 dark:text-amber-200',
    confirmVariant: 'primary',
  },
  info: {
    icon: Info,
    badge: 'border-ai-500/20 bg-ai-50 text-ai-700 dark:border-ai-400/30 dark:bg-ai-500/15 dark:text-ai-200',
    confirmVariant: 'primary',
  },
};

export function ConfirmDialog({ options, onCancel, onConfirm }) {
  const tone = TONE[options.variant] || TONE.primary;
  const Icon = tone.icon;

  return (
    <Modal
      isOpen
      onClose={onCancel}
      title={options.title}
      size="sm"
      footer={
        <div className="flex w-full flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" onClick={onCancel} className="w-full sm:w-auto">
            {options.cancelLabel}
          </Button>
          <Button type="button" variant={tone.confirmVariant} onClick={onConfirm} className="w-full sm:w-auto">
            {options.confirmLabel}
          </Button>
        </div>
      }
    >
      <div className="flex gap-4">
        <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border ${tone.badge}`}>
          <Icon size={22} strokeWidth={1.8} />
        </span>
        <div className="min-w-0 space-y-3">
          <p className="text-body-sm leading-relaxed text-secondary-600 dark:text-secondary-300">
            {options.description}
          </p>
          {options.details && (
            <div className="rounded-xl border border-secondary-200 bg-secondary-50 px-3.5 py-3 text-body-sm text-secondary-700 dark:border-white/10 dark:bg-white/[0.04] dark:text-secondary-200">
              {options.details}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}

ConfirmDialog.propTypes = {
  options: PropTypes.shape({
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    confirmLabel: PropTypes.string.isRequired,
    cancelLabel: PropTypes.string.isRequired,
    variant: PropTypes.oneOf(['primary', 'danger', 'warning', 'info']),
    details: PropTypes.node,
  }).isRequired,
  onCancel: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
};

export default ConfirmDialog;
