import PropTypes from 'prop-types';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { RecruiterJobsContext } from './RecruiterJobsContext';
import { recruiterApi } from './services/recruiterApi';

export function RecruiterJobsProvider({ children }) {
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isActive = true;

    recruiterApi.getJobs()
      .then((loadedJobs) => {
        if (!isActive) return;
        setJobs(loadedJobs);
      })
      .catch((error) => {
        console.error('Failed to load recruiter jobs:', error);
        if (isActive) setJobs([]);
      })
      .finally(() => {
        if (isActive) setIsLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, []);

  const addJob = useCallback(async (job) => {
    const newJob = await recruiterApi.createJob(job);
    setJobs((currentJobs) => [newJob, ...currentJobs]);
    return newJob;
  }, []);

  const updateJob = useCallback(async (jobId, updates) => {
    await recruiterApi.updateJob(jobId, updates);
    setJobs((currentJobs) =>
      currentJobs.map((job) => (job.id === jobId ? { ...job, ...updates } : job))
    );
  }, []);

  const updateJobStatus = useCallback(async (jobId, status) => {
    await recruiterApi.updateJobStatus(jobId, { status });
    setJobs((currentJobs) =>
      currentJobs.map((job) => (job.id === jobId ? { ...job, status } : job))
    );
  }, []);

  const getJobById = useCallback(
    (jobId) => jobs.find((job) => job.id === jobId) ?? null,
    [jobs]
  );

  const value = useMemo(
    () => ({ jobs, isLoading, addJob, updateJob, updateJobStatus, getJobById }),
    [addJob, getJobById, isLoading, jobs, updateJob, updateJobStatus]
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
