import React from 'react';
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, Badge } from '../../components/ui';
import { Sparkles, Building2, Search, ArrowRight, Zap, Target } from 'lucide-react';

export default function Home() {
  const MOCK_JOBS = [
    { id: 101, title: 'Senior UX Researcher', company: 'DesignWorks', location: 'Remote', type: 'Full-time' },
    { id: 102, title: 'Data Scientist', company: 'AnalyticsPro', location: 'London, UK', type: 'Hybrid' },
    { id: 103, title: 'Frontend Developer', company: 'WebSolutions', location: 'Berlin, DE', type: 'Contract' }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
      {/* Dynamic Header */}
      <header className="sticky top-0 z-sticky backdrop-blur-md bg-white/70 border-b border-white/20 shadow-sm px-6 py-4 flex items-center justify-between transition-all duration-300">
        <div className="flex items-center gap-2">
          <div className="bg-primary-500 p-2 rounded-lg">
            <Sparkles className="text-white w-5 h-5" />
          </div>
          <span className="text-h3 text-secondary-900 font-extrabold tracking-tight">RecruiterAI</span>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => window.location.href = '/login'}>
            Log In
          </Button>
          <div className="hidden sm:flex gap-4">
            <Button variant="outline" onClick={() => window.location.href = '/register/candidate'}>
              Find a Job
            </Button>
            <Button variant="primary" onClick={() => window.location.href = '/register/company'}>
              Hire Talent
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-secondary-900 text-white py-32 px-6">
        {/* Animated Background Gradients */}
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[100%] rounded-full bg-primary-600/30 blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[100%] rounded-full bg-ai-500/20 blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>

        <div className="relative max-w-5xl mx-auto text-center space-y-8 z-10">
          <Badge variant="ai" size="sm" className="mb-4 bg-ai-500/20 text-ai-100 border border-ai-400/30 backdrop-blur-sm px-4 py-1.5 text-sm uppercase tracking-widest rounded-full">
            The Future of Hiring
          </Badge>
          <h1 className="text-display font-black leading-tight tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white via-primary-100 to-ai-200">
            Connect Talent With Opportunity, Intelligently.
          </h1>
          <p className="text-body-lg text-secondary-300 max-w-2xl mx-auto text-lg leading-relaxed">
            Experience a frictionless hiring journey. Whether you're hunting for your dream role or sourcing top-tier professionals, our AI platform delivers perfect matches in seconds.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-8">
            <Button 
              size="lg" 
              variant="primary" 
              className="w-full sm:w-auto text-lg px-8 py-4 shadow-lg shadow-primary-500/30 hover:scale-105 transition-transform duration-300"
              onClick={() => window.location.href = '/register/candidate'}
              leftIcon={<Search size={20} />}
            >
              I'm a Candidate
            </Button>
            <Button 
              size="lg" 
              variant="secondary" 
              className="w-full sm:w-auto text-lg px-8 py-4 bg-white text-secondary-900 hover:bg-secondary-50 hover:scale-105 transition-transform duration-300"
              onClick={() => window.location.href = '/register/company'}
              leftIcon={<Building2 size={20} />}
            >
              I'm a Company
            </Button>
          </div>
        </div>
      </section>

      {/* Value Propositions Split */}
      <section className="py-24 px-6 bg-secondary-50 relative -mt-10 rounded-t-[3rem] z-20 shadow-[0_-10px_40px_rgba(0,0,0,0.1)]">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Candidate Path */}
          <Card hoverable className="group border-none shadow-xl shadow-secondary-200/50 hover:shadow-2xl hover:shadow-primary-200/50 transition-all duration-500 overflow-hidden bg-white/60 backdrop-blur-xl">
            <div className="h-2 w-full bg-gradient-to-r from-primary-400 to-primary-600 absolute top-0 left-0 transition-transform origin-left scale-x-0 group-hover:scale-x-100 duration-500"></div>
            <CardHeader className="pt-10">
              <div className="bg-primary-50 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-primary-100 transition-all duration-300">
                <Target className="text-primary-600 w-8 h-8" />
              </div>
              <CardTitle className="text-h2">For Candidates</CardTitle>
              <CardDescription className="text-body-lg text-secondary-600 mt-2">
                Elevate your career trajectory with precision AI matching.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4 text-secondary-700">
                <li className="flex items-start gap-3">
                  <div className="mt-1 bg-primary-100 p-1 rounded-full"><Zap size={14} className="text-primary-600"/></div>
                  <span><strong>AI-Driven Matches:</strong> Stop searching. Let our algorithm find roles tailored exactly to your unique skillset.</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-1 bg-primary-100 p-1 rounded-full"><Zap size={14} className="text-primary-600"/></div>
                  <span><strong>Unified Dashboard:</strong> Track all your applications, interviews, and offers in one streamlined interface.</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter className="pt-6 pb-10">
              <Button variant="ghost" className="text-primary-600 hover:text-primary-700 p-0" rightIcon={<ArrowRight size={16} />} onClick={() => window.location.href = '/register/candidate'}>
                Create your profile
              </Button>
            </CardFooter>
          </Card>

          {/* Company Path */}
          <Card hoverable className="group border-none shadow-xl shadow-secondary-200/50 hover:shadow-2xl hover:shadow-ai-200/50 transition-all duration-500 overflow-hidden bg-white/60 backdrop-blur-xl">
            <div className="h-2 w-full bg-gradient-to-r from-ai-400 to-ai-600 absolute top-0 left-0 transition-transform origin-left scale-x-0 group-hover:scale-x-100 duration-500"></div>
            <CardHeader className="pt-10">
              <div className="bg-ai-50 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-ai-100 transition-all duration-300">
                <Building2 className="text-ai-600 w-8 h-8" />
              </div>
              <CardTitle className="text-h2">For Companies</CardTitle>
              <CardDescription className="text-body-lg text-secondary-600 mt-2">
                Build world-class teams with intelligent automation.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4 text-secondary-700">
                <li className="flex items-start gap-3">
                  <div className="mt-1 bg-ai-100 p-1 rounded-full"><Zap size={14} className="text-ai-600"/></div>
                  <span><strong>Automated Screening:</strong> Instantly filter top candidates with AI-powered skill assessments and scoring.</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-1 bg-ai-100 p-1 rounded-full"><Zap size={14} className="text-ai-600"/></div>
                  <span><strong>Structured Pipelines:</strong> Gain org-wide visibility into every stage of the hiring process, reducing time-to-hire.</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter className="pt-6 pb-10">
              <Button variant="ghost" className="text-ai-600 hover:text-ai-700 p-0" rightIcon={<ArrowRight size={16} />} onClick={() => window.location.href = '/register/company'}>
                Start hiring today
              </Button>
            </CardFooter>
          </Card>

        </div>
      </section>

      {/* Featured Jobs Preview */}
      <section className="py-24 px-6 bg-white relative">
        <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-30"></div>
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 space-y-4 md:space-y-0">
            <div>
              <h2 className="text-h1 text-secondary-900 tracking-tight">Featured Open Roles</h2>
              <p className="text-body-lg text-secondary-500 mt-2">Discover high-impact positions hiring right now.</p>
            </div>
            <Button variant="outline" rightIcon={<ArrowRight size={16}/>} onClick={() => window.location.href = '/register/candidate'}>
              View all roles
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {MOCK_JOBS.map((job) => (
              <Card key={job.id} hoverable className="border border-secondary-200 shadow-sm hover:shadow-lg transition-shadow duration-300 bg-white">
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <div className="bg-primary-50 p-2 rounded-lg text-primary-600 font-bold text-xl w-12 h-12 flex items-center justify-center">
                      {job.company.charAt(0)}
                    </div>
                    <Badge variant="info" size="sm">{job.type}</Badge>
                  </div>
                  <CardTitle className="text-h4 mt-4">{job.title}</CardTitle>
                  <CardDescription className="text-secondary-500">{job.company} · {job.location}</CardDescription>
                </CardHeader>
                <CardFooter className="pt-4 border-t border-secondary-100">
                  <Button variant="ghost" className="w-full text-secondary-600 hover:bg-secondary-50" onClick={() => window.location.href = '/login'}>
                    Log In to Apply
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Premium Footer */}
      <footer className="mt-auto border-t border-secondary-200 py-12 px-6 bg-secondary-900 text-secondary-400">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
            <Sparkles className="text-primary-500 w-5 h-5" />
            <span className="text-h4 text-white font-bold tracking-tight">RecruiterAI</span>
          </div>
          <div className="text-sm">
            &copy; {new Date().getFullYear()} RecruiterAI Inc. All rights reserved. Designed for the future.
          </div>
        </div>
      </footer>
    </div>
  );
}
