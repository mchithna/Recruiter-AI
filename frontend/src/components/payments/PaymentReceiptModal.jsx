import PropTypes from 'prop-types';
import { createPortal } from 'react-dom';
import { CheckCircle2, Download, FileText, X, ShieldCheck } from 'lucide-react';
import { useToast } from '../../lib/ToastContext';

export function PaymentReceiptModal({ isOpen, onClose, receiptData }) {
  const { toast } = useToast();

  if (!isOpen || !receiptData) return null;

  const {
    transactionId = `HIR-PAY-${Math.floor(10000000 + Math.random() * 90000000)}`,
    date = new Date().toLocaleString('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short'
    }),
    accountHolderName = 'Valued Customer',
    cardType = 'Credit Card',
    cardNumber = '4036',
    zipCode = '90210',
    amount = '$49.00 USD',
    planName = 'Hirely Professional Plan (1 Month)'
  } = receiptData;

  const last4 = cardNumber.replace(/\s+/g, '').slice(-4) || '4036';

  const handleDownloadReceipt = () => {
    const receiptText = `
================================================================
                      HIRELY PAYMENT RECEIPT
================================================================

Receipt Number:   ${transactionId}
Date & Time:      ${date}
Payment Status:   PAID (Official PayPal Sandbox Test)

----------------------------------------------------------------
CUSTOMER DETAILS
----------------------------------------------------------------
Account Holder:   ${accountHolderName}
Billing Zip Code: ${zipCode}

----------------------------------------------------------------
PAYMENT DETAILS
----------------------------------------------------------------
Payment Method:   ${cardType} (ending in ${last4})
Plan:             ${planName}
Billing Cycle:    Monthly
Amount Paid:      ${amount}

----------------------------------------------------------------
Thank you for choosing Hirely!
For support, contact support@hirely.ai
================================================================
`.trim();

    try {
      const blob = new Blob([receiptText], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Hirely_Payment_Receipt_${transactionId}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: 'Receipt Downloaded! 📄',
        description: 'Payment receipt saved to your downloads folder.',
        variant: 'success'
      });
    } catch (err) {
      console.error('Download receipt error:', err);
      toast({
        title: 'Download failed',
        description: 'Could not generate receipt file.',
        variant: 'danger'
      });
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md transition-opacity animate-in fade-in duration-200 overflow-y-auto"
      onClick={onClose}
      aria-hidden="true"
    >
      <div
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-white dark:bg-secondary-900 shadow-2xl border border-secondary-200 dark:border-secondary-700/80 my-auto"
      >
        {/* Top Decorative Banner */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 p-6 text-white text-center relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-black/20 hover:bg-black/40 text-white transition-colors"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>

          <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md text-white shadow-lg border border-white/30">
            <CheckCircle2 size={36} className="animate-bounce" />
          </div>
          <h2 className="text-2xl font-black tracking-tight">Payment Successful! 🎉</h2>
          <p className="mt-1 text-xs font-medium text-emerald-100">
            Your Hirely Professional subscription is active
          </p>
        </div>

        {/* Receipt Body */}
        <div className="p-6 space-y-6">
          <div className="rounded-2xl border border-secondary-200/80 bg-secondary-50/70 dark:border-secondary-800 dark:bg-secondary-950/60 p-5 space-y-4 text-sm">
            {/* Header branding */}
            <div className="flex items-center justify-between border-b border-secondary-200/60 dark:border-secondary-800 pb-3">
              <div className="flex items-center gap-2.5">
                <img src="/logo.png" alt="Hirely Logo" className="h-8 w-8 object-contain" />
                <span className="text-lg font-black text-secondary-900 dark:text-white tracking-tight">
                  Hirely
                </span>
              </div>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-xs font-bold border border-emerald-500/20">
                <ShieldCheck size={13} /> Paid
              </span>
            </div>

            {/* Receipt Summary Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-secondary-400 dark:text-secondary-500">Receipt No:</span>
                <p className="font-mono font-bold text-secondary-900 dark:text-white mt-0.5">{transactionId}</p>
              </div>
              <div>
                <span className="text-secondary-400 dark:text-secondary-500">Date & Time:</span>
                <p className="font-semibold text-secondary-900 dark:text-white mt-0.5">{date}</p>
              </div>
              <div>
                <span className="text-secondary-400 dark:text-secondary-500">Account Holder:</span>
                <p className="font-semibold text-secondary-900 dark:text-white mt-0.5 truncate">{accountHolderName}</p>
              </div>
              <div>
                <span className="text-secondary-400 dark:text-secondary-500">Payment Method:</span>
                <p className="font-semibold text-secondary-900 dark:text-white mt-0.5">{cardType} (**** {last4})</p>
              </div>
              <div>
                <span className="text-secondary-400 dark:text-secondary-500">Billing Zip Code:</span>
                <p className="font-semibold text-secondary-900 dark:text-white mt-0.5">{zipCode}</p>
              </div>
              <div>
                <span className="text-secondary-400 dark:text-secondary-500">Plan:</span>
                <p className="font-bold text-primary-600 dark:text-primary-400 mt-0.5">{planName}</p>
              </div>
            </div>

            {/* Total Amount Row */}
            <div className="pt-3 border-t border-secondary-200/60 dark:border-secondary-800 flex items-center justify-between">
              <span className="font-bold text-secondary-700 dark:text-secondary-300">Total Paid</span>
              <span className="text-xl font-black text-secondary-900 dark:text-white">{amount}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2.5 pt-2">
            <button
              type="button"
              onClick={handleDownloadReceipt}
              className="w-full flex items-center justify-center gap-2.5 h-12 rounded-2xl bg-gradient-to-r from-primary-600 via-indigo-600 to-primary-600 hover:from-primary-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-primary-600/30 dark:shadow-indigo-500/25 transition-all duration-200 hover:scale-[1.01] active:scale-[0.98] group"
            >
              <Download size={18} className="transition-transform duration-200 group-hover:-translate-y-0.5" />
              <span className="tracking-wide">Download Receipt</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-full flex items-center justify-center h-11 rounded-2xl border border-secondary-200/80 dark:border-secondary-700/60 bg-secondary-50 dark:bg-secondary-800/60 text-secondary-700 dark:text-secondary-300 hover:bg-secondary-100 dark:hover:bg-secondary-700 font-semibold text-xs transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

PaymentReceiptModal.propTypes = {
  isOpen: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
  receiptData: PropTypes.object
};
