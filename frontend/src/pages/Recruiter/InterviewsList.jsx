import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  CalendarClock,
  CheckCircle2,
  Clock,
  Filter,
  Sparkles,
  Video,
  UserCheck,
  Sparkles,
  Edit,
  ExternalLink,
} from 'lucide-react';
import {
  Badge,
  Button,
  Card,
  DateTimeInput,
  EmptyState,
  Input,
  Modal,
  Select,
  Skeleton,
  StatCard,
  StatusBadge,
} from '../../components/ui';
import { recruiterApi } from './services/recruiterApi';
import { useToast } from '../../lib/ToastContext';

const formatScheduledTime = (scheduledTime) => {
  if (!scheduledTime) return 'Not scheduled';
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(scheduledTime));
};

const formatRelativeDay = (scheduledTime) => {
  if (!scheduledTime) return '';
  const now = new Date();
  const date = new Date(scheduledTime);
  const diffMs = date - now;
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays > 1 && diffDays <= 7) return `In ${diffDays} days`;
  if (diffDays < 0) return `${Math.abs(diffDays)} days ago`;
  return '';
};

const interviewTypeOptions = [
  { value: 'Recruiter Screen', label: 'Recruiter Screen' },
  { value: 'Technical Screen', label: 'Technical Screen' },
  { value: 'Portfolio Review', label: 'Portfolio Review' },
  { value: 'Hiring Manager', label: 'Hiring Manager' },
  { value: 'Panel', label: 'Panel' },
];

const interviewStatusOptions = [
  { value: 'Scheduled', label: 'Scheduled' },
  { value: 'Confirmed', label: 'Confirmed' },
  { value: 'Completed', label: 'Completed' },
  { value: 'Cancelled', label: 'Cancelled' },
];

const emptyInterviewForm = {
  interviewerId: '',
  interviewType: 'Recruiter Screen',
  scheduledTime: '',
  durationMinutes: '30',
  meetingLink: '',
};

export default function InterviewsList() {
  const { toast } = useToast();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('pending'); // 'pending' | 'scheduled'
  const [interviews, setInterviews] = useState([]);
  const [applications, setApplications] = useState([]);
  const [hiringManagers, setHiringManagers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [timeFilter, setTimeFilter] = useState('upcoming');
  const [statusFilter, setStatusFilter] = useState('all');

  // Schedule New Modal State
  const [selectedApp, setSelectedApp] = useState(null);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [interviewForm, setInterviewForm] = useState(emptyInterviewForm);
  const [isSubmittingSchedule, setIsSubmittingSchedule] = useState(false);

  // View / Edit Scheduled Interview Modal State
  const [selectedInterview, setSelectedInterview] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editForm, setEditForm] = useState({
    interviewerId: '',
    interviewType: 'Recruiter Screen',
    scheduledTime: '',
    durationMinutes: '30',
    meetingLink: '',
    status: 'Scheduled',
    notes: '',
  });
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [interviewsData, dashboardData, managersData] = await Promise.all([
        recruiterApi.getInterviews(),
        recruiterApi.getDashboard().catch(() => ({ applications: [] })),
        recruiterApi.getHiringManagers().catch(() => []),
      ]);

      setInterviews(
        [...(interviewsData || [])].sort((a, b) => new Date(a.scheduledTime) - new Date(b.scheduledTime))
      );
      setApplications(dashboardData.applications || []);
      setHiringManagers((managersData || []).map(m => ({
        value: m.id,
        label: `${m.firstName} ${m.lastName}`
      })));
    } catch (error) {
      console.error('Failed to load interview data:', error);
      toast({ title: 'Error loading interview details.', variant: 'danger' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter Shortlisted Candidates from Closed Jobs that don't have an active interview scheduled yet
  const pendingShortlisted = useMemo(() => {
    return applications.filter((app) => {
      const isShortlisted = app.status === 'Shortlisted';
      const isJobClosed = app.jobStatus?.toLowerCase() === 'closed';
      const hasInterviewScheduled = interviews.some(
        (inv) => String(inv.applicationId) === String(app.id)
      );

      return isShortlisted && isJobClosed && !hasInterviewScheduled;
    });
  }, [applications, interviews]);

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

  const stats = useMemo(() => {
    const now = new Date();
    const upcoming = interviews.filter(
      (i) =>
        ['Scheduled', 'Confirmed'].includes(i.status) &&
        i.scheduledTime &&
        new Date(i.scheduledTime) > now
    );
    const completed = interviews.filter((i) => i.status === 'Completed');

    return {
      pending: pendingShortlisted.length,
      upcoming: upcoming.length,
      completed: completed.length,
    };
  }, [interviews, pendingShortlisted]);

  // Schedule Modal Handlers
  const handleOpenScheduleModal = (app) => {
    setSelectedApp(app);
    setInterviewForm(emptyInterviewForm);
    setIsScheduleModalOpen(true);
  };

  const handleFormChange = (field) => (e) => {
    setInterviewForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmitSchedule = async (e) => {
    e.preventDefault();
    if (!selectedApp) return;
    if (!interviewForm.interviewerId) {
      toast({ title: 'Please select an interviewer.', variant: 'danger' });
      return;
    }

    setIsSubmittingSchedule(true);
    try {
      await recruiterApi.createInterview({
        applicationId: Number(selectedApp.id),
        interviewerId: Number(interviewForm.interviewerId),
        interviewType: interviewForm.interviewType,
        scheduledTime: new Date(interviewForm.scheduledTime).toISOString(),
        durationMinutes: Number(interviewForm.durationMinutes),
        meetingLink: interviewForm.meetingLink,
      });

      toast({ title: `Interview scheduled for ${selectedApp.candidateName}`, variant: 'success' });
      setIsScheduleModalOpen(false);
      loadData();
    } catch (error) {
      console.error('Failed to schedule interview:', error);
      toast({ title: error?.response?.data?.message || 'Failed to schedule interview.', variant: 'danger' });
    } finally {
      setIsSubmittingSchedule(false);
    }
  };

  // View / Edit Modal Handlers
  const handleViewInterview = (interview) => {
    setSelectedInterview(interview);
    setIsEditMode(false);
    
    // Format date for datetime-local input
    let formattedDate = '';
    if (interview.scheduledTime) {
      const d = new Date(interview.scheduledTime);
      d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
      formattedDate = d.toISOString().slice(0, 16);
    }

    setEditForm({
      interviewerId: String(interview.interviewerId || ''),
      interviewType: interview.interviewType || 'Recruiter Screen',
      scheduledTime: formattedDate,
      durationMinutes: String(interview.durationMinutes || 30),
      meetingLink: interview.meetingLink || '',
      status: interview.status || 'Scheduled',
      notes: interview.notes || '',
    });

    setIsViewModalOpen(true);
  };

  const handleEditFormChange = (field) => (e) => {
    setEditForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSaveInterviewEdits = async (e) => {
    e.preventDefault();
    if (!selectedInterview) return;

    setIsSubmittingEdit(true);
    try {
      await recruiterApi.updateInterview(selectedInterview.id, {
        interviewerId: Number(editForm.interviewerId),
        interviewType: editForm.interviewType,
        scheduledTime: new Date(editForm.scheduledTime).toISOString(),
        durationMinutes: Number(editForm.durationMinutes),
        meetingLink: editForm.meetingLink,
        status: editForm.status,
        notes: editForm.notes,
      });

      toast({ title: 'Interview details updated successfully.', variant: 'success' });
      setIsEditMode(false);
      setIsViewModalOpen(false);
      loadData();
    } catch (error) {
      console.error('Failed to update interview:', error);
      toast({ title: error?.response?.data?.message || 'Failed to update interview.', variant: 'danger' });
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  return (
    <div className="relative z-10 mx-auto max-w-7xl space-y-8 animate-slide-up">
      {/* Hero Banner */}
      <section className="glass-card-heavy relative overflow-hidden rounded-3xl border-none p-0">
        <img
          src="/images/card-bg-global-network.png"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover opacity-20 mix-blend-multiply dark:opacity-35 dark:mix-blend-screen"
        />
        <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-primary-500/20 blur-[70px]" />
        <div className="absolute -bottom-16 left-1/4 h-48 w-48 rounded-full bg-ai-500/20 blur-[80px]" />

        <div className="relative flex flex-col gap-5 p-8 sm:flex-row sm:items-center sm:justify-between lg:p-10">
          <div>
            <Badge variant="primary" size="sm" icon={<Calendar size={12} strokeWidth={1.75} />}>
              Interview center
            </Badge>
            <h1 className="mt-3 text-h1 text-secondary-900 dark:text-white">Interviews Hub</h1>
            <p className="mt-2 max-w-2xl text-body-sm text-secondary-500 dark:text-secondary-300">
              Schedule shortlisted candidates from closed jobs, assign Hiring Managers, and track scheduled interviews.
            </p>
          </div>
          <div className="hidden h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-primary-500 to-ai-600 text-white shadow-glow-primary sm:flex">
            <Video size={42} strokeWidth={1.5} />
          </div>
        </div>
      </section>

      {/* Stat Cards */}
      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard
          label="Pending Scheduling"
          value={stats.pending}
          icon={UserCheck}
          trend={{ direction: 'up', value: 'shortlisted on closed jobs' }}
          className="animate-counter glass-card-heavy border-none"
        />
        <StatCard
          label="Upcoming Interviews"
          value={stats.upcoming}
          icon={CalendarClock}
          trend={{ direction: 'up', value: 'next 7 days' }}
          className="animate-counter glass-card-heavy border-none"
        />
        <StatCard
          label="Completed Interviews"
          value={stats.completed}
          icon={CheckCircle2}
          trend={{ direction: 'up', value: 'total done' }}
          className="animate-counter glass-card-heavy border-none"
        />
      </section>

      {/* Main Section Navigation / Tabs */}
      <div className="flex flex-col gap-4 border-b border-secondary-200 dark:border-secondary-800 pb-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('pending')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${
              activeTab === 'pending'
                ? 'bg-primary-500 text-white shadow-glow-primary'
                : 'text-secondary-600 dark:text-secondary-400 hover:bg-secondary-100 dark:hover:bg-secondary-800'
            }`}
          >
            <UserCheck size={16} />
            Pending Scheduling
            {pendingShortlisted.length > 0 && (
              <span className="ml-1 rounded-full bg-white/20 px-2 py-0.5 text-xs">
                {pendingShortlisted.length}
              </span>
            )}
          </button>
          
          <button
            onClick={() => setActiveTab('scheduled')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${
              activeTab === 'scheduled'
                ? 'bg-primary-500 text-white shadow-glow-primary'
                : 'text-secondary-600 dark:text-secondary-400 hover:bg-secondary-100 dark:hover:bg-secondary-800'
            }`}
          >
            <CalendarClock size={16} />
            Scheduled Interviews ({interviews.length})
          </button>
        </div>
      </div>

      {/* TAB 1: PENDING SCHEDULING QUEUE */}
      {activeTab === 'pending' && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-h4 text-secondary-900 dark:text-white flex items-center gap-2">
              <Sparkles size={18} className="text-ai-500" />
              Shortlisted Candidates Ready for Scheduling
            </h2>
            <span className="text-caption text-secondary-500">
              Filtered from closed jobs
            </span>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Skeleton height="10rem" className="rounded-2xl" />
              <Skeleton height="10rem" className="rounded-2xl" />
              <Skeleton height="10rem" className="rounded-2xl" />
            </div>
          ) : pendingShortlisted.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {pendingShortlisted.map((app) => (
                <Card key={app.id} className="glass-card-heavy border-none relative flex flex-col justify-between p-6 hover:-translate-y-1 transition-all">
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <h3 className="text-h4 text-secondary-900 dark:text-white font-bold">
                          {app.candidateName}
                        </h3>
                        <p className="text-body-sm text-secondary-500 dark:text-secondary-400">
                          {app.jobTitle}
                        </p>
                      </div>
                      <StatusBadge status="shortlisted" />
                    </div>
                    {app.aiMatchScore > 0 && (
                      <div className="inline-flex items-center gap-1.5 rounded-lg bg-ai-50 dark:bg-ai-900/20 px-2.5 py-1 text-xs font-semibold text-ai-700 dark:text-ai-300 mb-4">
                        <Sparkles size={12} /> {app.aiMatchScore}% AI Score
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-secondary-100 dark:border-secondary-800 flex items-center justify-between gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/recruiter/applications/${app.id}`)}
                    >
                      View Details
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      leftIcon={<Calendar size={14} />}
                      onClick={() => handleOpenScheduleModal(app)}
                    >
                      Schedule Interview
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="glass-card-heavy border-none">
              <EmptyState
                icon={UserCheck}
                title="No shortlisted candidates pending scheduling"
                description="When you mark candidates as Shortlisted and finalize/close a job posting, they will appear here ready to be scheduled."
              />
            </Card>
          )}
        </section>
      )}

      {/* TAB 2: SCHEDULED INTERVIEWS */}
      {activeTab === 'scheduled' && (
        <section className="space-y-6">
          {/* Filters UI */}
          <div className="relative flex flex-col items-start gap-6 rounded-[20px] border border-white/5 bg-[#0b0e1e] p-6 sm:flex-row sm:items-end shadow-2xl">
            <div className="relative z-10 flex h-[42px] items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-[#a3adc2]">
              <Filter size={15} strokeWidth={2} />
              Filters
            </div>
            
            <div className="relative z-10 grid w-full grid-cols-1 gap-4 sm:w-auto sm:grid-cols-2">
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

          {/* Interview Cards Grid */}
          {loading ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
              <Skeleton height="12rem" className="rounded-2xl" />
              <Skeleton height="12rem" className="rounded-2xl" />
              <Skeleton height="12rem" className="rounded-2xl" />
            </div>
          ) : filteredInterviews.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
              {filteredInterviews.map((interview, index) => {
                const relDay = formatRelativeDay(interview.scheduledTime);

                return (
                  <div
                    key={interview.id}
                    onClick={() => handleViewInterview(interview)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        handleViewInterview(interview);
                      }
                    }}
                    role="button"
                    tabIndex={0}
                    className="group relative block h-full cursor-pointer overflow-hidden rounded-[20px] bg-[#0f1225] border border-white/5 p-0 transition-all duration-base hover:-translate-y-1 shadow-xl"
                    style={{ animationDelay: `${index * 60}ms` }}
                  >
                    <div className="absolute top-0 left-0 right-0 h-[6px] bg-gradient-to-r from-[#6366f1] via-[#8b5cf6] to-[#6366f1]" />
                    <div className="relative p-6 pt-7">
                      <div className="mb-5 flex items-start justify-between gap-3">
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white text-sm font-bold tracking-wide text-[#2563eb] shadow-sm">
                            {interview.candidateName
                              .split(' ')
                              .map((n) => n[0])
                              .join('')
                              .toUpperCase()
                              .substring(0, 2)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="truncate text-[16px] font-bold text-white transition-colors group-hover:text-primary-300">
                              {interview.candidateName}
                            </h3>
                            <p className="truncate text-[13px] font-medium text-[#94a3b8] mt-0.5">
                              {interview.jobTitle}
                            </p>
                          </div>
                        </div>
                        <div className="shrink-0">
                          <StatusBadge status={interview.status?.toLowerCase().replace(/ /g, '_')} />
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center gap-3 rounded-2xl bg-[#191e36] p-4 border border-white/[0.03]">
                          <CalendarClock size={18} strokeWidth={2} className="shrink-0 text-[#8b5cf6]" />
                          <div className="min-w-0 flex-1">
                            <p className="text-[14px] font-bold text-white">
                              {formatScheduledTime(interview.scheduledTime)}
                            </p>
                            <p className="text-[12px] font-medium text-[#94a3b8] mt-0.5">
                              {interview.durationMinutes} min · {interview.interviewType}
                            </p>
                          </div>
                          {relDay && (
                            <span className="shrink-0 rounded-full bg-white px-2.5 py-1 text-[11px] font-extrabold tracking-wide text-[#8b5cf6] shadow-sm">
                              {relDay}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center justify-between pl-1">
                          <p className="text-[13px] font-medium text-[#64748b]">
                            with {interview.interviewerName}
                          </p>
                          <div className="flex items-center gap-2">
                            {interview.meetingLink && (
                              <div className="flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-[12px] font-bold text-[#6366f1] shadow-sm">
                                <Video size={14} strokeWidth={2.5} />
                                Video
                              </div>
                            )}
                            <Button
                              type="button"
                              variant="ai"
                              size="sm"
                              leftIcon={<Sparkles size={14} />}
                              onClick={(event) => {
                                event.stopPropagation();
                                navigate(`/recruiter/interviews/${interview.id}/live-copilot`);
                              }}
                            >
                              Live Copilot
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <Card className="glass-card-heavy border-none">
              <EmptyState
                icon={CalendarClock}
                title="No interviews match these filters"
                description="Adjust the date or status filters to review more scheduled interviews."
              />
            </Card>
          )}
        </section>
      )}

      {/* SCHEDULING NEW INTERVIEW MODAL */}
      <Modal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        title={`Schedule Interview: ${selectedApp?.candidateName || ''}`}
        size="lg"
      >
        <form onSubmit={handleSubmitSchedule} className="space-y-4 pt-2">
          <p className="text-body-sm text-secondary-600 dark:text-secondary-300 mb-4">
            Position: <strong>{selectedApp?.jobTitle}</strong>
          </p>

          <Select
            label="Assign Hiring Manager"
            options={hiringManagers}
            value={interviewForm.interviewerId}
            onChange={handleFormChange('interviewerId')}
            required
          />

          <Select
            label="Interview Type"
            options={interviewTypeOptions}
            value={interviewForm.interviewType}
            onChange={handleFormChange('interviewType')}
            required
          />

          <DateTimeInput
            label="Scheduled Time"
            value={interviewForm.scheduledTime}
            onChange={handleFormChange('scheduledTime')}
            min={new Date().toISOString().slice(0, 16)}
            required
          />

          <Input
            label="Duration (Minutes)"
            type="number"
            min="15"
            step="15"
            value={interviewForm.durationMinutes}
            onChange={handleFormChange('durationMinutes')}
            required
          />

          <Input
            label="Meeting Link (Video)"
            type="url"
            value={interviewForm.meetingLink}
            onChange={handleFormChange('meetingLink')}
            placeholder="https://meet.example.com/interview"
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-secondary-100 dark:border-secondary-800">
            <Button type="button" variant="outline" onClick={() => setIsScheduleModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={isSubmittingSchedule}>
              {isSubmittingSchedule ? 'Saving...' : 'Confirm Schedule'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* VIEW / EDIT SCHEDULED INTERVIEW DETAILS MODAL */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setIsEditMode(false);
        }}
        title={isEditMode ? `Edit Interview: ${selectedInterview?.candidateName}` : `Interview Details: ${selectedInterview?.candidateName}`}
        size="lg"
      >
        {selectedInterview && (
          <div>
            {!isEditMode ? (
              /* VIEW MODE */
              <div className="space-y-5 pt-1">
                <div className="flex items-center justify-between pb-3 border-b border-secondary-100 dark:border-secondary-800">
                  <div>
                    <h3 className="text-h4 font-bold text-secondary-900 dark:text-white">
                      {selectedInterview.candidateName}
                    </h3>
                    <p className="text-body-sm text-secondary-500 dark:text-secondary-400">
                      {selectedInterview.jobTitle}
                    </p>
                  </div>
                  <StatusBadge status={selectedInterview.status?.toLowerCase().replace(/ /g, '_')} />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="rounded-xl bg-secondary-50 dark:bg-secondary-800/50 p-4">
                    <p className="text-xs font-bold uppercase tracking-wider text-secondary-400 mb-1 flex items-center gap-1.5">
                      <CalendarClock size={14} /> Scheduled Date & Time
                    </p>
                    <p className="text-body-sm font-semibold text-secondary-900 dark:text-white">
                      {formatScheduledTime(selectedInterview.scheduledTime)}
                    </p>
                    <p className="text-xs text-secondary-500 mt-0.5">
                      Duration: {selectedInterview.durationMinutes} mins
                    </p>
                  </div>

                  <div className="rounded-xl bg-secondary-50 dark:bg-secondary-800/50 p-4">
                    <p className="text-xs font-bold uppercase tracking-wider text-secondary-400 mb-1 flex items-center gap-1.5">
                      <UserCheck size={14} /> Interviewer
                    </p>
                    <p className="text-body-sm font-semibold text-secondary-900 dark:text-white">
                      {selectedInterview.interviewerName}
                    </p>
                    <p className="text-xs text-secondary-500 mt-0.5">
                      Type: {selectedInterview.interviewType}
                    </p>
                  </div>
                </div>

                {selectedInterview.meetingLink && (
                  <div className="rounded-xl bg-primary-500/10 border border-primary-200/50 p-4">
                    <p className="text-xs font-bold uppercase tracking-wider text-primary-700 dark:text-primary-300 mb-1 flex items-center gap-1.5">
                      <Video size={14} /> Video Meeting Link
                    </p>
                    <a
                      href={selectedInterview.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-body-sm font-semibold text-primary-600 dark:text-primary-400 underline break-all inline-flex items-center gap-1 hover:text-primary-700"
                    >
                      {selectedInterview.meetingLink} <ExternalLink size={12} />
                    </a>
                  </div>
                )}

                {selectedInterview.notes && (
                  <div className="rounded-xl bg-secondary-50 dark:bg-secondary-800/50 p-4">
                    <p className="text-xs font-bold uppercase tracking-wider text-secondary-400 mb-1">
                      Notes
                    </p>
                    <p className="text-body-sm text-secondary-700 dark:text-secondary-300 whitespace-pre-wrap">
                      {selectedInterview.notes}
                    </p>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-secondary-100 dark:border-secondary-800">
                  <Button
                    variant="outline"
                    leftIcon={<ExternalLink size={14} />}
                    onClick={() => {
                      setIsViewModalOpen(false);
                      navigate(`/recruiter/applications/${selectedInterview.applicationId}`);
                    }}
                  >
                    View Candidate Application
                  </Button>
                  <div className="flex gap-2 w-full sm:w-auto justify-end">
                    <Button
                      variant="ai"
                      leftIcon={<Sparkles size={14} />}
                      onClick={() => {
                        setIsViewModalOpen(false);
                        navigate(`/recruiter/interviews/${selectedInterview.id}/live-copilot`);
                      }}
                    >
                      Live Copilot
                    </Button>
                    <Button
                      variant="primary"
                      leftIcon={<Edit size={14} />}
                      onClick={() => setIsEditMode(true)}
                    >
                      Edit Details
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              /* EDIT MODE */
              <form onSubmit={handleSaveInterviewEdits} className="space-y-4 pt-1">
                <Select
                  label="Assign Hiring Manager"
                  options={hiringManagers}
                  value={editForm.interviewerId}
                  onChange={handleEditFormChange('interviewerId')}
                  required
                />

                <Select
                  label="Interview Type"
                  options={interviewTypeOptions}
                  value={editForm.interviewType}
                  onChange={handleEditFormChange('interviewType')}
                  required
                />

                <Select
                  label="Interview Status"
                  options={interviewStatusOptions}
                  value={editForm.status}
                  onChange={handleEditFormChange('status')}
                  required
                />

                <DateTimeInput
                  label="Scheduled Time"
                  value={editForm.scheduledTime}
                  onChange={handleEditFormChange('scheduledTime')}
                  required
                />

                <Input
                  label="Duration (Minutes)"
                  type="number"
                  min="15"
                  step="15"
                  value={editForm.durationMinutes}
                  onChange={handleEditFormChange('durationMinutes')}
                  required
                />

                <Input
                  label="Meeting Link (Video)"
                  type="url"
                  value={editForm.meetingLink}
                  onChange={handleEditFormChange('meetingLink')}
                  placeholder="https://meet.example.com/interview"
                />

                <div>
                  <label className="block text-caption font-medium text-secondary-700 dark:text-secondary-300 mb-1">
                    Notes
                  </label>
                  <textarea
                    value={editForm.notes}
                    onChange={handleEditFormChange('notes')}
                    rows={3}
                    className="w-full rounded-xl border border-secondary-200 bg-white p-3 text-body-sm dark:border-secondary-700 dark:bg-secondary-800 dark:text-white"
                    placeholder="Add interview notes or instructions..."
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-secondary-100 dark:border-secondary-800">
                  <Button type="button" variant="outline" onClick={() => setIsEditMode(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" disabled={isSubmittingEdit}>
                    {isSubmittingEdit ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </form>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
