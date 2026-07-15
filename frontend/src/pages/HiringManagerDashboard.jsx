import React from 'react';
import { Construction, ListChecks, Users } from 'lucide-react';
import { Card, CardDescription, CardHeader, CardTitle, StatCard } from '../components/ui';

export default function HiringManagerDashboard() {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-h2 text-secondary-900 dark:text-white">Hiring Manager Dashboard</h1>
        <p className="mt-2 text-body-lg text-secondary-500 dark:text-secondary-400">
          This workspace is under development. Interview feedback, assigned roles, and candidate review tools will appear here.
        </p>
      </div>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard label="Assigned Roles" value="0" icon={ListChecks} />
        <StatCard label="Candidates to Review" value="0" icon={Users} />
        <StatCard label="Pending Feedback" value="0" icon={Construction} />
      </section>

      <Card className="border-secondary-100 dark:border-white/10">
        <CardHeader className="mb-0 p-0">
          <CardTitle>Coming Soon</CardTitle>
          <CardDescription>
            Hiring managers will be able to review shortlisted candidates, submit interview feedback, and collaborate with recruiters from this area.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
