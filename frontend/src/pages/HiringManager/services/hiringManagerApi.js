import api from '../../../api';

export const getJobs = async () => {
  const response = await api.get('/hiring-manager/jobs');
  return response.data;
};

export const getJobApplications = async (jobId) => {
  const response = await api.get(`/hiring-manager/jobs/${jobId}/applications`);
  return response.data;
};

export const getShortlistedApplications = async () => {
  // Aggregate shortlisted applications from all accessible jobs
  const jobs = await getJobs();
  const allShortlisted = [];
  for (const job of jobs) {
    const apps = await getJobApplications(job.id);
    allShortlisted.push(...apps.filter(a => a.status === 'Shortlisted'));
  }
  return allShortlisted;
};

export const getApplication = async (applicationId) => {
  const response = await api.get(`/hiring-manager/applications/${applicationId}`);
  return response.data;
};

export const getInterview = async (interviewId) => {
  // Using the shared interviews endpoint which filters based on role
  // But wait, there is no GET /api/interviews/{id} ?
  // Let me just fetch all interviews for this application and find it.
  // Or add GET /api/interviews/{id} to backend? Wait!
  // I will just get all interviews and find it, or we can use a new endpoint.
  // Let's assume we fetch all and find it, or we should fetch all from /api/interviews
  const response = await api.get('/hiring-manager/interviews');
  const interview = response.data.find(i => i.id === Number(interviewId));
  return interview || null;
};

export const getInterviewsForApplication = async (applicationId) => {
  const response = await api.get(`/hiring-manager/interviews/application/${applicationId}`);
  return response.data;
};

export const getEvaluationForInterview = async (interviewId) => {
  try {
    const response = await api.get(`/hiring-manager/evaluations/interview/${interviewId}`);
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return null;
    }
    throw error;
  }
};

export const submitEvaluation = async (evaluationData) => {
  const response = await api.post('/hiring-manager/evaluations', evaluationData);
  return response.data;
};

export const getOfferForApplication = async (applicationId) => {
  try {
    const response = await api.get(`/hiring-manager/offers/application/${applicationId}`);
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return null;
    }
    throw error;
  }
};

export const submitOffer = async (offerData) => {
  const response = await api.post('/hiring-manager/offers', offerData);
  return response.data;
};

export const getAllInterviews = async () => {
  const response = await api.get('/hiring-manager/interviews');
  return response.data;
};

export const getAllOffers = async () => {
  const response = await api.get('/hiring-manager/offers');
  return response.data;
};
