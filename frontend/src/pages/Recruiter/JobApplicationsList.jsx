import { ArrowLeft, RefreshCw, Sparkles, Users, Check, X, AlertTriangle, Briefcase, GraduationCap } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Modal,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Switch
} from '../../components/ui';
import { StatusBadge } from '../../components/ui';
import { recruiterApi } from './services/recruiterApi';
import { useRecruiterJobs } from './useRecruiterJobs';
import { useToast } from '../../lib/ToastContext';

const formatAppliedAt = (appliedAt) => {
  if (!appliedAt) return 'Unknown';

  return new Intl.DateTimeFormat(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(appliedAt));
};

export function JobApplicationsList() {
  const navigate = useNavigate();
  const { jobId } = useParams();
  const { getJobById, updateJobStatus } = useRecruiterJobs();
  const [applications, setApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [aiPanel, setAiPanel] = useState({ loading: '', error: '', title: '', disclaimer: '', result: null });

  const job = getJobById(jobId);
  const sortedApplications = useMemo(
    () => {
      let apps = [...applications].sort((a, b) => b.aiMatchScore - a.aiMatchScore);
      if (job?.status === 'Closed') {
        const nonShortlistedStatuses = ['Applied', 'Under Review', 'In Review'];
        apps = apps.filter(app => !nonShortlistedStatuses.includes(app.status));
      }
      return apps;
    },
    [applications, job?.status]
  );
  const averageScore = applications.length
    ? Math.round(
        applications.reduce((total, application) => total + application.aiMatchScore, 0) /
          applications.length
      )
    : 0;

  const loadApplications = useCallback(async ({ showLoading = false } = {}) => {
    if (showLoading) setIsLoading(true);
    try {
      const loadedApplications = await recruiterApi.getApplicationsByJob(jobId);
      setApplications(loadedApplications);
    } catch (error) {
      console.error('Failed to load applications:', error);
      setApplications([]);
    } finally {
      if (showLoading) setIsLoading(false);
    }
  }, [jobId]);

  useEffect(() => {
    let isActive = true;
    setIsLoading(true);

    recruiterApi.getApplicationsByJob(jobId)
      .then((loadedApplications) => {
        if (!isActive) return;
        setApplications(loadedApplications);
      })
      .catch((error) => {
        console.error('Failed to load applications:', error);
        if (isActive) setApplications([]);
      })
      .finally(() => {
        if (isActive) setIsLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, [jobId]);

  const runAiAction = async (action) => {
    setAiPanel({ loading: action, error: '', title: '', disclaimer: '', result: null });
    try {
      const response = action === 'compare'
        ? await recruiterApi.compareCandidates(jobId)
        : await recruiterApi.screeningAssistance(jobId);
      setAiPanel({
        loading: '',
        error: '',
        title: action === 'compare' ? 'Explainable Candidate Comparison' : 'Screening Assistance',
        disclaimer: response.disclaimer,
        result: response.result,
      });
    } catch (error) {
      setAiPanel({
        loading: '',
        error: error?.response?.data?.message || 'AI could not complete this request right now.',
        title: '',
        disclaimer: '',
        result: null,
      });
    }
  };

  const { toast } = useToast();
  const [aiThreshold, setAiThreshold] = useState(0);
  const [strictExperience, setStrictExperience] = useState(false);
  const [strictEducation, setStrictEducation] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [showCloseModal, setShowCloseModal] = useState(false);

  const handleStatusChange = async (e, applicationId, newStatus) => {
    e.stopPropagation();
    try {
      await recruiterApi.updateApplicationStatus(applicationId, { newStatus });
      setApplications(prev => prev.map(app => 
        app.id === applicationId ? { ...app, status: newStatus } : app
      ));
      toast({ title: `Application marked as ${newStatus}`, variant: 'success' });
    } catch (error) {
      toast({ title: 'Failed to update status', variant: 'danger' });
    }
  };

  const handlePromptCloseJob = () => {
    setShowCloseModal(true);
  };

  const confirmCloseJob = async () => {
    setShowCloseModal(false);
    setIsClosing(true);
    try {
      await updateJobStatus(jobId, 'Closed');
      await loadApplications();
      toast({ title: 'Job successfully closed.', variant: 'success' });
    } catch (error) {
      console.error('Failed to close job:', error);
      toast({ title: 'Failed to close job.', variant: 'danger' });
    } finally {
      setIsClosing(false);
    }
  };

  return (
    <div className="relative z-10 space-y-6 animate-slide-up">
      <section className="glass-card-heavy relative overflow-hidden rounded-3xl border-none p-6">
        <img
          src="/images/card-bg-candidate.png"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover opacity-15 dark:opacity-35 dark:mix-blend-screen"
        />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Badge variant="ai" size="sm" icon={<Sparkles size={12} strokeWidth={1.75} />}>
              AI-ranked applicants
            </Badge>
            <h1 className="mt-3 text-h1 text-secondary-900 dark:text-white">Applications</h1>
            <p className="mt-2 max-w-2xl text-body-sm text-secondary-500 dark:text-secondary-300">
              {job ? job.title : 'Review candidates for this role'}
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <span className="rounded-full bg-white/70 px-3 py-1 text-caption font-semibold text-primary-700 dark:bg-white/10 dark:text-primary-300">
                {applications.length} candidates
              </span>
              <span className="rounded-full bg-white/70 px-3 py-1 text-caption font-semibold text-ai-700 dark:bg-white/10 dark:text-ai-300">
                {averageScore}% avg AI match
              </span>
            </div>
          </div>
          <div className="hidden h-24 w-24 items-center justify-center rounded-3xl bg-ai-500 text-white shadow-glow-ai sm:flex">
            <Users size={42} strokeWidth={1.5} />
          </div>
        </div>
      </section>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between w-full">
        {/* Left: AI Feature Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="ai"
            leftIcon={<Sparkles size={16} />}
            onClick={() => runAiAction('compare')}
            disabled={Boolean(aiPanel.loading) || applications.length === 0 || job?.status === 'Closed'}
            title={job?.status === 'Closed' ? 'Job posting is finalized and closed' : undefined}
          >
            {aiPanel.loading === 'compare' ? 'Comparing...' : 'Compare Candidates'}
          </Button>
          <Button
            type="button"
            variant="outline"
            leftIcon={<RefreshCw size={16} />}
            onClick={() => runAiAction('screening')}
            disabled={Boolean(aiPanel.loading) || applications.length === 0 || job?.status === 'Closed'}
            title={job?.status === 'Closed' ? 'Job posting is finalized and closed' : undefined}
          >
            {aiPanel.loading === 'screening' ? 'Checking...' : 'Screening Assistance'}
          </Button>
        </div>

        {/* Right: Job Finalize & Navigation Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="danger"
            onClick={handlePromptCloseJob}
            disabled={isClosing || !job || job.status === 'Closed'}
            className="bg-danger-600 hover:bg-danger-700 text-white font-medium shadow-sm shadow-danger-600/20"
          >
            {isClosing ? 'Closing...' : (job?.status === 'Closed' ? 'Job Closed' : 'Finalize & Close Job')}
          </Button>
          <Button
            type="button"
            variant="outline"
            leftIcon={<ArrowLeft size={18} />}
            onClick={() => navigate('/recruiter/jobs')}
          >
            Back to Jobs
          </Button>
        </div>
      </div>

      {(aiPanel.result || aiPanel.error) && (
        <Card className="glass-card-heavy border-none">
          <CardHeader className="mb-3">
            <div>
              <CardTitle>{aiPanel.title || 'AI Assistance'}</CardTitle>
              <CardDescription>
                {aiPanel.disclaimer || 'AI-generated output should be verified before recruiter decisions.'}
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            {aiPanel.error ? (
              <p className="text-body-sm text-danger-600 dark:text-danger-300">{aiPanel.error}</p>
            ) : aiPanel.result?.rankings ? (
              <div className="space-y-4">
                {aiPanel.result.rankings.map((item) => (
                  <div key={item.applicationId} className="rounded-xl border border-secondary-100 bg-white/70 p-4 dark:border-white/10 dark:bg-white/5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className="text-body-lg font-semibold text-secondary-900 dark:text-white">
                        #{item.explainableRank} {item.candidateName}
                      </h3>
                      <Badge variant="ai" size="sm">{item.matchScore}% match</Badge>
                    </div>
                    <p className="mt-2 text-body-sm text-secondary-600 dark:text-secondary-300">{item.explanation}</p>
                    <p className="mt-3 text-caption font-semibold uppercase tracking-wide text-success-700 dark:text-success-300">Strengths</p>
                    <p className="text-body-sm text-secondary-600 dark:text-secondary-300">{item.strengths?.join(', ') || 'None listed'}</p>
                    <p className="mt-2 text-caption font-semibold uppercase tracking-wide text-warning-700 dark:text-warning-300">Qualification gaps</p>
                    <p className="text-body-sm text-secondary-600 dark:text-secondary-300">{item.qualificationGaps?.join(', ') || 'None listed'}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {Object.entries(aiPanel.result || {}).map(([key, value]) => (
                  <div key={key} className="rounded-xl border border-secondary-100 bg-white/70 p-4 dark:border-white/10 dark:bg-white/5">
                    <h3 className="text-body-sm font-semibold capitalize text-secondary-900 dark:text-white">
                      {key.replace(/([A-Z])/g, ' $1')}
                    </h3>
                    <ul className="mt-2 list-disc space-y-1 pl-5 text-body-sm text-secondary-600 dark:text-secondary-300">
                      {(Array.isArray(value) ? value : [String(value || '')]).map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Card className="glass-card-heavy overflow-hidden border-none p-0">
        <CardHeader className="mb-0 p-6 pb-4">
          <div>
            <CardTitle>Applicants</CardTitle>
            <CardDescription>
              Sorted by AI match score from highest to lowest.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 border-b border-secondary-100 p-4 sm:p-6 dark:border-white/10 md:flex-row md:items-center md:justify-between bg-secondary-50/30 dark:bg-secondary-900/20">
            <div className="w-full md:flex-1 md:max-w-md">
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-semibold text-secondary-700 dark:text-secondary-300 flex items-center gap-1">
                  <Sparkles size={14} className="text-ai-500" /> AI Match Threshold
                </label>
                <span className="text-sm font-bold text-ai-600 dark:text-ai-400">{aiThreshold}%</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={aiThreshold} 
                onChange={(e) => setAiThreshold(Number(e.target.value))} 
                className="w-full h-2 bg-secondary-200 rounded-lg appearance-none cursor-pointer dark:bg-secondary-700 accent-ai-500 hover:accent-ai-600" 
              />
            </div>
            <div className="flex flex-wrap items-center gap-3 sm:gap-6">
              <div className="flex items-center space-x-2">
                <Switch id="strict-exp" checked={strictExperience} onChange={(e) => setStrictExperience(e.target.checked)} />
                <label htmlFor="strict-exp" className="text-xs sm:text-sm font-medium text-secondary-700 dark:text-secondary-300 flex items-center gap-1 whitespace-nowrap">
                  <Briefcase size={14} /> Strict Experience
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="strict-edu" checked={strictEducation} onChange={(e) => setStrictEducation(e.target.checked)} />
                <label htmlFor="strict-edu" className="text-xs sm:text-sm font-medium text-secondary-700 dark:text-secondary-300 flex items-center gap-1 whitespace-nowrap">
                  <GraduationCap size={14} /> Strict Education
                </label>
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-3 p-6">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : (
            <div className="w-full overflow-x-auto">
              <Table density="comfortable" className="min-w-[600px] w-full">
                <TableHeader>
                  <TableRow isHeader>
                    <TableHead>Candidate</TableHead>
                    <TableHead>Applied</TableHead>
                    <TableHead className="text-right">AI Match</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedApplications.map((application) => {
                    const isBelowThreshold = application.aiMatchScore < aiThreshold;
                    
                    const screening = application.screeningResult;
                    const failsExp = strictExperience && screening && screening.experienceMatchScore < 50;
                    const failsEdu = strictEducation && screening && screening.educationMatchScore < 50;
                    const hasStrictFailures = failsExp || failsEdu;

                    return (
                      <TableRow
                        key={application.id}
                        className={`cursor-pointer transition-all duration-300 ${isBelowThreshold ? 'opacity-40 grayscale-[50%] blur-[0.5px]' : 'hover:bg-secondary-50 dark:hover:bg-white/5'} ${hasStrictFailures ? 'bg-danger-50/50 dark:bg-danger-900/10' : ''}`}
                        onClick={() => navigate(`/recruiter/applications/${application.id}`)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') {
                          navigate(`/recruiter/applications/${application.id}`);
                        }
                      }}
                      role="link"
                      tabIndex={0}
                    >
                      <TableCell className="font-semibold text-secondary-900">
                        <div className="flex items-center gap-2">
                          {application.candidateName}
                          {hasStrictFailures && (
                            <span className="flex items-center gap-1 rounded bg-danger-100 px-1.5 py-0.5 text-xs font-medium text-danger-700 dark:bg-danger-900/50 dark:text-danger-300">
                              <AlertTriangle size={12} />
                              {failsExp && 'Exp'} {failsExp && failsEdu && '&'} {failsEdu && 'Edu'}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{formatAppliedAt(application.appliedAt)}</TableCell>
                      <TableCell numeric>
                        <span className={`font-bold ${isBelowThreshold ? 'text-danger-500' : 'text-ai-600 dark:text-ai-400'}`}>
                          {application.aiMatchScore}%
                        </span>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={application.status?.toLowerCase().replace(/ /g, '_')} />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                          {application.status === 'Shortlisted' ? (
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="h-8 text-secondary-600 hover:bg-secondary-100 hover:text-secondary-900"
                              onClick={(e) => handleStatusChange(e, application.id, 'Applied')}
                              disabled={job?.status === 'Closed'}
                              title={job?.status === 'Closed' ? 'Job posting is finalized and closed' : undefined}
                            >
                              Revoke
                            </Button>
                          ) : (
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="h-8 border-success-200 text-success-700 hover:bg-success-50 hover:text-success-800 dark:border-success-900/50 dark:text-success-400 dark:hover:bg-success-900/30"
                              onClick={(e) => handleStatusChange(e, application.id, 'Shortlisted')}
                              disabled={job?.status === 'Closed'}
                              title={job?.status === 'Closed' ? 'Job posting is finalized and closed' : undefined}
                            >
                              <Check size={14} className="mr-1" /> Shortlist
                            </Button>
                          )}
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="h-8 text-danger-600 hover:bg-danger-50 hover:text-danger-700 dark:text-danger-400 dark:hover:bg-danger-900/30"
                            onClick={(e) => handleStatusChange(e, application.id, 'Rejected')}
                            disabled={job?.status === 'Closed'}
                            title={job?.status === 'Closed' ? 'Job posting is finalized and closed' : undefined}
                          >
                            <X size={14} className="mr-1" /> Reject
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Modal
        isOpen={showCloseModal}
        onClose={() => setShowCloseModal(false)}
        title="Finalize & Close Job Posting"
        size="md"
        footer={
          <div className="flex items-center justify-end gap-3 w-full">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowCloseModal(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="danger"
              leftIcon={<AlertTriangle size={16} />}
              onClick={confirmCloseJob}
              isLoading={isClosing}
              className="bg-danger-600 hover:bg-danger-700 text-white"
            >
              Finalize & Close Job
            </Button>
          </div>
        }
      >
        <div className="space-y-4 py-1">
          <div className="flex items-center gap-3.5 rounded-xl border border-danger-500/20 bg-danger-50/60 p-3.5 dark:border-danger-500/30 dark:bg-danger-500/10">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-danger-600 text-white shadow-md shadow-danger-600/30">
              <AlertTriangle size={20} />
            </div>
            <div>
              <h4 className="text-body-sm font-semibold text-secondary-900 dark:text-white">
                {job?.title || 'Job Position'}
              </h4>
              <p className="text-caption text-secondary-500 dark:text-secondary-400">
                Finalizing job posting and locking applications
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-secondary-200 bg-secondary-50/70 p-4 dark:border-white/10 dark:bg-white/[0.03]">
            <p className="text-caption font-semibold uppercase tracking-wider text-danger-600 dark:text-danger-400 mb-1">
              Warning
            </p>
            <p className="text-body-sm text-secondary-800 dark:text-secondary-200">
              Are you sure? This will prevent any further applications for this role and finalize candidate status updates.
            </p>
          </div>

          <p className="text-body-sm text-secondary-600 dark:text-secondary-300">
            Click &quot;Finalize &amp; Close Job&quot; to confirm and close this vacancy.
          </p>
        </div>
      </Modal>
    </div>
  );
}

export default JobApplicationsList;
