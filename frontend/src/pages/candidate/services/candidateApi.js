import api from '../../../api';

export const getMyProfile = async () => {
  const response = await api.get('/candidate/profile');
  return response.data;
};

export const updateMyProfile = async (updates) => {
  await api.put('/candidate/profile', updates);
};

export const addProfileSkill = async (skill) => {
  await api.post('/candidate/profile/skills', skill);
};

export const deleteProfileSkill = async (id) => {
  await api.delete(`/candidate/profile/skills/${id}`);
};

export const addProfileExperience = async (experience) => {
  await api.post('/candidate/profile/experience', experience);
};

export const updateProfileExperience = async (id, experience) => {
  await api.put(`/candidate/profile/experience/${id}`, experience);
};

export const deleteProfileExperience = async (id) => {
  await api.delete(`/candidate/profile/experience/${id}`);
};

export const addProfileEducation = async (education) => {
  await api.post('/candidate/profile/education', education);
};

export const updateProfileEducation = async (id, education) => {
  await api.put(`/candidate/profile/education/${id}`, education);
};

export const deleteProfileEducation = async (id) => {
  await api.delete(`/candidate/profile/education/${id}`);
};

export const getMyDocuments = async () => {
  const response = await api.get('/candidate/documents');
  return response.data;
};

export const uploadDocument = async (doc) => {
  const response = await api.post('/candidate/documents', doc);
  return response.data;
};

export const deleteDocument = async (id) => {
  await api.delete(`/candidate/documents/${id}`);
};

export const setPrimaryDocument = async (id) => {
  await api.put(`/candidate/documents/${id}/primary`);
};

export const getJobs = async (filters = {}) => {
  const response = await api.get('/candidate/jobs', { params: filters });
  return response.data;
};

export const getJob = async (id) => {
  const response = await api.get(`/candidate/jobs/${id}`);
  return response.data;
};

export const applyForJob = async (jobId) => {
  const response = await api.post(`/candidate/jobs/${jobId}/apply`);
  return response.data;
};

export const getMyApplications = async () => {
  const response = await api.get('/candidate/applications');
  return response.data;
};

export const getApplication = async (id) => {
  const response = await api.get(`/candidate/applications/${id}`);
  return response.data;
};

export const getStatusHistory = async (applicationId) => {
  const response = await api.get(`/candidate/applications/${applicationId}/status-history`);
  return response.data;
};

export const getMessages = async (applicationId) => {
  const response = await api.get(`/candidate/applications/${applicationId}/messages`);
  return response.data;
};

export const sendMessage = async (applicationId, body) => {
  const response = await api.post(`/candidate/applications/${applicationId}/messages`, { body });
  return response.data;
};

export const candidateAiApi = {
  analyzeProfile: async () => {
    const response = await api.post('/candidate/ai/profile-analysis');
    return response.data;
  },
  recommendJobs: async () => {
    const response = await api.post('/candidate/ai/job-recommendations');
    return response.data;
  },
  skillGap: async (jobId) => {
    const response = await api.post(`/candidate/ai/jobs/${jobId}/skill-gap`);
    return response.data;
  },
  applicationAssistance: async (jobId, notes = '') => {
    const response = await api.post('/candidate/ai/application-assistance', { jobId, notes });
    return response.data;
  }
};
