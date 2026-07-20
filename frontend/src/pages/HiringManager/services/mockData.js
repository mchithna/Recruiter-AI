const delay = (value, ms = 300) =>
  new Promise((resolve) => {
    setTimeout(() => resolve(value), ms);
  });

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
    id: 'app-003',
    jobId: 'job-001',
    jobTitle: 'Senior Frontend Engineer',
    candidateId: 'cand-005',
    candidateName: 'Leah Morgan',
    candidateEmail: 'leah.morgan@example.com',
    status: 'Shortlisted',
    aiMatchScore: 76,
    appliedAt: '2026-07-03T14:05:00Z',
    resumeUrl: 'https://example.com/resumes/leah-morgan.pdf',
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
    applicationId: 'app-002',
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
    applicationId: 'app-003',
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
    id: 'int-004',
    applicationId: 'app-001',
    candidateName: 'Maya Perera',
    jobTitle: 'Senior Frontend Engineer',
    interviewerId: 'user-101',
    interviewerName: 'Priya Raman',
    interviewType: 'Initial Screening',
    scheduledTime: '2026-07-05T10:00:00Z',
    durationMinutes: 30,
    meetingLink: 'https://meet.example.com/maya-screen',
    status: 'Completed',
    notes: 'Very positive screen, recommend moving to technical loop.',
  },
  {
    id: 'int-005',
    applicationId: 'app-002',
    candidateName: 'Noah Bennett',
    jobTitle: 'AI Talent Sourcer',
    interviewerId: 'user-102',
    interviewerName: 'Elena Cruz',
    interviewType: 'Panel Interview',
    scheduledTime: '2026-07-20T11:00:00Z',
    durationMinutes: 90,
    meetingLink: 'https://meet.example.com/noah-panel',
    status: 'Scheduled',
    notes: 'Focus on strategic candidate pipelines and ATS optimization.',
  },
  {
    id: 'int-006',
    applicationId: 'app-003',
    candidateName: 'Leah Morgan',
    jobTitle: 'Senior Frontend Engineer',
    interviewerId: 'user-101',
    interviewerName: 'Priya Raman',
    interviewType: 'Technical Screen',
    scheduledTime: '2026-07-02T15:00:00Z',
    durationMinutes: 45,
    meetingLink: '',
    status: 'Canceled',
    notes: 'Candidate withdrew application prior to loop starting.',
  },
];

export const getShortlistedApplications = async () => {
  const filtered = applications.filter(
    (app) => app.status === 'Shortlisted' || app.status === 'Interview Scheduled'
  );
  return delay(filtered);
};

export const getApplication = async (applicationId) => {
  const application = applications.find((app) => app.id === applicationId) || null;
  if (!application) return delay(null);

  const candidateProfile = candidateProfiles.find(
    (profile) => profile.userId === application.candidateId
  ) || null;

  return delay({
    ...application,
    candidateProfile,
  });
};

export const getInterview = async (interviewId) => {
  const interview = interviews.find((int) => int.id === interviewId) || null;
  return delay(interview);
};

export const getInterviewsForApplication = async (applicationId) => {
  const filtered = interviews.filter((int) => int.applicationId === applicationId);
  return delay(filtered);
};

const evaluations = [];

export const getEvaluationForInterview = async (interviewId) => {
  const evaluation = evaluations.find((e) => e.interviewId === interviewId) || null;
  return delay(evaluation);
};

export const submitEvaluation = async (evaluation) => {
  const newEval = {
    id: `eval-${evaluations.length + 1}`,
    submittedAt: new Date().toISOString(),
    ...evaluation,
  };
  evaluations.push(newEval);

  // Automatically update the mock interview status to Completed
  const interview = interviews.find((int) => int.id === evaluation.interviewId);
  if (interview) {
    interview.status = 'Completed';
  }

  return delay(newEval);
};

const offers = [
  {
    id: 'off-001',
    applicationId: 'app-003',
    candidateName: 'Leah Morgan',
    offeredSalary: 115000,
    salaryCurrency: 'USD',
    proposedStartDate: '2026-08-01T09:00:00Z',
    offerExpiryDate: '2026-07-20T18:00:00Z',
    status: 'Pending',
    notes: 'Standard package with sign-on option.',
  }
];

export const getOfferForApplication = async (applicationId) => {
  const offer = offers.find((o) => o.applicationId === applicationId) || null;
  return delay(offer);
};

export const submitOffer = async (offer) => {
  const newOffer = {
    id: `off-${offers.length + 1}`,
    status: 'Pending',
    createdAt: new Date().toISOString(),
    ...offer,
  };
  offers.push(newOffer);

  // Automatically transition the application's status to Offer Extended
  const application = applications.find((app) => app.id === offer.applicationId);
  if (application) {
    application.status = 'Offer Extended';
  }

  return delay(newOffer);
};

export const getAllInterviews = async () => {
  return delay([...interviews]);
};

export const getAllOffers = async () => {
  return delay([...offers]);
};




