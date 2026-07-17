import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button, Spinner } from '../../components/ui';
import { MapPin, Briefcase, Clock, Calendar, AlertCircle, ChevronLeft } from 'lucide-react';
import { getJob, getMyDocuments, applyForJob } from './services/mockData';

export default function JobDetail() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [hasPrimaryDoc, setHasPrimaryDoc] = useState(false);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    loadData();
  }, [jobId]);

  const loadData = async () => {
    setLoading(true);
    const [jobData, docsData] = await Promise.all([
      getJob(jobId),
      getMyDocuments()
    ]);
    setJob(jobData);
    setHasPrimaryDoc(docsData.some(d => d.isPrimary));
    setLoading(false);
  };

  const handleApply = async () => {
    if (!hasPrimaryDoc) return;
    setApplying(true);
    await applyForJob(jobId);
    navigate('/candidate/applications');
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner size="lg" />
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
    </div>
  );
}
