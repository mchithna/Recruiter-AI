import React, { useState, useEffect } from 'react';
import Spinner from '../../components/ui/Spinner';
import { useToast } from '../../lib/ToastContext';
import api from '../../api';

const Analytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const response = await api.get('/analytics/overview');
        setData(response.data);
      } catch (error) {
        showToast('Failed to load analytics data.', 'danger');
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [showToast]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" className="text-primary-700" />
      </div>
    );
  }

  const {
    openJobs = 0,
    applications = 0,
    shortlisted = 0,
    interviewsScheduled = 0,
    offersExtended = 0,
    hires = 0,
    applicationsByStatus = {},
    avgAiMatchScore = null
  } = data || {};

  // For the horizontal bar chart
  const statusEntries = Object.entries(applicationsByStatus);
  const maxStatusCount = statusEntries.reduce((max, [_, count]) => Math.max(max, count), 0);

  const StatCard = ({ title, value }) => (
    <div className="bg-white dark:bg-secondary-800 p-6 rounded-xl border border-secondary-200 dark:border-secondary-700 shadow-sm flex flex-col">
      <span className="text-secondary-500 dark:text-secondary-400 text-body-sm font-medium mb-2">{title}</span>
      <span className="text-h2 font-bold text-secondary-900 dark:text-white">{value}</span>
    </div>
  );

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h3 className="text-h3 font-bold text-secondary-900 dark:text-white">Analytics Overview</h3>
        <p className="text-secondary-500 dark:text-secondary-400 text-body-sm mt-1">
          Monitor your recruitment pipeline and performance.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Open Jobs" value={openJobs} />
        <StatCard title="Applications" value={applications} />
        <StatCard title="Shortlisted" value={shortlisted} />
        <StatCard title="Interviews Scheduled" value={interviewsScheduled} />
        <StatCard title="Offers Extended" value={offersExtended} />
        <StatCard title="Hires" value={hires} />
        
        {/* Special card for AI Match Score */}
        <div className="bg-white dark:bg-secondary-800 p-6 rounded-xl border border-secondary-200 dark:border-secondary-700 shadow-sm flex flex-col lg:col-span-2">
          <span className="text-secondary-500 dark:text-secondary-400 text-body-sm font-medium mb-2">Avg. AI Match Score</span>
          <span className="text-h2 font-bold text-secondary-900 dark:text-white">
            {avgAiMatchScore !== null && avgAiMatchScore !== undefined ? (
              `${Number(avgAiMatchScore).toFixed(1)}%`
            ) : (
              <span className="text-body-lg text-secondary-400 font-normal">Not enough data yet</span>
            )}
          </span>
        </div>
      </div>

      <div className="bg-white dark:bg-secondary-800 p-6 rounded-xl border border-secondary-200 dark:border-secondary-700 shadow-sm">
        <h4 className="text-body-lg font-semibold text-secondary-800 dark:text-secondary-100 mb-6">Applications by Status</h4>
        
        {statusEntries.length === 0 ? (
          <p className="text-secondary-500 dark:text-secondary-400">No applications data available.</p>
        ) : (
          <div className="space-y-4">
            {statusEntries.map(([status, count]) => {
              const percentage = maxStatusCount > 0 ? (count / maxStatusCount) * 100 : 0;
              return (
                <div key={status} className="flex items-center gap-4">
                  <div className="w-32 text-body-sm text-secondary-600 dark:text-secondary-300 truncate">
                    {status}
                  </div>
                  <div className="flex-1 h-6 bg-secondary-100 dark:bg-secondary-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary-500 dark:bg-primary-600 transition-all duration-500 ease-out rounded-full"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <div className="w-12 text-right text-body-sm font-medium text-secondary-700 dark:text-secondary-200">
                    {count}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Analytics;
