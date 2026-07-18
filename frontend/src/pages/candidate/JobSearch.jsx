import React, { useState, useEffect } from 'react';
import { 
  Spinner,
  Select,
  SearchInput
} from '../../components/ui';
import JobCard from './components/JobCard';
import { getJobs } from './services/candidateApi';

export default function JobSearch() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [filters, setFilters] = useState({
    search: '',
    employmentType: '',
    workMode: ''
  });

  useEffect(() => {
    loadJobs();
  }, [filters]);

  const loadJobs = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getJobs(filters);
      setJobs(data);
    } catch (err) {
      setJobs([]);
      setError(err?.response?.data?.message || 'Unable to load jobs right now.');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 pb-16">
      <div>
        <h2 className="text-h2 text-secondary-900 dark:text-white">Discover Jobs</h2>
        <p className="text-body-sm text-secondary-600 dark:text-secondary-400 mt-2">
          Search and filter open roles across the company.
        </p>
      </div>

      <div className="relative z-20 rounded-2xl border border-white/60 bg-white/75 p-6 shadow-glass backdrop-blur-2xl dark:border-white/10 dark:bg-secondary-950/55 dark:shadow-glass-dark">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <SearchInput 
            placeholder="Search by title or location..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
          />
          <Select
            value={filters.employmentType}
            onChange={(e) => handleFilterChange('employmentType', e.target.value)}
            options={[
              { label: 'All Job Types', value: '' },
              { label: 'Full-time', value: 'Full-time' },
              { label: 'Contract', value: 'Contract' },
              { label: 'Part-time', value: 'Part-time' }
            ]}
          />
          <Select
            value={filters.workMode}
            onChange={(e) => handleFilterChange('workMode', e.target.value)}
            options={[
              { label: 'All Work Modes', value: '' },
              { label: 'Remote', value: 'Remote' },
              { label: 'Hybrid', value: 'Hybrid' },
              { label: 'On-site', value: 'On-site' }
            ]}
          />
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-body-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex py-12 items-center justify-center">
          <Spinner size="lg" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.length > 0 ? (
            jobs.map(job => (
              <JobCard key={job.id} job={job} />
            ))
          ) : (
            <div className="col-span-full rounded-2xl border border-dashed border-secondary-300 p-12 text-center dark:border-secondary-700">
              <p className="text-body text-secondary-500 dark:text-secondary-400">No jobs found matching your criteria.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
