import React from 'react';
import Button from '../../components/ui/Button';

const OrgChartBuilder = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">Org Chart Builder</h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Build your company's organization chart and manage departments.
          </p>
        </div>
        <Button variant="primary">Add Department</Button>
      </div>

      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 min-h-[400px] flex items-center justify-center">
        <p className="text-slate-400 dark:text-slate-500 text-center">
          [Org Chart Visualization Placeholder]
        </p>
      </div>
    </div>
  );
};

export default OrgChartBuilder;
