import { useContext } from 'react';
import { RecruiterJobsContext } from './RecruiterJobsContext';

export function useRecruiterJobs() {
  const context = useContext(RecruiterJobsContext);

  if (!context) {
    throw new Error('useRecruiterJobs must be used inside RecruiterJobsProvider');
  }

  return context;
}
