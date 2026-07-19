import React, { useState, useEffect } from 'react';
import { Button, Spinner } from '../../components/ui';
import { useToast } from '../../lib/ToastContext';
import api from '../../api';
import { adminAiApi } from './services/adminAiApi';
import { RefreshCw, Sparkles } from 'lucide-react';

const Analytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState('');
  const [aiError, setAiError] = useState('');
  const [summary, setSummary] = useState(null);
  const [insights, setInsights] = useState(null);
  const [activity, setActivity] = useState(null);
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

  const runAi = async (kind) => {
    setAiLoading(kind);
    setAiError('');
    try {
      if (kind === 'summary') setSummary(await adminAiApi.analyticsSummary());
      if (kind === 'insights') setInsights(await adminAiApi.insights());
      if (kind === 'activity') setActivity(await adminAiApi.activitySummary());
    } catch (error) {
      setAiError(error?.response?.data?.message || 'Unable to generate AI insights right now.');
    } finally {
      setAiLoading('');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" className="text-primary-700" />
      </div>
    );
  }

  const {
    totalOpenJobs = 0,
    totalApplications = 0,
    totalShortlisted = 0,
    totalInterviewsScheduled = 0,
    totalOffersExtended = 0,
    totalHires = 0,
    applicationsByStatus = [],
    avgAiMatchScore = null
  } = data || {};

  // For the horizontal bar chart
  const statusEntries = Array.isArray(applicationsByStatus)
    ? applicationsByStatus.map(item => [item.status, item.count])
    : Object.entries(applicationsByStatus);
  const maxStatusCount = statusEntries.reduce((max, [_, count]) => Math.max(max, count), 0);

  const StatCard = ({ title, value }) => (
    <div className="bg-white dark:bg-secondary-800 p-6 rounded-xl border border-secondary-200 dark:border-secondary-700 shadow-sm flex flex-col">
      <span className="text-secondary-500 dark:text-secondary-400 text-body-sm font-medium mb-2">{title}</span>
      <span className="text-h2 font-bold text-secondary-900 dark:text-white">{value}</span>
    </div>
  );

  return (
    <div className="min-w-full max-w-none space-y-6">
      <div>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="text-h3 font-bold text-secondary-900 dark:text-white">Analytics Overview</h3>
            <p className="text-secondary-500 dark:text-secondary-400 text-body-sm mt-1">
              Monitor your recruitment pipeline and performance.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" onClick={() => runAi('summary')} disabled={!!aiLoading} leftIcon={aiLoading === 'summary' ? <Spinner size="sm" /> : <Sparkles size={16} />}>
              Generate Analytics Summary
            </Button>
            <Button type="button" variant="outline" onClick={() => runAi('insights')} disabled={!!aiLoading} leftIcon={aiLoading === 'insights' ? <Spinner size="sm" /> : <Sparkles size={16} />}>
              View AI Insights
            </Button>
            <Button type="button" onClick={() => runAi('activity')} disabled={!!aiLoading} leftIcon={aiLoading === 'activity' ? <Spinner size="sm" /> : <Sparkles size={16} />}>
              Summarize Activity
            </Button>
          </div>
        </div>
        {aiError && (
          <div className="mt-4 flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-body-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200 sm:flex-row sm:items-center sm:justify-between">
            <span>{aiError}</span>
            <Button type="button" size="sm" variant="outline" onClick={() => runAi('summary')} leftIcon={<RefreshCw size={14} />}>Retry</Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Open Jobs" value={totalOpenJobs} />
        <StatCard title="Applications" value={totalApplications} />
        <StatCard title="Shortlisted" value={totalShortlisted} />
        <StatCard title="Interviews Scheduled" value={totalInterviewsScheduled} />
        <StatCard title="Offers Extended" value={totalOffersExtended} />
        <StatCard title="Hires" value={totalHires} />
        
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

      {(summary?.result || insights?.result || activity?.result) && (
        <div className="grid gap-4 lg:grid-cols-3">
          {summary?.result && (
            <AiPanel title="Recruitment Analytics Summary">
              <p className="text-body-sm text-secondary-700 dark:text-secondary-200">{summary.result.summary}</p>
              <AiList title="Observations" items={summary.result.observations} />
              <AiList title="Suggested actions" items={summary.result.suggestedActions} />
            </AiPanel>
          )}
          {insights?.result && (
            <AiPanel title="Recruitment Insights">
              <AiList title="Insights" items={insights.result.recruitmentInsights} />
              <AiList title="Bottlenecks" items={insights.result.bottlenecks} />
              <AiList title="Attention Required" items={insights.result.attentionRequired} />
              <AiList title="Trends" items={insights.result.trends} />
            </AiPanel>
          )}
          {activity?.result && (
            <AiPanel title="Activity and Audit Summary">
              <p className="text-body-sm text-secondary-700 dark:text-secondary-200">{activity.result.summary}</p>
              <AiList title="Important events" items={activity.result.importantEvents} />
              <AiList title="Recent changes requiring attention" items={activity.result.recentChangesRequiringAttention} />
            </AiPanel>
          )}
        </div>
      )}

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

const AiPanel = ({ title, children }) => (
  <div className="space-y-4 rounded-xl border border-ai-200 bg-white p-5 shadow-sm dark:border-ai-500/30 dark:bg-secondary-800">
    <h4 className="text-body-lg font-semibold text-secondary-900 dark:text-white">{title}</h4>
    {children}
  </div>
);

const AiList = ({ title, items }) => {
  const safeItems = Array.isArray(items) ? items.filter(Boolean) : [];
  if (safeItems.length === 0) return null;
  return (
    <div>
      <h5 className="mb-2 text-body-sm font-semibold text-secondary-800 dark:text-secondary-100">{title}</h5>
      <ul className="space-y-1.5 text-body-sm text-secondary-600 dark:text-secondary-300">
        {safeItems.map((item) => (
          <li key={item} className="flex gap-2">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-ai-500" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Analytics;
