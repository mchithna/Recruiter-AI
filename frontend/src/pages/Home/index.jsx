import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import {
  Button, Badge, Avatar,
  Card, CardContent,
} from '../../components/ui';
import {
  Building2, Search, ArrowRight,
  Zap, Target, Users, Briefcase, TrendingUp, Clock,
  Brain, BarChart2, Shield, Globe,
  Star, PlayCircle,
} from 'lucide-react';

/* ─── Intersection-observer entrance animation ─────────────────────────────── */
function useFadeIn(ref) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('is-visible');
          obs.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [ref]);
}

function FadeSection({ children, className = '', delay = 0 }) {
  const ref = useRef(null);
  useFadeIn(ref);
  return (
    <div ref={ref} className={`section-fade ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

/* ─── Animated Counter ─────────────────────────────────────────────────── */
function AnimatedCounter({ target, suffix = '', duration = 2000 }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const startTime = performance.now();
          const numericTarget = parseFloat(target.replace(/[^0-9.]/g, ''));

          const animate = (now) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
            setCount(Math.floor(eased * numericTarget));
            if (progress < 1) requestAnimationFrame(animate);
            else setCount(numericTarget);
          };
          requestAnimationFrame(animate);
          obs.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [target, duration]);

  const prefix = target.includes(',') ? count.toLocaleString() : count;
  return <span ref={ref}>{prefix}{suffix}</span>;
}

/* ─── Feature data ─────────────────────────────────────────────────────── */
const FEATURES = [
  {
    icon: Brain,
    title: 'AI-Powered Matching',
    description: 'Our neural networks analyze thousands of data points to find the perfect fit between candidate skills and company culture.',
    color: 'primary',
    span: 'md:col-span-2',
    bgImage: '/images/card-bg-ai-matching.png',
  },
  {
    icon: BarChart2,
    title: 'Live Analytics',
    description: 'Monitor pipeline health, drop-off rates, and diversity metrics through beautiful, interactive dashboards.',
    color: 'info',
    span: 'md:col-span-1',
    bgImage: '/images/card-bg-live-analytics.png',
  },
  {
    icon: Shield,
    title: 'Bias-Free Screening',
    description: 'Structured evaluations and blind reviews ensure every candidate gets a fair chance regardless of background.',
    color: 'success',
    span: 'md:col-span-1',
    bgImage: '/images/card-bg-bias-free.png',
  },
  {
    icon: Globe,
    title: 'Global Talent Network',
    description: 'Connect with top professionals worldwide. Multi-language support and timezone-aware scheduling built right in.',
    color: 'ai',
    span: 'md:col-span-2',
    bgImage: '/images/card-bg-global-network.png',
  },
];

const COLOR_MAP = {
  primary: {
    iconBg: 'bg-primary-100 dark:bg-primary-500/15',
    iconText: 'text-primary-600 dark:text-primary-400',
    glow: 'bg-primary-500/10',
  },
  info: {
    iconBg: 'bg-info-100 dark:bg-info-500/15',
    iconText: 'text-info-600 dark:text-info-400',
    glow: 'bg-info-500/10',
  },
  success: {
    iconBg: 'bg-success-100 dark:bg-success-500/15',
    iconText: 'text-success-600 dark:text-success-400',
    glow: 'bg-success-500/10',
  },
  ai: {
    iconBg: 'bg-ai-100 dark:bg-ai-500/15',
    iconText: 'text-ai-600 dark:text-ai-400',
    glow: 'bg-ai-500/10',
  },
};

const STATS = [
  { label: 'Roles Filled Monthly', value: '2,400', suffix: '+', Icon: Briefcase, trend: '+12% MoM', up: true },
  { label: 'Active Candidates', value: '95,000', suffix: '', Icon: Users, trend: '+8.3%', up: true },
  { label: 'Avg. Days to Hire', value: '14', suffix: '', Icon: Clock, trend: '−3.1 days', up: false },
  { label: 'Offer Acceptance', value: '93', suffix: '%', Icon: TrendingUp, trend: '+5% YoY', up: true },
];

const TESTIMONIALS = [
  { name: 'Priya Sharma', role: 'Engineering Lead @ FinTech Corp', quote: 'Hirely cut our time-to-hire by 40% in the first quarter. The AI scoring is eerily accurate.' },
  { name: 'Marcus Chen', role: 'Head of Talent @ Innovate.io', quote: 'The structured pipelines finally gave our distributed team a single source of truth for every candidate.' },
  { name: 'Sophie Müller', role: 'CTO @ WebSolutions GmbH', quote: 'I was skeptical about AI screening — but the skill-gap reports surfaced things we missed in manual review.' },
];

const ROLES = [
  { id: 101, title: 'Senior UX Researcher', company: 'DesignWorks', location: 'Remote', type: 'Full-time', typeVariant: 'success', initial: 'D' },
  { id: 102, title: 'Data Scientist', company: 'AnalyticsPro', location: 'London, UK', type: 'Hybrid', typeVariant: 'info', initial: 'A' },
  { id: 103, title: 'Frontend Developer', company: 'WebSolutions', location: 'Berlin, DE', type: 'Contract', typeVariant: 'warning', initial: 'W' },
];

/* ─── Main Component ───────────────────────────────────────────────────────── */
export default function Home() {
  return (
    <>
      <div className="min-h-screen w-full flex flex-col mesh-bg text-secondary-900 dark:text-white font-sans relative overflow-hidden">

      <Navbar />

      {/* Floating Background Particles */}
      <div className="particle w-24 h-24 left-[10%] animation-delay-[0s]" style={{ animationDuration: '20s' }}></div>
      <div className="particle w-40 h-40 left-[40%] animation-delay-[5s]" style={{ animationDuration: '30s' }}></div>
      <div className="particle w-16 h-16 left-[80%] animation-delay-[2s]" style={{ animationDuration: '15s' }}></div>
      <div className="particle w-32 h-32 left-[60%] animation-delay-[12s]" style={{ animationDuration: '25s' }}></div>

      <main className="relative z-10 flex-grow flex flex-col items-center pt-[80px]">

        {/* ── Decorative Background ──────────────────────────────────────── */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-primary-500/[0.07] dark:bg-primary-500/[0.05] rounded-full blur-[120px]" />
          <div className="absolute top-1/3 -left-40 w-[500px] h-[500px] bg-ai-500/[0.07] dark:bg-ai-500/[0.05] rounded-full blur-[120px]" />
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-success-500/[0.05] dark:bg-success-500/[0.03] rounded-full blur-[100px]" />
        </div>

        {/* ── SECTION 1: Hero ────────────────────────────────────────────── */}
        <section className="w-full max-w-7xl mx-auto px-6 pt-10 pb-24 lg:pt-20 lg:pb-32 flex flex-col lg:flex-row items-center gap-16 relative z-10">
          <div className="lg:w-1/2 space-y-8 text-center lg:text-left">
            <FadeSection delay={0}>
              <Badge variant="ai" className="inline-flex items-center gap-2 uppercase tracking-widest text-xs">
                <div className="w-1.5 h-1.5 rounded-full bg-ai-500 animate-pulse" />
                AI-Powered Recruitment
              </Badge>
            </FadeSection>

            <FadeSection delay={100}>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-black leading-[1.05] tracking-tighter">
                Hire the{' '}
                <span className="text-gradient-vivid">Future,</span>
                <br />
                Faster.
              </h1>
            </FadeSection>

            <FadeSection delay={200}>
              <p className="text-lg md:text-xl text-secondary-500 dark:text-secondary-400 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                A deeply immersive, AI-native talent platform that connects brilliant minds with visionary companies — in milliseconds.
              </p>
            </FadeSection>

            <FadeSection delay={300} className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
              <Link to="/register/company">
                <Button size="lg" variant="glass" className="text-base px-8 py-3 rounded-xl" leftIcon={<Building2 size={18} />}>
                  Start Hiring
                </Button>
              </Link>
              <Link to="/register/candidate">
                <Button size="lg" variant="glass" className="text-base px-8 py-3 rounded-xl" leftIcon={<Search size={18} />}>
                  Find a Job
                </Button>
              </Link>
            </FadeSection>

            {/* Trust indicators */}
            <FadeSection delay={400} className="flex items-center gap-4 justify-center lg:justify-start pt-4">
              <div className="flex -space-x-2">
                {['Priya Sharma', 'Marcus Chen', 'Sophie Müller', 'Luca Ferreira'].map((name) => (
                  <Avatar key={name} name={name} size="sm" />
                ))}
              </div>
              <div className="text-sm text-secondary-500 dark:text-secondary-400">
                <span className="font-semibold text-secondary-700 dark:text-secondary-300">2,400+</span> companies hiring
              </div>
            </FadeSection>
          </div>

          {/* Creative Hero Imagery Layout */}
          <div className="lg:w-1/2 relative z-10 w-full max-w-2xl mt-12 lg:mt-0">
            <FadeSection delay={400} className="relative w-full aspect-square md:aspect-[4/3] lg:aspect-square">
              {/* Abstract decorative rings */}
              <div className="absolute inset-0 border-2 border-primary-500/20 rounded-full animate-ping" style={{ animationDuration: '8s' }}></div>
              <div className="absolute inset-8 border border-ai-500/30 rounded-full animate-spin" style={{ animationDuration: '30s' }}></div>
              
              {/* Main Hero Image */}
              <div className="absolute inset-4 rounded-[3rem] overflow-hidden shadow-[0_20px_60px_-15px_rgba(99,102,241,0.15)] dark:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.4)] ring-1 ring-white/60 dark:ring-white/20 transform rotate-3 hover:rotate-0 transition-transform duration-700 bg-white/40 dark:bg-secondary-900/60 backdrop-blur-2xl p-2.5">
                <div className="w-full h-full rounded-[2.5rem] overflow-hidden relative bg-secondary-950 shadow-inner">
                  {/* The image acts as the glowing UI, blending its black background into the dark screen */}
                  <img src="/images/image_01.jpg" alt="AI Recruitment Dashboard" className="w-full h-full object-cover mix-blend-screen opacity-95" />
                  
                  {/* Glass overlay on the screen itself to add depth */}
                  <div className="absolute inset-0 bg-gradient-to-t from-secondary-950/90 via-secondary-900/30 to-transparent pointer-events-none"></div>
                  
                  {/* Floating stats card over image - synchronized for the dark screen */}
                  <div className="absolute bottom-8 left-8 right-8 bg-white/10 dark:bg-secondary-900/50 backdrop-blur-md border border-white/20 dark:border-white/10 rounded-2xl p-6 flex items-center justify-between shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
                    <div>
                      <p className="text-primary-300 text-sm font-semibold uppercase tracking-wider mb-1">Time to hire</p>
                      <p className="text-4xl font-black text-white">-45%</p>
                    </div>
                    <div className="w-14 h-14 rounded-full bg-primary-500 flex items-center justify-center shadow-lg shadow-primary-500/50">
                      <TrendingUp className="text-white w-7 h-7" />
                    </div>
                  </div>
                </div>
              </div>
            </FadeSection>
          </div>
        </section>

        {/* ── SECTION 2: Trusted By ────────────────────────────────────── */}
        <section className="w-full border-y border-secondary-200/60 dark:border-secondary-800/60 bg-secondary-100/50 dark:bg-secondary-900/50 py-10">
          <FadeSection className="max-w-7xl mx-auto px-6">
            <p className="text-center text-sm font-medium text-secondary-400 dark:text-secondary-500 uppercase tracking-widest mb-8">
              Trusted by forward-thinking teams
            </p>
            <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
              {['TechNova', 'Quantum Labs', 'NexGen AI', 'CloudPeak', 'DataForge', 'SynapseHQ'].map((name) => (
                <span key={name} className="text-lg font-bold text-secondary-400 dark:text-secondary-500 tracking-tight select-none">
                  {name}
                </span>
              ))}
            </div>
          </FadeSection>
        </section>

        {/* ── SECTION 3: Features Bento Grid ────────────────────────────── */}
        <section className="w-full max-w-7xl mx-auto px-6 py-24 lg:py-32 relative z-10">
          <FadeSection className="text-center mb-16">
            <Badge variant="primary" className="mb-4 uppercase tracking-widest text-xs">
              Features
            </Badge>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-5">
              Supercharged by <span className="text-gradient-vivid">Intelligence</span>
            </h2>
            <p className="text-lg text-secondary-500 dark:text-secondary-400 max-w-2xl mx-auto">
              Experience recruitment that feels like magic. Fluid, fast, and remarkably accurate.
            </p>
          </FadeSection>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {FEATURES.map(({ icon: Icon, title, description, color, span, bgImage }, i) => {
              const c = COLOR_MAP[color];
              return (
                <FadeSection key={title} delay={i * 100} className={span}>
                  <Card hoverable className="glass-card-heavy h-full rounded-2xl overflow-hidden group relative border-none">
                    {/* Responsive texture */}
                    <img src={bgImage} alt={`${title} background texture`} className="absolute inset-0 w-full h-full object-cover opacity-15 dark:opacity-40 pointer-events-none select-none z-0 dark:mix-blend-screen dark:saturate-200 transition-opacity duration-500 group-hover:opacity-25 dark:group-hover:opacity-60" />
                    {/* Decorative glow */}
                    <div className={`absolute -top-20 -right-20 w-40 h-40 ${c.glow} rounded-full blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-0`} />
                    <CardContent className="p-8 relative z-10">
                      <div className={`w-14 h-14 rounded-xl ${c.iconBg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                        <Icon className={`w-7 h-7 ${c.iconText}`} />
                      </div>
                      <h3 className="text-xl font-bold text-secondary-900 dark:text-white mb-3">{title}</h3>
                      <p className="text-secondary-600 dark:text-secondary-400 leading-relaxed">{description}</p>
                    </CardContent>
                  </Card>
                </FadeSection>
              );
            })}
          </div>
        </section>

        {/* ── SECTION 4: Two Paths ──────────────────────────────────────── */}
        <section className="w-full max-w-7xl mx-auto px-6 pb-24 lg:pb-32 relative z-10">
          <FadeSection className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-5">
              Two paths. <span className="text-gradient-vivid">One platform.</span>
            </h2>
            <p className="text-lg text-secondary-500 dark:text-secondary-400 max-w-xl mx-auto">
              Choose your journey and get started in minutes.
            </p>
          </FadeSection>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Candidate Card */}
            <FadeSection delay={80}>
              <Card hoverable className="glass-card-heavy h-full rounded-2xl overflow-hidden group relative border-none">
                {/* Responsive texture */}
                <img src="/images/card-bg-candidate.png" alt="Candidate background texture" className="absolute inset-0 w-full h-full object-cover opacity-15 dark:opacity-40 pointer-events-none select-none z-0 dark:mix-blend-screen dark:saturate-200 transition-opacity duration-500 group-hover:opacity-25 dark:group-hover:opacity-60" />
                <div className="absolute -top-10 -right-10 w-64 h-64 bg-primary-500/5 dark:bg-primary-500/5 rounded-full blur-[80px] group-hover:bg-primary-500/10 transition-all duration-500 z-0" />
                <CardContent className="p-10 flex flex-col h-full relative z-10">
                  <div className="w-14 h-14 rounded-xl bg-primary-100 dark:bg-primary-500/15 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Target className="text-primary-600 dark:text-primary-400 w-7 h-7" />
                  </div>
                  <h3 className="text-2xl font-bold text-secondary-900 dark:text-white mb-3">For Candidates</h3>
                  <p className="text-secondary-600 dark:text-secondary-400 mb-8 leading-relaxed">
                    Elevate your career trajectory with precision AI matching. Stop searching — let your dream role find you.
                  </p>
                  <ul className="space-y-3 mb-8 flex-grow">
                    {[
                      'AI-driven role matching to your exact skillset',
                      'Unified dashboard for all applications & interviews',
                      'Real-time notifications when recruiters engage',
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-3">
                        <div className="mt-0.5 bg-primary-100 dark:bg-primary-500/15 p-1 rounded-full shrink-0">
                          <Zap size={12} className="text-primary-600 dark:text-primary-400" />
                        </div>
                        <span className="text-sm text-secondary-600 dark:text-secondary-300">{item}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="relative mt-auto pt-4">
                    <div className="absolute inset-0 bg-primary-400/20 dark:bg-primary-500/10 blur-2xl rounded-full scale-150 z-0"></div>
                    <Link to="/register/candidate" className="relative z-10 block">
                      <Button variant="glass" className="rounded-xl w-auto font-semibold shadow-lg hover:shadow-xl ring-2 ring-white/50 dark:ring-white/10" rightIcon={<ArrowRight size={16} />}>
                        Create your profile
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </FadeSection>

            {/* Company Card */}
            <FadeSection delay={160}>
              <Card hoverable className="glass-card-heavy h-full rounded-2xl overflow-hidden group relative border-none">
                {/* Responsive texture */}
                <img src="/images/card-bg-company.png" alt="Company background texture" className="absolute inset-0 w-full h-full object-cover opacity-15 dark:opacity-40 pointer-events-none select-none z-0 dark:mix-blend-screen dark:saturate-200 transition-opacity duration-500 group-hover:opacity-25 dark:group-hover:opacity-60" />
                <div className="absolute -top-10 -right-10 w-64 h-64 bg-ai-500/5 dark:bg-ai-500/5 rounded-full blur-[80px] group-hover:bg-ai-500/10 transition-all duration-500 z-0" />
                <CardContent className="p-10 flex flex-col h-full relative z-10">
                  <div className="w-14 h-14 rounded-xl bg-ai-100 dark:bg-ai-500/15 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Building2 className="text-ai-600 dark:text-ai-400 w-7 h-7" />
                  </div>
                  <h3 className="text-2xl font-bold text-secondary-900 dark:text-white mb-3">For Companies</h3>
                  <p className="text-secondary-500 dark:text-secondary-400 mb-8 leading-relaxed">
                    Build world-class teams with intelligent automation. Reduce time-to-hire without sacrificing quality.
                  </p>
                  <ul className="space-y-3 mb-8 flex-grow">
                    {[
                      'Automated AI screening & candidate scoring',
                      'Org-wide structured hiring pipelines',
                      'Collaborative team reviews with scorecard sharing',
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-3">
                        <div className="mt-0.5 bg-ai-100 dark:bg-ai-500/15 p-1 rounded-full shrink-0">
                          <Zap size={12} className="text-ai-600 dark:text-ai-400" />
                        </div>
                        <span className="text-sm text-secondary-600 dark:text-secondary-300">{item}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="relative mt-auto pt-4">
                    <div className="absolute inset-0 bg-ai-400/20 dark:bg-ai-500/10 blur-2xl rounded-full scale-150 z-0"></div>
                    <Link to="/register/company" className="relative z-10 block">
                      <Button variant="glass" className="rounded-xl w-auto font-semibold shadow-lg hover:shadow-xl ring-2 ring-white/50 dark:ring-white/10" rightIcon={<ArrowRight size={16} />}>
                        Start hiring today
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </FadeSection>
          </div>
        </section>

        {/* ── SECTION 5: Featured Roles ────────────────────────────────── */}
        <section className="w-full max-w-7xl mx-auto px-6 pb-24 lg:pb-32 relative z-10">
          <FadeSection className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-2">Featured Open Roles</h2>
              <p className="text-lg text-secondary-500 dark:text-secondary-400">Discover high-impact positions hiring right now.</p>
            </div>
            <Link to="/register/candidate">
              <Button variant="glass" className="rounded-xl shrink-0" rightIcon={<ArrowRight size={16} />}>
                View all roles
              </Button>
            </Link>
          </FadeSection>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {ROLES.map(({ id, title, company, location, type, typeVariant, initial }, i) => (
              <FadeSection key={id} delay={i * 90}>
                <div className="glass-card-heavy rounded-2xl overflow-hidden h-full flex flex-col hover:-translate-y-1 transition-all duration-300 cursor-pointer group border-none">
                  {/* Card top strip */}
                  <div className="h-1 w-full bg-gradient-to-r from-primary-500 to-ai-500" />
                  <div className="p-7 flex flex-col flex-grow">
                    <div className="flex items-start justify-between mb-5">
                      <div className="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-500/15 flex items-center justify-center text-lg font-black text-primary-600 dark:text-primary-400 border border-primary-200 dark:border-primary-500/25 shrink-0">
                        {initial}
                      </div>
                      <Badge variant={typeVariant} size="sm">{type}</Badge>
                    </div>
                    <div className="flex-grow">
                      <h3 className="text-lg font-bold text-secondary-900 dark:text-white mb-1 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">{title}</h3>
                      <p className="text-secondary-500 dark:text-secondary-400 text-sm">{company}</p>
                      <div className="flex items-center gap-1.5 mt-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-secondary-300 dark:bg-secondary-600" />
                        <span className="text-secondary-400 dark:text-secondary-500 text-xs">{location}</span>
                      </div>
                    </div>
                    <Link
                      to="/login"
                      className="mt-5 w-full py-2.5 rounded-xl border border-secondary-200 dark:border-secondary-700 text-secondary-600 dark:text-secondary-300 text-sm font-medium hover:bg-primary-50 dark:hover:bg-primary-500/10 hover:border-primary-300 dark:hover:border-primary-500/30 hover:text-primary-600 dark:hover:text-primary-400 transition-all duration-200 text-center block"
                    >
                      Log In to Apply
                    </Link>
                  </div>
                </div>
              </FadeSection>
            ))}
          </div>
        </section>

        {/* ── SECTION 6: Stats & Social Proof ──────────────────────────── */}
        <section className="w-full max-w-7xl mx-auto px-6 pb-24 lg:pb-32 relative z-10">
          <FadeSection className="text-center mb-14">
            <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-5">
              Trusted by <span className="text-gradient-vivid">thousands of teams</span>
            </h2>
          </FadeSection>

          {/* Stats Row */}
          <FadeSection delay={100}>
            <div className="glass-card-heavy rounded-2xl p-8 mb-12">
              <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-secondary-100 dark:divide-secondary-800">
                {STATS.map(({ label, value, suffix, Icon, trend, up }) => (
                  <div key={label} className="flex flex-col items-center text-center px-4 py-4 gap-2">
                    <div className="w-11 h-11 rounded-full bg-primary-100 dark:bg-primary-500/15 flex items-center justify-center mb-1">
                      <Icon size={18} className="text-primary-600 dark:text-primary-400" />
                    </div>
                    <p className="text-3xl font-black text-secondary-900 dark:text-white tabular-nums">
                      <AnimatedCounter target={value} suffix={suffix} />
                    </p>
                    <p className="text-xs text-secondary-500 dark:text-secondary-400 leading-snug">{label}</p>
                    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
                      up ? 'bg-success-50 dark:bg-success-500/10 text-success-600 dark:text-success-400' : 'bg-danger-50 dark:bg-danger-500/10 text-danger-600 dark:text-danger-400'
                    }`}>
                      {up ? '↗' : '↘'} {trend}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </FadeSection>

          {/* Testimonials */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map(({ name, role, quote }, i) => (
              <FadeSection key={name} delay={i * 100}>
                <div className="glass-card-heavy rounded-2xl p-8 h-full flex flex-col justify-between hover:scale-[1.02] transition-transform duration-300">
                  {/* Stars */}
                  <div className="flex items-center gap-0.5 mb-4">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} size={14} className="text-warning-400 fill-warning-400" />
                    ))}
                  </div>
                  <p className="text-secondary-600 dark:text-secondary-300 italic leading-relaxed text-sm flex-grow mb-6">
                    &ldquo;{quote}&rdquo;
                  </p>
                  <div className="flex items-center gap-3 pt-5 border-t border-secondary-100 dark:border-secondary-800">
                    <Avatar name={name} size="sm" />
                    <div>
                      <p className="text-sm font-semibold text-secondary-900 dark:text-white">{name}</p>
                      <p className="text-xs text-secondary-400 dark:text-secondary-500">{role}</p>
                    </div>
                  </div>
                </div>
              </FadeSection>
            ))}
          </div>
        </section>

        {/* ── SECTION 7: CTA Banner ────────────────────────────────────── */}
        <section className="w-full max-w-5xl mx-auto px-6 pb-24 lg:pb-32 relative z-10">
          <FadeSection>
            <div className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-ai-700 rounded-3xl p-12 md:p-16 text-center overflow-hidden shadow-2xl">
              {/* Background decoration */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full blur-[80px]" />
                <div className="absolute bottom-0 right-0 w-48 h-48 bg-ai-300 rounded-full blur-[60px]" />
              </div>

              <div className="relative z-10">
                <h2 className="text-3xl md:text-5xl font-black text-white mb-5 drop-shadow-md">
                  Join the Hiring Revolution
                </h2>
                <p className="text-lg text-primary-100 max-w-xl mx-auto mb-10">
                  Start building your dream team today with the power of AI-driven recruitment.
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <Link to="/register/company">
                    <Button size="lg" variant="glass" className="text-base px-10 py-3 font-bold rounded-xl">
                      Start Hiring Now
                    </Button>
                  </Link>
                  <Link to="/features">
                    <Button size="lg" variant="glass" className="text-base px-10 py-3 font-bold rounded-xl" leftIcon={<PlayCircle size={18} />}>
                      Learn More
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </FadeSection>
        </section>

      </main>

      <Footer />
    </div>
    </>
  );
}
