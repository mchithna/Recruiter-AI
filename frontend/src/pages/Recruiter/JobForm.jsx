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
  skills: [],
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

const hasJobDescriptionSeed = ({ title, description, requirements }) =>
  [title, description, requirements].some((value) => value.trim().length > 0);

const getAiErrorMessage = (error) => {
  const responseMessage = error?.response?.data?.message;
  if (responseMessage) return responseMessage;

  if (error?.response?.status === 401) {
    return 'Your session has expired. Please sign in again before using AI assistance.';
  }

  if (error?.response?.status === 403) {
    return 'You do not have permission to use recruiter AI assistance.';
  }

  if (error?.request && !error?.response) {
    return 'Could not reach the backend API. Please make sure the backend server is running and try again.';
  }

  return 'AI could not improve this job description right now.';
};

const getSubmitErrorMessage = (error) => {
  const responseMessage = error?.response?.data?.message;
  if (responseMessage) return responseMessage;

  if (error?.response?.status === 401) {
    return 'Your session has expired. Please sign in again before creating a job.';
  }

  if (error?.response?.status === 403) {
    return 'You do not have permission to create or update recruiter jobs.';
  }

  if (error?.request && !error?.response) {
    return 'Could not reach the backend API. Please make sure the backend server is running and try again.';
  }

  return 'Could not save this job right now. Please review the details and try again.';
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
  const [extractAiState, setExtractAiState] = useState({ loading: false, error: '' });
  const [submitState, setSubmitState] = useState({ loading: false, error: '' });
  const [skillsExtracted, setSkillsExtracted] = useState(false);
  const [newSkill, setNewSkill] = useState('');

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
      skills: existingJob.skills ?? [],
    });
    setSkillsExtracted((existingJob.skills ?? []).length > 0);
  }, [existingJob]);

  const handleChange = (field) => (event) => {
    if (submitState.error) {
      setSubmitState((current) => ({ ...current, error: '' }));
    }
    if (aiState.error) {
      setAiState((current) => ({ ...current, error: '' }));
    }
    if (extractAiState.error) {
      setExtractAiState((current) => ({ ...current, error: '' }));
    }

    setFormValues((currentValues) => ({
      ...currentValues,
      [field]: event.target.value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitState({ loading: true, error: '' });

    const payload = {
      ...formValues,
      applicationDeadline: toStoredDateTime(formValues.applicationDeadline),
    };

    try {
      if (isEditMode) {
        await updateJob(jobId, payload);
      } else {
        await addJob(payload);
      }

      navigate('/recruiter/jobs');
    } catch (error) {
      setSubmitState({ loading: false, error: getSubmitErrorMessage(error) });
    }
  };

  const handleImproveWithAi = async () => {
    if (!hasJobDescriptionSeed(formValues)) {
      setAiState({
        loading: false,
        error: 'Add a title, description, or requirements before using AI assistance.',
        disclaimer: '',
        notes: [],
      });
      return;
    }

    setAiState({ loading: true, error: '', disclaimer: '', notes: [] });
    try {
      const response = await recruiterApi.generateJobDescription({
        jobTitle: formValues.title.trim(),
        existingDescription: formValues.description.trim(),
        existingRequirements: formValues.requirements.trim(),
        employmentType: formValues.employmentType,
        workMode: formValues.workMode,
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
        error: getAiErrorMessage(error),
        disclaimer: '',
        notes: [],
      });
    }
  };

  const handleExtractSkills = async () => {
    if (!hasJobDescriptionSeed(formValues)) return;
    setExtractAiState({ loading: true, error: '' });
    try {
      const response = await recruiterApi.extractJobSkills({
        title: formValues.title.trim(),
        description: formValues.description.trim(),
        requirements: formValues.requirements.trim(),
      });
      setFormValues((current) => ({
        ...current,
        skills: response.result?.extractedSkills || [],
      }));
      setSkillsExtracted(true);
      setExtractAiState({ loading: false, error: '' });
    } catch (error) {
      setExtractAiState({
        loading: false,
        error: getAiErrorMessage(error),
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

            <div className="rounded-xl border border-secondary-200 p-5 dark:border-white/10">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
                <div>
                  <p className="text-body-md font-semibold text-secondary-900 dark:text-white">Required Skills</p>
                  <p className="mt-1 text-body-sm text-secondary-500">Extract skills from job description using AI, then edit as needed before saving.</p>
                </div>
                <Button
                  type="button"
                  variant="ai"
                  leftIcon={<Sparkles size={16} />}
                  onClick={handleExtractSkills}
                  disabled={extractAiState.loading || !hasJobDescriptionSeed(formValues)}
                >
                  {extractAiState.loading ? 'Extracting...' : 'Extract Skills'}
                </Button>
              </div>

              {extractAiState.error && (
                <p className="mb-4 text-body-sm text-danger-600 dark:text-danger-300">
                  {extractAiState.error}
                </p>
              )}

              {formValues.skills.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {formValues.skills.map((skill, i) => (
                    <span key={i} className="inline-flex items-center gap-1 rounded-full bg-primary-50 px-3 py-1.5 text-sm font-medium text-primary-700 border border-primary-100 dark:border-primary-900/30 dark:bg-primary-900/20 dark:text-primary-300">
                      {skill}
                      <button type="button" onClick={() => {
                        const newSkills = [...formValues.skills];
                        newSkills.splice(i, 1);
                        handleChange('skills')({ target: { value: newSkills } });
                        if (newSkills.length === 0) setSkillsExtracted(false);
                      }} className="ml-1 hover:text-danger-500 rounded-full w-5 h-5 flex items-center justify-center bg-primary-100 dark:bg-primary-900/50">×</button>
                    </span>
                  ))}
                </div>
              )}
              <div className="flex gap-2">
                <Input
                  placeholder="Add a skill manually..."
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      if (newSkill.trim() && !formValues.skills.includes(newSkill.trim())) {
                        handleChange('skills')({ target: { value: [...formValues.skills, newSkill.trim()] } });
                        setNewSkill('');
                        setSkillsExtracted(true);
                      }
                    }
                  }}
                />
                <Button type="button" variant="outline" onClick={() => {
                  if (newSkill.trim() && !formValues.skills.includes(newSkill.trim())) {
                    handleChange('skills')({ target: { value: [...formValues.skills, newSkill.trim()] } });
                    setNewSkill('');
                    setSkillsExtracted(true);
                  }
                }}>Add</Button>
              </div>
              {!skillsExtracted && (
                <p className="mt-3 text-body-sm font-semibold text-warning-600 dark:text-warning-400">
                  ⚠️ You must extract or add skills before saving the job.
                </p>
              )}
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-secondary-100 pt-5 sm:flex-row sm:justify-end">
              {submitState.error && (
                <p className="rounded-lg border border-danger-200 bg-danger-50 px-4 py-3 text-body-sm font-semibold text-danger-700 dark:border-danger-400/30 dark:bg-danger-500/10 dark:text-danger-200 sm:mr-auto">
                  {submitState.error}
                </p>
              )}
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/recruiter/jobs')}
                disabled={submitState.loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                leftIcon={<Save size={18} />}
                isLoading={submitState.loading}
                disabled={!skillsExtracted}
              >
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
