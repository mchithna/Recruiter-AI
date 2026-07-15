import React from 'react';
import { CheckCircle2, Mail, Network, ShieldCheck, UserPlus } from 'lucide-react';
import { Avatar, Badge, Card, CardDescription, CardHeader, CardTitle } from '../../components/ui';

const activities = [
  {
    id: 1,
    title: 'Recruiter invitation sent',
    description: 'yasa@gmail.com was invited to join the Talent Acquisition department.',
    time: 'Today, 10:18 PM',
    actor: 'Yasindu',
    icon: Mail,
    badge: 'Invite',
  },
  {
    id: 2,
    title: 'Department updated',
    description: 'Engineering reporting structure was edited in the organization chart.',
    time: 'Today, 9:42 PM',
    actor: 'Admin',
    icon: Network,
    badge: 'Org Chart',
  },
  {
    id: 3,
    title: 'Company profile saved',
    description: 'Company location and public profile details were updated.',
    time: 'Yesterday, 4:16 PM',
    actor: 'Yasindu',
    icon: CheckCircle2,
    badge: 'Profile',
  },
  {
    id: 4,
    title: 'Hiring manager access prepared',
    description: 'Hiring manager dashboard access is staged while the module is under development.',
    time: 'Yesterday, 11:30 AM',
    actor: 'System',
    icon: ShieldCheck,
    badge: 'Access',
  },
];

export default function AdminActivityLog() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-h3 text-secondary-900 dark:text-white">Activity Log</h2>
        <p className="mt-1 text-body-sm text-secondary-500 dark:text-secondary-400">
          Recent admin actions, invitations, and organization updates.
        </p>
      </div>

      <Card className="overflow-hidden border-secondary-100 p-0 dark:border-white/10">
        <CardHeader className="mb-0 border-b border-secondary-100 p-5 dark:border-white/10">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-700 dark:bg-primary-500/15 dark:text-primary-300">
              <UserPlus size={19} strokeWidth={1.75} />
            </span>
            <div>
              <CardTitle>Latest Events</CardTitle>
              <CardDescription>Operational timeline for the company workspace.</CardDescription>
            </div>
          </div>
        </CardHeader>

        <div className="divide-y divide-secondary-100 dark:divide-white/10">
          {activities.map((activity) => {
            const Icon = activity.icon;

            return (
              <div key={activity.id} className="grid gap-4 p-5 sm:grid-cols-[44px_minmax(0,1fr)_auto] sm:items-start">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-secondary-50 text-secondary-600 dark:bg-white/10 dark:text-secondary-200">
                  <Icon size={18} strokeWidth={1.75} />
                </span>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-body-lg font-semibold text-secondary-900 dark:text-white">
                      {activity.title}
                    </h3>
                    <Badge variant="secondary" size="sm">{activity.badge}</Badge>
                  </div>
                  <p className="mt-1 text-body-sm text-secondary-500 dark:text-secondary-300">
                    {activity.description}
                  </p>
                </div>
                <div className="flex items-center gap-3 text-left sm:text-right">
                  <div>
                    <p className="text-caption font-semibold uppercase tracking-wide text-secondary-400">
                      {activity.time}
                    </p>
                    <p className="mt-1 text-body-sm text-secondary-500 dark:text-secondary-300">
                      {activity.actor}
                    </p>
                  </div>
                  <Avatar name={activity.actor} size="sm" />
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
