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
  jobStatus: application.jobStatus || '',
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

const normalizeInterview = (interview) => ({
  ...interview,
  id: String(interview.id),
  applicationId: String(interview.applicationId),
  interviewerId: String(interview.interviewerId),
  durationMinutes: Number(interview.durationMinutes ?? 0),
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

  async updateJobStatus(jobId, payload) {
    await api.put(`/recruiter/jobs/${jobId}/status`, payload);
  },

  async getApplicationsByJob(jobId) {
    const { data } = await api.get(`/recruiter/jobs/${jobId}/applications`);
    return (data || []).map(normalizeApplication);
  },

  async getApplication(applicationId) {
    const { data } = await api.get(`/recruiter/applications/${applicationId}`);
    return normalizeApplication(data);
  },

  async updateApplicationStatus(applicationId, payload) {
    const { data } = await api.put(`/recruiter/applications/${applicationId}/status`, payload);
    return data;
  },

  async getConversations() {
    const { data } = await api.get('/recruiter/messages/conversations');
    return (data || []).map((conversation) => ({
      ...conversation,
      applicationId: String(conversation.applicationId),
    }));
  },

  async getInterviews() {
    const { data } = await api.get('/interviews');
    return (data || []).map(normalizeInterview);
  },

  async getInterviewsByApplication(applicationId) {
    const { data } = await api.get(`/interviews/application/${applicationId}`);
    return (data || []).map(normalizeInterview);
  },

  async createInterview(payload) {
    const { data } = await api.post('/interviews', payload);
    return normalizeInterview(data);
  },

  async updateInterview(interviewId, payload) {
    const { data } = await api.put(`/interviews/${interviewId}`, payload);
    return data;
  },

  async updateInterviewStatus(interviewId, payload) {
    const { data } = await api.put(`/interviews/${interviewId}/status`, payload);
    return data;
  },

  async getHiringManagers() {
    const { data } = await api.get('/staff/hiring-managers');
    return (data || []).map((manager) => ({
      ...manager,
      id: String(manager.id),
    }));
  },

  async getApplicationMessages(applicationId) {
    const { data } = await api.get(`/recruiter/applications/${applicationId}/messages`);
    return (data || []).map((message) => ({
      ...message,
      id: String(message.id),
      sender: message.senderName,
    }));
  },

  async sendApplicationMessage(applicationId, payload) {
    const { data } = await api.post(`/recruiter/applications/${applicationId}/messages`, payload);
    return {
      ...data,
      id: String(data.id),
      sender: data.senderName,
    };
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

  async extractJobSkills(payload) {
    try {
      const { data } = await api.post('/recruiter/ai/extract-job-skills', payload);
      return data;
    } catch (error) {
      console.error('Server Error during skill extraction:', error.response?.data || error.message);
      throw error;
    }
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
