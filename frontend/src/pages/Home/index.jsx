import React, { useEffect, useRef } from 'react';
import {
  Button, Badge,
  Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter,
  StatCard, Avatar, Tooltip,
} from '../../components/ui';
import {
  Sparkles, Building2, Search, ArrowRight,
  Zap, Target, Users, Briefcase, TrendingUp, Clock,
  Brain, MessageSquare, Video, BarChart2, Layers,
  Mail,
} from 'lucide-react';

/* ─── Scroll-aware header opacity ─────────────────────────────────────────── */

function useScrollGlass(ref) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onScroll = () => {
      const y = window.scrollY;
      // Ramp from bg-white/50 → bg-white/85 over the first 200 px
      const opacity = Math.min(0.5 + (y / 200) * 0.35, 0.85);
      el.style.setProperty('--header-bg-opacity', opacity.toString());
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [ref]);
}

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

/* ─── Reusable fade-in wrapper ─────────────────────────────────────────────── */

function FadeSection({ children, className = '', delay = 0 }) {
  const ref = useRef(null);
  useFadeIn(ref);
  return (
    <div
      ref={ref}
      className={`section-fade ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

/* ─── Data ─────────────────────────────────────────────────────────────────── */

const MOCK_JOBS = [
  { id: 101, title: 'Senior UX Researcher',  company: 'DesignWorks',   location: 'Remote',     type: 'Full-time' },
  { id: 102, title: 'Data Scientist',         company: 'AnalyticsPro',  location: 'London, UK', type: 'Hybrid'    },
  { id: 103, title: 'Frontend Developer',     company: 'WebSolutions',  location: 'Berlin, DE', type: 'Contract'  },
];

const AI_FEATURES = [
  { icon: Brain,        title: 'AI Candidate Matching',       description: 'Instantly score and rank applicants using multi-dimensional skill and culture fit analysis.', variant: 'ai', span: 'md:col-span-2' },
  { icon: MessageSquare, title: 'Interview Question Generator', description: 'Auto-generate role-specific interview sets from the job description in seconds.',               variant: 'ai', span: '' },
  { icon: Video,        title: 'Video Interview Analysis',    description: 'Transcribe, score, and flag key moments from async video responses automatically.',              variant: 'info', span: '' },
  { icon: BarChart2,    title: 'Sentiment Analysis',          description: 'Surface candidate communication patterns and engagement signals from written responses.',         variant: 'info', span: '' },
  { icon: Layers,       title: 'Skill-Gap Identification',    description: 'Benchmark applicants against your benchmark profile and surface training gaps upfront.',          variant: 'success', span: '' },
];

const STATS = [
  { label: 'Roles Filled Monthly', value: '2,400+', icon: Briefcase, trend: { direction: 'up', value: '+12% MoM' } },
  { label: 'Active Candidates',    value: '95,000', icon: Users,     trend: { direction: 'up', value: '+8.3%'    } },
  { label: 'Avg. Days to Hire',    value: '14.2',   icon: Clock,     trend: { direction: 'down', value: '−3.1 days' }, trendUpIsGood: false },
  { label: 'Offer Acceptance',     value: '93%',    icon: TrendingUp, trend: { direction: 'up', value: '+5% YoY' } },
];

const FOOTER_LINKS = {
  Product:  ['Job Search', 'AI Matching', 'Analytics', 'Integrations'],
  Company:  ['About Us', 'Careers', 'Blog', 'Press'],
  Resources:['Documentation', 'Status', 'Community', 'Changelog'],
  Legal:    ['Privacy', 'Terms', 'Cookie Policy', 'GDPR'],
};

/* ─── Main Component ───────────────────────────────────────────────────────── */

export default function Home() {
  const headerRef = useRef(null);
  useScrollGlass(headerRef);

  return (
    <>
      {/* ── Inline styles: glass utilities, fade animation, accessibility ── */}
      <style>{`
        /* Layer 1 glass — the single source of truth for glass styling */
        .glass-layer-1 {
          background-color: rgba(255,255,255, var(--header-bg-opacity, 0.7));
          backdrop-filter: blur(20px) saturate(1.5);
          -webkit-backdrop-filter: blur(20px) saturate(1.5);
          border-bottom: 1px solid rgba(255,255,255,0.35);
        }

        /* Stats strip glass */
        .glass-stats-strip {
          background: rgba(255,255,255,0.60);
          backdrop-filter: blur(16px) saturate(1.4);
          -webkit-backdrop-filter: blur(16px) saturate(1.4);
          border: 1px solid rgba(255,255,255,0.40);
        }

        /* Icon chip glass accent */
        .glass-icon-chip {
          backdrop-filter: blur(4px);
          -webkit-backdrop-filter: blur(4px);
        }

        /* Accessibility: prefers-reduced-transparency — drop to near-solid frost */
        @media (prefers-reduced-transparency: reduce) {
          .glass-layer-1 {
            background-color: rgba(255,255,255,0.95) !important;
            backdrop-filter: none !important;
            -webkit-backdrop-filter: none !important;
            border-bottom: 1px solid rgba(0,0,0,0.12);
          }
          .glass-stats-strip {
            background: rgba(255,255,255,0.96) !important;
            backdrop-filter: none !important;
            -webkit-backdrop-filter: none !important;
            border: 1px solid rgba(0,0,0,0.12);
          }
          .glass-icon-chip {
            backdrop-filter: none !important;
            -webkit-backdrop-filter: none !important;
          }
        }

        /* Accessibility: forced-colors / high contrast */
        @media (forced-colors: active) {
          .glass-layer-1, .glass-stats-strip {
            border: 1px solid ButtonText;
          }
        }

        /* Section entrance animation */
        .section-fade {
          opacity: 0;
          transform: translateY(24px);
          transition: opacity 0.55s ease, transform 0.55s ease;
        }
        .section-fade.is-visible {
          opacity: 1;
          transform: none;
        }

        /* Accessibility: prefers-reduced-motion — fade only, no translate */
        @media (prefers-reduced-motion: reduce) {
          .section-fade {
            transform: none !important;
            transition: opacity 0.3s ease !important;
          }
          .animate-pulse, .animate-bounce {
            animation: none !important;
          }
        }
      `}</style>

      <div className="min-h-screen flex flex-col bg-secondary-50">

        {/* ── LAYER 1: Sticky Glass Header ────────────────────────────────── */}
        <header
          ref={headerRef}
          className="glass-layer-1 sticky top-0 z-50 px-6 py-4 flex items-center justify-between transition-all duration-300"
          style={{ '--header-bg-opacity': 0.7 }}
        >
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="bg-primary-500 p-2 rounded-xl">
              <Sparkles className="text-white w-5 h-5" aria-hidden="true" />
            </div>
            <span className="text-h3 text-secondary-900 font-extrabold tracking-tight select-none">
              RecruiterAI
            </span>
          </div>

          {/* Nav Actions — always solid text, only background is glass */}
          <nav className="flex items-center gap-3" aria-label="Main navigation">
            <Button variant="ghost" onClick={() => window.location.href = '/login'}>
              Log In
            </Button>
            <div className="hidden sm:flex gap-3">
              <Button variant="outline" onClick={() => window.location.href = '/register/candidate'}>
                Find a Job
              </Button>
              <Button variant="primary" onClick={() => window.location.href = '/register/company'}>
                Hire Talent
              </Button>
            </div>
          </nav>
        </header>

        <main>

          {/* ── SECTION 2: Hero — Layer 0 (ambient) + Layer 2 (content) ──── */}
          <section
            className="relative overflow-hidden bg-secondary-900 text-white py-32 px-6"
            aria-labelledby="hero-heading"
          >
            {/* Layer 0 — decorative orbs, no text, safe glass use */}
            <div aria-hidden="true" className="pointer-events-none">
              <div className="absolute -top-32 -left-24 w-[520px] h-[520px] rounded-full bg-primary-500/30 blur-[140px] animate-pulse" />
              <div className="absolute -bottom-32 -right-24 w-[480px] h-[480px] rounded-full bg-ai-500/25 blur-[140px] animate-pulse" style={{ animationDelay: '2.2s' }} />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full bg-primary-300/10 blur-[80px]" />
            </div>

            {/* Layer 2 — solid content, protected from ambient translucency */}
            <div className="relative z-10 max-w-5xl mx-auto text-center space-y-8">
              <Badge variant="ai" className="inline-flex gap-1.5 uppercase tracking-widest text-caption">
                <Sparkles size={12} aria-hidden="true" />
                AI-Powered Recruitment
              </Badge>

              {/* text-display on dark solid background — contrast guaranteed */}
              <h1 id="hero-heading" className="text-display font-black leading-tight tracking-tighter text-white">
                Connect Talent With Opportunity,{' '}
                <span className="text-primary-300">Intelligently.</span>
              </h1>

              <p className="text-body-lg text-secondary-300 max-w-2xl mx-auto leading-relaxed">
                Whether you're hunting for your dream role or sourcing top-tier professionals,
                our AI platform delivers precision matches — not noise.
              </p>

              <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
                <Button
                  size="lg"
                  variant="primary"
                  leftIcon={<Search size={18} aria-hidden="true" />}
                  onClick={() => window.location.href = '/register/candidate'}
                >
                  I'm a Candidate
                </Button>
                <Button
                  size="lg"
                  variant="secondary"
                  leftIcon={<Building2 size={18} aria-hidden="true" />}
                  className="bg-white text-secondary-900 hover:bg-secondary-50"
                  onClick={() => window.location.href = '/register/company'}
                >
                  I'm a Company
                </Button>
              </div>
            </div>
          </section>

          {/* ── SECTION 3: Split Pathways — Layer 2 solid cards ─────────── */}
          <section
            className="py-24 px-6 bg-secondary-50 relative -mt-8 rounded-t-[2.5rem] z-10 shadow-[0_-8px_40px_rgba(0,0,0,0.08)]"
            aria-labelledby="pathways-heading"
          >
            <div className="max-w-6xl mx-auto">
              <FadeSection className="text-center mb-12">
                <h2 id="pathways-heading" className="text-h1 text-secondary-900 tracking-tight">
                  Two paths. One platform.
                </h2>
                <p className="text-body-lg text-secondary-500 mt-3 max-w-xl mx-auto">
                  Choose your journey and get started in minutes.
                </p>
              </FadeSection>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                {/* Candidate Card — solid Layer 2, glass only on icon chip */}
                <FadeSection delay={80}>
                  <Card hoverable className="group bg-white border border-secondary-200 shadow-md hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 overflow-hidden h-full">
                    <CardHeader className="pt-10 pb-2">
                      {/* Icon chip — the ONE glass accent allowed inside content cards (plan §3) */}
                      <div className="glass-icon-chip bg-primary-50/60 border border-white/50 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                        <Target className="text-primary-600 w-8 h-8" aria-hidden="true" />
                      </div>
                      <CardTitle className="text-h2">For Candidates</CardTitle>
                      <CardDescription className="text-body-lg text-secondary-600 mt-2">
                        Elevate your career trajectory with precision AI matching.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-4 text-secondary-700">
                        {[
                          ['AI-Driven Matches', 'Stop searching. Let our algorithm surface roles tailored exactly to your unique skillset.'],
                          ['Unified Dashboard', 'Track every application, interview, and offer in one streamlined interface.'],
                          ['Instant Notifications', 'Get real-time alerts the moment a recruiter views your profile or advances your application.'],
                        ].map(([title, desc]) => (
                          <li key={title} className="flex items-start gap-3">
                            <div className="mt-1 bg-primary-100 p-1 rounded-full shrink-0">
                              <Zap size={13} className="text-primary-600" aria-hidden="true" />
                            </div>
                            <span className="text-body-sm"><strong>{title}:</strong> {desc}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                    <CardFooter className="pt-6 pb-8">
                      <Button
                        variant="ghost"
                        className="text-primary-600 hover:text-primary-700 p-0"
                        rightIcon={<ArrowRight size={16} aria-hidden="true" />}
                        onClick={() => window.location.href = '/register/candidate'}
                      >
                        Create your profile
                      </Button>
                    </CardFooter>
                  </Card>
                </FadeSection>

                {/* Company Card — same pattern */}
                <FadeSection delay={160}>
                  <Card hoverable className="group bg-white border border-secondary-200 shadow-md hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 overflow-hidden h-full">
                    <CardHeader className="pt-10 pb-2">
                      <div className="glass-icon-chip bg-ai-50/60 border border-white/50 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                        <Building2 className="text-ai-600 w-8 h-8" aria-hidden="true" />
                      </div>
                      <CardTitle className="text-h2">For Companies</CardTitle>
                      <CardDescription className="text-body-lg text-secondary-600 mt-2">
                        Build world-class teams with intelligent automation.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-4 text-secondary-700">
                        {[
                          ['Automated Screening', 'Instantly filter top candidates with AI-powered skill assessments and scoring.'],
                          ['Structured Pipelines', 'Gain org-wide visibility into every hiring stage to reduce time-to-hire.'],
                          ['Collaborative Reviews', 'Invite your team, leave structured feedback, and reach consensus faster.'],
                        ].map(([title, desc]) => (
                          <li key={title} className="flex items-start gap-3">
                            <div className="mt-1 bg-ai-100 p-1 rounded-full shrink-0">
                              <Zap size={13} className="text-ai-600" aria-hidden="true" />
                            </div>
                            <span className="text-body-sm"><strong>{title}:</strong> {desc}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                    <CardFooter className="pt-6 pb-8">
                      <Button
                        variant="ghost"
                        className="text-ai-600 hover:text-ai-700 p-0"
                        rightIcon={<ArrowRight size={16} aria-hidden="true" />}
                        onClick={() => window.location.href = '/register/company'}
                      >
                        Start hiring today
                      </Button>
                    </CardFooter>
                  </Card>
                </FadeSection>

              </div>
            </div>
          </section>

          {/* ── SECTION 5: AI Features Bento Grid — Layer 2 solid cards ─── */}
          <section
            className="py-24 px-6 bg-white border-t border-secondary-100"
            aria-labelledby="ai-heading"
          >
            <div className="max-w-6xl mx-auto">
              <FadeSection className="text-center mb-14">
                <Badge variant="ai" className="mb-4 uppercase tracking-widest text-caption">
                  AI-Powered
                </Badge>
                <h2 id="ai-heading" className="text-h1 text-secondary-900 tracking-tight">
                  Intelligence at every step
                </h2>
                <p className="text-body-lg text-secondary-500 mt-3 max-w-xl mx-auto">
                  Five AI capabilities, built natively into the hiring workflow.
                </p>
              </FadeSection>

              {/* Bento grid — anchor card spans 2 cols per plan §5 */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {AI_FEATURES.map(({ icon: Icon, title, description, variant, span }, i) => (
                  <FadeSection key={title} delay={i * 80} className={span}>
                    <Card className={`bg-secondary-50 border border-secondary-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 h-full ${span}`}>
                      <CardHeader>
                        {/* Icon chip glass accent — same pattern as §3 */}
                        <div className={`glass-icon-chip bg-${variant}-50/60 border border-white/50 w-12 h-12 rounded-xl flex items-center justify-center mb-4`}>
                          <Icon className={`text-${variant}-600 w-6 h-6`} aria-hidden="true" />
                        </div>
                        <CardTitle className="text-h4">{title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-body-sm text-secondary-600">{description}</p>
                      </CardContent>
                      <CardFooter>
                        <Badge variant={variant} size="sm">AI-Powered</Badge>
                      </CardFooter>
                    </Card>
                  </FadeSection>
                ))}
              </div>
            </div>
          </section>

          {/* ── SECTION 4: Featured Jobs — Layer 2, no glass ─────────────── */}
          <section
            className="py-24 px-6 bg-secondary-50 border-t border-secondary-100 relative"
            aria-labelledby="jobs-heading"
          >
            {/* Subtle dot-grid decoration (Layer 0, purely visual) */}
            <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:20px_20px] opacity-40 pointer-events-none" />

            <div className="max-w-6xl mx-auto relative z-10">
              <FadeSection className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
                <div>
                  <h2 id="jobs-heading" className="text-h1 text-secondary-900 tracking-tight">Featured Open Roles</h2>
                  <p className="text-body-lg text-secondary-500 mt-2">Discover high-impact positions hiring right now.</p>
                </div>
                <Button variant="outline" rightIcon={<ArrowRight size={16} aria-hidden="true" />} onClick={() => window.location.href = '/register/candidate'}>
                  View all roles
                </Button>
              </FadeSection>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {MOCK_JOBS.map(({ id, title, company, location, type }, i) => (
                  <FadeSection key={id} delay={i * 90}>
                    <Card hoverable className="bg-white border border-secondary-200 shadow-sm hover:shadow-lg transition-shadow duration-300 h-full">
                      <CardHeader>
                        <div className="flex justify-between items-start mb-3">
                          <Tooltip content={company} position="top">
                            <div className="bg-primary-50 text-primary-700 font-extrabold text-xl w-12 h-12 rounded-xl flex items-center justify-center select-none">
                              {company.charAt(0)}
                            </div>
                          </Tooltip>
                          <Badge variant={type === 'Full-time' ? 'success' : type === 'Hybrid' ? 'info' : 'warning'} size="sm">
                            {type}
                          </Badge>
                        </div>
                        <CardTitle className="text-h4 mt-2">{title}</CardTitle>
                        <CardDescription className="text-secondary-500">{company} · {location}</CardDescription>
                      </CardHeader>
                      <CardFooter className="border-t border-secondary-100 pt-4">
                        <Button variant="outline" className="w-full" size="sm" onClick={() => window.location.href = '/login'}>
                          Log In to Apply
                        </Button>
                      </CardFooter>
                    </Card>
                  </FadeSection>
                ))}
              </div>
            </div>
          </section>

          {/* ── SECTION 6: Trust & Stats Strip — Layer 1 glass container ─── */}
          <section
            className="py-20 px-6 bg-secondary-900 relative overflow-hidden"
            aria-labelledby="stats-heading"
          >
            {/* Layer 0 ambient orbs */}
            <div aria-hidden="true" className="pointer-events-none">
              <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-primary-500/20 blur-[100px]" />
              <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-ai-500/15 blur-[100px]" />
            </div>

            <div className="max-w-6xl mx-auto relative z-10">
              <FadeSection className="text-center mb-12">
                <h2 id="stats-heading" className="text-h1 text-white tracking-tight">
                  Trusted by thousands of teams
                </h2>
                <p className="text-body-lg text-secondary-300 mt-3">Real numbers, real results.</p>
              </FadeSection>

              {/* The glass container — bold numerals, predictable contrast (plan §6) */}
              <FadeSection delay={100}>
                <div className="glass-stats-strip rounded-2xl p-8">
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                    {STATS.map((stat, i) => (
                      <div key={stat.label}>
                        <StatCard
                          label={stat.label}
                          value={stat.value}
                          icon={stat.icon}
                          trend={stat.trend}
                          trendUpIsGood={stat.trendUpIsGood}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </FadeSection>

              {/* Testimonial row — fully solid per plan §6 note */}
              <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { name: 'Priya Sharma',    role: 'Engineering Lead @ FinTech Corp',  quote: 'RecruiterAI cut our time-to-hire by 40% in the first quarter. The AI scoring is eerily accurate.' },
                  { name: 'Marcus Chen',     role: 'Head of Talent @ Innovate.io',     quote: 'The structured pipelines finally gave our distributed team a single source of truth for every candidate.' },
                  { name: 'Sophie Müller',   role: 'CTO @ WebSolutions GmbH',          quote: 'I was skeptical about AI screening — but the skill-gap reports surfaced things we missed in manual review.' },
                ].map(({ name, role, quote }, i) => (
                  <FadeSection key={name} delay={i * 100}>
                    <Card className="bg-white border border-secondary-100 shadow-sm h-full">
                      <CardContent className="pt-6">
                        <p className="text-body-sm text-secondary-700 italic leading-relaxed">"{quote}"</p>
                      </CardContent>
                      <CardFooter className="gap-3 border-t border-secondary-100 pt-4">
                        <Avatar name={name} size="sm" />
                        <div>
                          <p className="text-caption font-semibold text-secondary-900">{name}</p>
                          <p className="text-caption text-secondary-500">{role}</p>
                        </div>
                      </CardFooter>
                    </Card>
                  </FadeSection>
                ))}
              </div>
            </div>
          </section>

          {/* ── SECTION 7: Final CTA Banner — Layer 0 + Layer 2 ─────────── */}
          <section
            className="relative overflow-hidden bg-secondary-900 py-28 px-6 text-center"
            aria-labelledby="cta-heading"
          >
            {/* Layer 0 ambient */}
            <div aria-hidden="true" className="pointer-events-none">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full bg-primary-500/25 blur-[120px]" />
              <div className="absolute bottom-0 left-1/4 w-64 h-64 rounded-full bg-ai-400/20 blur-[80px]" />
            </div>

            {/* Layer 2 — scrim protects text contrast */}
            <div className="relative z-10 max-w-3xl mx-auto space-y-6">
              <h2 id="cta-heading" className="text-h1 text-white font-black tracking-tight">
                Ready to transform the way you hire?
              </h2>
              <p className="text-body-lg text-secondary-300 max-w-xl mx-auto">
                Join thousands of candidates and companies already using RecruiterAI to make smarter hiring decisions.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
                <Button
                  size="lg"
                  variant="primary"
                  leftIcon={<Search size={18} aria-hidden="true" />}
                  onClick={() => window.location.href = '/register/candidate'}
                >
                  Find a Job
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/40 text-white hover:bg-white/10"
                  leftIcon={<Building2 size={18} aria-hidden="true" />}
                  onClick={() => window.location.href = '/register/company'}
                >
                  Start Hiring
                </Button>
              </div>
            </div>
          </section>

        </main>

        {/* ── SECTION 8: Footer — Layer 2, fully opaque (no glass) ─────── */}
        <footer className="bg-secondary-900 border-t border-secondary-700 pt-16 pb-10 px-6" aria-label="Site footer">
          <div className="max-w-6xl mx-auto">
            {/* Brand row */}
            <div className="flex items-center gap-2 mb-10">
              <div className="bg-primary-500 p-2 rounded-xl">
                <Sparkles className="text-white w-5 h-5" aria-hidden="true" />
              </div>
              <span className="text-h3 text-white font-extrabold tracking-tight">RecruiterAI</span>
            </div>

            {/* Link columns */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
              {Object.entries(FOOTER_LINKS).map(([group, links]) => (
                <div key={group}>
                  <p className="text-overline uppercase tracking-wide text-secondary-400 mb-4">{group}</p>
                  <ul className="space-y-2">
                    {links.map((link) => (
                      <li key={link}>
                        <a href="#" className="text-body-sm text-secondary-500 hover:text-primary-400 transition-colors duration-200">
                          {link}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Bottom bar */}
            <div className="border-t border-secondary-700 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-caption text-secondary-500">
                &copy; {new Date().getFullYear()} RecruiterAI Inc. All rights reserved.
              </p>
              <div className="flex items-center gap-4">
                <a href="#" aria-label="Email" className="text-secondary-500 hover:text-primary-400 transition-colors duration-200">
                  <Mail size={18} aria-hidden="true" />
                </a>
              </div>
            </div>
          </div>
        </footer>

      </div>
    </>
  );
}
