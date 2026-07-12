const delay = (value, ms = 350) =>
  new Promise((resolve) => {
    setTimeout(() => resolve(value), ms);
  });

const jobs = [
  {
    id: 'job-001',
    title: 'Senior Frontend Engineer',
    description: 'Build polished recruiter and candidate workflows for a high-growth hiring platform.',
    requirements: 'React, TypeScript, accessibility, design systems, testing',
    employmentType: 'Full-time',
    workMode: 'Hybrid',
    location: 'Colombo, Sri Lanka',
    applicationDeadline: '2026-08-15T23:59:00Z',
    status: 'Open',
    departmentName: 'Product Engineering',
    createdAt: '2026-06-18T09:15:00Z',
  },
  {
    id: 'job-002',
    title: 'AI Talent Sourcer',
    description: 'Partner with recruiters to tune AI-assisted sourcing and shortlist high-intent candidates.',
    requirements: 'Boolean search, candidate outreach, ATS hygiene, sourcing analytics',
    employmentType: 'Full-time',
    workMode: 'Remote',
    location: 'United States',
    applicationDeadline: '2026-08-05T23:59:00Z',
    status: 'Open',
    departmentName: 'Talent Acquisition',
    createdAt: '2026-06-24T13:30:00Z',
  },
  {
    id: 'job-003',
    title: 'People Operations Coordinator',
    description: 'Coordinate hiring operations, interview loops, and candidate communications.',
    requirements: 'Scheduling, HRIS, stakeholder communication, process documentation',
    employmentType: 'Contract',
    workMode: 'On-site',
    location: 'Austin, TX',
    applicationDeadline: '2026-07-30T23:59:00Z',
    status: 'Paused',
    departmentName: 'People',
    createdAt: '2026-06-10T16:45:00Z',
  },
  {
    id: 'job-004',
    title: 'Data Analyst, Recruiting Insights',
    description: 'Create dashboards and analysis for funnel health, source quality, and hiring velocity.',
    requirements: 'SQL, BI dashboards, statistics, recruiting metrics, storytelling',
    employmentType: 'Part-time',
    workMode: 'Hybrid',
    location: 'London, United Kingdom',
    applicationDeadline: '2026-09-01T23:59:00Z',
    status: 'Draft',
    departmentName: 'Analytics',
    createdAt: '2026-07-02T10:00:00Z',
  },
];

const candidateProfiles = [
  {
    userId: 'cand-001',
    firstName: 'Maya',
    lastName: 'Perera',
    email: 'maya.perera@example.com',
    summaryText:
      'Frontend engineer with 7 years of experience building accessible React applications and reusable UI systems for SaaS teams.',
    portfolioUrl: 'https://maya-perera.example.com',
    linkedinUrl: 'https://linkedin.com/in/mayaperera',
    githubUrl: 'https://github.com/mayaperera',
    locationCity: 'Colombo',
    locationCountry: 'Sri Lanka',
    yearsOfExperience: 7,
    resumeUrl: 'https://example.com/resumes/maya-perera.pdf',
    education: [
      {
        institutionName: 'University of Moratuwa',
        degree: 'BSc',
        fieldOfStudy: 'Computer Science',
        startDate: '2014-09-01',
        endDate: '2018-06-30',
        isCurrent: false,
        grade: 'First Class',
      },
    ],
    workExperience: [
      {
        companyName: 'Nimbus Apps',
        jobTitle: 'Senior Frontend Engineer',
        location: 'Colombo, Sri Lanka',
        startDate: '2022-01-15',
        endDate: null,
        isCurrent: true,
        description: 'Leads the frontend platform team and owns component quality, accessibility, and release practices.',
      },
      {
        companyName: 'BrightLoop',
        jobTitle: 'React Developer',
        location: 'Remote',
        startDate: '2018-07-01',
        endDate: '2021-12-20',
        isCurrent: false,
        description: 'Built customer-facing dashboards and migrated legacy UI flows to React.',
      },
    ],
    skills: [
      { name: 'React', proficiencyLevel: 'Expert', yearsOfExperience: 7, extractedByAi: true },
      { name: 'Accessibility', proficiencyLevel: 'Advanced', yearsOfExperience: 5, extractedByAi: true },
      { name: 'Design Systems', proficiencyLevel: 'Advanced', yearsOfExperience: 4, extractedByAi: false },
      { name: 'Testing Library', proficiencyLevel: 'Intermediate', yearsOfExperience: 3, extractedByAi: true },
    ],
  },
  {
    userId: 'cand-002',
    firstName: 'Noah',
    lastName: 'Bennett',
    email: 'noah.bennett@example.com',
    summaryText:
      'Technical sourcer focused on AI startup recruiting, candidate research, and structured outreach experiments.',
    portfolioUrl: 'https://noahbennett.example.com',
    linkedinUrl: 'https://linkedin.com/in/noahbennett',
    githubUrl: '',
    locationCity: 'Denver',
    locationCountry: 'United States',
    yearsOfExperience: 5,
    resumeUrl: 'https://example.com/resumes/noah-bennett.pdf',
    education: [
      {
        institutionName: 'University of Colorado Boulder',
        degree: 'BA',
        fieldOfStudy: 'Psychology',
        startDate: '2015-08-20',
        endDate: '2019-05-18',
        isCurrent: false,
        grade: '3.7 GPA',
      },
    ],
    workExperience: [
      {
        companyName: 'SignalHire Labs',
        jobTitle: 'Senior Talent Sourcer',
        location: 'Remote',
        startDate: '2023-03-01',
        endDate: null,
        isCurrent: true,
        description: 'Sources technical candidates, tests outbound messaging, and maintains sourcing analytics.',
      },
    ],
    skills: [
      { name: 'Candidate Research', proficiencyLevel: 'Expert', yearsOfExperience: 5, extractedByAi: false },
      { name: 'Boolean Search', proficiencyLevel: 'Advanced', yearsOfExperience: 5, extractedByAi: true },
      { name: 'Outreach Strategy', proficiencyLevel: 'Advanced', yearsOfExperience: 4, extractedByAi: true },
    ],
  },
  {
    userId: 'cand-003',
    firstName: 'Anika',
    lastName: 'Shah',
    email: 'anika.shah@example.com',
    summaryText:
      'People operations coordinator with a calm scheduling style and strong documentation habits across high-volume hiring loops.',
    portfolioUrl: '',
    linkedinUrl: 'https://linkedin.com/in/anikashah',
    githubUrl: '',
    locationCity: 'Austin',
    locationCountry: 'United States',
    yearsOfExperience: 4,
    resumeUrl: 'https://example.com/resumes/anika-shah.pdf',
    education: [
      {
        institutionName: 'Texas State University',
        degree: 'BBA',
        fieldOfStudy: 'Human Resource Management',
        startDate: '2017-08-25',
        endDate: '2021-05-22',
        isCurrent: false,
        grade: '3.8 GPA',
      },
    ],
    workExperience: [
      {
        companyName: 'LatticeBridge',
        jobTitle: 'Recruiting Coordinator',
        location: 'Austin, TX',
        startDate: '2021-06-10',
        endDate: null,
        isCurrent: true,
        description: 'Coordinates interview schedules, candidate travel, and weekly hiring status reporting.',
      },
    ],
    skills: [
      { name: 'Interview Scheduling', proficiencyLevel: 'Expert', yearsOfExperience: 4, extractedByAi: false },
      { name: 'Greenhouse', proficiencyLevel: 'Advanced', yearsOfExperience: 3, extractedByAi: true },
      { name: 'Process Documentation', proficiencyLevel: 'Advanced', yearsOfExperience: 4, extractedByAi: true },
    ],
  },
  {
    userId: 'cand-004',
    firstName: 'Ethan',
    lastName: 'Cole',
    email: 'ethan.cole@example.com',
    summaryText:
      'Recruiting data analyst who turns funnel metrics into practical recommendations for hiring teams.',
    portfolioUrl: 'https://ethancole.example.com',
    linkedinUrl: 'https://linkedin.com/in/ethancole',
    githubUrl: 'https://github.com/ethancole',
    locationCity: 'London',
    locationCountry: 'United Kingdom',
    yearsOfExperience: 6,
    resumeUrl: 'https://example.com/resumes/ethan-cole.pdf',
    education: [
      {
        institutionName: 'University of Manchester',
        degree: 'MSc',
        fieldOfStudy: 'Business Analytics',
        startDate: '2018-09-01',
        endDate: '2019-09-01',
        isCurrent: false,
        grade: 'Distinction',
      },
    ],
    workExperience: [
      {
        companyName: 'Northstar Talent',
        jobTitle: 'Recruiting Analytics Lead',
        location: 'London, United Kingdom',
        startDate: '2020-02-01',
        endDate: null,
        isCurrent: true,
        description: 'Owns recruiting dashboards, source quality analysis, and funnel forecasting.',
      },
    ],
    skills: [
      { name: 'SQL', proficiencyLevel: 'Expert', yearsOfExperience: 6, extractedByAi: true },
      { name: 'Tableau', proficiencyLevel: 'Advanced', yearsOfExperience: 5, extractedByAi: false },
      { name: 'Recruiting Metrics', proficiencyLevel: 'Advanced', yearsOfExperience: 4, extractedByAi: true },
    ],
  },
  {
    userId: 'cand-005',
    firstName: 'Leah',
    lastName: 'Morgan',
    email: 'leah.morgan@example.com',
    summaryText:
      'Frontend developer with product sense, strong CSS fundamentals, and experience pairing closely with designers.',
    portfolioUrl: 'https://leahmorgan.example.com',
    linkedinUrl: 'https://linkedin.com/in/leahmorgan',
    githubUrl: 'https://github.com/leahmorgan',
    locationCity: 'Toronto',
    locationCountry: 'Canada',
    yearsOfExperience: 3,
    resumeUrl: 'https://example.com/resumes/leah-morgan.pdf',
    education: [
      {
        institutionName: 'University of Toronto',
        degree: 'BSc',
        fieldOfStudy: 'Information',
        startDate: '2019-09-01',
        endDate: '2023-05-31',
        isCurrent: false,
        grade: '3.6 GPA',
      },
    ],
    workExperience: [
      {
        companyName: 'CanvasHR',
        jobTitle: 'Frontend Developer',
        location: 'Toronto, Canada',
        startDate: '2023-06-15',
        endDate: null,
        isCurrent: true,
        description: 'Builds recruiter-facing UI and collaborates on design system refinements.',
      },
    ],
    skills: [
      { name: 'React', proficiencyLevel: 'Intermediate', yearsOfExperience: 3, extractedByAi: true },
      { name: 'CSS', proficiencyLevel: 'Advanced', yearsOfExperience: 4, extractedByAi: false },
      { name: 'Figma', proficiencyLevel: 'Intermediate', yearsOfExperience: 2, extractedByAi: true },
    ],
  },
];

const applications = [
  {
    id: 'app-001',
    jobId: 'job-001',
    jobTitle: 'Senior Frontend Engineer',
    candidateId: 'cand-001',
    candidateName: 'Maya Perera',
    candidateEmail: 'maya.perera@example.com',
    status: 'Shortlisted',
    aiMatchScore: 94,
    appliedAt: '2026-07-01T08:20:00Z',
    resumeUrl: 'https://example.com/resumes/maya-perera.pdf',
  },
  {
    id: 'app-002',
    jobId: 'job-001',
    jobTitle: 'Senior Frontend Engineer',
    candidateId: 'cand-005',
    candidateName: 'Leah Morgan',
    candidateEmail: 'leah.morgan@example.com',
    status: 'Under Review',
    aiMatchScore: 76,
    appliedAt: '2026-07-03T14:05:00Z',
    resumeUrl: 'https://example.com/resumes/leah-morgan.pdf',
  },
  {
    id: 'app-003',
    jobId: 'job-001',
    jobTitle: 'Senior Frontend Engineer',
    candidateId: 'cand-003',
    candidateName: 'Anika Shah',
    candidateEmail: 'anika.shah@example.com',
    status: 'Rejected',
    aiMatchScore: 41,
    appliedAt: '2026-07-04T11:30:00Z',
    resumeUrl: 'https://example.com/resumes/anika-shah.pdf',
  },
  {
    id: 'app-004',
    jobId: 'job-002',
    jobTitle: 'AI Talent Sourcer',
    candidateId: 'cand-002',
    candidateName: 'Noah Bennett',
    candidateEmail: 'noah.bennett@example.com',
    status: 'Interview Scheduled',
    aiMatchScore: 91,
    appliedAt: '2026-07-02T17:45:00Z',
    resumeUrl: 'https://example.com/resumes/noah-bennett.pdf',
  },
  {
    id: 'app-005',
    jobId: 'job-002',
    jobTitle: 'AI Talent Sourcer',
    candidateId: 'cand-003',
    candidateName: 'Anika Shah',
    candidateEmail: 'anika.shah@example.com',
    status: 'Applied',
    aiMatchScore: 68,
    appliedAt: '2026-07-06T09:00:00Z',
    resumeUrl: 'https://example.com/resumes/anika-shah.pdf',
  },
  {
    id: 'app-006',
    jobId: 'job-003',
    jobTitle: 'People Operations Coordinator',
    candidateId: 'cand-003',
    candidateName: 'Anika Shah',
    candidateEmail: 'anika.shah@example.com',
    status: 'Offer Extended',
    aiMatchScore: 88,
    appliedAt: '2026-06-28T10:15:00Z',
    resumeUrl: 'https://example.com/resumes/anika-shah.pdf',
  },
  {
    id: 'app-007',
    jobId: 'job-003',
    jobTitle: 'People Operations Coordinator',
    candidateId: 'cand-002',
    candidateName: 'Noah Bennett',
    candidateEmail: 'noah.bennett@example.com',
    status: 'Withdrawn',
    aiMatchScore: 55,
    appliedAt: '2026-06-30T12:40:00Z',
    resumeUrl: 'https://example.com/resumes/noah-bennett.pdf',
  },
  {
    id: 'app-008',
    jobId: 'job-004',
    jobTitle: 'Data Analyst, Recruiting Insights',
    candidateId: 'cand-004',
    candidateName: 'Ethan Cole',
    candidateEmail: 'ethan.cole@example.com',
    status: 'Hired',
    aiMatchScore: 96,
    appliedAt: '2026-07-05T15:25:00Z',
    resumeUrl: 'https://example.com/resumes/ethan-cole.pdf',
  },
];

const aiScreeningResults = [
  {
    applicationId: 'app-001',
    overallScore: 94,
    skillsMatchScore: 96,
    experienceMatchScore: 92,
    educationMatchScore: 90,
    screeningSummary: 'Excellent React and design system alignment with strong accessibility experience.',
    aiRank: 1,
  },
  {
    applicationId: 'app-002',
    overallScore: 76,
    skillsMatchScore: 78,
    experienceMatchScore: 70,
    educationMatchScore: 82,
    screeningSummary: 'Good frontend foundation, but less senior ownership experience than the role asks for.',
    aiRank: 2,
  },
  {
    applicationId: 'app-003',
    overallScore: 41,
    skillsMatchScore: 35,
    experienceMatchScore: 45,
    educationMatchScore: 55,
    screeningSummary: 'Strong operations profile, but limited frontend engineering experience.',
    aiRank: 3,
  },
  {
    applicationId: 'app-004',
    overallScore: 91,
    skillsMatchScore: 93,
    experienceMatchScore: 88,
    educationMatchScore: 84,
    screeningSummary: 'Strong sourcing background with clear evidence of AI recruiting workflow experience.',
    aiRank: 1,
  },
  {
    applicationId: 'app-005',
    overallScore: 68,
    skillsMatchScore: 62,
    experienceMatchScore: 72,
    educationMatchScore: 78,
    screeningSummary: 'Excellent coordination skills, but sourcing specialization is lighter.',
    aiRank: 2,
  },
  {
    applicationId: 'app-006',
    overallScore: 88,
    skillsMatchScore: 89,
    experienceMatchScore: 86,
    educationMatchScore: 92,
    screeningSummary: 'Very strong match for coordination, documentation, and candidate communication.',
    aiRank: 1,
  },
  {
    applicationId: 'app-007',
    overallScore: 55,
    skillsMatchScore: 58,
    experienceMatchScore: 52,
    educationMatchScore: 60,
    screeningSummary: 'Some transferable recruiting skills, but role focus is operations-heavy.',
    aiRank: 2,
  },
  {
    applicationId: 'app-008',
    overallScore: 96,
    skillsMatchScore: 98,
    experienceMatchScore: 94,
    educationMatchScore: 96,
    screeningSummary: 'Top match for recruiting analytics, BI tooling, and funnel storytelling.',
    aiRank: 1,
  },
];

const interviews = [
  {
    id: 'int-001',
    applicationId: 'app-001',
    candidateName: 'Maya Perera',
    jobTitle: 'Senior Frontend Engineer',
    interviewerId: 'user-101',
    interviewerName: 'Priya Raman',
    interviewType: 'Technical Screen',
    scheduledTime: '2026-07-16T14:00:00Z',
    durationMinutes: 60,
    meetingLink: 'https://meet.example.com/maya-tech',
    status: 'Confirmed',
    notes: 'Focus on design system ownership and accessibility tradeoffs.',
  },
  {
    id: 'int-002',
    applicationId: 'app-004',
    candidateName: 'Noah Bennett',
    jobTitle: 'AI Talent Sourcer',
    interviewerId: 'user-102',
    interviewerName: 'Elena Cruz',
    interviewType: 'Recruiter Screen',
    scheduledTime: '2026-07-14T18:30:00Z',
    durationMinutes: 30,
    meetingLink: 'https://meet.example.com/noah-screen',
    status: 'Scheduled',
    notes: 'Discuss sourcing metrics and outbound experiments.',
  },
  {
    id: 'int-003',
    applicationId: 'app-006',
    candidateName: 'Anika Shah',
    jobTitle: 'People Operations Coordinator',
    interviewerId: 'user-103',
    interviewerName: 'Marcus Lee',
    interviewType: 'Hiring Manager',
    scheduledTime: '2026-07-09T16:00:00Z',
    durationMinutes: 45,
    meetingLink: 'https://meet.example.com/anika-manager',
    status: 'Completed',
    notes: 'Positive feedback on scheduling scenarios and documentation examples.',
  },
  {
    id: 'int-004',
    applicationId: 'app-008',
    candidateName: 'Ethan Cole',
    jobTitle: 'Data Analyst, Recruiting Insights',
    interviewerId: 'user-104',
    interviewerName: 'Sofia Grant',
    interviewType: 'Panel',
    scheduledTime: '2026-07-11T11:00:00Z',
    durationMinutes: 75,
    meetingLink: 'https://meet.example.com/ethan-panel',
    status: 'Completed',
    notes: 'Strong dashboard walkthrough and crisp recommendations.',
  },
  {
    id: 'int-005',
    applicationId: 'app-002',
    candidateName: 'Leah Morgan',
    jobTitle: 'Senior Frontend Engineer',
    interviewerId: 'user-101',
    interviewerName: 'Priya Raman',
    interviewType: 'Portfolio Review',
    scheduledTime: '2026-07-18T15:30:00Z',
    durationMinutes: 45,
    meetingLink: 'https://meet.example.com/leah-portfolio',
    status: 'Rescheduled',
    notes: 'Candidate asked to move from the original July 17 slot.',
  },
  {
    id: 'int-006',
    applicationId: 'app-003',
    candidateName: 'Anika Shah',
    jobTitle: 'Senior Frontend Engineer',
    interviewerId: 'user-105',
    interviewerName: 'Dev Patel',
    interviewType: 'Technical Screen',
    scheduledTime: '2026-07-08T13:00:00Z',
    durationMinutes: 45,
    meetingLink: '',
    status: 'Canceled',
    notes: 'Canceled after application was rejected during screen review.',
  },
];

const findApplication = (applicationId) =>
  applications.find((application) => application.id === applicationId) ?? null;

export const getJobs = async () => delay([...jobs]);

export const getApplicationsByJob = async (jobId) =>
  delay(applications.filter((application) => application.jobId === jobId));

export const getApplication = async (applicationId) => {
  const application = findApplication(applicationId);
  const candidateProfile = application
    ? candidateProfiles.find((profile) => profile.userId === application.candidateId) ?? null
    : null;

  return delay(application ? { ...application, candidateProfile } : null);
};

export const getAiScreeningResult = async (applicationId) =>
  delay(
    aiScreeningResults.find((result) => result.applicationId === applicationId) ?? null
  );

export const getInterviewsByApplication = async (applicationId) =>
  delay(interviews.filter((interview) => interview.applicationId === applicationId));

export const getAllInterviews = async () => delay([...interviews]);
export const getAllApplications = async () => delay([...applications]);

export const buildMockMessages = (application) => [
  {
    id: `${application.id}-msg-001`,
    sender: 'Current Recruiter',
    body: `Hi ${application.candidateName}, thanks for applying for ${application.jobTitle}. We are reviewing your profile now.`,
    sentAt: '2026-07-08T09:20:00Z',
  },
  {
    id: `${application.id}-msg-002`,
    sender: application.candidateName,
    body: 'Thank you. I am happy to answer any questions or share more examples of my work.',
    sentAt: '2026-07-08T10:05:00Z',
  },
  {
    id: `${application.id}-msg-003`,
    sender: 'Current Recruiter',
    body: 'Great. Could you confirm your availability for a short call later this week?',
    sentAt: '2026-07-09T13:30:00Z',
  },
  {
    id: `${application.id}-msg-004`,
    sender: application.candidateName,
    body: 'Thursday afternoon or Friday morning would work well for me.',
    sentAt: '2026-07-09T14:12:00Z',
  },
];

export const getMessagesForApplication = async (applicationId) => {
  const application = findApplication(applicationId);
  if (!application) return delay([]);
  return delay(buildMockMessages(application));
};

export const getAllConversations = async () => {
  const conversations = applications.map((app) => {
    const messages = buildMockMessages(app);
    const lastMessage = messages[messages.length - 1];
    return {
      applicationId: app.id,
      candidateName: app.candidateName,
      jobTitle: app.jobTitle,
      body: lastMessage.body,
      sentAt: lastMessage.sentAt,
      unread: lastMessage.sender === app.candidateName,
    };
  });
  
  // Sort by most recent first
  conversations.sort((a, b) => new Date(b.sentAt) - new Date(a.sentAt));
  return delay(conversations);
};
