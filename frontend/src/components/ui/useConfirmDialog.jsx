import { useCallback, useRef, useState } from 'react';
import { ConfirmDialog } from './ConfirmDialog';

const DEFAULT_OPTIONS = {
  title: 'Confirm action',
  description: 'Please confirm that you want to continue.',
  confirmLabel: 'Confirm',
  cancelLabel: 'Cancel',
  variant: 'primary',
};

export function useConfirmDialog() {
  const [options, setOptions] = useState(null);
  const resolverRef = useRef(null);

  const closeWith = useCallback((value) => {
    resolverRef.current?.(value);
    resolverRef.current = null;
    setOptions(null);
  }, []);

  const confirm = useCallback((nextOptions = {}) => new Promise((resolve) => {
    resolverRef.current = resolve;
    setOptions({ ...DEFAULT_OPTIONS, ...nextOptions });
  }), []);

  const dialog = options ? (
    <ConfirmDialog
      options={options}
      onCancel={() => closeWith(false)}
      onConfirm={() => closeWith(true)}
    />
  ) : null;

  return { confirm, dialog };
}

export default useConfirmDialog;
