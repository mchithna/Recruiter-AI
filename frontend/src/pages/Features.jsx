import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Button, Badge, Card, CardContent } from '../components/ui';
import { Brain, Target, BarChart2, Shield, Globe, Users, ArrowRight, Video, MessageSquare, Layers } from 'lucide-react';

const FEATURES_DETAILED = [
  {
    icon: Brain,
    title: 'AI-Powered Matching',
    description: 'Our neural networks analyze thousands of data points — skills, experience, culture fit, and growth potential — to find the absolute perfect match between candidates and companies.',
    color: 'primary',
  },
  {
    icon: Target,
    title: 'Precision Screening',
    description: 'Automatically screen and rank candidates based on customizable criteria. Save hours of manual resume review while ensuring no great candidate slips through the cracks.',
    color: 'ai',
  },
  {
    icon: BarChart2,
    title: 'Live Analytics Dashboard',
    description: 'Monitor your entire hiring pipeline with beautiful, interactive dashboards. Track time-to-hire, drop-off rates, diversity metrics, and source effectiveness in real-time.',
    color: 'info',
  },
  {
    icon: Shield,
    title: 'Bias-Free Evaluation',
    description: 'Structured evaluations and optional blind reviews ensure every candidate gets a fair chance. Our AI is trained to flag and eliminate common biases in the hiring process.',
    color: 'success',
  },
  {
    icon: Globe,
    title: 'Global Talent Network',
    description: 'Connect with top professionals worldwide. Multi-language support, timezone-aware scheduling, and compliance features for international hiring are built right in.',
    color: 'warning',
  },
  {
    icon: Video,
    title: 'Video AI Interviews',
    description: 'Automatically transcribe, score, and analyze candidate async video interviews. Get structured insights without watching every recording.',
    color: 'danger',
  },
  {
    icon: MessageSquare,
    title: 'Smart Communication',
    description: 'AI-assisted email templates, automated follow-ups, and centralized messaging keep every candidate engaged throughout their journey.',
    color: 'primary',
  },
  {
    icon: Users,
    title: 'Collaborative Hiring',
    description: 'Bring your entire team into the loop. Leave structured feedback, share scorecards, compare notes, and reach consensus faster than ever before.',
    color: 'ai',
  },
  {
    icon: Layers,
    title: 'Pipeline Management',
    description: 'Drag-and-drop Kanban boards, customizable stages, and automated stage transitions make managing hundreds of candidates effortless.',
    color: 'info',
  },
];

const COLOR_MAP = {
  primary: { bg: 'bg-primary-100 dark:bg-primary-500/15', text: 'text-primary-600 dark:text-primary-400' },
  ai: { bg: 'bg-ai-100 dark:bg-ai-500/15', text: 'text-ai-600 dark:text-ai-400' },
  info: { bg: 'bg-info-100 dark:bg-info-500/15', text: 'text-info-600 dark:text-info-400' },
  success: { bg: 'bg-success-100 dark:bg-success-500/15', text: 'text-success-600 dark:text-success-400' },
  warning: { bg: 'bg-warning-100 dark:bg-warning-500/15', text: 'text-warning-600 dark:text-warning-400' },
  danger: { bg: 'bg-danger-100 dark:bg-danger-500/15', text: 'text-danger-600 dark:text-danger-400' },
};

export default function Features() {
  return (
    <div className="min-h-screen w-full flex flex-col bg-secondary-50 dark:bg-secondary-950 text-secondary-900 dark:text-secondary-100 font-sans">
      <Navbar />

      <main className="flex-grow pt-[80px]">
        {/* Hero */}
        <section className="max-w-7xl mx-auto px-6 pt-16 pb-20 text-center">
          <Badge variant="primary" className="mb-4 uppercase tracking-widest text-xs">Features</Badge>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-5">
            Everything you need to <span className="text-gradient-vivid">hire smarter</span>
          </h1>
          <p className="text-lg text-secondary-500 dark:text-secondary-400 max-w-2xl mx-auto mb-10">
            From AI-powered matching to collaborative reviews, Hirely gives your team the tools to build world-class organizations.
          </p>
          <div className="flex justify-center gap-4">
            <Link to="/register/company">
              <Button variant="primary" size="lg" className="rounded-xl px-8" rightIcon={<ArrowRight size={16} />}>
                Start Free Trial
              </Button>
            </Link>
          </div>
        </section>

        {/* Features Grid */}
        <section className="max-w-7xl mx-auto px-6 pb-24">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES_DETAILED.map(({ icon: Icon, title, description, color }) => {
              const c = COLOR_MAP[color];
              return (
                <Card key={title} hoverable className="border-secondary-200/60 dark:border-secondary-700/60 bg-white dark:bg-secondary-900 rounded-2xl">
                  <CardContent className="p-8">
                    <div className={`w-12 h-12 rounded-xl ${c.bg} flex items-center justify-center mb-5`}>
                      <Icon className={`w-6 h-6 ${c.text}`} />
                    </div>
                    <h3 className="text-lg font-bold text-secondary-900 dark:text-white mb-2">{title}</h3>
                    <p className="text-sm text-secondary-500 dark:text-secondary-400 leading-relaxed">{description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
