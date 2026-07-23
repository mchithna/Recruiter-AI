import { useEffect, useRef, useState } from 'react';
import { useToast } from '../../lib/ToastContext';
import {
  captureProfessionalOrder,
  createProfessionalOrder,
  getPayPalCheckoutConfig,
  loadPayPalSdk
} from '../../lib/paypalCheckout';

export function PayPalCheckoutButton({ onSuccess }) {
  const containerRef = useRef(null);
  const { toast } = useToast();
  const [status, setStatus] = useState('loading');
  const [errorMessage, setErrorMessage] = useState('');

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
            try {
              const result = await captureProfessionalOrder(config, orderID, actions);
              const isSuccess = result?.status === 'COMPLETED' || result?.status === 'APPROVED' || result?.id;
              
              if (!isSuccess) {
                throw new Error('PayPal payment status was not completed.');
              }

              // Automatically activate company subscription in database
              try {
                const apiModule = await import('../../api');
                await apiModule.default.post('/company/subscription/activate', {
                  orderId: orderID,
                  paymentMethod: 'PayPalSandbox'
                });
              } catch (activationErr) {
                console.warn('Subscription activation API warning:', activationErr);
              }

              toast({
                title: 'Payment Completed! 🎉',
                description: 'Your Hirely Professional subscription is now active.',
                variant: 'success',
                duration: 6000
              });

              if (onSuccess) {
                onSuccess();
              }
            } catch (err) {
              console.error('PayPal capture error:', err);
              toast({
                title: 'Payment failed',
                description: err?.message || 'PayPal Sandbox could not complete the payment. Please try again.',
                variant: 'danger'
              });
            }
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
    <div className="w-full min-h-11">
      <div className="relative min-h-11">
        {status === 'loading' && (
          <div className="absolute inset-0 z-10 flex h-11 items-center justify-center rounded-lg border border-secondary-200 bg-secondary-50 text-xs font-semibold text-secondary-500 dark:border-secondary-700 dark:bg-secondary-800 dark:text-secondary-400">
            Loading PayPal Sandbox...
          </div>
        )}
        <div ref={containerRef} className="min-h-11" />
      </div>

      {status === 'error' && (
        <p className="mt-2 text-center text-xs text-danger-600 dark:text-danger-400" role="alert">
          {errorMessage}
        </p>
      )}

      <p className="mt-1.5 text-center text-[11px] text-secondary-400 dark:text-secondary-500">
        Sandbox test payment - $49.00 USD
      </p>
    </div>
  );
}
