import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, Video, FileText, Check, X, Sparkles, AlertTriangle, ShieldCheck } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Skeleton,
  Button,
} from '../../components/ui';
import StatusBadge from './components/StatusBadge';
import CalendarConnectButton from './components/CalendarConnectButton';
import { getInterview, getEvaluationForInterview } from './services/hiringManagerApi';

const formatScheduledTime = (scheduledTime) => {
  if (!scheduledTime) return 'Not scheduled';

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'long',
    timeStyle: 'short',
  }).format(new Date(scheduledTime));
};

export function InterviewDetail() {
  const { interviewId } = useParams();
  const navigate = useNavigate();
  const [interview, setInterview] = useState(null);
  const [evaluation, setEvaluation] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isActive = true;

    async function loadInterviewData() {
      try {
        setIsLoading(true);
        const data = await getInterview(interviewId);
        const evalData = await getEvaluationForInterview(interviewId);

        if (isActive) {
          setInterview(data);
          setEvaluation(evalData);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Failed to load interview detail', error);
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    loadInterviewData();

    return () => {
      isActive = false;
    };
  }, [interviewId]);

  const updateStatus = (newStatus) => {
    if (!interview) return;
    setInterview((prev) => ({
      ...prev,
      status: newStatus,
    }));
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-slide-up">
        <Skeleton className="h-16 w-full rounded-2xl" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Skeleton className="h-80 w-full rounded-2xl" />
          </div>
          <div>
            <Skeleton className="h-48 w-full rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!interview) {
    return (
      <div className="text-center py-12 animate-slide-up">
        <h2 className="text-h2 text-secondary-900 dark:text-white">Interview not found</h2>
        <p className="mt-2 text-body-sm text-secondary-500">The interview link may have expired or does not exist.</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate('/hiring-manager/queue')}>
          Back to Queue
        </Button>
      </div>
    );
  }

  return (
    <div className="relative z-10 space-y-6 animate-slide-up">
      {/* Header section with back navigation and status */}
      <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            leftIcon={<ArrowLeft size={16} />}
            onClick={() => navigate(`/hiring-manager/applications/${interview.applicationId}`)}
          >
            Back to Application
          </Button>
          <div className="h-6 w-px bg-secondary-200 dark:bg-white/10 hidden sm:block" />
          <div>
            <span className="text-caption font-semibold uppercase tracking-wide text-secondary-400">
              {interview.interviewType}
            </span>
            <h1 className="text-h2 text-secondary-900 dark:text-white">
              {interview.candidateName}
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-3 bg-white/70 dark:bg-white/5 border border-secondary-100 dark:border-white/5 px-4 py-2 rounded-2xl backdrop-blur-md shadow-sm">
          <span className="text-body-sm font-semibold text-secondary-500 dark:text-secondary-400">
            Interview Status:
          </span>
          <StatusBadge status={interview.status} size="md" />
        </div>
      </section>

      {/* Detail Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Interview & Evaluation Details Card */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="overflow-hidden border-none shadow-glass">
            {/* Top gradient accent */}
            <div className="h-1.5 w-full bg-gradient-to-r from-primary-500 via-primary-500 to-ai-500" />
            <CardHeader>
              <CardTitle>Interview Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Time & Duration */}
                <div className="flex items-start gap-3 rounded-2xl bg-secondary-50 dark:bg-white/5 p-4 border border-secondary-100 dark:border-white/5">
                  <Calendar size={20} className="text-primary-500 mt-0.5 shrink-0" />
                  <div>
                    <h4 className="text-body-sm font-bold text-secondary-800 dark:text-white">Date & Time</h4>
                    <p className="mt-1 text-body-md text-secondary-600 dark:text-secondary-300">
                      {formatScheduledTime(interview.scheduledTime)}
                    </p>
                    <span className="inline-flex items-center gap-1 mt-1 text-caption text-secondary-400 dark:text-secondary-500">
                      <Clock size={12} /> {interview.durationMinutes} minutes
                    </span>
                  </div>
                </div>

                {/* Meeting Link */}
                <div className="flex items-start gap-3 rounded-2xl bg-secondary-50 dark:bg-white/5 p-4 border border-secondary-100 dark:border-white/5">
                  <Video size={20} className="text-primary-500 mt-0.5 shrink-0" />
                  <div>
                    <h4 className="text-body-sm font-bold text-secondary-800 dark:text-white">Meeting Link</h4>
                    {interview.meetingLink ? (
                      <div className="mt-1">
                        <a
                          href={interview.meetingLink}
                          target="_blank"
                          rel="noreferrer"
                          className="text-body-md font-semibold text-primary-600 hover:text-primary-700 dark:text-primary-400 break-all inline-flex items-center gap-1"
                        >
                          Join Call
                        </a>
                      </div>
                    ) : (
                      <p className="mt-1 text-body-sm italic text-secondary-400 dark:text-secondary-500">
                        No meeting link provided.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Notes Section */}
              <div className="rounded-2xl border border-secondary-100 dark:border-white/5 p-4">
                <h4 className="text-body-sm font-bold text-secondary-800 dark:text-white flex items-center gap-2 mb-2">
                  <FileText size={16} className="text-secondary-400" />
                  Interviewer Notes
                </h4>
                <p className="text-body-md text-secondary-600 dark:text-secondary-300 leading-relaxed whitespace-pre-wrap">
                  {interview.notes || 'No specific notes provided for this interview slot.'}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Submitted Evaluation summary */}
          {evaluation && (
            <Card className="overflow-hidden border-none shadow-glass">
              {/* Green/success accent for evaluation */}
              <div className="h-1.5 w-full bg-gradient-to-r from-success-500 via-primary-500 to-primary-500" />
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Submitted Evaluation Record</CardTitle>
                <div className="flex flex-col items-center">
                  <span className="text-caption font-semibold uppercase text-secondary-400">Overall Rating</span>
                  <span className="text-h2 font-extrabold text-primary-600 dark:text-primary-400">
                    {evaluation.overallScore}/100
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="rounded-2xl bg-success-50/50 dark:bg-success-950/10 border border-success-200/50 dark:border-success-500/20 p-4">
                    <h5 className="text-body-sm font-bold text-success-800 dark:text-success-400 mb-1.5 flex items-center gap-1.5">
                      <Check size={14} /> Key Strengths
                    </h5>
                    <p className="text-body-sm text-secondary-600 dark:text-secondary-300 leading-relaxed whitespace-pre-wrap">
                      {evaluation.strengthsText || 'No strengths noted.'}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-danger-50/30 dark:bg-danger-950/10 border border-danger-200/30 dark:border-danger-500/20 p-4">
                    <h5 className="text-body-sm font-bold text-danger-800 dark:text-danger-400 mb-1.5 flex items-center gap-1.5">
                      <AlertTriangle size={14} /> Key Concerns
                    </h5>
                    <p className="text-body-sm text-secondary-600 dark:text-secondary-300 leading-relaxed whitespace-pre-wrap">
                      {evaluation.concernsText || 'No major concerns noted.'}
                    </p>
                  </div>
                </div>
                <div className="rounded-2xl border border-secondary-100 dark:border-white/5 p-4">
                  <h5 className="text-body-sm font-bold text-secondary-800 dark:text-white mb-1.5">
                    Detailed Notes
                  </h5>
                  <p className="text-body-sm text-secondary-600 dark:text-secondary-300 leading-relaxed whitespace-pre-wrap">
                    {evaluation.feedbackText}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Action Panel Side column */}
        <div className="space-y-6">
          {/* Calendar Sync Card */}
          <Card className="shadow-glass border-none">
            <CardHeader className="pb-2">
              <CardTitle className="text-body-lg font-bold">Calendar Integration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-body-sm text-secondary-500 dark:text-secondary-400">
                Connect your account calendar to automatically sync interview loops and prevent schedule overlap.
              </p>
              <CalendarConnectButton provider="Google Calendar" />
            </CardContent>
          </Card>

          {/* Action Decision Card */}
          <Card className="shadow-glass border-none">
            <CardHeader className="pb-2">
              <CardTitle className="text-body-lg font-bold">Interview Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-body-sm text-secondary-500 dark:text-secondary-400">
                Manage the schedule lifecycle. Status transitions occur instantly in local workspace.
              </p>
              <Button
                variant="ai"
                className="w-full"
                leftIcon={<Sparkles size={16} />}
                onClick={() => navigate(`/hiring-manager/interviews/${interviewId}/live-copilot`)}
              >
                Open Live Copilot
              </Button>
              
              <div className="space-y-3">
                {evaluation ? (
                  // If evaluated
                  <div className="space-y-4">
                    <div className="rounded-xl bg-success-50 dark:bg-success-950/20 border border-success-200 dark:border-success-500/30 p-3 text-success-800 dark:text-success-300 text-body-sm font-semibold flex items-center gap-2">
                      <ShieldCheck size={16} /> Candidate Evaluated
                    </div>
                    {evaluation.hireRecommendation ? (
                      <Button
                        variant="primary"
                        className="w-full bg-gradient-to-r from-primary-500 to-primary-600 shadow-glow-primary"
                        leftIcon={<Sparkles size={16} />}
                        onClick={() => navigate(`/hiring-manager/applications/${interview.applicationId}/offer`)}
                      >
                        Proceed to Offer
                      </Button>
                    ) : (
                      <p className="text-body-sm italic text-secondary-400 text-center">
                        No hire recommendation submitted.
                      </p>
                    )}
                  </div>
                ) : (
                  // Standard schedule buttons when not evaluated
                  <>
                    {(interview.status === 'Scheduled' || interview.status === 'Rescheduled') && (
                      <div className="flex flex-col gap-2">
                        <Button
                          variant="primary"
                          className="w-full"
                          leftIcon={<Check size={16} />}
                          onClick={() => updateStatus('Confirmed')}
                        >
                          Confirm Interview
                        </Button>
                        <Button
                          variant="danger"
                          className="w-full"
                          leftIcon={<X size={16} />}
                          onClick={() => updateStatus('Canceled')}
                        >
                          Cancel Interview
                        </Button>
                      </div>
                    )}

                    {interview.status === 'Confirmed' && (
                      <div className="flex flex-col gap-2">
                        <Button
                          variant="primary"
                          className="w-full"
                          leftIcon={<Check size={16} />}
                          onClick={() => updateStatus('Completed')}
                        >
                          Mark Completed
                        </Button>
                        <Button
                          variant="danger"
                          className="w-full"
                          leftIcon={<X size={16} />}
                          onClick={() => updateStatus('Canceled')}
                        >
                          Cancel Interview
                        </Button>
                      </div>
                    )}

                    {interview.status === 'Completed' && (
                      <div className="space-y-4">
                        <div className="rounded-xl bg-success-50 dark:bg-success-950/20 border border-success-200 dark:border-success-500/30 p-3 text-success-800 dark:text-success-300 text-body-sm font-semibold flex items-center gap-2">
                          <Check size={16} /> Completed
                        </div>
                        <Button
                          variant="primary"
                          className="w-full bg-gradient-to-r from-primary-500 to-primary-600 shadow-glow-primary"
                          leftIcon={<Sparkles size={16} />}
                          onClick={() => navigate(`/hiring-manager/interviews/${interviewId}/evaluate`)}
                        >
                          Submit Evaluation
                        </Button>
                      </div>
                    )}

                    {interview.status === 'Canceled' && (
                      <div className="space-y-4">
                        <div className="rounded-xl bg-danger-50 dark:bg-danger-950/20 border border-danger-200 dark:border-danger-500/30 p-3 text-danger-800 dark:text-danger-300 text-body-sm font-semibold flex items-center gap-2">
                          <X size={16} /> Canceled
                        </div>
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => updateStatus('Scheduled')}
                        >
                          Reschedule Slot
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default InterviewDetail;
