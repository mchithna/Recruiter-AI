import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button, Spinner } from '../../components/ui';
import { MapPin, Briefcase, Clock, Calendar, AlertCircle, ChevronLeft, Sparkles, RefreshCw } from 'lucide-react';
import { applyForJob, candidateAiApi, getJob, getMyDocuments } from './services/candidateApi';

export default function JobDetail() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [hasPrimaryDoc, setHasPrimaryDoc] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [applyError, setApplyError] = useState('');
  const [applying, setApplying] = useState(false);
  const [skillGap, setSkillGap] = useState(null);
  const [assistance, setAssistance] = useState(null);
  const [aiLoading, setAiLoading] = useState('');
  const [aiError, setAiError] = useState('');

  useEffect(() => {
    loadData();
  }, [jobId]);

  const loadData = async () => {
    setLoading(true);
    setLoadError('');
    try {
      const [jobData, docsData] = await Promise.all([
        getJob(jobId),
        getMyDocuments()
      ]);
      setJob(jobData);
      setHasPrimaryDoc(docsData.some(d => d.isPrimary));
    } catch (err) {
      setJob(null);
      setLoadError(err?.response?.data?.message || 'Unable to load this job right now.');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    if (!hasPrimaryDoc) return;
    setApplying(true);
    setApplyError('');
    try {
      await applyForJob(jobId);
      navigate('/candidate/applications');
    } catch (err) {
      setApplyError(err?.response?.data?.message || 'Unable to apply for this job right now.');
    } finally {
      setApplying(false);
    }
  };

  const runSkillGap = async () => {
    setAiLoading('skill-gap');
    setAiError('');
    try {
      const data = await candidateAiApi.skillGap(jobId);
      setSkillGap(data);
    } catch (err) {
      setAiError(err?.response?.data?.message || 'Unable to generate skill-gap analysis.');
    } finally {
      setAiLoading('');
    }
  };

  const runApplicationHelp = async () => {
    setAiLoading('application');
    setAiError('');
    try {
      const data = await candidateAiApi.applicationAssistance(jobId);
      setAssistance(data);
    } catch (err) {
      setAiError(err?.response?.data?.message || 'Unable to generate application guidance.');
    } finally {
      setAiLoading('');
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <h2 className="text-h2 text-secondary-900 dark:text-white">Unable to Load Job</h2>
        <p className="mt-2 max-w-xl text-body-sm text-secondary-500 dark:text-secondary-400">{loadError}</p>
        <Button variant="outline" leftIcon={<ChevronLeft size={16} />} onClick={() => navigate('/candidate/jobs')} className="mt-4">Back to Jobs</Button>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <h2 className="text-h2 text-secondary-900 dark:text-white">Job Not Found</h2>
        <Button variant="outline" leftIcon={<ChevronLeft size={16} />} onClick={() => navigate('/candidate/jobs')} className="mt-4">Back to Jobs</Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8 pb-12">
      <Button variant="outline" leftIcon={<ChevronLeft size={16} />} onClick={() => navigate(-1)} className="mb-4">
        Back to Jobs
      </Button>

      <div className="rounded-3xl border border-white/60 bg-white/75 p-8 shadow-glass backdrop-blur-2xl dark:border-white/10 dark:bg-secondary-950/55 dark:shadow-glass-dark">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div>
            <h1 className="text-h1 text-secondary-900 dark:text-white">{job.jobTitle}</h1>
            <p className="text-body text-secondary-500 dark:text-secondary-400 mt-1">{job.departmentName}</p>
            
            <div className="mt-6 flex flex-wrap gap-y-2 gap-x-6 text-body-sm text-secondary-600 dark:text-secondary-300">
              <div className="flex items-center gap-2">
                <Briefcase size={18} className="text-primary-500" />
                {job.employmentType}
              </div>
              <div className="flex items-center gap-2">
                <MapPin size={18} className="text-primary-500" />
                {job.location}
              </div>
              <div className="flex items-center gap-2">
                <Clock size={18} className="text-primary-500" />
                {job.workMode}
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={18} className="text-primary-500" />
                Deadline: {new Date(job.applicationDeadline).toLocaleDateString()}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 min-w-[200px]">
            <Button 
              size="lg" 
              onClick={handleApply} 
              disabled={!hasPrimaryDoc || applying}
              className="w-full shadow-glow-primary"
            >
              {applying ? 'Applying...' : 'Apply Now'}
            </Button>
            {!hasPrimaryDoc && (
              <div className="flex items-start gap-2 rounded-lg bg-red-50 p-3 text-caption text-red-700 dark:bg-red-500/10 dark:text-red-400">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <p>
                  Upload a primary resume before applying. <Link to="/candidate/documents" className="font-semibold underline">Go to Documents</Link>
                </p>
              </div>
            )}
            {applyError && (
              <div className="rounded-lg bg-red-50 p-3 text-caption text-red-700 dark:bg-red-500/10 dark:text-red-400">
                {applyError}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-8 rounded-3xl border border-white/60 bg-white/75 p-8 shadow-glass backdrop-blur-2xl dark:border-white/10 dark:bg-secondary-950/55 dark:shadow-glass-dark">
        <section>
          <h3 className="text-h3 text-secondary-900 dark:text-white mb-4">Job Description</h3>
          <div className="prose prose-secondary dark:prose-invert max-w-none text-body-sm whitespace-pre-wrap">
            {job.description}
          </div>
        </section>

        <section>
          <h3 className="text-h3 text-secondary-900 dark:text-white mb-4">Requirements</h3>
          <div className="prose prose-secondary dark:prose-invert max-w-none text-body-sm whitespace-pre-wrap">
            {job.requirements}
          </div>
        </section>
      </div>

      <div className="space-y-6 rounded-3xl border border-white/60 bg-white/75 p-8 shadow-glass backdrop-blur-2xl dark:border-white/10 dark:bg-secondary-950/55 dark:shadow-glass-dark">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-h3 text-secondary-900 dark:text-white">AI Application Support</h3>
            <p className="mt-1 text-body-sm text-secondary-500 dark:text-secondary-400">
              Advisory guidance based on this job and your authenticated profile.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" onClick={runSkillGap} disabled={!!aiLoading} leftIcon={aiLoading === 'skill-gap' ? <Spinner size="sm" /> : <Sparkles size={16} />}>
              View Skill Gaps
            </Button>
            <Button type="button" onClick={runApplicationHelp} disabled={!!aiLoading} leftIcon={aiLoading === 'application' ? <Spinner size="sm" /> : <Sparkles size={16} />}>
              Generate Application Tips
            </Button>
          </div>
        </div>

        {aiError && (
          <div className="flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-body-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200 sm:flex-row sm:items-center sm:justify-between">
            <span>{aiError}</span>
            <Button type="button" size="sm" variant="outline" onClick={runSkillGap} leftIcon={<RefreshCw size={14} />}>Retry</Button>
          </div>
        )}

        {skillGap?.result && (
          <div className="grid gap-5 md:grid-cols-2">
            <AiList title="Required skills you have" items={skillGap.result.availableRequiredSkills} />
            <AiList title="Missing required skills" items={skillGap.result.missingRequiredSkills} />
            <AiList title="Preferred skills" items={skillGap.result.preferredSkills} />
            <AiList title="Suggested learning areas" items={skillGap.result.suggestedLearningAreas} />
            <div className="md:col-span-2"><AiList title="Practical recommendations" items={skillGap.result.practicalRecommendations} /></div>
          </div>
        )}

        {assistance?.result && (
          <div className="space-y-5 border-t border-secondary-100 pt-6 dark:border-white/10">
            <AiList title="Application tips" items={assistance.result.applicationTips} />
            <AiList title="Profile-summary suggestions" items={assistance.result.profileSummarySuggestions} />
            {assistance.result.coverLetterDraft && (
              <div>
                <h4 className="mb-2 text-body-sm font-semibold text-secondary-800 dark:text-secondary-100">Cover-letter draft</h4>
                <div className="whitespace-pre-wrap rounded-2xl bg-secondary-50 p-4 text-body-sm text-secondary-700 dark:bg-secondary-900 dark:text-secondary-200">
                  {assistance.result.coverLetterDraft}
                </div>
              </div>
            )}
            <AiList title="Interview preparation guidance" items={assistance.result.interviewPreparationGuidance} />
            <p className="text-caption text-secondary-500 dark:text-secondary-400">{assistance.disclaimer}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function AiList({ title, items }) {
  const safeItems = Array.isArray(items) ? items.filter(Boolean) : [];
  if (safeItems.length === 0) return null;

  return (
    <div>
      <h4 className="mb-2 text-body-sm font-semibold text-secondary-800 dark:text-secondary-100">{title}</h4>
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
}
