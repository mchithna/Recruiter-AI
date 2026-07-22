import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Button, Badge, Input, Textarea } from '../components/ui';
import { Mail, MapPin, Phone, Send, MessageSquare } from 'lucide-react';

const CONTACT_INFO = [
  { icon: Mail, label: 'Email', value: 'hello@hirely.ai', href: 'mailto:hello@hirely.ai' },
  { icon: MapPin, label: 'Office', value: 'San Francisco, CA', href: '#' },
  { icon: Phone, label: 'Phone', value: '+1 (555) 123-4567', href: 'tel:+15551234567' },
];

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen w-full flex flex-col bg-secondary-50 dark:bg-secondary-950 text-secondary-900 dark:text-secondary-100 font-sans">
      <Navbar />

      <main className="flex-grow pt-[80px]">
        {/* Hero */}
        <section className="max-w-7xl mx-auto px-6 pt-16 pb-20 text-center">
          <Badge variant="info" className="mb-4 uppercase tracking-widest text-xs">Contact</Badge>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-5">
            Get in <span className="text-gradient-vivid">touch</span>
          </h1>
          <p className="text-lg text-secondary-500 dark:text-secondary-400 max-w-2xl mx-auto">
            Have a question, feedback, or want to schedule a demo? We'd love to hear from you.
          </p>
        </section>

        {/* Contact Grid */}
        <section className="max-w-5xl mx-auto px-6 pb-24">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
            {/* Contact Info */}
            <div className="md:col-span-2 space-y-6">
              <h2 className="text-2xl font-bold text-secondary-900 dark:text-white mb-6">Reach out to us</h2>

              {CONTACT_INFO.map(({ icon: Icon, label, value, href }) => (
                <a
                  key={label}
                  href={href}
                  className="flex items-start gap-4 p-4 bg-white dark:bg-secondary-900 rounded-xl border border-secondary-200/60 dark:border-secondary-700/60 hover:shadow-md transition-shadow duration-300 group"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-500/15 flex items-center justify-center shrink-0">
                    <Icon size={18} className="text-primary-600 dark:text-primary-400" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-secondary-400 dark:text-secondary-500 uppercase tracking-wider mb-0.5">{label}</p>
                    <p className="text-sm font-medium text-secondary-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">{value}</p>
                  </div>
                </a>
              ))}

              <div className="mt-6 p-6 bg-gradient-to-br from-primary-50 to-ai-50 dark:from-primary-500/10 dark:to-ai-500/10 rounded-xl border border-primary-200/50 dark:border-primary-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <MessageSquare size={16} className="text-primary-600 dark:text-primary-400" />
                  <span className="text-sm font-semibold text-primary-700 dark:text-primary-300">Live Chat</span>
                </div>
                <p className="text-xs text-primary-600/70 dark:text-primary-400/70">
                  Our team typically responds within 2 hours during business hours (9 AM – 6 PM PST).
                </p>
              </div>
            </div>

            {/* Contact Form */}
            <div className="md:col-span-3">
              <div className="bg-white dark:bg-secondary-900 rounded-2xl border border-secondary-200/60 dark:border-secondary-700/60 p-8 shadow-sm">
                {submitted ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto mb-6 bg-success-100 dark:bg-success-500/15 rounded-full flex items-center justify-center">
                      <Send size={28} className="text-success-600 dark:text-success-400" />
                    </div>
                    <h3 className="text-xl font-bold text-secondary-900 dark:text-white mb-2">Message Sent!</h3>
                    <p className="text-secondary-500 dark:text-secondary-400">
                      Thanks for reaching out. We'll get back to you within 24 hours.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Input label="First Name" placeholder="John" required />
                      <Input label="Last Name" placeholder="Doe" required />
                    </div>
                    <Input label="Email" type="email" placeholder="you@example.com" required />
                    <Input label="Subject" placeholder="How can we help?" />
                    <Textarea
                      label="Message"
                      placeholder="Tell us more about what you're looking for..."
                      autoResize
                      required
                    />
                    <Button type="submit" variant="primary" className="w-full rounded-xl" leftIcon={<Send size={16} />}>
                      Send Message
                    </Button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
