import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Button, Badge } from '../components/ui';
import { PayPalCheckoutButton } from '../components/payments/PayPalCheckoutButton';
import { CheckCircle, ArrowRight, Sparkles } from 'lucide-react';

const SALES_EMAIL_LINK = [
  'mailto:hello@hirely.ai',
  '?subject=Hirely%20Enterprise%20plan%20inquiry',
  '&body=Hello%20Hirely%20Sales%2C%0A%0A',
  'I%27m%20interested%20in%20the%20Enterprise%20plan.',
  '%20Please%20contact%20me%20to%20discuss%20pricing%20and%20implementation.%0A%0A',
  'Thank%20you.'
].join('');

const PLANS = [
  {
    name: 'Starter',
    price: 'Free',
    period: '',
    description: 'Perfect for small teams just getting started with modern hiring.',
    features: [
      'Up to 3 active job postings',
      'Basic AI candidate matching',
      'Email notifications',
      'Standard analytics dashboard',
      'Community support',
    ],
    cta: 'Get Started Free',
    variant: 'primary',
    highlighted: false,
  },
  {
    name: 'Professional',
    price: '$49',
    period: '/month',
    description: 'For growing companies that need powerful hiring tools.',
    features: [
      'Unlimited job postings',
      'Advanced AI matching & scoring',
      'Video AI interviews',
      'Custom hiring pipelines',
      'Team collaboration tools',
      'Advanced analytics & reports',
      'Priority email support',
    ],
    cta: 'Start 7-Day Free Trial',
    variant: 'primary',
    highlighted: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    description: 'For organizations that need full customization and dedicated support.',
    features: [
      'Everything in Professional',
      'SSO & advanced security',
      'Custom integrations & API access',
      'Dedicated account manager',
      'Custom AI model training',
      'SLA guarantees',
      'On-premise deployment option',
    ],
    cta: 'Contact Sales',
    variant: 'primary',
    highlighted: false,
  },
];

export default function Pricing() {
  const navigate = useNavigate();

  const handlePlanAction = (planName) => {
    if (planName === 'Enterprise') {
      window.location.href = SALES_EMAIL_LINK;
      return;
    }

    navigate('/register/company');
  };

  return (
    <div className="min-h-screen w-full flex flex-col bg-secondary-50 dark:bg-secondary-950 text-secondary-900 dark:text-secondary-100 font-sans">
      <Navbar />

      <main className="flex-grow pt-[80px]">
        {/* Hero */}
        <section className="max-w-7xl mx-auto px-6 pt-16 pb-20 text-center">
          <Badge variant="primary" className="mb-4 uppercase tracking-widest text-xs">Pricing</Badge>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-5">
            Simple, transparent <span className="text-gradient-vivid">pricing</span>
          </h1>
          <p className="text-lg text-secondary-500 dark:text-secondary-400 max-w-2xl mx-auto">
            Start free. Scale when you're ready. No hidden fees, no surprises.
          </p>
        </section>

        {/* Pricing Cards */}
        <section className="max-w-5xl mx-auto px-6 pb-24">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            {PLANS.map(({ name, price, period, description, features, cta, variant, highlighted }) => (
              <div
                key={name}
                className={`relative rounded-2xl border overflow-hidden flex flex-col ${
                  highlighted
                    ? 'border-primary-500 dark:border-primary-400 shadow-glow-primary bg-white dark:bg-secondary-900 scale-[1.02]'
                    : 'border-secondary-200/60 dark:border-secondary-700/60 bg-white dark:bg-secondary-900'
                }`}
              >
                {highlighted && (
                  <div className="bg-gradient-to-r from-primary-600 to-ai-600 text-white text-xs font-bold text-center py-2 uppercase tracking-widest flex items-center justify-center gap-1.5">
                    <Sparkles size={12} /> Most Popular
                  </div>
                )}
                <div className="p-8 flex flex-col flex-grow">
                  <h3 className="text-lg font-bold text-secondary-900 dark:text-white mb-2">{name}</h3>
                  <div className="flex items-baseline gap-1 mb-3">
                    <span className="text-4xl font-black text-secondary-900 dark:text-white">{price}</span>
                    {period && <span className="text-secondary-500 dark:text-secondary-400 text-sm">{period}</span>}
                  </div>
                  <p className="text-sm text-secondary-500 dark:text-secondary-400 mb-6">{description}</p>

                  <ul className="space-y-3 mb-8 flex-grow">
                    {features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2.5">
                        <CheckCircle size={16} className="text-success-500 mt-0.5 shrink-0" />
                        <span className="text-sm text-secondary-600 dark:text-secondary-300">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    type="button"
                    variant={variant}
                    className={`w-full rounded-xl ${highlighted ? 'shadow-md shadow-primary-500/20' : ''}`}
                    rightIcon={<ArrowRight size={14} />}
                    onClick={() => handlePlanAction(name)}
                  >
                    {cta}
                  </Button>

                  {name === 'Professional' && <PayPalCheckoutButton />}
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
