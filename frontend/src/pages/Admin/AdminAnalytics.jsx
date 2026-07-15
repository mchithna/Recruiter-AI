import React from 'react';
import { BarChart2, Briefcase, Clock, Users } from 'lucide-react';
import { Card, CardDescription, CardHeader, CardTitle, ProgressBar, StatCard } from '../../components/ui';

const funnel = [
  { label: 'Applied', value: 124 },
  { label: 'Screening', value: 82 },
  { label: 'Interview', value: 38 },
  { label: 'Offer', value: 12 },
  { label: 'Hired', value: 7 },
];

const sources = [
  { label: 'LinkedIn', value: 42 },
  { label: 'Careers Page', value: 28 },
  { label: 'Referrals', value: 18 },
  { label: 'Job Boards', value: 12 },
];

export default function AdminAnalytics() {
  const maxFunnelValue = Math.max(...funnel.map((item) => item.value));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-h3 text-secondary-900 dark:text-white">Analytics</h2>
        <p className="mt-1 text-body-sm text-secondary-500 dark:text-secondary-400">
          Hiring performance snapshot across departments and open roles.
        </p>
      </div>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Open Roles" value="18" icon={Briefcase} trend={{ direction: 'up', value: '+3 this month' }} />
        <StatCard label="Active Candidates" value="124" icon={Users} trend={{ direction: 'up', value: '+14%' }} />
        <StatCard label="Avg. Time to Hire" value="21d" icon={Clock} trend={{ direction: 'down', value: '-4 days' }} trendUpIsGood={false} />
        <StatCard label="Offer Rate" value="31%" icon={BarChart2} trend={{ direction: 'up', value: '+6%' }} />
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <Card className="border-secondary-100 dark:border-white/10">
          <CardHeader className="mb-5 p-0">
            <CardTitle>Hiring Funnel</CardTitle>
            <CardDescription>Current candidate movement by pipeline stage.</CardDescription>
          </CardHeader>
          <div className="space-y-4">
            {funnel.map((item) => (
              <div key={item.label} className="grid gap-3 sm:grid-cols-[120px_minmax(0,1fr)_48px] sm:items-center">
                <span className="text-body-sm font-semibold text-secondary-700 dark:text-secondary-200">
                  {item.label}
                </span>
                <ProgressBar value={Math.round((item.value / maxFunnelValue) * 100)} size="md" />
                <span className="text-right text-body-sm font-semibold tabular-nums text-secondary-900 dark:text-white">
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="border-secondary-100 dark:border-white/10">
          <CardHeader className="mb-5 p-0">
            <CardTitle>Candidate Sources</CardTitle>
            <CardDescription>Top channels by active candidate share.</CardDescription>
          </CardHeader>
          <div className="space-y-4">
            {sources.map((source) => (
              <div key={source.label}>
                <div className="mb-2 flex items-center justify-between text-body-sm">
                  <span className="font-semibold text-secondary-700 dark:text-secondary-200">{source.label}</span>
                  <span className="tabular-nums text-secondary-500 dark:text-secondary-400">{source.value}%</span>
                </div>
                <ProgressBar value={source.value} size="sm" />
              </div>
            ))}
          </div>
        </Card>
      </section>
    </div>
  );
}
