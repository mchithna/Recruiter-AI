import { useEffect, useRef, useState } from 'react';
import { CreditCard } from 'lucide-react';
import { useToast } from '../../lib/ToastContext';
import { PayPalCardModal } from './PayPalCardModal';
import {
  captureProfessionalOrder,
  createProfessionalOrder,
  getPayPalCheckoutConfig,
  loadPayPalSdk
} from '../../lib/paypalCheckout';

export function PayPalCheckoutButton() {
  const containerRef = useRef(null);
  const { toast } = useToast();
  const [status, setStatus] = useState('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const [checkout, setCheckout] = useState(null);
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);

  useEffect(() => {
    let isActive = true;
    let buttons = null;

    async function initializeCheckout() {
      try {
        const config = await getPayPalCheckoutConfig();
        const paypal = await loadPayPalSdk(config.clientId, config.currency);

        if (!isActive || !containerRef.current || !paypal) {
          return;
        }

        buttons = paypal.Buttons({
          fundingSource: paypal.FUNDING.PAYPAL,
          style: {
            color: 'gold',
            shape: 'rect',
            label: 'paypal',
            height: 44
          },
          createOrder: (_data, actions) => createProfessionalOrder(config, actions),
          onApprove: async ({ orderID }, actions) => {
            const result = await captureProfessionalOrder(config, orderID, actions);
            if (result.status !== 'COMPLETED') {
              throw new Error('PayPal did not complete the payment.');
            }

            toast({
              title: 'Payment completed',
              description: 'Your Hirely Professional payment was captured in PayPal Sandbox.',
              variant: 'success',
              duration: 6000
            });
          },
          onCancel: () => {
            toast({
              title: 'Payment cancelled',
              description: 'No Sandbox payment was captured.',
              variant: 'info'
            });
          },
          onError: (error) => {
            console.error('PayPal Checkout error:', error);
            toast({
              title: 'Payment failed',
              description: 'PayPal Sandbox could not complete the payment. Please try again.',
              variant: 'danger'
            });
          }
        });

        if (!buttons.isEligible()) {
          throw new Error('PayPal Checkout is not available in this browser.');
        }

        await buttons.render(containerRef.current);
        if (isActive) {
          setCheckout({ paypal, config });
          setStatus('ready');
        }
      } catch (error) {
        if (isActive) {
          setErrorMessage(
            error?.response?.data?.title ||
            error?.message ||
            'PayPal Checkout is temporarily unavailable.'
          );
          setStatus('error');
        }
      }
    }

    initializeCheckout();

    return () => {
      isActive = false;
      if (buttons?.close) {
        buttons.close();
      }
    };
  }, [toast]);

  return (
    <div className="mt-3 min-h-11">
      <div className="relative min-h-11">
        {status === 'loading' && (
          <div className="absolute inset-0 z-10 flex h-11 items-center justify-center rounded-lg border border-secondary-200 bg-secondary-50 text-xs font-semibold text-secondary-500 dark:border-secondary-700 dark:bg-secondary-800 dark:text-secondary-400">
            Loading PayPal Sandbox...
          </div>
        )}
        <div ref={containerRef} className="min-h-11" />
      </div>

      {status === 'ready' && (
        <button
          type="button"
          onClick={() => setIsCardModalOpen(true)}
          className="mt-2 flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-secondary-800 px-4 text-sm font-bold text-white transition-colors hover:bg-secondary-700 focus-ring dark:bg-white/10 dark:hover:bg-white/15"
        >
          <CreditCard size={19} />
          Debit or Credit Card
        </button>
      )}

      {status === 'error' && (
        <p className="mt-2 text-center text-xs text-danger-600 dark:text-danger-400" role="alert">
          {errorMessage}
        </p>
      )}

      <p className="mt-1.5 text-center text-[11px] text-secondary-400 dark:text-secondary-500">
        Sandbox test payment - $49.00 USD
      </p>

      <PayPalCardModal
        isOpen={isCardModalOpen}
        onClose={() => setIsCardModalOpen(false)}
        paypal={checkout?.paypal}
        config={checkout?.config}
      />
    </div>
  );
}
