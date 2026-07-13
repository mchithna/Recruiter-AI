import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, AlertTriangle, Sparkles, Clipboard, ShieldCheck } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Skeleton,
  Button,
  Input,
  Textarea,
  Switch,
  Badge,
} from '../../components/ui';
import { getInterview, getEvaluationForInterview, submitEvaluation } from './services/mockData';

export function Evaluate() {
  const { interviewId } = useParams();
  const navigate = useNavigate();
  const [interview, setInterview] = useState(null);
  const [evaluation, setEvaluation] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [overallScore, setOverallScore] = useState('');
  const [feedbackText, setFeedbackText] = useState('');
  const [strengthsText, setStrengthsText] = useState('');
  const [concernsText, setConcernsText] = useState('');
  const [hireRecommendation, setHireRecommendation] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    let isActive = true;

    async function loadEvaluationContext() {
      try {
        setIsLoading(true);
        const intData = await getInterview(interviewId);
        const evalData = await getEvaluationForInterview(interviewId);

        if (isActive) {
          setInterview(intData);
          if (evalData) {
            setEvaluation(evalData);
            // Pre-fill form state in case we show read-only
            setOverallScore(evalData.overallScore);
            setFeedbackText(evalData.feedbackText);
            setStrengthsText(evalData.strengthsText);
            setConcernsText(evalData.concernsText);
            setHireRecommendation(evalData.hireRecommendation);
          }
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Failed to load evaluation context', error);
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    loadEvaluationContext();

    return () => {
      isActive = false;
    };
  }, [interviewId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    const scoreNum = Number(overallScore);
    if (!overallScore || isNaN(scoreNum) || scoreNum < 1 || scoreNum > 100) {
      setFormError('Please enter a valid overall score between 1 and 100.');
      return;
    }

    if (!feedbackText.trim()) {
      setFormError('Please provide detailed feedback text.');
      return;
    }

    try {
      setIsSubmitting(true);
      await submitEvaluation({
        interviewId,
        overallScore: scoreNum,
        feedbackText,
        strengthsText,
        concernsText,
        hireRecommendation,
      });
      setIsSubmitting(false);
      navigate(`/hiring-manager/interviews/${interviewId}`);
    } catch (err) {
      console.error('Failed to submit evaluation', err);
      setFormError('An error occurred while saving the evaluation. Please try again.');
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-slide-up">
        <Skeleton className="h-16 w-full rounded-2xl" />
        <Skeleton className="h-96 w-full rounded-2xl" />
      </div>
    );
  }

  if (!interview) {
    return (
      <div className="text-center py-12 animate-slide-up">
        <h2 className="text-h2 text-secondary-900 dark:text-white">Interview not found</h2>
        <Button variant="outline" className="mt-4" onClick={() => navigate('/hiring-manager/queue')}>
          Back to Queue
        </Button>
      </div>
    );
  }

  // Read-only View if evaluation already exists
  if (evaluation) {
    return (
      <div className="relative z-10 space-y-6 animate-slide-up">
        <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              leftIcon={<ArrowLeft size={16} />}
              onClick={() => navigate(`/hiring-manager/interviews/${interviewId}`)}
            >
              Back to Interview
            </Button>
            <div className="h-6 w-px bg-secondary-200 dark:bg-white/10 hidden sm:block" />
            <div>
              <span className="text-caption font-semibold uppercase tracking-wide text-secondary-400">
                Evaluation Submitted
              </span>
              <h1 className="text-h2 text-secondary-900 dark:text-white">
                Feedback: {interview.candidateName}
              </h1>
            </div>
          </div>
          {evaluation.hireRecommendation ? (
            <Badge variant="success" size="md" icon={<ShieldCheck size={14} />}>
              Recommended for Hire
            </Badge>
          ) : (
            <Badge variant="secondary" size="md">
              No Hire Recommendation
            </Badge>
          )}
        </section>

        {/* Read-Only Evaluation Summary Card */}
        <Card className="overflow-hidden border-none shadow-glass">
          <div className="h-1.5 w-full bg-gradient-to-r from-success-500 via-primary-500 to-indigo-500" />
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Evaluation Record</CardTitle>
            <div className="flex flex-col items-center">
              <span className="text-caption font-semibold uppercase text-secondary-400">Overall Rating</span>
              <span className="text-h1 font-extrabold text-primary-600 dark:text-primary-400">
                {evaluation.overallScore}/100
              </span>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Strengths & Concerns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="rounded-2xl bg-success-50/50 dark:bg-success-950/10 border border-success-200/50 dark:border-success-500/20 p-5">
                <h4 className="text-body-md font-bold text-success-800 dark:text-success-400 mb-2 flex items-center gap-1.5">
                  <Check size={16} /> Key Strengths
                </h4>
                <p className="text-body-sm text-secondary-700 dark:text-secondary-300 leading-relaxed whitespace-pre-wrap">
                  {evaluation.strengthsText || 'No strengths noted.'}
                </p>
              </div>

              <div className="rounded-2xl bg-danger-50/30 dark:bg-danger-950/10 border border-danger-200/30 dark:border-danger-500/20 p-5">
                <h4 className="text-body-md font-bold text-danger-800 dark:text-danger-400 mb-2 flex items-center gap-1.5">
                  <AlertTriangle size={16} /> Key Concerns / Risks
                </h4>
                <p className="text-body-sm text-secondary-700 dark:text-secondary-300 leading-relaxed whitespace-pre-wrap">
                  {evaluation.concernsText || 'No major concerns noted.'}
                </p>
              </div>
            </div>

            {/* Detailed Feedback */}
            <div className="rounded-2xl border border-secondary-100 dark:border-white/5 p-5">
              <h4 className="text-body-md font-bold text-secondary-800 dark:text-white mb-2 flex items-center gap-1.5">
                <Clipboard size={16} className="text-secondary-400" /> Detailed Interview Notes
              </h4>
              <p className="text-body-sm text-secondary-600 dark:text-secondary-300 leading-relaxed whitespace-pre-wrap">
                {evaluation.feedbackText}
              </p>
            </div>

            {/* Sub-workflow link */}
            {evaluation.hireRecommendation && (
              <div className="flex justify-end pt-4 border-t border-secondary-100 dark:border-white/5">
                <Button
                  variant="primary"
                  className="bg-gradient-to-r from-indigo-500 to-primary-600 shadow-glow-primary"
                  onClick={() => navigate(`/hiring-manager/applications/${interview.applicationId}/offer`)}
                >
                  Proceed to Offer Details
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Evaluation Form View
  return (
    <div className="relative z-10 space-y-6 animate-slide-up">
      {/* Header */}
      <section className="flex items-center gap-3">
        <Button
          type="button"
          variant="outline"
          size="sm"
          leftIcon={<ArrowLeft size={16} />}
          onClick={() => navigate(`/hiring-manager/interviews/${interviewId}`)}
        >
          Cancel
        </Button>
        <div className="h-6 w-px bg-secondary-200 dark:bg-white/10" />
        <div>
          <span className="text-caption font-semibold uppercase tracking-wide text-secondary-400">
            Submit Assessment
          </span>
          <h1 className="text-h2 text-secondary-900 dark:text-white">
            Evaluate: {interview.candidateName}
          </h1>
        </div>
      </section>

      {/* Form Card */}
      <Card className="overflow-hidden border-none shadow-glass">
        {/* Top gradient accent */}
        <div className="h-1.5 w-full bg-gradient-to-r from-primary-500 via-indigo-500 to-ai-500" />
        <CardHeader>
          <CardTitle>Interview Assessment Form</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {formError && (
              <div className="rounded-xl bg-danger-50 dark:bg-danger-950/20 border border-danger-200 dark:border-danger-500/30 p-4 text-danger-800 dark:text-danger-300 text-body-sm font-semibold flex items-center gap-2">
                <AlertTriangle size={16} />
                {formError}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
              {/* Overall Score input */}
              <div className="md:col-span-1">
                <Input
                  label="Overall Rating Score (1-100)"
                  type="number"
                  placeholder="e.g. 85"
                  min="1"
                  max="100"
                  required
                  value={overallScore}
                  onChange={(e) => setOverallScore(e.target.value)}
                  helperText="Assign a general numerical value based on performance metrics."
                />
              </div>

              {/* Recommend for Hire Switch */}
              <div className="md:col-span-2 md:pt-7 flex items-center">
                <Switch
                  label="Recommend Candidate for Hire"
                  checked={hireRecommendation}
                  onChange={(e) => setHireRecommendation(e.target.checked)}
                />
              </div>
            </div>

            {/* Strengths & Concerns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Textarea
                label="Candidate Strengths"
                placeholder="What did they excel at? Reusable design systems, deep React hooks knowledge, etc."
                value={strengthsText}
                onChange={(e) => setStrengthsText(e.target.value)}
                autoResize
                helperText="Focus on matching technical proficiencies and cultural alignment."
              />

              <Textarea
                label="Candidate Concerns / Risks"
                placeholder="Any gaps or areas of caution? Less experience with automated testing, etc."
                value={concernsText}
                onChange={(e) => setConcernsText(e.target.value)}
                autoResize
                helperText="Note any flags to address in follow-up loops or onboarding."
              />
            </div>

            {/* Detailed Feedback Textarea */}
            <Textarea
              label="Detailed Feedback & Notes"
              placeholder="Provide a comprehensive summary of the interview experience and code review notes..."
              required
              rows={6}
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              autoResize
              helperText="This feedback will assist the hiring committee in final decisions."
            />

            {/* Submission Action */}
            <div className="flex justify-end gap-3 pt-4 border-t border-secondary-100 dark:border-white/5">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(`/hiring-manager/interviews/${interviewId}`)}
              >
                Discard
              </Button>
              <Button
                type="submit"
                variant="primary"
                isLoading={isSubmitting}
                leftIcon={<Check size={16} />}
              >
                Submit Evaluation
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default Evaluate;
