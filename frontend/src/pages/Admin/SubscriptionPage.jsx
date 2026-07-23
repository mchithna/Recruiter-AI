import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, CheckCircle2, ShieldCheck, Zap, Sparkles, LockKeyhole } from 'lucide-react';
import api from '../../api';
import { useToast } from '../../lib/ToastContext';
import { Badge, Button, Card, CardContent, Spinner } from '../../components/ui';
import { PayPalCheckoutButton } from '../../components/payments/PayPalCheckoutButton';

export default function SubscriptionPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activating, setActivating] = useState(false);

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

  const handleManualActivation = async () => {
    try {
      setActivating(true);
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
    } catch {
      toast({
        title: 'Activation Failed',
        description: 'Could not activate subscription. Please try again.',
        variant: 'danger',
      });
    } finally {
      setActivating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  const isActive = company?.subscriptionStatus?.toLowerCase() === 'active';

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-secondary-200 dark:border-slate-800 pb-6">
        <div>
          <Badge variant="primary" className="mb-2 uppercase tracking-widest text-[10px]">
            Subscription & Billing
          </Badge>
          <h1 className="text-3xl font-black text-secondary-900 dark:text-white">
            Manage Subscription
          </h1>
          <p className="mt-1 text-sm text-secondary-500 dark:text-secondary-400">
            Activate your account to unlock modern recruitment features like Org Chart and AI pipelines.
          </p>
        </div>
        <div className="flex items-center gap-2">
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

      {/* Active Subscription Banner */}
      {isActive && (
        <Card className="border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/20 shadow-md">
          <CardContent className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/30">
                <CheckCircle2 size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-secondary-900 dark:text-white">
                  Account Fully Active
                </h3>
                <p className="text-sm text-secondary-600 dark:text-secondary-300 mt-0.5">
                  Your company <span className="font-semibold text-secondary-900 dark:text-white">{company?.name}</span> has unlimited access to all platform features including Org Chart and AI copilot.
                </p>
              </div>
            </div>
            <Button
              type="button"
              variant="primary"
              onClick={() => navigate('/admin/org-chart')}
              leftIcon={<Zap size={16} />}
              className="shrink-0"
            >
              Go to Org Chart
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Subscription Plan Card */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        <div className="md:col-span-7 space-y-6">
          <Card className="relative overflow-hidden border-primary-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl">
            <div className="bg-gradient-to-r from-primary-600 to-indigo-600 p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-widest text-primary-200">
                    Recommended Plan
                  </span>
                  <h2 className="text-2xl font-black mt-1">Hirely Professional</h2>
                </div>
                <div className="text-right">
                  <span className="text-3xl font-black">$49</span>
                  <span className="text-xs text-primary-200">/month</span>
                </div>
              </div>
              <p className="mt-2 text-xs text-primary-100 leading-relaxed">
                Complete AI-driven recruitment suite for growing companies.
              </p>
            </div>

            <CardContent className="p-6 space-y-6">
              <ul className="space-y-3">
                {[
                  'Full access to Interactive Organization Chart',
                  'Unlimited AI candidate screening & matching',
                  'Live Interview Copilot with Gemini real-time assistant',
                  'Full team staff management & role permissions',
                  'Priority support & custom recruitment workflows',
                ].map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm text-secondary-700 dark:text-secondary-300">
                    <CheckCircle2 size={18} className="text-emerald-500 mt-0.5 shrink-0" />
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
            <CardContent className="p-5 sm:p-6 space-y-5">
              <div className="flex items-center gap-2.5 text-sm font-bold text-secondary-900 dark:text-white">
                <CreditCard size={18} className="text-primary-600 dark:text-primary-400 shrink-0" />
                <span>Pay via PayPal Sandbox</span>
              </div>

              {/* PayPal Sandbox Widget */}
              <div className="rounded-2xl border border-secondary-100 bg-secondary-50/50 p-4 dark:border-slate-800 dark:bg-slate-950/60">
                <PayPalCheckoutButton onSuccess={fetchCompany} />
              </div>

              <div className="relative flex items-center justify-center my-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-secondary-200 dark:border-slate-800" />
                </div>
                <span className="relative bg-white dark:bg-slate-900 px-3 text-[11px] uppercase tracking-wider text-secondary-400 font-bold">
                  OR TEST MODE
                </span>
              </div>

              {/* Manual Sandbox Test Activation Button */}
              <Button
                type="button"
                variant="secondary"
                size="md"
                isLoading={activating}
                onClick={handleManualActivation}
                leftIcon={<Sparkles size={16} className="text-amber-500 shrink-0" />}
                className="w-full justify-center text-sm font-bold bg-amber-500/10 text-amber-700 hover:bg-amber-500/20 border border-amber-500/30 dark:text-amber-300 h-11"
              >
                Instant Activate (Sandbox Test)
              </Button>
              <p className="text-center text-[11px] leading-relaxed text-secondary-400 dark:text-secondary-500 px-2">
                Quick test shortcut for instant evaluation without typing PayPal credentials.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
