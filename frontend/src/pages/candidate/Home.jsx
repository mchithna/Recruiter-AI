import React, { useState, useEffect } from 'react';
import { Spinner } from '../../components/ui';
import JobCard from './components/JobCard';
import { getRecommendations, dismissRecommendation } from './services/mockData';

export default function CandidateHome() {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecommendations();
  }, []);

  const loadRecommendations = async () => {
    setLoading(true);
    const data = await getRecommendations();
    setRecommendations(data);
    setLoading(false);
  };

  const handleDismiss = async (id) => {
    await dismissRecommendation(id);
    await loadRecommendations();
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
        <h2 className="text-h2 text-secondary-900 dark:text-white">AI Recommendations</h2>
        <p className="text-body-sm text-secondary-600 dark:text-secondary-400 mt-2">
          Jobs matched to your profile based on your skills and experience.
        </p>
      </div>

      <div className="space-y-6">
        {recommendations.length > 0 ? (
          recommendations.map(rec => (
            <JobCard 
              key={rec.id} 
              job={rec} 
              matchScore={rec.matchScore} 
              recommendationReason={rec.recommendationReason}
              onDismiss={() => handleDismiss(rec.id)}
            />
          ))
        ) : (
          <div className="rounded-2xl border border-dashed border-secondary-300 p-12 text-center dark:border-secondary-700">
            <p className="text-body text-secondary-500 dark:text-secondary-400">No new recommendations at this time.</p>
          </div>
        )}
      </div>
    </div>
  );
}
