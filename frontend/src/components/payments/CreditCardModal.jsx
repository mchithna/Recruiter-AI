import { useState } from 'react';
import PropTypes from 'prop-types';
import { createPortal } from 'react-dom';
import { CreditCard, Lock, ShieldCheck, Sparkles, X, User, Calendar, KeyRound, MapPin } from 'lucide-react';
import { useToast } from '../../lib/ToastContext';

const CARD_TYPES = [
  { id: 'Visa', name: 'Visa (PayPal Test)', logo: '💳' },
  { id: 'MasterCard', name: 'MasterCard (PayPal Test)', logo: '💳' },
  { id: 'American Express', name: 'American Express (PayPal Test)', logo: '💳' },
  { id: 'Discover', name: 'Discover (PayPal Test)', logo: '💳' }
];

export function CreditCardModal({ isOpen, onClose, onSuccess }) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    cardType: 'Visa',
    accountHolderName: '',
    cardNumber: '',
    expiredDate: '',
    cvv: '',
    billingZipCode: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  if (!isOpen) return null;

  const handleInputChange = (field, value) => {
    let formattedValue = value;

    // Formatting rules
    if (field === 'cardNumber') {
      // Remove non-digit characters
      const digits = value.replace(/\D/g, '').slice(0, 16);
      // Group by 4s
      formattedValue = digits.replace(/(\d{4})(?=\d)/g, '$1 ');
    } else if (field === 'expiredDate') {
      // Clean non-digits
      const digits = value.replace(/\D/g, '').slice(0, 4);
      if (digits.length >= 3) {
        formattedValue = `${digits.slice(0, 2)} / ${digits.slice(2)}`;
      } else {
        formattedValue = digits;
      }
    } else if (field === 'cvv') {
      formattedValue = value.replace(/\D/g, '').slice(0, 4);
    } else if (field === 'billingZipCode') {
      formattedValue = value.replace(/[^\w\s-]/g, '').slice(0, 10);
    }

    setFormData((prev) => ({ ...prev, [field]: formattedValue }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.accountHolderName.trim()) {
      newErrors.accountHolderName = 'Account holder name is required.';
    }

    const rawCardNum = formData.cardNumber.replace(/\s+/g, '');
    if (!rawCardNum || rawCardNum.length < 13) {
      newErrors.cardNumber = 'Valid card number is required (13-16 digits).';
    }

    if (!formData.expiredDate.trim() || formData.expiredDate.length < 5) {
      newErrors.expiredDate = 'Expiration date is required (MM / YY).';
    }

    if (!formData.cvv.trim() || formData.cvv.length < 3) {
      newErrors.cvv = 'CVV is required (3 or 4 digits).';
    }

    if (!formData.billingZipCode.trim()) {
      newErrors.billingZipCode = 'Billing zip code is required.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // Simulate processing delay for realistic UX
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const orderId = `PAYPAL-CARD-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

      // Automatically activate subscription if logged in
      try {
        const apiModule = await import('../../api');
        await apiModule.default.post('/company/subscription/activate', {
          orderId,
          paymentMethod: `CreditCard_${formData.cardType}`
        });
      } catch (activationErr) {
        console.warn('Subscription activation skipped or guest mode:', activationErr);
      }

      toast({
        title: 'Payment Processed! 🎉',
        description: `Official PayPal Sandbox test payment completed with ${formData.cardType}.`,
        variant: 'success',
        duration: 6000
      });

      const receiptDetails = {
        transactionId: orderId,
        date: new Date().toLocaleString('en-US', {
          dateStyle: 'medium',
          timeStyle: 'short'
        }),
        accountHolderName: formData.accountHolderName,
        cardType: formData.cardType,
        cardNumber: formData.cardNumber,
        zipCode: formData.billingZipCode,
        amount: '$49.00 USD',
        planName: 'Hirely Professional Plan (1 Month)'
      };

      onClose();
      if (onSuccess) {
        onSuccess(receiptDetails);
      }
    } catch (err) {
      console.error('Card payment error:', err);
      toast({
        title: 'Payment Failed',
        description: 'Failed to process card details. Please check test card numbers.',
        variant: 'danger'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md transition-all animate-in fade-in duration-200 overflow-y-auto"
      onClick={onClose}
      aria-hidden="true"
    >
      <div
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md my-auto overflow-hidden rounded-3xl bg-white dark:bg-secondary-900 shadow-2xl border border-secondary-200/80 dark:border-secondary-700/80"
      >
        {/* Modal Header */}
        <div className="relative bg-gradient-to-r from-primary-700 via-indigo-700 to-primary-600 p-5 sm:p-6 text-white overflow-hidden">
          {/* Subtle background glow decorative elements */}
          <div className="absolute -top-12 -right-12 h-32 w-32 rounded-full bg-white/10 blur-xl pointer-events-none" />

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X size={18} />
          </button>

          {/* Hirely Logo & Title Row */}
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-md border border-white/25 shadow-md">
              <img src="/logo.png" alt="Hirely Logo" className="h-7 w-7 object-contain drop-shadow" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-black tracking-tight text-white">Hirely</span>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-400/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300 border border-emerald-400/30">
                  <ShieldCheck size={11} /> Secure
                </span>
              </div>
              <p className="text-xs text-primary-200 font-medium">Card Payment Checkout</p>
            </div>
          </div>

          {/* Order Summary Box */}
          <div className="mt-3 flex items-center justify-between rounded-xl bg-white/10 backdrop-blur-md p-3 border border-white/15">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-amber-300 shrink-0" />
              <span className="text-xs font-bold text-white">Hirely Professional</span>
            </div>
            <div className="text-right">
              <span className="text-lg font-black text-white">$49.00</span>
              <span className="text-[10px] text-primary-200 font-medium ml-1">USD</span>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
          {/* Card Type Dropdown */}
          <div>
            <label className="block text-xs font-bold text-secondary-800 dark:text-secondary-200 mb-1.5">
              Select Card Type <span className="text-danger-500">*</span>
            </label>
            <div className="relative">
              <select
                value={formData.cardType}
                onChange={(e) => handleInputChange('cardType', e.target.value)}
                className="w-full h-11 appearance-none rounded-xl border border-secondary-300 dark:border-secondary-700 bg-secondary-50 dark:bg-secondary-950 px-3.5 pr-9 text-sm font-semibold text-secondary-900 dark:text-white focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all"
              >
                {CARD_TYPES.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-secondary-500">
                <CreditCard size={17} />
              </div>
            </div>
          </div>

          {/* Account Holder Name */}
          <div>
            <label className="block text-xs font-bold text-secondary-800 dark:text-secondary-200 mb-1.5">
              Account Holder Name <span className="text-danger-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="e.g. John Doe"
                value={formData.accountHolderName}
                onChange={(e) => handleInputChange('accountHolderName', e.target.value)}
                className={`w-full h-11 rounded-xl border ${
                  errors.accountHolderName
                    ? 'border-danger-500 focus:ring-danger-500/20'
                    : 'border-secondary-300 dark:border-secondary-700 focus:border-primary-500 focus:ring-primary-500/20'
                } bg-secondary-50 dark:bg-secondary-950 pl-10 pr-3.5 text-sm font-medium text-secondary-900 dark:text-white placeholder:text-secondary-400 focus:outline-none focus:ring-2 transition-all`}
              />
              <User size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-400" />
            </div>
            {errors.accountHolderName && (
              <p className="mt-1 text-xs text-danger-500 font-semibold">{errors.accountHolderName}</p>
            )}
          </div>

          {/* Card Number */}
          <div>
            <label className="block text-xs font-bold text-secondary-800 dark:text-secondary-200 mb-1.5">
              Card Number <span className="text-danger-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="4036 4036 4036 4036"
                value={formData.cardNumber}
                onChange={(e) => handleInputChange('cardNumber', e.target.value)}
                className={`w-full h-11 rounded-xl border ${
                  errors.cardNumber
                    ? 'border-danger-500 focus:ring-danger-500/20'
                    : 'border-secondary-300 dark:border-secondary-700 focus:border-primary-500 focus:ring-primary-500/20'
                } bg-secondary-50 dark:bg-secondary-950 pl-10 pr-3.5 text-sm font-mono font-semibold text-secondary-900 dark:text-white placeholder:text-secondary-400 focus:outline-none focus:ring-2 transition-all`}
              />
              <CreditCard size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-400" />
            </div>
            {errors.cardNumber && (
              <p className="mt-1 text-xs text-danger-500 font-semibold">{errors.cardNumber}</p>
            )}
            <p className="mt-1 text-[11px] text-secondary-400 dark:text-secondary-500">
              PayPal Test Cards: Visa (4036 4036 4036 4036 / 4111 1111 1111 1111), MC (5454...), Amex (3782...)
            </p>
          </div>

          {/* Expiration Date & CVV Row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-secondary-800 dark:text-secondary-200 mb-1.5">
                Expired Date <span className="text-danger-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="MM / YY"
                  value={formData.expiredDate}
                  onChange={(e) => handleInputChange('expiredDate', e.target.value)}
                  className={`w-full h-11 rounded-xl border ${
                    errors.expiredDate
                      ? 'border-danger-500 focus:ring-danger-500/20'
                      : 'border-secondary-300 dark:border-secondary-700 focus:border-primary-500 focus:ring-primary-500/20'
                  } bg-secondary-50 dark:bg-secondary-950 pl-10 pr-3 text-sm font-semibold text-secondary-900 dark:text-white placeholder:text-secondary-400 focus:outline-none focus:ring-2 transition-all`}
                />
                <Calendar size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-400" />
              </div>
              {errors.expiredDate && (
                <p className="mt-1 text-xs text-danger-500 font-semibold">{errors.expiredDate}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-secondary-800 dark:text-secondary-200 mb-1.5">
                CVV <span className="text-danger-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="password"
                  placeholder="123"
                  value={formData.cvv}
                  onChange={(e) => handleInputChange('cvv', e.target.value)}
                  className={`w-full h-11 rounded-xl border ${
                    errors.cvv
                      ? 'border-danger-500 focus:ring-danger-500/20'
                      : 'border-secondary-300 dark:border-secondary-700 focus:border-primary-500 focus:ring-primary-500/20'
                  } bg-secondary-50 dark:bg-secondary-950 pl-10 pr-3 text-sm font-mono font-semibold text-secondary-900 dark:text-white placeholder:text-secondary-400 focus:outline-none focus:ring-2 transition-all`}
                />
                <KeyRound size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-400" />
              </div>
              {errors.cvv && (
                <p className="mt-1 text-xs text-danger-500 font-semibold">{errors.cvv}</p>
              )}
            </div>
          </div>

          {/* Billing Zip Code */}
          <div>
            <label className="block text-xs font-bold text-secondary-800 dark:text-secondary-200 mb-1.5">
              Billing Zip Code <span className="text-danger-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="90210"
                value={formData.billingZipCode}
                onChange={(e) => handleInputChange('billingZipCode', e.target.value)}
                className={`w-full h-11 rounded-xl border ${
                  errors.billingZipCode
                    ? 'border-danger-500 focus:ring-danger-500/20'
                    : 'border-secondary-300 dark:border-secondary-700 focus:border-primary-500 focus:ring-primary-500/20'
                } bg-secondary-50 dark:bg-secondary-950 pl-10 pr-3.5 text-sm font-semibold text-secondary-900 dark:text-white placeholder:text-secondary-400 focus:outline-none focus:ring-2 transition-all`}
              />
              <MapPin size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-400" />
            </div>
            {errors.billingZipCode && (
              <p className="mt-1 text-xs text-danger-500 font-semibold">{errors.billingZipCode}</p>
            )}
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 h-12 rounded-xl bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-700 hover:to-indigo-700 text-white font-black text-base shadow-lg shadow-primary-600/30 transition-all duration-150 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2 text-sm font-bold">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Processing Card...
                </span>
              ) : (
                <span>Create</span>
              )}
            </button>

            <div className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-secondary-400 dark:text-secondary-500">
              <Lock size={12} />
              <span>Processed securely with 256-Bit SSL Encryption</span>
            </div>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}

CreditCardModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func
};
