import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';
import { CreditCard, LockKeyhole, ShieldCheck } from 'lucide-react';
import { Modal } from '../ui';
import { useToast } from '../../lib/ToastContext';
import {
  captureProfessionalOrder,
  createProfessionalOrder
} from '../../lib/paypalCheckout';

export function PayPalCardModal({
  isOpen,
  onClose,
  paypal,
  config
}) {
  const cardButtonRef = useRef(null);
  const cardNameRef = useRef(null);
  const cardNumberRef = useRef(null);
  const cardExpiryRef = useRef(null);
  const cardCvvRef = useRef(null);
  const hostedCardFieldsRef = useRef(null);
  const hostedFieldInstancesRef = useRef([]);
  const { toast } = useToast();
  const [status, setStatus] = useState('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [isCardFormExpanded, setIsCardFormExpanded] = useState(false);
  const useHostedCardFields = Boolean(config?.useServer && paypal?.CardFields);

  useEffect(() => {
    if (!isOpen || !paypal || !config) {
      return undefined;
    }

    if (useHostedCardFields && (
      !cardNameRef.current ||
      !cardNumberRef.current ||
      !cardExpiryRef.current ||
      !cardCvvRef.current
    )) {
      return undefined;
    }

    if (!useHostedCardFields && !cardButtonRef.current) {
      return undefined;
    }

    let isActive = true;
    let cardButtons = null;
    let cardFields = null;
    setStatus('loading');
    setErrorMessage('');
    setIsCardFormExpanded(useHostedCardFields);

    async function renderCardCheckout() {
      try {
        if (useHostedCardFields) {
          cardFields = paypal.CardFields({
            style: {
              input: {
                color: '#0f172a',
                'font-size': '16px',
                'font-family': 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                'font-weight': '500'
              },
              'input::placeholder': {
                color: '#64748b'
              },
              '.invalid': {
                color: '#dc2626'
              }
            },
            createOrder: () => createProfessionalOrder(config),
            onApprove: async ({ orderID }) => {
              const result = await captureProfessionalOrder(config, orderID);
              if (result.status !== 'COMPLETED') {
                throw new Error('PayPal did not complete the card payment.');
              }

              toast({
                title: 'Payment completed',
                description: 'Your $49.00 Professional payment was captured in PayPal Sandbox.',
                variant: 'success',
                duration: 6000
              });
              onClose();
            },
            onError: (error) => {
              console.error('PayPal card fields error:', error);
              toast({
                title: 'Card payment failed',
                description: 'Check the card details and try again.',
                variant: 'danger'
              });
            }
          });

          if (!cardFields.isEligible()) {
            throw new Error('Card fields are not available for this Sandbox checkout.');
          }

          const renderedFields = [
            cardFields.NameField({ placeholder: 'Name on card' }),
            cardFields.NumberField({ placeholder: 'Card number' }),
            cardFields.ExpiryField({ placeholder: 'MM / YY' }),
            cardFields.CVVField({ placeholder: 'CVV' })
          ];

          await Promise.all([
            renderedFields[0].render(cardNameRef.current),
            renderedFields[1].render(cardNumberRef.current),
            renderedFields[2].render(cardExpiryRef.current),
            renderedFields[3].render(cardCvvRef.current)
          ]);

          if (isActive) {
            hostedCardFieldsRef.current = cardFields;
            hostedFieldInstancesRef.current = renderedFields;
            setStatus('ready');
          }
          return;
        }

        cardButtons = paypal.Buttons({
          fundingSource: paypal.FUNDING.CARD,
          style: {
            color: 'black',
            shape: 'rect',
            label: 'pay',
            height: 48
          },
          createOrder: (_data, actions) => createProfessionalOrder(config, actions),
          onApprove: async ({ orderID }, actions) => {
            try {
              const result = await captureProfessionalOrder(config, orderID, actions);
              const isSuccess = result?.status === 'COMPLETED' || result?.status === 'APPROVED' || result?.id;

              if (!isSuccess) {
                throw new Error('PayPal did not complete the card payment.');
              }

              // Automatically activate company subscription in database
              try {
                const apiModule = await import('../../api');
                await apiModule.default.post('/company/subscription/activate', {
                  orderId: orderID,
                  paymentMethod: 'PayPalSandboxCard'
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
              onClose();
            } catch (err) {
              console.error('PayPal card capture error:', err);
              toast({
                title: 'Payment failed',
                description: err?.message || 'PayPal Sandbox could not complete the payment.',
                variant: 'danger'
              });
            }
          },
          onCancel: () => {
            toast({
              title: 'Payment cancelled',
              description: 'No Sandbox card payment was captured.',
              variant: 'info'
            });
          },
          onError: (error) => {
            console.error('PayPal card checkout error:', error);
            toast({
              title: 'Card payment failed',
              description: 'Check the card details and try again.',
              variant: 'danger'
            });
          }
        });

        if (!cardButtons.isEligible()) {
          throw new Error('Card payments are not available for this Sandbox checkout.');
        }

        await cardButtons.render(cardButtonRef.current);
        if (isActive) {
          setStatus('ready');
        }
      } catch (error) {
        if (isActive) {
          setErrorMessage(error?.message || 'Card checkout is temporarily unavailable.');
          setStatus('error');
        }
      }
    }

    renderCardCheckout();

    return () => {
      isActive = false;
      hostedCardFieldsRef.current = null;
      hostedFieldInstancesRef.current.forEach((field) => {
        if (field?.close) {
          field.close();
        }
      });
      hostedFieldInstancesRef.current = [];
      if (cardButtons?.close) {
        cardButtons.close();
      }
      if (cardFields?.close) {
        cardFields.close();
      }
    };
  }, [config, isOpen, onClose, paypal, toast, useHostedCardFields]);

  useEffect(() => {
    if (!isOpen || !cardButtonRef.current || typeof ResizeObserver === 'undefined') {
      return undefined;
    }

    const observer = new ResizeObserver(([entry]) => {
      setIsCardFormExpanded(entry.contentRect.height > 120);
    });
    observer.observe(cardButtonRef.current);

    return () => observer.disconnect();
  }, [isOpen]);

  async function handleHostedCardSubmit() {
    if (!hostedCardFieldsRef.current) {
      return;
    }

    try {
      setStatus('processing');
      setErrorMessage('');
      await hostedCardFieldsRef.current.submit();
    } catch (error) {
      setErrorMessage(error?.message || 'Check the card details and try again.');
      setStatus('ready');
    }
  }

  return createPortal(
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isCardFormExpanded ? 'Complete your payment' : 'Secure card payment'}
      size="xl"
      bodyClassName="px-4 py-4 sm:px-6 sm:py-5"
    >
      <div className="space-y-4">
        {!isCardFormExpanded && (
          <>
            <div className="flex items-start gap-3 text-sm text-secondary-600 dark:text-secondary-300">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-success-100 text-success-700 dark:bg-success-500/15 dark:text-success-400">
                <ShieldCheck size={20} />
              </span>
              <div>
                <p className="font-semibold text-secondary-900 dark:text-white">
                  Payment details are protected by PayPal
                </p>
                <p className="mt-1 leading-5">
                  Your card information is entered into PayPal-hosted fields and is never stored by Hirely.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between gap-4 border-y border-secondary-200 py-4 dark:border-secondary-700">
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-100 text-primary-700 dark:bg-primary-500/15 dark:text-primary-300">
                  <CreditCard size={19} />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-secondary-900 dark:text-white">
                    Hirely Professional
                  </p>
                  <p className="text-xs text-secondary-500 dark:text-secondary-400">
                    One month - Sandbox payment
                  </p>
                </div>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-xl font-black text-secondary-900 dark:text-white">$49.00</p>
                <p className="text-xs font-semibold text-secondary-500 dark:text-secondary-400">USD</p>
              </div>
            </div>
          </>
        )}

        {isCardFormExpanded && (
          <div className="flex items-center justify-between gap-3 rounded-lg border border-primary-200 bg-primary-50 px-3 py-2.5 dark:border-primary-500/25 dark:bg-primary-500/10">
            <div className="flex min-w-0 items-center gap-2">
              <ShieldCheck size={16} className="shrink-0 text-success-600 dark:text-success-400" />
              <span className="truncate text-xs font-semibold text-secondary-700 dark:text-secondary-200">
                PayPal secure checkout
              </span>
            </div>
            <span className="shrink-0 text-sm font-black text-secondary-900 dark:text-white">
              $49.00 USD
            </span>
          </div>
        )}

        <div>
          {!isCardFormExpanded && (
            <p className="mb-3 text-sm font-semibold text-secondary-800 dark:text-secondary-200">
              Continue to your card details
            </p>
          )}
          {useHostedCardFields ? (
            <div className="-mx-1 rounded-2xl border border-slate-200/90 bg-slate-50 p-3 text-slate-900 shadow-lg [color-scheme:light] sm:mx-0 sm:p-5">
              <div className="grid gap-3">
                <div
                  ref={cardNameRef}
                  className="min-h-12 rounded-xl border border-slate-300 bg-white px-3 py-3 text-slate-900 shadow-sm"
                />
                <div
                  ref={cardNumberRef}
                  className="min-h-12 rounded-xl border border-slate-300 bg-white px-3 py-3 text-slate-900 shadow-sm"
                />
                <div className="grid grid-cols-2 gap-3">
                  <div
                    ref={cardExpiryRef}
                    className="min-h-12 rounded-xl border border-slate-300 bg-white px-3 py-3 text-slate-900 shadow-sm"
                  />
                  <div
                    ref={cardCvvRef}
                    className="min-h-12 rounded-xl border border-slate-300 bg-white px-3 py-3 text-slate-900 shadow-sm"
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={handleHostedCardSubmit}
                disabled={status === 'loading' || status === 'processing'}
                className="mt-4 flex h-12 w-full items-center justify-center rounded-xl bg-primary-600 px-4 text-sm font-black text-white shadow-lg shadow-primary-600/25 transition-colors hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {status === 'processing' ? 'Processing...' : 'Pay $49.00'}
              </button>
            </div>
          ) : (
            <div
              onPointerDownCapture={() => setIsCardFormExpanded(true)}
              onFocusCapture={() => setIsCardFormExpanded(true)}
              className={`relative min-h-12 min-w-0 transition-all duration-300 ${
                isCardFormExpanded
                  ? '-mx-1 rounded-2xl border border-slate-200/90 bg-slate-50 p-3 text-slate-900 shadow-lg [color-scheme:light] sm:mx-0 sm:p-5'
                  : ''
              }`}
            >
              {status === 'loading' && (
                <div className="absolute inset-0 z-10 flex h-12 items-center justify-center rounded-xl bg-secondary-100 text-xs font-semibold text-secondary-600 dark:bg-secondary-800 dark:text-secondary-300">
                  Preparing secure card fields...
                </div>
              )}
              <div
                ref={cardButtonRef}
                className="paypal-card-iframe-wrapper min-h-12 min-w-0 w-full overflow-visible rounded-xl bg-white text-slate-900 [color-scheme:light] [&>iframe]:block [&>iframe]:!max-w-full [&>iframe]:!min-h-[48px] [&>iframe]:!min-w-0 [&>iframe]:!w-full"
              />
            </div>
          )}
          {useHostedCardFields && status === 'loading' && (
            <p className="mt-2 text-center text-xs font-semibold text-secondary-500 dark:text-secondary-400">
              Preparing secure card fields...
            </p>
          )}
          {!useHostedCardFields && isCardFormExpanded && (
            <p className="mt-2 text-center text-xs font-semibold text-slate-600 dark:text-slate-300">
              If the card form does not open, use the PayPal button above or reload the page.
            </p>
          )}
          {status === 'error' && (
            <p className="mt-2 text-sm text-danger-600 dark:text-danger-400" role="alert">
              {errorMessage}
            </p>
          )}
        </div>

        {!isCardFormExpanded && (
          <div className="flex items-center justify-center gap-2 text-xs text-secondary-400 dark:text-secondary-500">
            <LockKeyhole size={13} />
            <span>Encrypted and processed securely by PayPal</span>
          </div>
        )}
      </div>
    </Modal>,
    document.body
  );
}

PayPalCardModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  paypal: PropTypes.object,
  config: PropTypes.shape({
    clientId: PropTypes.string.isRequired,
    currency: PropTypes.string.isRequired,
    useServer: PropTypes.bool.isRequired
  })
};
