import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, CheckCircle2, Zap, Sparkles, Power } from 'lucide-react';
import api from '../../api';
import { useToast } from '../../lib/ToastContext';
import { Badge, Button, Card, CardContent, Spinner } from '../../components/ui';
import { PayPalCheckoutButton } from '../../components/payments/PayPalCheckoutButton';
import { CreditCardModal } from '../../components/payments/CreditCardModal';
import { PaymentReceiptModal } from '../../components/payments/PaymentReceiptModal';

export default function SubscriptionPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activating, setActivating] = useState(false);
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [receiptData, setReceiptData] = useState(null);

  const fetchCompany = async () => {
    try {
      setLoading(true);
      const res = await api.get('/company/me');
      setCompany(res.data);
    } catch {
      toast({
        title: 'Error loading subscription',
        description: 'Failed to fetch company subscription details.',
        variant: 'danger',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompany();
  }, []);

  const isActive = company?.subscriptionStatus?.toLowerCase() === 'active';

  const handleToggleSubscription = async () => {
    try {
      setActivating(true);
      if (isActive) {
        const res = await api.post('/company/subscription/deactivate', {});
        setCompany(res.data);
        toast({
          title: 'Subscription Deactivated',
          description: 'Account has been set to inactive.',
          variant: 'info',
          duration: 5000,
        });
      } else {
        const res = await api.post('/company/subscription/activate', {
          isManualTest: true,
          paymentMethod: 'SandboxManual',
        });
        setCompany(res.data);
        toast({
          title: 'Subscription Activated! 🎉',
          description: 'Your account is active. Org Chart and all features are now fully unlocked.',
          variant: 'success',
          duration: 6000,
        });
      }
    } catch (err) {
      console.error('Subscription toggle error:', err);
      toast({
        title: 'Action Failed',
        description: err?.response?.data?.title || err?.response?.data?.message || err?.message || 'Could not update subscription status. Please try again.',
        variant: 'danger',
      });
    } finally {
      setActivating(false);
    }
  };

  const handleCardPaymentSuccess = (receipt) => {
    setReceiptData(receipt);
    setIsReceiptModalOpen(true);
    fetchCompany();
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8 pb-16 px-1 sm:px-0">
      {/* Mobile Responsive Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-secondary-200 dark:border-slate-800 pb-5">
        <div className="space-y-1.5 w-full sm:w-auto">
          <div className="flex items-center justify-between sm:justify-start gap-2 flex-wrap">
            <Badge variant="primary" className="uppercase tracking-widest text-[9px] sm:text-[10px]">
              Subscription & Billing
            </Badge>
            <div className="flex items-center gap-1.5 sm:hidden">
              <span
                className={[
                  'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold shadow-sm',
                  isActive
                    ? 'bg-emerald-500/15 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 border border-emerald-500/30'
                    : 'bg-amber-500/15 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400 border border-amber-500/30',
                ].join(' ')}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${isActive ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                {isActive ? 'Active' : 'Pending'}
              </span>
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-secondary-900 dark:text-white leading-tight">
            Manage Subscription
          </h1>
          <p className="text-xs sm:text-sm text-secondary-500 dark:text-secondary-400 leading-relaxed max-w-xl">
            Activate your account to unlock modern recruitment features like Org Chart and AI pipelines.
          </p>
        </div>

        {/* Status Badge for Desktop */}
        <div className="hidden sm:flex items-center gap-2 shrink-0">
          <span className="text-xs font-semibold text-secondary-500 dark:text-secondary-400">Status:</span>
          <span
            className={[
              'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold shadow-sm',
              isActive
                ? 'bg-emerald-500/15 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 border border-emerald-500/30'
                : 'bg-amber-500/15 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400 border border-amber-500/30',
            ].join(' ')}
          >
            <span className={`h-2 w-2 rounded-full ${isActive ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
            {isActive ? 'Active Subscription' : 'Pending Activation'}
          </span>
        </div>
      </div>

      {/* Active Subscription Banner (Mobile Optimized) */}
      {isActive && (
        <Card className="border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/20 shadow-md">
          <CardContent className="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/30">
                <CheckCircle2 size={22} className="sm:w-6 sm:h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base sm:text-lg font-bold text-secondary-900 dark:text-white leading-tight">
                  Account Fully Active
                </h3>
                <p className="text-xs sm:text-sm text-secondary-600 dark:text-secondary-300 leading-relaxed">
                  Your company <span className="font-semibold text-secondary-900 dark:text-white">{company?.name}</span> has unlimited access to all platform features including Org Chart and AI copilot.
                </p>
              </div>
            </div>
            <Button
              type="button"
              variant="primary"
              onClick={() => navigate('/admin/org-chart')}
              leftIcon={<Zap size={16} />}
              className="w-full sm:w-auto justify-center shrink-0 h-11 text-xs sm:text-sm font-bold"
            >
              Go to Org Chart
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Subscription Plan Card & Payment Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 sm:gap-8 items-start">
        <div className="md:col-span-7 space-y-6">
          <Card className="relative overflow-hidden border-primary-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl">
            <div className="bg-gradient-to-r from-primary-600 to-indigo-600 p-5 sm:p-6 text-white">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-primary-200">
                    Recommended Plan
                  </span>
                  <h2 className="text-xl sm:text-2xl font-black mt-0.5">Hirely Professional</h2>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-2xl sm:text-3xl font-black">$49</span>
                  <span className="text-xs text-primary-200">/month</span>
                </div>
              </div>
              <p className="mt-2 text-xs text-primary-100 leading-relaxed">
                Complete AI-driven recruitment suite for growing companies.
              </p>
            </div>

            <CardContent className="p-4 sm:p-6 space-y-4 sm:space-y-6">
              <ul className="space-y-2.5 sm:space-y-3">
                {[
                  'Full access to Interactive Organization Chart',
                  'Unlimited AI candidate screening & matching',
                  'Live Interview Copilot with Gemini real-time assistant',
                  'Full team staff management & role permissions',
                  'Priority support & custom recruitment workflows',
                ].map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5 sm:gap-3 text-xs sm:text-sm text-secondary-700 dark:text-secondary-300">
                    <CheckCircle2 size={16} className="text-emerald-500 mt-0.5 shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Payment & Sandbox Options */}
        <div className="md:col-span-5 space-y-6">
          <Card className="border-secondary-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl">
            <CardContent className="p-4 sm:p-6 space-y-4 sm:space-y-5">
              <div className="flex items-center gap-2.5 text-xs sm:text-sm font-bold text-secondary-900 dark:text-white">
                <CreditCard size={18} className="text-primary-600 dark:text-primary-400 shrink-0" />
                <span>Payment Options</span>
              </div>

              {/* Credit Card Button Option */}
              <Button
                type="button"
                variant="primary"
                size="md"
                onClick={() => setIsCardModalOpen(true)}
                leftIcon={<CreditCard size={17} className="shrink-0" />}
                className="w-full justify-center text-xs sm:text-sm font-black bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-700 hover:to-indigo-700 text-white shadow-lg shadow-primary-600/25 h-11 sm:h-12"
              >
                Pay with Credit or Debit Card
              </Button>

              <div className="relative flex items-center justify-center my-1.5">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-secondary-200 dark:border-slate-800" />
                </div>
                <span className="relative bg-white dark:bg-slate-900 px-3 text-[10px] sm:text-[11px] uppercase tracking-wider text-secondary-400 font-bold">
                  OR PAYPAL CHECKOUT
                </span>
              </div>

              {/* PayPal Sandbox Widget */}
              <div className="rounded-2xl border border-secondary-100 bg-secondary-50/50 p-3 sm:p-4 dark:border-slate-800 dark:bg-slate-950/60">
                <PayPalCheckoutButton onSuccess={() => {
                  handleCardPaymentSuccess({
                    transactionId: `HIR-PAY-${Math.floor(10000000 + Math.random() * 90000000)}`,
                    date: new Date().toLocaleString(),
                    accountHolderName: company?.name || 'Hirely Member',
                    cardType: 'PayPal Account',
                    cardNumber: '4036',
                    zipCode: '90210',
                    amount: '$49.00 USD',
                    planName: 'Hirely Professional Plan (1 Month)'
                  });
                }} />
              </div>

              <div className="relative flex items-center justify-center my-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-secondary-200 dark:border-slate-800" />
                </div>
                <span className="relative bg-white dark:bg-slate-900 px-2.5 text-[10px] sm:text-[11px] uppercase tracking-wider text-secondary-400 font-bold">
                  OR TEST MODE
                </span>
              </div>

              {/* Toggle Activate / Deactivate Button */}
              <Button
                type="button"
                variant="secondary"
                size="md"
                isLoading={activating}
                onClick={handleToggleSubscription}
                leftIcon={isActive ? <Power size={15} className="text-red-500 shrink-0" /> : <Sparkles size={15} className="text-amber-500 shrink-0" />}
                className={[
                  'w-full justify-center text-xs font-bold h-auto min-h-[42px] py-2.5 px-3 leading-snug text-center transition-all duration-200',
                  isActive
                    ? 'bg-red-500/10 text-red-600 hover:bg-red-500/20 border border-red-500/30 dark:text-red-400'
                    : 'bg-amber-500/10 text-amber-700 hover:bg-amber-500/20 border border-amber-500/30 dark:text-amber-300',
                ].join(' ')}
              >
                {isActive ? 'Deactivate Subscription' : 'Instant Activate (Test)'}
              </Button>
              <p className="text-center text-[10px] sm:text-[11px] leading-relaxed text-secondary-400 dark:text-secondary-500 px-1">
                Quick test shortcut to toggle account subscription state.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Credit Card Form Modal */}
      <CreditCardModal
        isOpen={isCardModalOpen}
        onClose={() => setIsCardModalOpen(false)}
        onSuccess={handleCardPaymentSuccess}
      />

      {/* Payment Success Receipt Modal */}
      <PaymentReceiptModal
        isOpen={isReceiptModalOpen}
        onClose={() => setIsReceiptModalOpen(false)}
        receiptData={receiptData}
      />
    </div>
  );
}
