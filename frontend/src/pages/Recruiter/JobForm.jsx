import { ArrowLeft, Save, Sparkles } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  DateTimeInput,
  Input,
  Select,
  Skeleton,
  Textarea,
} from '../../components/ui';
import { useRecruiterJobs } from './useRecruiterJobs';
import { recruiterApi } from './services/recruiterApi';

const employmentTypeOptions = [
  { value: 'Full-time', label: 'Full-time' },
  { value: 'Part-time', label: 'Part-time' },
  { value: 'Contract', label: 'Contract' },
  { value: 'Internship', label: 'Internship' },
];

const workModeOptions = [
  { value: 'Remote', label: 'Remote' },
  { value: 'Hybrid', label: 'Hybrid' },
  { value: 'On-site', label: 'On-site' },
];

const emptyForm = {
  title: '',
  description: '',
  requirements: '',
  employmentType: 'Full-time',
  workMode: 'Hybrid',
  location: '',
  applicationDeadline: '',
};

const toDateTimeInputValue = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  return date.toISOString().slice(0, 16);
};

const toStoredDateTime = (value) => {
  if (!value) return '';
  return new Date(value).toISOString();
};

export function JobForm() {
  const navigate = useNavigate();
  const { jobId } = useParams();
  const { addJob, getJobById, isLoading, updateJob } = useRecruiterJobs();
  const isEditMode = Boolean(jobId);
  const existingJob = useMemo(
    () => (jobId ? getJobById(jobId) : null),
    [getJobById, jobId]
  );
  const [formValues, setFormValues] = useState(emptyForm);
  const [aiState, setAiState] = useState({ loading: false, error: '', disclaimer: '', notes: [] });

  useEffect(() => {
    if (!existingJob) return;

    setFormValues({
      title: existingJob.title ?? '',
      description: existingJob.description ?? '',
      requirements: existingJob.requirements ?? '',
      employmentType: existingJob.employmentType ?? 'Full-time',
      workMode: existingJob.workMode ?? 'Hybrid',
      location: existingJob.location ?? '',
      applicationDeadline: toDateTimeInputValue(existingJob.applicationDeadline),
    });
  }, [existingJob]);

  const handleChange = (field) => (event) => {
    setFormValues((currentValues) => ({
      ...currentValues,
      [field]: event.target.value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const payload = {
      ...formValues,
      applicationDeadline: toStoredDateTime(formValues.applicationDeadline),
    };

    if (isEditMode) {
      await updateJob(jobId, payload);
    } else {
      await addJob(payload);
    }

    navigate('/recruiter/jobs');
  };

  const handleImproveWithAi = async () => {
    setAiState({ loading: true, error: '', disclaimer: '', notes: [] });
    try {
      const response = await recruiterApi.generateJobDescription({
        jobTitle: formValues.title,
        existingDescription: formValues.description,
        existingRequirements: formValues.requirements,
        employmentType: formValues.employmentType,
        location: formValues.location,
      });
      const result = response.result;
      setFormValues((current) => ({
        ...current,
        title: result?.title || current.title,
        description: result?.description || current.description,
        requirements: result?.requirements || current.requirements,
      }));
      setAiState({
        loading: false,
        error: '',
        disclaimer: response.disclaimer || '',
        notes: result?.reviewNotes || [],
      });
    } catch (error) {
      setAiState({
        loading: false,
        error: error?.response?.data?.message || 'AI could not improve this job description right now.',
        disclaimer: '',
        notes: [],
      });
    }
  };

  if (isEditMode && isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton height="2.5rem" className="max-w-sm" />
        <Skeleton height="24rem" />
      </div>
    );
  }

  if (isEditMode && !existingJob) {
    return (
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Job not found</CardTitle>
            <CardDescription>
              This job is not available in the current mock dataset.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <Button
            type="button"
            variant="outline"
            leftIcon={<ArrowLeft size={18} />}
            onClick={() => navigate('/recruiter/jobs')}
          >
            Back to Jobs
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-h2 text-secondary-900">
            {isEditMode ? 'Edit Job' : 'New Job'}
          </h1>
          <p className="mt-1 text-body-sm text-secondary-500">
            {isEditMode
              ? 'Update the role details shown to candidates.'
              : 'Create a draft role for your hiring pipeline.'}
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          leftIcon={<ArrowLeft size={18} />}
          onClick={() => navigate('/recruiter/jobs')}
          className="w-full sm:w-auto"
        >
          Back to Jobs
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Role Details</CardTitle>
            <CardDescription>Complete the core job posting fields.</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form className="space-y-5" onSubmit={handleSubmit}>
            <Input
              label="Title"
              value={formValues.title}
              onChange={handleChange('title')}
              required
            />

            <Textarea
              label="Description"
              value={formValues.description}
              onChange={handleChange('description')}
              autoResize
              required
            />

            <Textarea
              label="Requirements"
              value={formValues.requirements}
              onChange={handleChange('requirements')}
              autoResize
              required
            />

            <div className="rounded-xl border border-ai-100 bg-ai-50/70 p-4 dark:border-ai-400/20 dark:bg-ai-500/10">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-body-sm font-semibold text-ai-800 dark:text-ai-200">
                    AI job description assistance
                  </p>
                  <p className="mt-1 text-body-sm text-secondary-600 dark:text-secondary-300">
                    Generate a reviewed draft from the current editable fields.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ai"
                  leftIcon={<Sparkles size={16} />}
                  onClick={handleImproveWithAi}
                  disabled={aiState.loading}
                >
                  {aiState.loading ? 'Generating...' : 'Improve with AI'}
                </Button>
              </div>
              {aiState.error && (
                <p className="mt-3 text-body-sm text-danger-600 dark:text-danger-300">{aiState.error}</p>
              )}
              {aiState.disclaimer && (
                <p className="mt-3 text-caption font-semibold text-secondary-500 dark:text-secondary-300">
                  {aiState.disclaimer}
                </p>
              )}
              {aiState.notes.length > 0 && (
                <ul className="mt-3 list-disc space-y-1 pl-5 text-body-sm text-secondary-600 dark:text-secondary-300">
                  {aiState.notes.map((note) => <li key={note}>{note}</li>)}
                </ul>
              )}
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <Select
                label="Employment Type"
                options={employmentTypeOptions}
                value={formValues.employmentType}
                onChange={handleChange('employmentType')}
                required
              />
              <Select
                label="Work Mode"
                options={workModeOptions}
                value={formValues.workMode}
                onChange={handleChange('workMode')}
                required
              />
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <Input
                label="Location"
                value={formValues.location}
                onChange={handleChange('location')}
                required
              />
              <DateTimeInput
                label="Application Deadline"
                value={formValues.applicationDeadline}
                onChange={handleChange('applicationDeadline')}
                required
              />
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-secondary-100 pt-5 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/recruiter/jobs')}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" leftIcon={<Save size={18} />}>
                {isEditMode ? 'Save Changes' : 'Create Job'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default JobForm;
