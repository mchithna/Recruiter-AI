import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Globe, MessageCircle, ExternalLink, Mail, Heart } from 'lucide-react';

const PLATFORM_LINKS = [
  { label: 'Features', to: '/features' },
  { label: 'Pricing', to: '/pricing' },
  { label: 'For Candidates', to: '/register/candidate' },
  { label: 'For Companies', to: '/register/company' },
];

const COMPANY_LINKS = [
  { label: 'About', to: '/about' },
  { label: 'Contact', to: '/contact' },
  { label: 'Careers', to: '/about' },
  { label: 'Blog', to: '/about' },
];

const LEGAL_LINKS = [
  { label: 'Privacy Policy', to: '#' },
  { label: 'Terms of Service', to: '#' },
  { label: 'Cookie Policy', to: '#' },
];

const SOCIAL_LINKS = [
  { icon: MessageCircle, href: '#', label: 'Twitter' },
  { icon: ExternalLink, href: '#', label: 'LinkedIn' },
  { icon: Globe, href: '#', label: 'Website' },
  { icon: Mail, href: '#', label: 'Email' },
];

export default function Footer() {
  return (
    <footer className="relative bg-secondary-900 dark:bg-secondary-950 text-secondary-300 overflow-hidden">
      {/* Top gradient divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-primary-500/50 to-transparent" />

      {/* Decorative glow */}
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-6 pt-16 pb-10">
        {/* Main footer grid */}
        <div className="grid grid-cols-2 md:grid-cols-12 gap-10 mb-16">
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-4">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="bg-gradient-to-br from-primary-500 to-ai-600 p-2 rounded-xl shadow-lg shadow-primary-500/20">
                <Sparkles className="text-white w-5 h-5" aria-hidden="true" />
              </div>
              <span className="text-xl font-black tracking-tight text-white">
                Hirely
              </span>
            </div>
            <p className="text-secondary-400 text-sm leading-relaxed max-w-xs mb-6">
              Building the future of talent acquisition through advanced artificial intelligence and stunning user experiences.
            </p>
            {/* Social Icons */}
            <div className="flex items-center gap-3">
              {SOCIAL_LINKS.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-9 h-9 rounded-lg bg-secondary-800 dark:bg-secondary-800/50 border border-secondary-700/50 flex items-center justify-center text-secondary-400 hover:text-primary-400 hover:border-primary-500/50 hover:bg-primary-500/10 transition-all duration-200"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Platform */}
          <div className="col-span-1 md:col-span-2 md:col-start-6">
            <h4 className="text-xs font-bold tracking-widest text-secondary-500 uppercase mb-5">
              Platform
            </h4>
            <ul className="space-y-3">
              {PLATFORM_LINKS.map(({ label, to }) => (
                <li key={label}>
                  <Link
                    to={to}
                    className="text-sm text-secondary-400 hover:text-white transition-colors duration-200"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div className="col-span-1 md:col-span-2">
            <h4 className="text-xs font-bold tracking-widest text-secondary-500 uppercase mb-5">
              Company
            </h4>
            <ul className="space-y-3">
              {COMPANY_LINKS.map(({ label, to }) => (
                <li key={label}>
                  <Link
                    to={to}
                    className="text-sm text-secondary-400 hover:text-white transition-colors duration-200"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div className="col-span-2 md:col-span-2">
            <h4 className="text-xs font-bold tracking-widest text-secondary-500 uppercase mb-5">
              Legal
            </h4>
            <ul className="space-y-3">
              {LEGAL_LINKS.map(({ label, to }) => (
                <li key={label}>
                  <Link
                    to={to}
                    className="text-sm text-secondary-400 hover:text-white transition-colors duration-200"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-secondary-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-secondary-500">
            &copy; {new Date().getFullYear()} Hirely. All rights reserved.
          </p>
          <p className="text-sm text-secondary-500 flex items-center gap-1.5">
            Built with <Heart size={13} className="text-danger-400 fill-danger-400" /> by the Hirely Team
          </p>
        </div>
      </div>
    </footer>
  );
}
