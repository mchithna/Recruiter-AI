import * as mockData from './mockData';

const normalizeJob = (job) => ({
  ...job,
  id: String(job.id),
  applicationDeadline: job.applicationDeadline || '',
  aiMatchScore: Number(job.aiMatchScore ?? 0),
});

const normalizeApplication = (application) => ({
  ...application,
  id: String(application.id),
  jobId: String(application.jobId),
  aiMatchScore: Number(application.aiMatchScore ?? 0),
  screeningResult: application.screeningResult
    ? {
        ...application.screeningResult,
        overallScore: Number(application.screeningResult.overallScore ?? 0),
        skillsMatchScore: Number(application.screeningResult.skillsMatchScore ?? 0),
        experienceMatchScore: Number(application.screeningResult.experienceMatchScore ?? 0),
        educationMatchScore: Number(application.screeningResult.educationMatchScore ?? 0),
      }
    : null,
});

export const recruiterApi = {
  async getDashboard() {
    const jobs = await mockData.getJobs();
    const applications = await mockData.getAllApplications();
    const interviews = await mockData.getAllInterviews();
    return {
      jobs: (jobs || []).map(normalizeJob),
      applications: (applications || []).map(normalizeApplication),
      interviews: interviews || [],
    };
  },

  async getJobs() {
    const jobs = await mockData.getJobs();
    return (jobs || []).map(normalizeJob);
  },

  async createJob(payload) {
    const jobs = await mockData.getJobs();
    const nextId = jobs.length + 1;
    const newJob = {
      id: `job-00${nextId}`,
      createdAt: new Date().toISOString(),
      status: 'Open',
      departmentName: 'Product Engineering',
      ...payload,
    };
    return normalizeJob(newJob);
  },

  async updateJob(jobId, payload) {
    return Promise.resolve();
  },

  async getApplicationsByJob(jobId) {
    const applications = await mockData.getApplicationsByJob(jobId);
    return (applications || []).map(normalizeApplication);
  },

  async getApplication(applicationId) {
    const application = await mockData.getApplication(applicationId);
    return normalizeApplication(application);
  },

  async getConversations() {
    const conversations = await mockData.getAllConversations();
    return (conversations || []).map((conversation) => ({
      ...conversation,
      applicationId: String(conversation.applicationId),
    }));
  },

  async analyzeCv(applicationId) {
    const screening = await mockData.getAiScreeningResult(applicationId);
    return screening;
  },

  async matchCandidate(applicationId) {
    const screening = await mockData.getAiScreeningResult(applicationId);
    return screening;
  },

  async summarizeCandidate(applicationId) {
    const screening = await mockData.getAiScreeningResult(applicationId);
    return screening;
  },

  async compareCandidates(jobId) {
    return {
      success: true,
      comparison: 'Candidates evaluated successfully using mock AI.'
    };
  },

  async screeningAssistance(jobId) {
    return {
      success: true,
      screeningFeedback: 'Screening processed via mock AI pipeline.'
    };
  },

  async generateInterviewQuestions(applicationId) {
    return {
      questions: [
        'How do you manage states in a complex React tree?',
        'Can you describe your experience optimizing accessibility in design systems?'
      ]
    };
  },

  async generateJobDescription(payload) {
    return {
      result: {
        title: payload.jobTitle || 'Enhanced Role',
        description: `${payload.existingDescription || 'Role description'} - improved with AI.`,
        requirements: `${payload.existingRequirements || 'Core requirements'} - refined by AI.`
      },
      disclaimer: 'AI disclaimer: Mock output for review.'
    };
  },

  async draftMessage(payload) {
    return {
      draft: `Hi, thank you for your interest. We'd love to invite you to our next screening stage.`
    };
  },

  async summarizeAnalytics() {
    return {
      summary: 'Recruiting analytics processed successfully.'
    };
  },
};
