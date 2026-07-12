import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarClock } from 'lucide-react';
import { Card, EmptyState, Select, Skeleton } from '../../components/ui';
import { InterviewCard } from './components/InterviewCard';
import { getAllInterviews } from './services/mockData';

export default function InterviewsList() {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState('upcoming');
  const [statusFilter, setStatusFilter] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    let isActive = true;

    async function fetchInterviews() {
      setLoading(true);

      try {
        const data = await getAllInterviews();
        if (!isActive) return;

        setInterviews(
          [...data].sort((a, b) => new Date(a.scheduledTime) - new Date(b.scheduledTime))
        );
      } catch (error) {
        console.error('Failed to fetch interviews:', error);
      } finally {
        if (isActive) setLoading(false);
      }
    }

    fetchInterviews();

    return () => {
      isActive = false;
    };
  }, []);

  const filteredInterviews = useMemo(() => {
    const now = new Date();

    return interviews.filter((interview) => {
      if (statusFilter !== 'all' && interview.status.toLowerCase() !== statusFilter) {
        return false;
      }

      if (timeFilter === 'all' || !interview.scheduledTime) {
        return true;
      }

      const interviewTime = new Date(interview.scheduledTime);
      if (timeFilter === 'upcoming') return interviewTime >= now;
      if (timeFilter === 'past') return interviewTime < now;

      return true;
    });
  }, [interviews, timeFilter, statusFilter]);

  const statusOptions = useMemo(() => {
    const statuses = Array.from(new Set(interviews.map((interview) => interview.status)));

    return [
      { value: 'all', label: 'All Statuses' },
      ...statuses.map((status) => ({ value: status.toLowerCase(), label: status })),
    ];
  }, [interviews]);

  return (
    <div className="mx-auto max-w-7xl space-y-6 animate-slide-up">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-h2 text-secondary-900">Interviews</h1>
          <p className="mt-1 text-body-sm text-secondary-500">
            View and manage all candidate interviews.
          </p>
        </div>

        <div className="grid w-full grid-cols-1 gap-3 sm:w-auto sm:grid-cols-2">
          <Select
            label="Date Range"
            value={timeFilter}
            onChange={(event) => setTimeFilter(event.target.value)}
            options={[
              { value: 'all', label: 'All Dates' },
              { value: 'upcoming', label: 'Upcoming' },
              { value: 'past', label: 'Past' },
            ]}
          />
          <Select
            label="Status"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            options={statusOptions}
          />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          <Skeleton height="10rem" />
          <Skeleton height="10rem" />
          <Skeleton height="10rem" />
        </div>
      ) : filteredInterviews.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredInterviews.map((interview) => (
            <div
              key={interview.id}
              onClick={() => navigate(`/recruiter/applications/${interview.applicationId}`)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  navigate(`/recruiter/applications/${interview.applicationId}`);
                }
              }}
              role="link"
              tabIndex={0}
              className="block h-full cursor-pointer transition-transform duration-base hover:-translate-y-1"
            >
              <InterviewCard interview={interview} />
            </div>
          ))}
        </div>
      ) : (
        <Card>
          <EmptyState
            icon={CalendarClock}
            title="No interviews match these filters"
            description="Adjust the date or status filters to review more scheduled interviews."
          />
        </Card>
      )}
    </div>
  );
}
