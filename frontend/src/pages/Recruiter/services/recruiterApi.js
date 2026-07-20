import api from '../../../api';

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
    const { data } = await api.get('/recruiter/dashboard');
    return {
      jobs: (data.jobs || []).map(normalizeJob),
      applications: (data.applications || []).map(normalizeApplication),
      interviews: data.interviews || [],
    };
  },

  async getJobs() {
    const { data } = await api.get('/recruiter/jobs');
    return (data || []).map(normalizeJob);
  },

  async createJob(payload) {
    const { data } = await api.post('/recruiter/jobs', payload);
    return normalizeJob(data);
  },

  async updateJob(jobId, payload) {
    await api.put(`/recruiter/jobs/${jobId}`, payload);
  },

  async getApplicationsByJob(jobId) {
    const { data } = await api.get(`/recruiter/jobs/${jobId}/applications`);
    return (data || []).map(normalizeApplication);
  },

  async getApplication(applicationId) {
    const { data } = await api.get(`/recruiter/applications/${applicationId}`);
    return normalizeApplication(data);
  },

  async getConversations() {
    const { data } = await api.get('/recruiter/messages/conversations');
    return (data || []).map((conversation) => ({
      ...conversation,
      applicationId: String(conversation.applicationId),
    }));
  },

  async analyzeCv(applicationId) {
    const { data } = await api.post(`/recruiter/ai/applications/${applicationId}/cv-analysis`);
    return data;
  },

  async matchCandidate(applicationId) {
    const { data } = await api.post(`/recruiter/ai/applications/${applicationId}/match`);
    return data;
  },

  async summarizeCandidate(applicationId) {
    const { data } = await api.post(`/recruiter/ai/applications/${applicationId}/summary`);
    return data;
  },

  async compareCandidates(jobId) {
    const { data } = await api.post(`/recruiter/ai/jobs/${jobId}/compare-candidates`);
    return data;
  },

  async screeningAssistance(jobId) {
    const { data } = await api.post(`/recruiter/ai/jobs/${jobId}/screening`);
    return data;
  },

  async generateInterviewQuestions(applicationId) {
    const { data } = await api.post(`/recruiter/ai/applications/${applicationId}/interview-questions`);
    return data;
  },

  async generateJobDescription(payload) {
    const { data } = await api.post('/recruiter/ai/job-description', payload);
    return data;
  },

  async draftMessage(payload) {
    const { data } = await api.post('/recruiter/ai/message-draft', payload);
    return data;
  },

  async summarizeAnalytics() {
    const { data } = await api.post('/recruiter/ai/analytics/summary');
    return data;
  },
};
