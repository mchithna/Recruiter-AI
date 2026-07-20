import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, AlertTriangle, Send, DollarSign, Calendar, FileText } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Skeleton,
  Button,
  Input,
  Textarea,
  Select,
  Badge,
} from '../../components/ui';
import DateTimeInput from '../../components/ui/DateTimeInput';
import { getApplication, getOfferForApplication, submitOffer } from './services/mockData';

const formatDateTime = (dateTimeString) => {
  if (!dateTimeString) return '';
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(dateTimeString));
};

const currencyOptions = [
  { value: 'USD', label: 'USD ($)' },
  { value: 'EUR', label: 'EUR (€)' },
  { value: 'GBP', label: 'GBP (£)' },
  { value: 'LKR', label: 'LKR (Rs)' },
  { value: 'CAD', label: 'CAD (C$)' },
  { value: 'AUD', label: 'AUD (A$)' },
];

export function Offer() {
  const { applicationId } = useParams();
  const navigate = useNavigate();
  const [application, setApplication] = useState(null);
  const [offer, setOffer] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [justSubmitted, setJustSubmitted] = useState(false);

  // Form states
  const [offeredSalary, setOfferedSalary] = useState('');
  const [salaryCurrency, setSalaryCurrency] = useState('USD');
  const [proposedStartDate, setProposedStartDate] = useState('');
  const [offerExpiryDate, setOfferExpiryDate] = useState('');
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState('');

  useEffect(() => {
    let isActive = true;

    async function loadOfferContext() {
      try {
        setIsLoading(true);
        const appData = await getApplication(applicationId);
        const offerData = await getOfferForApplication(applicationId);

        if (isActive) {
          setApplication(appData);
          if (offerData) {
            setOffer(offerData);
          }
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Failed to load offer context', error);
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    loadOfferContext();

    return () => {
      isActive = false;
    };
  }, [applicationId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    const salaryNum = Number(offeredSalary);
    if (!offeredSalary || isNaN(salaryNum) || salaryNum <= 0) {
      setFormError('Please enter a valid salary amount.');
      return;
    }

    if (!proposedStartDate) {
      setFormError('Please specify a proposed start date.');
      return;
    }

    if (!offerExpiryDate) {
      setFormError('Please specify the offer expiry date.');
      return;
    }

    const start = new Date(proposedStartDate);
    const expiry = new Date(offerExpiryDate);
    if (expiry <= new Date()) {
      setFormError('Offer expiry date must be in the future.');
      return;
    }

    if (start <= expiry) {
      setFormError('Proposed start date must be after the offer expiry date.');
      return;
    }

    try {
      setIsSubmitting(true);
      const newOffer = await submitOffer({
        applicationId,
        candidateName: application.candidateName,
        offeredSalary: salaryNum,
        salaryCurrency,
        proposedStartDate,
        offerExpiryDate,
        notes,
      });

      if (newOffer) {
        setOffer(newOffer);
        setJustSubmitted(true);
      }
      setIsSubmitting(false);
    } catch (err) {
      console.error('Failed to submit job offer', err);
      setFormError('An error occurred while creating the offer. Please try again.');
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

  if (!application) {
    return (
      <div className="text-center py-12 animate-slide-up">
        <h2 className="text-h2 text-secondary-900 dark:text-white">Application not found</h2>
        <Button variant="outline" className="mt-4" onClick={() => navigate('/hiring-manager/queue')}>
          Back to Queue
        </Button>
      </div>
    );
  }

  // Submitted / Read-only state
  if (offer) {
    return (
      <div className="relative z-10 space-y-6 animate-slide-up">
        {/* Header */}
        <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              leftIcon={<ArrowLeft size={16} />}
              onClick={() => navigate(`/hiring-manager/applications/${applicationId}`)}
            >
              Back to Application
            </Button>
            <div className="h-6 w-px bg-secondary-200 dark:bg-white/10 hidden sm:block" />
            <div>
              <span className="text-caption font-semibold uppercase tracking-wide text-secondary-400">
                Offer Status Summary
              </span>
              <h1 className="text-h2 text-secondary-900 dark:text-white">
                Offer Details: {application.candidateName}
              </h1>
            </div>
          </div>
          <Badge variant="warning" size="md" icon={<Send size={14} />}>
            Offer Pending Recruiter Dispatch
          </Badge>
        </section>

        {/* Confirmation Success Banner (only visible immediately on submit) */}
        {(justSubmitted || offer.status === 'Pending') && (
          <Card className="border-none bg-gradient-to-br from-primary-500/10 via-primary-500/5 to-transparent shadow-glass">
            <CardContent className="p-6 flex items-start gap-4">
              <div className="rounded-2xl bg-primary-500 text-white p-3 shadow-glow-primary shrink-0">
                <Send size={24} />
              </div>
              <div className="space-y-1">
                <h4 className="text-body-lg font-bold text-secondary-900 dark:text-white">
                  Offer Initiated and Handed Off
                </h4>
                <p className="text-body-sm text-secondary-600 dark:text-secondary-300 leading-relaxed">
                  The job offer has been successfully drafted and handed off. A Recruiter from the Talent Acquisition team has been notified and will manage sending, tracking, and final negotiations with {application.candidateName}.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Read-Only Offer card */}
        <Card className="overflow-hidden border-none shadow-glass">
          <div className="h-1.5 w-full bg-gradient-to-r from-primary-500 via-primary-500 to-ai-500" />
          <CardHeader>
            <CardTitle>Details of Proposed Package</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Package Salary */}
              <div className="rounded-2xl bg-secondary-50 dark:bg-white/5 border border-secondary-100 dark:border-white/5 p-5">
                <h4 className="text-body-sm font-bold text-secondary-500 dark:text-secondary-400 mb-1 flex items-center gap-1.5">
                  <DollarSign size={16} className="text-primary-500" /> Offered Salary
                </h4>
                <p className="text-h2 font-extrabold text-secondary-900 dark:text-white">
                  {offer.salaryCurrency} {offer.offeredSalary.toLocaleString()}
                </p>
                <span className="text-caption text-secondary-400">per annum</span>
              </div>

              {/* Start Date */}
              <div className="rounded-2xl bg-secondary-50 dark:bg-white/5 border border-secondary-100 dark:border-white/5 p-5">
                <h4 className="text-body-sm font-bold text-secondary-500 dark:text-secondary-400 mb-1 flex items-center gap-1.5">
                  <Calendar size={16} className="text-primary-500" /> Start Date
                </h4>
                <p className="text-body-lg font-bold text-secondary-900 dark:text-white mt-1">
                  {formatDateTime(offer.proposedStartDate)}
                </p>
              </div>

              {/* Expiry Date */}
              <div className="rounded-2xl bg-secondary-50 dark:bg-white/5 border border-secondary-100 dark:border-white/5 p-5">
                <h4 className="text-body-sm font-bold text-secondary-500 dark:text-secondary-400 mb-1 flex items-center gap-1.5">
                  <AlertTriangle size={16} className="text-danger-500" /> Offer Expiration
                </h4>
                <p className="text-body-lg font-bold text-secondary-900 dark:text-white mt-1">
                  {formatDateTime(offer.offerExpiryDate)}
                </p>
              </div>
            </div>

            {/* Offer Notes */}
            {offer.notes && (
              <div className="rounded-2xl border border-secondary-100 dark:border-white/5 p-5">
                <h4 className="text-body-sm font-bold text-secondary-800 dark:text-white flex items-center gap-2 mb-2">
                  <FileText size={16} className="text-secondary-400" /> Notes & Custom Clauses
                </h4>
                <p className="text-body-md text-secondary-600 dark:text-secondary-300 leading-relaxed whitespace-pre-wrap">
                  {offer.notes}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Offer Creation Form View
  return (
    <div className="relative z-10 space-y-6 animate-slide-up">
      {/* Header */}
      <section className="flex items-center gap-3">
        <Button
          type="button"
          variant="outline"
          size="sm"
          leftIcon={<ArrowLeft size={16} />}
          onClick={() => navigate(`/hiring-manager/applications/${applicationId}`)}
        >
          Cancel
        </Button>
        <div className="h-6 w-px bg-secondary-200 dark:bg-white/10" />
        <div>
          <span className="text-caption font-semibold uppercase tracking-wide text-secondary-400">
            Offer Generation
          </span>
          <h1 className="text-h2 text-secondary-900 dark:text-white">
            Initiate Offer: {application.candidateName}
          </h1>
        </div>
      </section>

      {/* Form Card */}
      <Card className="overflow-hidden border-none shadow-glass">
        {/* Top gradient accent */}
        <div className="h-1.5 w-full bg-gradient-to-r from-primary-500 via-primary-500 to-ai-500" />
        <CardHeader>
          <CardTitle>Draft Package Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {formError && (
              <div className="rounded-xl bg-danger-50 dark:bg-danger-950/20 border border-danger-200 dark:border-danger-500/30 p-4 text-danger-800 dark:text-danger-300 text-body-sm font-semibold flex items-center gap-2">
                <AlertTriangle size={16} />
                {formError}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Offered Salary */}
              <div className="md:col-span-2">
                <Input
                  label="Offered Salary Amount (Annual)"
                  type="number"
                  placeholder="e.g. 120000"
                  required
                  value={offeredSalary}
                  onChange={(e) => setOfferedSalary(e.target.value)}
                  leftIcon={<DollarSign size={16} />}
                  helperText="Define the candidate annual base package."
                />
              </div>

              {/* Currency Select */}
              <div className="md:col-span-1">
                <Select
                  label="Salary Currency"
                  value={salaryCurrency}
                  onChange={(e) => setSalaryCurrency(e.target.value)}
                  options={currencyOptions}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Proposed Expiry Date */}
              <DateTimeInput
                label="Offer Expiry Date"
                required
                value={offerExpiryDate}
                onChange={(e) => setOfferExpiryDate(e.target.value)}
                min={new Date().toISOString().slice(0, 16)}
                helperText="Proposed deadline for the candidate to accept or decline."
              />

              {/* Proposed Start Date */}
              <DateTimeInput
                label="Proposed Start Date"
                required
                value={proposedStartDate}
                onChange={(e) => setProposedStartDate(e.target.value)}
                min={new Date().toISOString().slice(0, 16)}
                helperText="Projected candidate onboarding date (must be after expiry)."
              />
            </div>

            {/* Offer Notes */}
            <Textarea
              label="Additional Notes / Allowances / Sign-on Clauses"
              placeholder="Detail any bonuses, sign-on terms, hybrid structure details, or health benefit options..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              autoResize
              rows={4}
              helperText="Internal guidelines or clauses that the Recruiter should append when sending the final PDF contract."
            />

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-secondary-100 dark:border-white/5">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(`/hiring-manager/applications/${applicationId}`)}
              >
                Discard
              </Button>
              <Button
                type="submit"
                variant="primary"
                isLoading={isSubmitting}
                leftIcon={<Check size={16} />}
              >
                Initiate Handoff
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default Offer;
