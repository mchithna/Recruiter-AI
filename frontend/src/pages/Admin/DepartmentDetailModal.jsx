import React, { useState, useEffect } from 'react';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Spinner from '../../components/ui/Spinner';
import { useToast } from '../../lib/ToastContext';
import api from '../../api';
import { Copy, Mail, Users } from 'lucide-react';

const initials = (first, last) => {
  return `${first?.[0] || ''}${last?.[0] || ''}`.toUpperCase() || '?';
};

const STATUS_PILL_STYLES = {
  Pending: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400',
  Revoked: 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400',
  Accepted: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400',
  Expired: 'bg-secondary-100 text-secondary-600 dark:bg-secondary-800 dark:text-secondary-400'
};

const StatusPill = ({ status }) => (
  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_PILL_STYLES[status] || STATUS_PILL_STYLES.Expired}`}>
    {status}
  </span>
);

const DepartmentDetailModal = ({ isOpen, onClose, department, allDepartments }) => {
  const { showToast } = useToast();
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(false);

  const [staffList, setStaffList] = useState([]);
  const [loadingStaff, setLoadingStaff] = useState(false);

  // Form state
  const [email, setEmail] = useState('');
  const [roleName, setRoleName] = useState('Recruiter');
  const [inviting, setInviting] = useState(false);

  // Success state for displaying link
  const [lastInviteUrl, setLastInviteUrl] = useState(null);

  useEffect(() => {
    if (isOpen && department) {
      fetchInvitations();
      fetchStaff();
      // Reset form and success state when opening a new department
      setEmail('');
      setRoleName('Recruiter');
      setLastInviteUrl(null);
    }
  }, [isOpen, department]);

  const fetchInvitations = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/invitations?departmentId=${department.id}`);
      setInvitations(response.data);
    } catch (error) {
      showToast('Failed to load pending invitations.', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const fetchStaff = async () => {
    try {
      setLoadingStaff(true);
      const response = await api.get(`/staff?departmentId=${department.id}`);
      setStaffList(response.data);
    } catch (error) {
      showToast('Failed to load staff.', 'danger');
    } finally {
      setLoadingStaff(false);
    }
  };

  const handleToggleStatus = async (staffId, currentStatus) => {
    try {
      if (currentStatus) {
        await api.put(`/staff/${staffId}/deactivate`);
      } else {
        await api.put(`/staff/${staffId}/reactivate`);
      }
      showToast(`Staff member ${currentStatus ? 'deactivated' : 'activated'} successfully.`, 'success');
      fetchStaff();
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to update status.', 'danger');
    }
  };

  const handleReassign = async (staffId, newDepartmentId) => {
    if (!newDepartmentId || newDepartmentId == department.id) return;
    try {
      await api.put(`/staff/${staffId}/reassign-department`, { departmentId: parseInt(newDepartmentId) });
      showToast('Staff member reassigned successfully.', 'success');
      fetchStaff();
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to reassign staff.', 'danger');
    }
  };

  const handleRevoke = async (id) => {
    try {
      await api.post(`/invitations/${id}/revoke`);
      showToast('Invitation revoked successfully.', 'success');
      fetchInvitations();
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to revoke invitation.', 'danger');
    }
  };

  const handleInviteSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    try {
      setInviting(true);
      setLastInviteUrl(null);
      const response = await api.post('/invitations', {
        email,
        roleName,
        departmentId: department.id
      });

      showToast('Invitation sent successfully.', 'success');
      setEmail('');
      setLastInviteUrl(response.data.acceptUrl);
      fetchInvitations();
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to send invitation.', 'danger');
    } finally {
      setInviting(false);
    }
  };

  const handleCopyLink = () => {
    if (lastInviteUrl) {
      navigator.clipboard.writeText(lastInviteUrl);
      showToast('Link copied to clipboard.', 'success');
    }
  };

  if (!department) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={department.name}
      size="xl"
    >
      <div className="flex flex-col max-h-[75vh]">
        <div className="flex-1 min-h-0 overflow-y-auto pr-1 space-y-8">
          {/* Staff Section */}
          <section>
            <h3 className="text-body-lg font-semibold text-secondary-800 dark:text-secondary-100 mb-3">Staff</h3>

            <div className="bg-white dark:bg-secondary-800 rounded-xl border border-secondary-200 dark:border-secondary-700">
              {loadingStaff ? (
                <div className="flex justify-center p-6">
                  <Spinner size="md" className="text-primary-700" />
                </div>
              ) : staffList.length === 0 ? (
                <div className="p-8 flex flex-col items-center text-center">
                  <div className="w-10 h-10 rounded-full bg-secondary-100 dark:bg-secondary-700 flex items-center justify-center mb-2 text-secondary-400">
                    <Users size={18} />
                  </div>
                  <p className="text-secondary-500 dark:text-secondary-400 text-body-sm">No staff assigned yet.</p>
                </div>
              ) : (
                <ul className="divide-y divide-secondary-100 dark:divide-secondary-700">
                  {staffList.map((staff) => (
                    <li key={staff.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold ${staff.isActive ? 'bg-primary-50 text-primary-700 dark:bg-primary-500/10 dark:text-primary-400' : 'bg-secondary-100 text-secondary-400 dark:bg-secondary-700 dark:text-secondary-500'}`}>
                          {initials(staff.firstName, staff.lastName)}
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium text-secondary-800 dark:text-secondary-100 truncate">
                            {staff.firstName} {staff.lastName}
                          </div>
                          <div className="text-body-sm text-secondary-500 dark:text-secondary-400 flex items-center flex-wrap gap-x-2 gap-y-0.5 mt-0.5">
                            <span className="bg-secondary-100 dark:bg-secondary-700 px-2 py-0.5 rounded-full text-xs">
                              {staff.roleName}
                            </span>
                            <span className="truncate">{staff.email}</span>
                            <span className={staff.isActive ? 'text-emerald-600 dark:text-emerald-500' : 'text-slate-400'}>
                              {staff.isActive ? 'Active' : 'Inactive'}
                            </span>
                            {staff.lastLoginAt && (
                              <span>Last login: {new Date(staff.lastLoginAt).toLocaleDateString()}</span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <div className="w-36">
                          <Select
                            placeholder="Move to..."
                            value=""
                            onChange={(e) => handleReassign(staff.id, e.target.value)}
                            options={allDepartments
                              ?.filter(d => d.id !== department.id)
                              .map(d => ({ value: d.id, label: d.name })) || []}
                          />
                        </div>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleToggleStatus(staff.id, staff.isActive)}
                        >
                          {staff.isActive ? 'Deactivate' : 'Activate'}
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>

          {/* Pending Invitations Section */}
          <section>
            <h3 className="text-body-lg font-semibold text-secondary-800 dark:text-secondary-100 mb-3">Pending Invitations</h3>

            <div className="bg-white dark:bg-secondary-800 rounded-xl border border-secondary-200 dark:border-secondary-700 overflow-hidden">
              {loading ? (
                <div className="flex justify-center p-6">
                  <Spinner size="md" className="text-primary-700" />
                </div>
              ) : invitations.length === 0 ? (
                <div className="p-6 text-center text-secondary-500 dark:text-secondary-400 text-body-sm">
                  No pending invitations.
                </div>
              ) : (
                <ul className="divide-y divide-secondary-100 dark:divide-secondary-700">
                  {invitations.map(inv => (
                    <li key={inv.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="flex-shrink-0 w-9 h-9 rounded-full bg-secondary-100 dark:bg-secondary-700 flex items-center justify-center text-secondary-400">
                          <Mail size={15} />
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium text-secondary-800 dark:text-secondary-100 truncate">{inv.email}</div>
                          <div className="text-body-sm text-secondary-500 dark:text-secondary-400 flex items-center flex-wrap gap-x-2 gap-y-1 mt-1">
                            <span className="bg-secondary-100 dark:bg-secondary-700 px-2 py-0.5 rounded-full text-xs">
                              {inv.roleName}
                            </span>
                            <StatusPill status={inv.status} />
                            <span>Expires: {new Date(inv.expiresAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>

                      {inv.status === 'Pending' && (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleRevoke(inv.id)}
                          className="flex-shrink-0"
                        >
                          Revoke
                        </Button>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        </div>

        {/* Invite Someone Section — pinned outside the scroll area so it's always reachable */}
        <section className="pt-6 mt-6 border-t border-secondary-200 dark:border-secondary-800 flex-shrink-0">
          <h3 className="text-body-lg font-semibold text-secondary-800 dark:text-secondary-100 mb-3">Invite Someone</h3>
          <div className="bg-secondary-50 dark:bg-secondary-900/50 p-5 rounded-xl border border-secondary-200 dark:border-secondary-800">
            <form onSubmit={handleInviteSubmit} className="flex flex-col sm:flex-row gap-4 items-end">
              <div className="flex-1 w-full">
                <Input
                  label="Email Address"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="colleague@example.com"
                  required
                />
              </div>
              <div className="w-full sm:w-48">
                <Select
                  label="Role"
                  value={roleName}
                  onChange={(e) => setRoleName(e.target.value)}
                  options={[
                    { value: 'Recruiter', label: 'Recruiter' },
                    { value: 'HiringManager', label: 'Hiring Manager' }
                  ]}
                />
              </div>
              <Button type="submit" variant="primary" isLoading={inviting} className="w-full sm:w-auto h-10 mt-1">
                Send Invite
              </Button>
            </form>

            {lastInviteUrl && (
              <div className="mt-4 p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/30 rounded-lg flex flex-col gap-2">
                <p className="text-sm text-emerald-800 dark:text-emerald-300 font-medium">
                  Invitation email sent!
                </p>
                <div className="flex items-center gap-3">
                  <p className="text-xs text-emerald-600 dark:text-emerald-400">
                    If the email doesn't arrive, you can copy this link directly:
                  </p>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={handleCopyLink}
                    className="flex items-center gap-1.5 text-emerald-700 border-emerald-300 hover:bg-emerald-100 dark:text-emerald-300 dark:border-emerald-700 dark:hover:bg-emerald-800/50"
                  >
                    <Copy size={14} /> Copy Link
                  </Button>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </Modal>
  );
};

export default DepartmentDetailModal;