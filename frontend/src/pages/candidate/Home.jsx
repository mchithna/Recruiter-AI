import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button, Spinner } from '../../components/ui';
import JobCard from './components/JobCard';
import { candidateAiApi, getMyProfile, getMyDocuments } from './services/candidateApi';
import { RefreshCw, Sparkles, FileText, UserCircle, ArrowRight } from 'lucide-react';

export default function CandidateHome() {
  const [recommendations, setRecommendations] = useState([]);
  const [aiResponse, setAiResponse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [onboardingState, setOnboardingState] = useState({ hasResume: false, hasProfile: false });

  useEffect(() => {
    checkOnboardingAndLoad();
  }, []);

  const checkOnboardingAndLoad = async () => {
    setLoading(true);
    try {
      const [profile, docs] = await Promise.all([
        getMyProfile(),
        getMyDocuments()
      ]);

      const hasPrimaryDoc = docs.some(d => d.isPrimary);
      const hasSkills = profile.skills && profile.skills.length > 0;
      const hasExperience = profile.experience && profile.experience.length > 0;
      const hasEducation = profile.education && profile.education.length > 0;
      
      const hasProfileData = hasSkills && (hasExperience || hasEducation);

      if (!hasPrimaryDoc || !hasProfileData) {
        setNeedsOnboarding(true);
        setOnboardingState({ hasResume: hasPrimaryDoc, hasProfile: hasProfileData });
        setLoading(false);
      } else {
        setNeedsOnboarding(false);
        await loadRecommendations();
      }
    } catch (err) {
      console.error(err);
      setError('Failed to load profile data.');
      setLoading(false);
    }
  };

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

  if (needsOnboarding) {
    return (
      <div className="mx-auto max-w-2xl mt-8">
        <div className="glass-card-heavy rounded-3xl p-10 text-center shadow-glass backdrop-blur-2xl">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary-500/10 text-primary-600 dark:text-primary-400">
            <Sparkles size={40} strokeWidth={1.5} />
          </div>
          <h2 className="text-h2 text-secondary-900 dark:text-white mb-3">Welcome to your Job Hub!</h2>
          <p className="text-body text-secondary-600 dark:text-secondary-400 mb-8 max-w-lg mx-auto">
            Before our AI can match you with the perfect roles, we need to know a little more about you. Complete these quick steps to get started.
          </p>
          
          <div className="flex flex-col gap-4 text-left">
            <Link to="/candidate/documents" className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:p-5 rounded-2xl border transition-all hover:-translate-y-1 ${onboardingState.hasResume ? 'bg-success-50 border-success-200 dark:bg-success-900/10 dark:border-success-800' : 'bg-white border-secondary-200 shadow-sm dark:bg-secondary-900 dark:border-secondary-800 hover:border-primary-300 dark:hover:border-primary-700'}`}>
              <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                <div className={`flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-full ${onboardingState.hasResume ? 'bg-success-100 text-success-600 dark:bg-success-800/30 dark:text-success-400' : 'bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400'}`}>
                  <FileText size={22} />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-h4 text-secondary-900 dark:text-white mb-0.5">Upload a Resume</h3>
                  <p className="text-body-sm text-secondary-500 dark:text-secondary-400">Add a primary resume so we can parse your details.</p>
                </div>
              </div>
              <div className="shrink-0 flex justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-secondary-100 dark:border-white/5">
                {onboardingState.hasResume ? (
                  <span className="text-sm font-semibold text-success-600 dark:text-success-400">Completed</span>
                ) : (
                  <span className="flex items-center gap-1 text-sm font-semibold text-primary-600 dark:text-primary-400">Go <ArrowRight size={14} /></span>
                )}
              </div>
            </Link>

            <Link to="/candidate/profile" className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:p-5 rounded-2xl border transition-all hover:-translate-y-1 ${onboardingState.hasProfile ? 'bg-success-50 border-success-200 dark:bg-success-900/10 dark:border-success-800' : 'bg-white border-secondary-200 shadow-sm dark:bg-secondary-900 dark:border-secondary-800 hover:border-primary-300 dark:hover:border-primary-700'}`}>
              <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                <div className={`flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-full ${onboardingState.hasProfile ? 'bg-success-100 text-success-600 dark:bg-success-800/30 dark:text-success-400' : 'bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400'}`}>
                  <UserCircle size={22} />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-h4 text-secondary-900 dark:text-white mb-0.5">Fill out your Profile</h3>
                  <p className="text-body-sm text-secondary-500 dark:text-secondary-400">Add at least one skill and an experience/education entry.</p>
                </div>
              </div>
              <div className="shrink-0 flex justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-secondary-100 dark:border-white/5">
                {onboardingState.hasProfile ? (
                  <span className="text-sm font-semibold text-success-600 dark:text-success-400">Completed</span>
                ) : (
                  <span className="flex items-center gap-1 text-sm font-semibold text-primary-600 dark:text-primary-400">Go <ArrowRight size={14} /></span>
                )}
              </div>
            </Link>
          </div>
          
          <div className="mt-8">
            <Button variant="ghost" onClick={checkOnboardingAndLoad} leftIcon={<RefreshCw size={16} />}>
              Refresh Status
            </Button>
          </div>
        </div>
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
