const delay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms));

let myProfile = {
  firstName: 'Jane',
  lastName: 'Doe',
  email: 'jane.doe@example.com',
  summaryText: 'Experienced software engineer with a passion for frontend development and user experience.',
  portfolioUrl: 'https://janedoe.com',
  linkedinUrl: 'https://linkedin.com/in/janedoe',
  githubUrl: 'https://github.com/janedoe',
  locationCity: 'San Francisco',
  locationCountry: 'USA',
  yearsOfExperience: 5,
  education: [
    { id: '1', institutionName: 'Stanford University', degree: 'BS', fieldOfStudy: 'Computer Science', startDate: '2016', endDate: '2020', isCurrent: false, grade: '3.8 GPA' }
  ],
  experience: [
    { id: '1', companyName: 'TechCorp', jobTitle: 'Frontend Developer', location: 'San Francisco, CA', startDate: '2020', endDate: 'Present', isCurrent: true, description: 'Building modern web apps.' }
  ],
  skills: [
    { id: '1', name: 'React', proficiencyLevel: 'Expert', extractedByAi: true },
    { id: '2', name: 'Tailwind CSS', proficiencyLevel: 'Advanced', extractedByAi: true },
    { id: '3', name: 'Node.js', proficiencyLevel: 'Intermediate', extractedByAi: false },
  ]
};

let myDocuments = [
  { id: '1', documentType: 'Resume', fileName: 'Jane_Doe_Resume_2026.pdf', fileUrl: '#', fileSizeKb: 245, isPrimary: true, uploadedAt: '2026-07-01T10:00:00Z', resume_parse_status: 'Completed' },
  { id: '2', documentType: 'Portfolio', fileName: 'Jane_Doe_Portfolio.pdf', fileUrl: '#', fileSizeKb: 1024, isPrimary: false, uploadedAt: '2026-06-15T09:30:00Z' }
];

let jobs = [
  { id: 'j1', jobTitle: 'Senior Frontend Engineer', employmentType: 'Full-time', workMode: 'Remote', location: 'San Francisco, CA', description: 'Join our team to build scalable web applications...', requirements: '5+ years experience in React...', applicationDeadline: '2026-08-31', departmentName: 'Engineering' },
  { id: 'j2', jobTitle: 'UX Designer', employmentType: 'Contract', workMode: 'Hybrid', location: 'New York, NY', description: 'Design beautiful interfaces...', requirements: 'Figma expertise...', applicationDeadline: '2026-09-15', departmentName: 'Design' },
  { id: 'j3', jobTitle: 'Product Manager', employmentType: 'Full-time', workMode: 'On-site', location: 'Austin, TX', description: 'Lead product strategy...', requirements: '3+ years product management...', applicationDeadline: '2026-08-01', departmentName: 'Product' }
];

let recommendations = [
  { id: 'r1', jobId: 'j1', jobTitle: 'Senior Frontend Engineer', employmentType: 'Full-time', workMode: 'Remote', location: 'San Francisco, CA', matchScore: 95, recommendationReason: 'Your experience with React and 5 years in frontend aligns perfectly with this role.', isDismissed: false, generatedAt: '2026-07-16T12:00:00Z' }
];

let applications = [
  { id: 'a1', jobId: 'j2', jobTitle: 'UX Designer', appliedAt: '2026-07-10T14:30:00Z', status: 'In Review', aiMatchScore: 88 }
];

let statusHistory = {
  'a1': [
    { id: 'sh1', applicationId: 'a1', oldStatus: 'Applied', newStatus: 'Screening', changedByName: 'System', notes: 'Application received.', changedAt: '2026-07-10T14:30:00Z' },
    { id: 'sh2', applicationId: 'a1', oldStatus: 'Screening', newStatus: 'In Review', changedByName: 'Alice Smith', notes: 'Moved to hiring manager review.', changedAt: '2026-07-12T10:00:00Z' }
  ]
};

let messages = {
  'a1': [
    { id: 'm1', applicationId: 'a1', senderName: 'Alice Smith', body: 'Hi Jane, we loved your portfolio! Are you available for a quick chat next Tuesday?', sentAt: '2026-07-15T09:00:00Z', isMine: false }
  ]
};

export const getMyProfile = async () => {
  await delay();
  return { ...myProfile };
};

export const updateMyProfile = async (updates) => {
  await delay();
  myProfile = { ...myProfile, ...updates };
  return myProfile;
};

export const getMyDocuments = async () => {
  await delay();
  return [...myDocuments];
};

export const uploadDocument = async (doc) => {
  await delay();
  const newDoc = { ...doc, id: Math.random().toString(), uploadedAt: new Date().toISOString() };
  myDocuments.push(newDoc);
  return newDoc;
};

export const deleteDocument = async (id) => {
  await delay();
  myDocuments = myDocuments.filter(d => d.id !== id);
};

export const setPrimaryDocument = async (id) => {
  await delay();
  myDocuments = myDocuments.map(d => ({ ...d, isPrimary: d.id === id }));
};

export const getRecommendations = async () => {
  await delay();
  return recommendations.filter(r => !r.isDismissed);
};

export const dismissRecommendation = async (id) => {
  await delay();
  recommendations = recommendations.map(r => r.id === id ? { ...r, isDismissed: true } : r);
};

export const getJobs = async (filters = {}) => {
  await delay();
  let results = [...jobs];
  if (filters.employmentType) results = results.filter(j => j.employmentType === filters.employmentType);
  if (filters.workMode) results = results.filter(j => j.workMode === filters.workMode);
  if (filters.search) {
    const s = filters.search.toLowerCase();
    results = results.filter(j => j.jobTitle.toLowerCase().includes(s) || j.location.toLowerCase().includes(s));
  }
  return results;
};

export const getJob = async (id) => {
  await delay();
  return jobs.find(j => j.id === id);
};

export const getMyApplications = async () => {
  await delay();
  return [...applications];
};

export const getApplication = async (id) => {
  await delay();
  return applications.find(a => a.id === id);
};

export const applyForJob = async (jobId) => {
  await delay();
  const job = jobs.find(j => j.id === jobId);
  const newApp = {
    id: `a${Date.now()}`,
    jobId,
    jobTitle: job.jobTitle,
    appliedAt: new Date().toISOString(),
    status: 'Applied',
    aiMatchScore: 85
  };
  applications.push(newApp);
  statusHistory[newApp.id] = [{ id: `sh${Date.now()}`, applicationId: newApp.id, oldStatus: null, newStatus: 'Applied', changedByName: 'System', notes: 'Application submitted', changedAt: newApp.appliedAt }];
  messages[newApp.id] = [];
  return newApp;
};

export const getStatusHistory = async (applicationId) => {
  await delay();
  return statusHistory[applicationId] || [];
};

export const getMessages = async (applicationId) => {
  await delay();
  return messages[applicationId] || [];
};

export const sendMessage = async (applicationId, body) => {
  await delay();
  const newMessage = { id: `m${Date.now()}`, applicationId, senderName: 'Jane Doe', body, sentAt: new Date().toISOString(), isMine: true };
  if (!messages[applicationId]) messages[applicationId] = [];
  messages[applicationId].push(newMessage);
  return newMessage;
};
