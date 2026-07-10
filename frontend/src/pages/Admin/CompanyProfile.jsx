import React from 'react';
import Button from '../../components/ui/Button';

const CompanyProfile = () => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-slate-900 dark:text-white">Company Profile</h3>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          Manage your company details and subscription status.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
        <p className="text-slate-600 dark:text-slate-300">
          [Company Profile Form Placeholder]
        </p>
        <div className="mt-4">
          <Button variant="primary" type="button">Save Profile</Button>
        </div>
      </div>
    </div>
  );
};

export default CompanyProfile;
