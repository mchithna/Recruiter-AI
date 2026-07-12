import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllInterviews } from './services/mockData';
import { InterviewCard } from './components/InterviewCard';

export default function InterviewsList() {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState('upcoming'); // 'all', 'upcoming', 'past'
  const [statusFilter, setStatusFilter] = useState('all');
  
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchInterviews() {
      setLoading(true);
      try {
        const data = await getAllInterviews();
        // Sort by scheduled time by default
        data.sort((a, b) => new Date(a.scheduledTime) - new Date(b.scheduledTime));
        setInterviews(data);
      } catch (error) {
        console.error('Failed to fetch interviews:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchInterviews();
  }, []);

  const filteredInterviews = useMemo(() => {
    const now = new Date();
    return interviews.filter((interview) => {
      // Status filter
      if (statusFilter !== 'all' && interview.status.toLowerCase() !== statusFilter.toLowerCase()) {
        return false;
      }
      
      // Time filter
      if (timeFilter !== 'all' && interview.scheduledTime) {
        const interviewTime = new Date(interview.scheduledTime);
        if (timeFilter === 'upcoming' && interviewTime < now) {
          return false;
        }
        if (timeFilter === 'past' && interviewTime >= now) {
          return false;
        }
      }
      
      return true;
    });
  }, [interviews, timeFilter, statusFilter]);

  const allStatuses = useMemo(() => {
    const statuses = new Set(interviews.map(i => i.status));
    return Array.from(statuses);
  }, [interviews]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Interviews</h1>
          <p className="text-slate-500 dark:text-slate-400">View and manage all candidate interviews</p>
        </div>
        
        <div className="flex items-center gap-3">
          <select
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value)}
            className="h-10 px-3 py-2 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Dates</option>
            <option value="upcoming">Upcoming</option>
            <option value="past">Past</option>
          </select>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 px-3 py-2 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Statuses</option>
            {allStatuses.map(status => (
              <option key={status} value={status.toLowerCase()}>{status}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      ) : filteredInterviews.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredInterviews.map((interview) => (
            <div 
              key={interview.id} 
              onClick={() => navigate(`/recruiter/applications/${interview.applicationId}`)}
              className="cursor-pointer transition-transform hover:-translate-y-1 block h-full"
            >
              <InterviewCard interview={interview} />
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 p-12 rounded-xl border border-slate-200 dark:border-slate-700 text-center">
          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
          </div>
          <h3 className="text-lg font-semibold mb-1">No interviews found</h3>
          <p className="text-slate-500 dark:text-slate-400">
            Try adjusting your filters to see more results.
          </p>
        </div>
      )}
    </div>
  );
}
