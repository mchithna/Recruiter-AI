import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Badge, Avatar } from '../components/ui';
import { Heart, Lightbulb, Globe, Shield } from 'lucide-react';

const VALUES = [
  { icon: Heart, title: 'People First', description: 'We believe every hiring decision shapes lives. Our technology is designed to respect and empower both candidates and companies.' },
  { icon: Lightbulb, title: 'Innovation', description: 'We push the boundaries of what AI can do for recruitment, constantly exploring new ways to make hiring faster, fairer, and smarter.' },
  { icon: Globe, title: 'Inclusivity', description: 'Our platform is built to eliminate bias and create equal opportunities for talent everywhere, regardless of background or geography.' },
  { icon: Shield, title: 'Trust & Privacy', description: 'We handle sensitive data with the utmost care. Security, compliance, and transparency are non-negotiable pillars of our platform.' },
];

const TEAM = [
  { name: 'Priya Sharma', role: 'Co-Founder & CEO' },
  { name: 'Marcus Chen', role: 'Co-Founder & CTO' },
  { name: 'Sophie Müller', role: 'Head of Product' },
  { name: 'Luca Ferreira', role: 'Lead AI Engineer' },
  { name: 'Ayasha Redcloud', role: 'Head of Design' },
  { name: 'James Wilson', role: 'VP of Sales' },
];

export default function About() {
  return (
    <div className="min-h-screen w-full flex flex-col bg-secondary-50 dark:bg-secondary-950 text-secondary-900 dark:text-secondary-100 font-sans">
      <Navbar />

      <main className="flex-grow pt-[80px]">
        {/* Hero */}
        <section className="max-w-7xl mx-auto px-6 pt-16 pb-20 text-center">
          <Badge variant="ai" className="mb-4 uppercase tracking-widest text-xs">About Us</Badge>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-5">
            Building the future of <span className="text-gradient-vivid">hiring</span>
          </h1>
          <p className="text-lg text-secondary-500 dark:text-secondary-400 max-w-2xl mx-auto">
            We're a passionate team of engineers, designers, and recruiters on a mission to make hiring smarter, faster, and fairer for everyone.
          </p>
        </section>

        {/* Mission */}
        <section className="max-w-4xl mx-auto px-6 pb-20">
          <div className="bg-white dark:bg-secondary-900 rounded-2xl border border-secondary-200/60 dark:border-secondary-700/60 p-10 md:p-14 text-center shadow-sm">
            <h2 className="text-2xl font-bold text-secondary-900 dark:text-white mb-4">Our Mission</h2>
            <p className="text-lg text-secondary-600 dark:text-secondary-300 leading-relaxed">
              To transform recruitment from a tedious, bias-prone process into an intelligent, delightful experience — where the right talent meets the right opportunity, every single time.
            </p>
          </div>
        </section>

        {/* Values */}
        <section className="max-w-7xl mx-auto px-6 pb-20">
          <h2 className="text-3xl font-black text-center mb-12">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {VALUES.map(({ icon: Icon, title, description }) => (
              <div key={title} className="bg-white dark:bg-secondary-900 rounded-2xl border border-secondary-200/60 dark:border-secondary-700/60 p-8 text-center shadow-sm hover:shadow-md transition-shadow duration-300">
                <div className="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-500/15 flex items-center justify-center mx-auto mb-5">
                  <Icon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                </div>
                <h3 className="text-lg font-bold text-secondary-900 dark:text-white mb-2">{title}</h3>
                <p className="text-sm text-secondary-500 dark:text-secondary-400 leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Team */}
        <section className="max-w-5xl mx-auto px-6 pb-24">
          <h2 className="text-3xl font-black text-center mb-12">Meet the Team</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
            {TEAM.map(({ name, role }) => (
              <div key={name} className="flex flex-col items-center text-center">
                <Avatar name={name} size="lg" />
                <h3 className="text-base font-bold text-secondary-900 dark:text-white mt-4 mb-1">{name}</h3>
                <p className="text-sm text-secondary-500 dark:text-secondary-400">{role}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
