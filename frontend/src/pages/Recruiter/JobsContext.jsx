import PropTypes from 'prop-types';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { RecruiterJobsContext } from './RecruiterJobsContext';
import { getJobs } from './services/mockData';

export function RecruiterJobsProvider({ children }) {
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isActive = true;

    getJobs().then((mockJobs) => {
      if (!isActive) return;
      setJobs(mockJobs);
      setIsLoading(false);
    });

    return () => {
      isActive = false;
    };
  }, []);

  const addJob = useCallback((job) => {
    const now = new Date().toISOString();
    const newJob = {
      ...job,
      id: `job-${Date.now()}`,
      status: 'Draft',
      departmentName: job.departmentName ?? 'Recruiting',
      createdAt: now,
    };

    setJobs((currentJobs) => [newJob, ...currentJobs]);
    return newJob;
  }, []);

  const updateJob = useCallback((jobId, updates) => {
    setJobs((currentJobs) =>
      currentJobs.map((job) => (job.id === jobId ? { ...job, ...updates } : job))
    );
  }, []);

  const getJobById = useCallback(
    (jobId) => jobs.find((job) => job.id === jobId) ?? null,
    [jobs]
  );

  const value = useMemo(
    () => ({ jobs, isLoading, addJob, updateJob, getJobById }),
    [addJob, getJobById, isLoading, jobs, updateJob]
  );

  return (
    <RecruiterJobsContext.Provider value={value}>
      {children}
    </RecruiterJobsContext.Provider>
  );
}

RecruiterJobsProvider.propTypes = {
  children: PropTypes.node,
};
