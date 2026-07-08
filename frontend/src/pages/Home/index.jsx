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
  Mail, PlayCircle
} from 'lucide-react';

/* ─── Scroll-aware header opacity ─────────────────────────────────────────── */
function useScrollGlass(ref) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onScroll = () => {
      const rootEl = document.getElementById('root') || window;
      const y = rootEl.scrollTop ?? window.scrollY;
      const opacity = Math.min((y / 300) * 0.8, 0.8);
      const blur = Math.min((y / 300) * 24, 24);
      el.style.setProperty('--header-bg-opacity', opacity.toString());
      el.style.setProperty('--header-blur', `${blur}px`);
    };
    const target = document.getElementById('root') || window;
    target.addEventListener('scroll', onScroll, { passive: true });
    return () => target.removeEventListener('scroll', onScroll);
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

function FadeSection({ children, className = '', delay = 0 }) {
  const ref = useRef(null);
  useFadeIn(ref);
  return (
    <div ref={ref} className={`section-fade ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

/* ─── Main Component ───────────────────────────────────────────────────────── */
export default function Home() {
  const headerRef = useRef(null);
  useScrollGlass(headerRef);

  return (
    <>
      <style>{`
        /* Global Background Mesh Animation */
        @keyframes aurora {
          0% { background-position: 50% 50%, 50% 50%; }
          50% { background-position: 100% 50%, 0% 50%; }
          100% { background-position: 50% 50%, 50% 50%; }
        }
        
        .mesh-bg {
          background-color: #020617; /* slate-950 */
          background-image: 
            radial-gradient(at 0% 0%, rgba(99, 102, 241, 0.4) 0px, transparent 50%),
            radial-gradient(at 100% 100%, rgba(139, 92, 246, 0.4) 0px, transparent 50%);
          background-size: 200% 200%;
          animation: aurora 20s ease infinite;
        }

        /* Floating elements animation */
        @keyframes float-up {
          0% { transform: translateY(100vh) rotate(0deg) scale(0.8); opacity: 0; }
          20% { opacity: 0.8; }
          80% { opacity: 0.8; }
          100% { transform: translateY(-20vh) rotate(360deg) scale(1.2); opacity: 0; }
        }

        .particle {
          position: fixed;
          z-index: 0;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(8px);
          border-radius: 20%;
          animation: float-up 25s linear infinite;
        }

        /* V4 Heavy Glass for Cards */
        .glass-card-heavy {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(24px) saturate(1.5);
          -webkit-backdrop-filter: blur(24px) saturate(1.5);
          border: 1px solid rgba(255, 255, 255, 0.15);
          box-shadow: 0 32px 64px rgba(0, 0, 0, 0.3);
        }
        
        .glass-card-heavy:hover {
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.3);
          box-shadow: 0 32px 80px rgba(99, 102, 241, 0.2);
        }

        /* Fixed Liquid Glass Header */
        .glass-header-fixed {
          background: rgba(2, 6, 23, 0.55);
          backdrop-filter: blur(28px) saturate(1.8) brightness(1.1);
          -webkit-backdrop-filter: blur(28px) saturate(1.8) brightness(1.1);
          border-bottom: 1px solid rgba(255, 255, 255, 0.12);
          box-shadow: 0 4px 40px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.08);
        }

        /* Entrance Animation */
        .section-fade {
          opacity: 0;
          transform: translateY(40px) scale(0.98);
          transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .section-fade.is-visible {
          opacity: 1;
          transform: none;
        }

        /* Text Gradients */
        .text-gradient-vivid {
          background: linear-gradient(135deg, #fff 0%, #a5b4fc 50%, #e879f9 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        
        /* Overrides for text legibility on dark glass */
        .glass-card-heavy .text-secondary-900,
        .glass-card-heavy .text-secondary-600,
        .glass-card-heavy .text-secondary-500,
        .glass-card-heavy .text-secondary-700 {
          color: rgba(255, 255, 255, 0.9) !important;
        }
        .glass-card-heavy .bg-secondary-50 {
          background: rgba(255, 255, 255, 0.1) !important;
        }
      `}</style>

      <div className="min-h-screen w-full flex flex-col mesh-bg text-white font-sans relative overflow-hidden">
        
        {/* Floating Background Particles */}
        <div className="particle w-24 h-24 left-[10%] animation-delay-[0s]" style={{ animationDuration: '20s' }}></div>
        <div className="particle w-40 h-40 left-[40%] animation-delay-[5s]" style={{ animationDuration: '30s' }}></div>
        <div className="particle w-16 h-16 left-[80%] animation-delay-[2s]" style={{ animationDuration: '15s' }}></div>
        <div className="particle w-32 h-32 left-[60%] animation-delay-[12s]" style={{ animationDuration: '25s' }}></div>

        {/* ── LAYER 1: Fixed Liquid Glass Header ──────────────────────────── */}
        <header className="glass-header-fixed fixed top-0 left-0 right-0 z-50 flex justify-center">
          <div className="w-full max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2.5 rounded-xl shadow-lg shadow-indigo-500/30">
                <Sparkles className="text-white w-6 h-6" aria-hidden="true" />
              </div>
              <span className="text-2xl font-black tracking-tighter text-white drop-shadow-md">
                RecruiterAI
              </span>
            </div>
            <nav className="flex items-center gap-4">
              <Button variant="ghost" className="text-white hover:bg-white/10" onClick={() => window.location.href = '/login'}>
                Log In
              </Button>
              <div className="hidden sm:flex gap-3">
                <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 hover:border-white/40" onClick={() => window.location.href = '/register/candidate'}>
                  Find a Job
                </Button>
                <button
                  onClick={() => window.location.href = '/register/company'}
                  style={{ background: '#ffffff', color: '#1e1b4b' }}
                  className="inline-flex items-center justify-center gap-2 font-semibold rounded-button px-4 h-10 text-body-lg hover:bg-indigo-50 hover:scale-105 transition-all duration-200 active:scale-95"
                >
                  Hire Talent
                </button>
              </div>
            </nav>
          </div>
        </header>

        {/* Push content below the fixed header (header height ~72px) */}
        <main className="relative z-10 flex-grow flex flex-col items-center pt-[72px]">

          {/* ── SECTION 1: Massive Hero ────────────────────────────────────── */}
          <section className="w-full max-w-7xl mx-auto px-6 pt-10 pb-24 lg:pt-16 lg:pb-32 flex flex-col lg:flex-row items-center gap-16">
            <div className="lg:w-1/2 space-y-10 text-center lg:text-left z-20">
              <FadeSection delay={0}>
                <Badge variant="ai" className="inline-flex items-center gap-2 uppercase tracking-widest text-sm py-2 px-4 bg-indigo-500/20 border-indigo-400/30 backdrop-blur-md rounded-full shadow-[0_0_20px_rgba(99,102,241,0.3)]">
                  <div className="w-2 h-2 rounded-full bg-indigo-400 animate-ping"></div>
                  Next-Gen Recruitment
                </Badge>
              </FadeSection>
              
              <FadeSection delay={100}>
                {/* Breaking StyleGuide constraints with raw tailwind sizes for massive impact */}
                <h1 className="text-6xl md:text-7xl lg:text-[5.5rem] font-black leading-[1.05] tracking-tighter drop-shadow-2xl">
                  Hire the <span className="text-gradient-vivid italic">Future,</span><br />
                  Faster.
                </h1>
              </FadeSection>

              <FadeSection delay={200}>
                <p className="text-xl md:text-2xl text-indigo-100/80 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-light">
                  A deeply immersive, AI-native talent platform that connects brilliant minds with visionary companies in milliseconds.
                </p>
              </FadeSection>

              <FadeSection delay={300} className="flex flex-col sm:flex-row items-center gap-5 justify-center lg:justify-start">
                <Button size="lg" className="w-full sm:w-auto text-lg px-10 py-6 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl shadow-xl shadow-indigo-600/30 hover:shadow-2xl hover:shadow-indigo-500/50 hover:-translate-y-1 transition-all duration-300" leftIcon={<Building2 size={22} />} onClick={() => window.location.href = '/register/company'}>
                  Start Hiring
                </Button>
                <Button size="lg" variant="outline" className="w-full sm:w-auto text-lg px-10 py-6 border-white/20 text-white bg-white/5 backdrop-blur-md rounded-2xl hover:bg-white/10 hover:-translate-y-1 transition-all duration-300" leftIcon={<Search size={22} />} onClick={() => window.location.href = '/register/candidate'}>
                  Find a Job
                </Button>
              </FadeSection>
            </div>

            {/* Creative Hero Imagery Layout */}
            <div className="lg:w-1/2 relative z-10 w-full max-w-2xl mt-12 lg:mt-0">
              <FadeSection delay={400} className="relative w-full aspect-square md:aspect-[4/3] lg:aspect-square">
                {/* Abstract decorative rings */}
                <div className="absolute inset-0 border-2 border-indigo-500/20 rounded-full animate-ping" style={{ animationDuration: '8s' }}></div>
                <div className="absolute inset-8 border border-purple-500/30 rounded-full animate-spin" style={{ animationDuration: '30s' }}></div>
                
                {/* Main Hero Image */}
                <div className="absolute inset-4 rounded-[3rem] overflow-hidden shadow-2xl ring-1 ring-white/20 transform rotate-3 hover:rotate-0 transition-transform duration-700 glass-card-heavy p-2">
                  <div className="w-full h-full rounded-[2.5rem] overflow-hidden relative">
                    <img src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" alt="Modern recruitment meeting" className="w-full h-full object-cover mix-blend-overlay opacity-80" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent"></div>
                    
                    {/* Floating stats card over image */}
                    <div className="absolute bottom-8 left-8 right-8 glass-card-heavy rounded-2xl p-6 flex items-center justify-between">
                      <div>
                        <p className="text-indigo-200 text-sm font-semibold uppercase tracking-wider mb-1">Time to hire</p>
                        <p className="text-4xl font-black text-white">-45%</p>
                      </div>
                      <div className="w-14 h-14 rounded-full bg-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/40">
                        <TrendingUp className="text-white w-7 h-7" />
                      </div>
                    </div>
                  </div>
                </div>
              </FadeSection>
            </div>
          </section>

          {/* ── SECTION 2: Fully Glass Bento Grid ──────────────────────────── */}
          <section className="w-full max-w-7xl mx-auto px-6 py-32 z-20">
            <FadeSection className="text-center mb-20">
              <h2 className="text-4xl md:text-6xl font-black text-white tracking-tight drop-shadow-lg">
                Supercharged by <span className="text-gradient-vivid">Intelligence</span>
              </h2>
              <p className="text-xl text-indigo-200/80 mt-6 max-w-2xl mx-auto">
                Experience recruitment that feels like magic. Fluid, fast, and remarkably accurate.
              </p>
            </FadeSection>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              
              {/* Massive Glass Card 1 */}
              <FadeSection delay={100} className="md:col-span-2">
                <Card hoverable className="glass-card-heavy h-[400px] border-none rounded-[2rem] overflow-hidden group">
                  <div className="absolute inset-0 z-0">
                    <img src="https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" alt="Team collaboration" className="w-full h-full object-cover opacity-20 group-hover:scale-105 transition-transform duration-1000" />
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-950/90 to-transparent"></div>
                  </div>
                  <CardContent className="relative z-10 h-full flex flex-col justify-center p-12">
                    <div className="w-16 h-16 rounded-2xl bg-indigo-500/20 backdrop-blur-md border border-indigo-400/30 flex items-center justify-center mb-8">
                      <Target className="text-indigo-300 w-8 h-8" />
                    </div>
                    <h3 className="text-4xl font-bold text-white mb-4">Precision Matching</h3>
                    <p className="text-lg text-indigo-200/80 max-w-md">Our neural networks analyze thousands of data points to find the absolute perfect fit between candidate skills and company culture.</p>
                  </CardContent>
                </Card>
              </FadeSection>

              {/* Massive Glass Card 2 */}
              <FadeSection delay={200} className="md:col-span-1">
                <Card hoverable className="glass-card-heavy h-[400px] border-none rounded-[2rem] overflow-hidden flex flex-col">
                  <CardContent className="p-10 flex-grow flex flex-col justify-between relative">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-purple-500/20 rounded-full blur-[60px]"></div>
                    <div className="w-16 h-16 rounded-2xl bg-purple-500/20 backdrop-blur-md border border-purple-400/30 flex items-center justify-center">
                      <Video className="text-purple-300 w-8 h-8" />
                    </div>
                    <div>
                      <h3 className="text-3xl font-bold text-white mb-3">Video AI</h3>
                      <p className="text-indigo-200/80">Automatically transcribe, score, and analyze candidate async video interviews in real-time.</p>
                    </div>
                  </CardContent>
                </Card>
              </FadeSection>

              {/* Massive Glass Card 3 */}
              <FadeSection delay={300} className="md:col-span-1">
                <Card hoverable className="glass-card-heavy h-[400px] border-none rounded-[2rem] overflow-hidden flex flex-col">
                  <CardContent className="p-10 flex-grow flex flex-col justify-between relative">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-teal-500/20 rounded-full blur-[60px]"></div>
                    <div className="w-16 h-16 rounded-2xl bg-teal-500/20 backdrop-blur-md border border-teal-400/30 flex items-center justify-center">
                      <BarChart2 className="text-teal-300 w-8 h-8" />
                    </div>
                    <div>
                      <h3 className="text-3xl font-bold text-white mb-3">Live Insights</h3>
                      <p className="text-indigo-200/80">Monitor pipeline health, drop-off rates, and diversity metrics through beautiful, interactive dashboards.</p>
                    </div>
                  </CardContent>
                </Card>
              </FadeSection>

              {/* Massive Glass Card 4 */}
              <FadeSection delay={400} className="md:col-span-2">
                <Card hoverable className="glass-card-heavy h-[400px] border-none rounded-[2rem] overflow-hidden group">
                  <div className="absolute inset-0 z-0">
                    <img src="https://images.unsplash.com/photo-1573164713988-8665fc963095?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" alt="Tech professionals" className="w-full h-full object-cover opacity-20 group-hover:scale-105 transition-transform duration-1000" />
                    <div className="absolute inset-0 bg-gradient-to-l from-purple-950/90 to-transparent"></div>
                  </div>
                  <CardContent className="relative z-10 h-full flex flex-col justify-center items-end text-right p-12">
                    <div className="w-16 h-16 rounded-2xl bg-purple-500/20 backdrop-blur-md border border-purple-400/30 flex items-center justify-center mb-8">
                      <Users className="text-purple-300 w-8 h-8" />
                    </div>
                    <h3 className="text-4xl font-bold text-white mb-4">Collaborative Hiring</h3>
                    <p className="text-lg text-indigo-200/80 max-w-md">Bring your entire team into the loop. Leave structured feedback, share scorecards, and reach consensus faster than ever.</p>
                  </CardContent>
                </Card>
              </FadeSection>

            </div>
          </section>

          {/* ── SECTION 3: Split Pathways (Candidate vs Company) ─────────── */}
          <section className="w-full max-w-7xl mx-auto px-6 pb-24 z-20">
            <FadeSection className="text-center mb-14">
              <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight">
                Two paths. <span className="text-gradient-vivid">One platform.</span>
              </h2>
              <p className="text-xl text-indigo-200/70 mt-4 max-w-xl mx-auto">
                Choose your journey and get started in minutes.
              </p>
            </FadeSection>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Candidate Card */}
              <FadeSection delay={80}>
                <Card hoverable className="glass-card-heavy border-none rounded-[2rem] overflow-hidden group h-full">
                  <CardContent className="p-10 flex flex-col h-full relative">
                    <div className="absolute -top-10 -right-10 w-64 h-64 bg-indigo-500/15 rounded-full blur-[80px]" />
                    <div className="w-16 h-16 rounded-2xl bg-indigo-500/20 backdrop-blur-md border border-indigo-400/30 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300">
                      <Target className="text-indigo-300 w-8 h-8" />
                    </div>
                    <h3 className="text-3xl font-bold text-white mb-4">For Candidates</h3>
                    <p className="text-indigo-200/70 mb-8 text-lg leading-relaxed">
                      Elevate your career trajectory with precision AI matching. Stop searching — let us find your dream role.
                    </p>
                    <ul className="space-y-4 mb-10 flex-grow">
                      {[
                        'AI-Driven Role Matching to your exact skillset',
                        'Unified dashboard for all applications & interviews',
                        'Real-time notifications when recruiters engage',
                      ].map(item => (
                        <li key={item} className="flex items-start gap-3">
                          <div className="mt-1 bg-indigo-500/20 p-1 rounded-full shrink-0">
                            <Zap size={13} className="text-indigo-300" />
                          </div>
                          <span className="text-indigo-200/80 text-sm">{item}</span>
                        </li>
                      ))}
                    </ul>
                    <Button variant="outline" className="border-indigo-400/40 text-indigo-300 hover:bg-indigo-500/20 rounded-xl self-start" rightIcon={<ArrowRight size={16} />} onClick={() => window.location.href = '/register/candidate'}>
                      Create your profile
                    </Button>
                  </CardContent>
                </Card>
              </FadeSection>

              {/* Company Card */}
              <FadeSection delay={160}>
                <Card hoverable className="glass-card-heavy border-none rounded-[2rem] overflow-hidden group h-full">
                  <CardContent className="p-10 flex flex-col h-full relative">
                    <div className="absolute -top-10 -right-10 w-64 h-64 bg-purple-500/15 rounded-full blur-[80px]" />
                    <div className="w-16 h-16 rounded-2xl bg-purple-500/20 backdrop-blur-md border border-purple-400/30 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300">
                      <Building2 className="text-purple-300 w-8 h-8" />
                    </div>
                    <h3 className="text-3xl font-bold text-white mb-4">For Companies</h3>
                    <p className="text-indigo-200/70 mb-8 text-lg leading-relaxed">
                      Build world-class teams with intelligent automation. Reduce time-to-hire without sacrificing quality.
                    </p>
                    <ul className="space-y-4 mb-10 flex-grow">
                      {[
                        'Automated AI screening & candidate scoring',
                        'Org-wide structured hiring pipelines',
                        'Collaborative team reviews with scorecard sharing',
                      ].map(item => (
                        <li key={item} className="flex items-start gap-3">
                          <div className="mt-1 bg-purple-500/20 p-1 rounded-full shrink-0">
                            <Zap size={13} className="text-purple-300" />
                          </div>
                          <span className="text-indigo-200/80 text-sm">{item}</span>
                        </li>
                      ))}
                    </ul>
                    <Button variant="outline" className="border-purple-400/40 text-purple-300 hover:bg-purple-500/20 rounded-xl self-start" rightIcon={<ArrowRight size={16} />} onClick={() => window.location.href = '/register/company'}>
                      Start hiring today
                    </Button>
                  </CardContent>
                </Card>
              </FadeSection>
            </div>
          </section>

          {/* ── SECTION 4: Featured Open Roles ────────────────────────────── */}
          <section className="w-full max-w-7xl mx-auto px-6 pb-24 z-20">
            <FadeSection className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
              <div>
                <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight">Featured Open Roles</h2>
                <p className="text-lg text-indigo-200/70 mt-3">Discover high-impact positions hiring right now.</p>
              </div>
              <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 rounded-xl shrink-0" rightIcon={<ArrowRight size={16} />} onClick={() => window.location.href = '/register/candidate'}>
                View all roles
              </Button>
            </FadeSection>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { id: 101, title: 'Senior UX Researcher',  company: 'DesignWorks',  location: 'Remote',     type: 'Full-time', typeVariant: 'success', initial: 'D', color: 'indigo' },
                { id: 102, title: 'Data Scientist',         company: 'AnalyticsPro', location: 'London, UK', type: 'Hybrid',    typeVariant: 'info',    initial: 'A', color: 'purple' },
                { id: 103, title: 'Frontend Developer',     company: 'WebSolutions', location: 'Berlin, DE', type: 'Contract',  typeVariant: 'warning', initial: 'W', color: 'teal'   },
              ].map(({ id, title, company, location, type, typeVariant, initial, color }, i) => (
                <FadeSection key={id} delay={i * 90}>
                  <div className="glass-card-heavy rounded-[1.5rem] overflow-hidden h-full flex flex-col hover:-translate-y-1 transition-all duration-300 cursor-pointer group">
                    {/* Card top strip */}
                    <div className="h-1 w-full" style={{ background: color === 'indigo' ? 'linear-gradient(90deg,#6366f1,#818cf8)' : color === 'purple' ? 'linear-gradient(90deg,#a855f7,#c084fc)' : 'linear-gradient(90deg,#14b8a6,#2dd4bf)' }} />
                    <div className="p-7 flex flex-col flex-grow">
                      {/* Header row */}
                      <div className="flex items-start justify-between mb-6">
                        <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl font-black border shrink-0`}
                          style={{ background: color === 'indigo' ? 'rgba(99,102,241,0.2)' : color === 'purple' ? 'rgba(168,85,247,0.2)' : 'rgba(20,184,166,0.2)', color: color === 'indigo' ? '#a5b4fc' : color === 'purple' ? '#d8b4fe' : '#5eead4', borderColor: color === 'indigo' ? 'rgba(99,102,241,0.35)' : color === 'purple' ? 'rgba(168,85,247,0.35)' : 'rgba(20,184,166,0.35)' }}>
                          {initial}
                        </div>
                        <Badge variant={typeVariant} size="sm" className="mt-1">{type}</Badge>
                      </div>
                      {/* Job details */}
                      <div className="flex-grow">
                        <h3 className="text-xl font-bold text-white mb-1 group-hover:text-indigo-200 transition-colors">{title}</h3>
                        <p className="text-indigo-300/70 text-sm">{company}</p>
                        <div className="flex items-center gap-1.5 mt-3">
                          <div className="w-1.5 h-1.5 rounded-full bg-indigo-400/60" />
                          <span className="text-indigo-300/50 text-xs">{location}</span>
                        </div>
                      </div>
                      {/* CTA */}
                      <button
                        onClick={() => window.location.href = '/login'}
                        className="mt-6 w-full py-3 rounded-xl border border-white/15 text-white/80 text-sm font-medium hover:bg-white/10 hover:border-white/30 hover:text-white transition-all duration-200"
                      >
                        Log In to Apply
                      </button>
                    </div>
                  </div>
                </FadeSection>
              ))}
            </div>
          </section>

          {/* ── SECTION 5: Stats & Social Proof ──────────────────────────── */}
          <section className="w-full max-w-7xl mx-auto px-6 pb-24 z-20">
            <FadeSection className="text-center mb-14">
              <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight">
                Trusted by <span className="text-gradient-vivid">thousands of teams</span>
              </h2>
            </FadeSection>

            {/* Inline dark glass stat tiles — avoid StatCard's white Card bg */}
            <FadeSection delay={100}>
              <div className="glass-card-heavy rounded-[2rem] p-8 mb-10">
                <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-white/10">
                  {[
                    { label: 'Roles Filled Monthly', value: '2,400+', Icon: Briefcase,  trend: '+12% MoM',  up: true  },
                    { label: 'Active Candidates',    value: '95,000', Icon: Users,      trend: '+8.3%',     up: true  },
                    { label: 'Avg. Days to Hire',    value: '14.2',   Icon: Clock,      trend: '−3.1 days', up: false },
                    { label: 'Offer Acceptance',     value: '93%',    Icon: TrendingUp, trend: '+5% YoY',   up: true  },
                  ].map(({ label, value, Icon, trend, up }) => (
                    <div key={label} className="flex flex-col items-center text-center px-6 py-6 gap-3">
                      <div className="w-12 h-12 rounded-full bg-indigo-500/20 border border-indigo-400/25 flex items-center justify-center mb-1">
                        <Icon size={20} className="text-indigo-300" />
                      </div>
                      <p className="text-4xl font-black text-white tabular-nums">{value}</p>
                      <p className="text-sm text-indigo-300/70 leading-snug max-w-[120px]">{label}</p>
                      <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${ up ? 'bg-emerald-500/15 text-emerald-400' : 'bg-rose-500/15 text-rose-400' }`}>
                        {up ? '↗' : '↘'} {trend}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </FadeSection>

            {/* Testimonials */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { name: 'Priya Sharma',  role: 'Engineering Lead @ FinTech Corp',  quote: 'RecruiterAI cut our time-to-hire by 40% in the first quarter. The AI scoring is eerily accurate.' },
                { name: 'Marcus Chen',   role: 'Head of Talent @ Innovate.io',     quote: 'The structured pipelines finally gave our distributed team a single source of truth for every candidate.' },
                { name: 'Sophie Müller', role: 'CTO @ WebSolutions GmbH',          quote: "I was skeptical about AI screening — but the skill-gap reports surfaced things we missed in manual review." },
              ].map(({ name, role, quote }, i) => (
                <FadeSection key={name} delay={i * 100}>
                  <div className="glass-card-heavy rounded-[1.5rem] p-8 h-full flex flex-col justify-between">
                    {/* Quote marks */}
                    <div className="text-5xl text-indigo-400/30 font-serif leading-none mb-3">&ldquo;</div>
                    <p className="text-indigo-100/80 italic leading-relaxed text-sm flex-grow">{quote}</p>
                    <div className="flex items-center gap-3 mt-6 pt-5 border-t border-white/10">
                      <Avatar name={name} size="sm" />
                      <div>
                        <p className="text-sm font-semibold text-white">{name}</p>
                        <p className="text-xs text-indigo-300/60">{role}</p>
                      </div>
                    </div>
                  </div>
                </FadeSection>
              ))}
            </div>
          </section>

          {/* ── SECTION 6: Deep Glass CTA ──────────────────────────────────── */}
          <section className="w-full max-w-5xl mx-auto px-6 pb-32 z-20">
            <FadeSection>
              <div className="glass-card-heavy rounded-[3rem] p-16 text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/10 to-transparent"></div>
                
                <h2 className="text-5xl font-black text-white mb-8 relative z-10 drop-shadow-lg">
                  Join the Hiring Revolution
                </h2>
                
                <div className="flex flex-col sm:flex-row justify-center gap-6 relative z-10">
                  <button
                    onClick={() => window.location.href = '/register/company'}
                    style={{ background: '#ffffff', color: '#1e1b4b' }}
                    className="inline-flex items-center justify-center gap-2 font-semibold rounded-2xl text-xl px-12 py-5 shadow-2xl hover:bg-indigo-50 hover:-translate-y-1 transition-all duration-300 active:scale-95"
                  >
                    Start Hiring Now
                  </button>
                  <Button size="lg" className="text-xl px-12 py-8 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl shadow-2xl shadow-indigo-600/20 hover:-translate-y-1 transition-all duration-300" leftIcon={<PlayCircle size={24} />}>
                    Watch Demo
                  </Button>
                </div>
              </div>
            </FadeSection>
          </section>

        </main>

        {/* ── SECTION 4: Translucent Footer ──────────────────────────────── */}
        <footer className="relative z-20 border-t border-white/10 bg-black/40 backdrop-blur-xl pt-16 pb-10 px-6">
          <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-6">
                <Sparkles className="text-indigo-400 w-6 h-6" />
                <span className="text-2xl font-black text-white">RecruiterAI</span>
              </div>
              <p className="text-indigo-200/60 leading-relaxed">
                Building the future of human capital through advanced artificial intelligence and breathtaking design.
              </p>
            </div>
            
            <div>
              <p className="text-white font-bold tracking-wider mb-6">PLATFORM</p>
              <ul className="space-y-4">
                {['For Candidates', 'For Companies', 'Pricing', 'AI Features'].map(link => (
                  <li key={link}><a href="#" className="text-indigo-200/70 hover:text-white transition-colors">{link}</a></li>
                ))}
              </ul>
            </div>

            <div>
              <p className="text-white font-bold tracking-wider mb-6">COMPANY</p>
              <ul className="space-y-4">
                {['About Us', 'Careers', 'Blog', 'Contact'].map(link => (
                  <li key={link}><a href="#" className="text-indigo-200/70 hover:text-white transition-colors">{link}</a></li>
                ))}
              </ul>
            </div>

            <div>
              <p className="text-white font-bold tracking-wider mb-6">LEGAL</p>
              <ul className="space-y-4">
                {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map(link => (
                  <li key={link}><a href="#" className="text-indigo-200/70 hover:text-white transition-colors">{link}</a></li>
                ))}
              </ul>
            </div>
          </div>

          <div className="max-w-7xl mx-auto border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <p className="text-indigo-200/50">
              &copy; {new Date().getFullYear()} RecruiterAI Inc. Designed in the Future.
            </p>
            <div className="flex items-center gap-6">
              {[Mail].map((Icon, i) => (
                <a key={i} href="#" className="text-indigo-200/50 hover:text-white transition-colors">
                  <Icon size={20} />
                </a>
              ))}
            </div>
          </div>
        </footer>

      </div>
    </>
  );
}
