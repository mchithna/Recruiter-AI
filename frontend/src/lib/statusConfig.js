export const APPLICATION_STATUS = {
  applied: { label: 'Applied', token: 'secondary' },
  under_review: { label: 'Under Review', token: 'info' },
  interview_scheduled: { label: 'Interview Scheduled', token: 'primary' },
  offer_extended: { label: 'Offer Extended', token: 'success' },
  hired: { label: 'Hired', token: 'success' },
  rejected: { label: 'Rejected', token: 'danger' },
  withdrawn: { label: 'Withdrawn', token: 'secondary' },
};

export const JOB_STATUS = {
  draft: { label: 'Draft', token: 'secondary' },
  open: { label: 'Open', token: 'success' },
  paused: { label: 'Paused', token: 'warning' },
  closed: { label: 'Closed', token: 'danger' },
};

export const SCORE_THRESHOLDS = [
  { max: 40, token: 'danger' },
  { max: 70, token: 'warning' },
  { max: 100, token: 'success' },
];
