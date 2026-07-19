import React, { useState, useEffect } from 'react';
import { Button, Spinner } from '../../components/ui';
import JobCard from './components/JobCard';
import { candidateAiApi } from './services/candidateApi';
import { RefreshCw, Sparkles } from 'lucide-react';

export default function CandidateHome() {
  const [recommendations, setRecommendations] = useState([]);
  const [aiResponse, setAiResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadRecommendations();
  }, []);

  const loadRecommendations = async () => {
    setError('');
    setLoading(true);
    try {
      const data = await candidateAiApi.recommendJobs();
      setAiResponse(data);
      setRecommendations(data.result?.recommendations || []);
    } catch (err) {
      setRecommendations([]);
      setError(err?.response?.data?.message || 'Unable to generate job recommendations.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6 pb-16">
      <div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-h2 text-secondary-900 dark:text-white">AI Recommendations</h2>
            <p className="text-body-sm text-secondary-600 dark:text-secondary-400 mt-2">
              Jobs matched to your real profile, resume metadata, skills, education, and experience.
            </p>
          </div>
          <Button type="button" onClick={loadRecommendations} disabled={loading} leftIcon={loading ? <Spinner size="sm" /> : <Sparkles size={16} />}>
            Find Matching Jobs
          </Button>
        </div>
        {aiResponse?.disclaimer && (
          <p className="mt-3 rounded-xl border border-ai-200 bg-ai-50 px-4 py-3 text-body-sm text-ai-800 dark:border-ai-500/30 dark:bg-ai-500/10 dark:text-ai-200">
            {aiResponse.disclaimer}
          </p>
        )}
        {error && (
          <div className="mt-4 flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-body-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200 sm:flex-row sm:items-center sm:justify-between">
            <span>{error}</span>
            <Button type="button" variant="outline" size="sm" onClick={loadRecommendations} leftIcon={<RefreshCw size={14} />}>Retry</Button>
          </div>
        )}
      </div>

      <div className="space-y-6">
        {recommendations.length > 0 ? (
          recommendations.map(rec => (
            <JobCard 
              key={rec.jobId} 
              job={{ ...rec, id: rec.jobId }} 
              matchScore={rec.matchScore} 
              recommendationReason={rec.explanation}
            />
          ))
        ) : (
          <div className="rounded-2xl border border-dashed border-secondary-300 p-12 text-center dark:border-secondary-700">
            <p className="text-body text-secondary-500 dark:text-secondary-400">No recommendations are available from your current profile data.</p>
          </div>
        )}
      </div>
    </div>
  );
}
