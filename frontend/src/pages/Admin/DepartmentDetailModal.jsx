import React, { useEffect, useState } from 'react';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Spinner from '../../components/ui/Spinner';
import { useToast } from '../../lib/ToastContext';
import api from '../../api';
import { Copy } from 'lucide-react';

const DepartmentDetailModal = ({ isOpen, onClose, department, allDepartments }) => {
  const { toast } = useToast();
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [staffList, setStaffList] = useState([]);
  const [loadingStaff, setLoadingStaff] = useState(false);
  const [email, setEmail] = useState('');
  const [roleName, setRoleName] = useState('Recruiter');
  const [inviting, setInviting] = useState(false);
  const [lastInviteUrl, setLastInviteUrl] = useState(null);

  useEffect(() => {
    if (isOpen && department) {
      fetchInvitations();
      fetchStaff();
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
    } catch {
      try { toast({ title: 'Failed to load pending invitations.', variant: 'danger' }); } catch (e) {}
    } finally {
      setLoading(false);
    }
  };

  const fetchStaff = async () => {
    try {
      setLoadingStaff(true);
      const response = await api.get(`/staff?departmentId=${department.id}`);
      setStaffList(response.data);
    } catch {
      try { toast({ title: 'Failed to load staff.', variant: 'danger' }); } catch (e) {}
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
      fetchStaff();
      try { toast({ title: `Staff member ${currentStatus ? 'deactivated' : 'activated'} successfully.`, variant: 'success' }); } catch (e) {}
    } catch (error) {
      try { toast({ title: error.response?.data?.message || 'Failed to update status.', variant: 'danger' }); } catch (e) {}
    }
  };

  const handleReassign = async (staffId, newDepartmentId) => {
    if (!newDepartmentId || newDepartmentId == department.id) return;

    try {
      await api.put(`/staff/${staffId}/reassign-department`, { departmentId: parseInt(newDepartmentId) });
      fetchStaff();
      try { toast({ title: 'Staff member reassigned successfully.', variant: 'success' }); } catch (e) {}
    } catch (error) {
      try { toast({ title: error.response?.data?.message || 'Failed to reassign staff.', variant: 'danger' }); } catch (e) {}
    }
  };

  const handleRevoke = async (id) => {
    try {
      await api.post(`/invitations/${id}/revoke`);
      fetchInvitations();
      try { toast({ title: 'Invitation revoked successfully.', variant: 'success' }); } catch (e) {}
    } catch (error) {
      try { toast({ title: error.response?.data?.message || 'Failed to revoke invitation.', variant: 'danger' }); } catch (e) {}
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
        departmentId: department.id,
      });

      setEmail('');
      setLastInviteUrl(response.data.acceptUrl);
      fetchInvitations();
      try { toast({ title: 'Invitation sent successfully.', variant: 'success' }); } catch (e) {}
    } catch (error) {
      try { toast({ title: error.response?.data?.message || 'Failed to send invitation.', variant: 'danger' }); } catch (e) {}
    } finally {
      setInviting(false);
    }
  };

  const handleCopyLink = () => {
    if (lastInviteUrl) {
      navigator.clipboard.writeText(lastInviteUrl);
      try { toast({ title: 'Link copied to clipboard.', variant: 'success' }); } catch (e) {}
    }
  };

  if (!department) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={department.name} size="2xl">
      <div className="space-y-6">
        <section className="pb-2">
          <h3 className="mb-3 text-body-lg font-semibold text-secondary-800 dark:text-secondary-100">
            Staff
          </h3>

          <div className="overflow-visible rounded-xl border border-secondary-200 bg-white dark:border-secondary-700 dark:bg-secondary-800">
            {loadingStaff ? (
              <div className="flex justify-center p-6">
                <Spinner size="md" className="text-primary-700" />
              </div>
            ) : staffList.length === 0 ? (
              <div className="p-6 text-center text-body-sm text-secondary-500 dark:text-secondary-400">
                No staff assigned yet.
              </div>
            ) : (
              <ul className="divide-y divide-secondary-100 dark:divide-secondary-700">
                {staffList.map((staff) => (
                  <li key={staff.id} className="flex flex-col gap-3 p-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="min-w-0">
                      <div className="break-words font-medium text-secondary-800 dark:text-secondary-100">
                        {staff.firstName} {staff.lastName}
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-body-sm text-secondary-500 dark:text-secondary-400">
                        <span className="rounded bg-secondary-100 px-2 py-0.5 text-xs dark:bg-secondary-700">
                          {staff.roleName}
                        </span>
                        <span aria-hidden="true">•</span>
                        <span className="break-all">{staff.email}</span>
                        <span aria-hidden="true">•</span>
                        <span className={staff.isActive ? 'text-emerald-600 dark:text-emerald-500' : 'text-slate-400'}>
                          {staff.isActive ? 'Active' : 'Inactive'}
                        </span>
                        {staff.lastLoginAt && (
                          <>
                            <span aria-hidden="true">•</span>
                            <span>Last login: {new Date(staff.lastLoginAt).toLocaleDateString()}</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:items-center">
                      <div className="relative z-30 w-full sm:w-44">
                        <Select
                          placeholder="Move to..."
                          value=""
                          dropdownClassName="absolute z-[120] mt-2 w-full rounded-xl border border-secondary-200 bg-white py-1 shadow-2xl dark:border-[#3a4368] dark:!bg-[#1e2338]"
                          onChange={(e) => handleReassign(staff.id, e.target.value)}
                          options={allDepartments
                            ?.filter((d) => d.id !== department.id)
                            .map((d) => ({ value: d.id, label: d.name })) || []}
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

        <section>
          <h3 className="mb-3 text-body-lg font-semibold text-secondary-800 dark:text-secondary-100">
            Pending Invitations
          </h3>

          <div className="overflow-visible rounded-xl border border-secondary-200 bg-white dark:border-secondary-700 dark:bg-secondary-800">
            {loading ? (
              <div className="flex justify-center p-6">
                <Spinner size="md" className="text-primary-700" />
              </div>
            ) : invitations.length === 0 ? (
              <div className="p-6 text-center text-body-sm text-secondary-500 dark:text-secondary-400">
                No pending invitations.
              </div>
            ) : (
              <ul className="divide-y divide-secondary-100 dark:divide-secondary-700">
                {invitations.map((inv) => (
                  <li key={inv.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <div className="break-all font-medium text-secondary-800 dark:text-secondary-100">
                        {inv.email}
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-body-sm text-secondary-500 dark:text-secondary-400">
                        <span className="rounded bg-secondary-100 px-2 py-0.5 text-xs dark:bg-secondary-700">
                          {inv.roleName}
                        </span>
                        <span aria-hidden="true">•</span>
                        <span className={inv.status === 'Pending' ? 'text-amber-600 dark:text-amber-500' : ''}>
                          {inv.status}
                        </span>
                        <span aria-hidden="true">•</span>
                        <span>Expires: {new Date(inv.expiresAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {inv.status === 'Pending' && (
                      <Button variant="secondary" size="sm" onClick={() => handleRevoke(inv.id)}>
                        Revoke
                      </Button>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        <section>
          <h3 className="mb-3 text-body-lg font-semibold text-secondary-800 dark:text-secondary-100">
            Invite Someone
          </h3>
          <div className="rounded-xl border border-secondary-200 bg-secondary-50 p-5 dark:border-secondary-800 dark:bg-secondary-900/50">
            <form onSubmit={handleInviteSubmit} className="flex flex-col items-end gap-4 sm:flex-row">
              <div className="w-full flex-1">
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
                    { value: 'HiringManager', label: 'Hiring Manager' },
                  ]}
                />
              </div>
              <Button type="submit" variant="primary" isLoading={inviting} className="h-10 w-full sm:w-auto">
                Send Invite
              </Button>
            </form>

            {lastInviteUrl && (
              <div className="mt-4 flex flex-col gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-800/30 dark:bg-emerald-900/20">
                <p className="text-sm font-medium text-emerald-800 dark:text-emerald-300">
                  Invitation email sent!
                </p>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <p className="text-xs text-emerald-600 dark:text-emerald-400">
                    If the email does not arrive, you can copy this link directly.
                  </p>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    leftIcon={<Copy size={14} />}
                    onClick={handleCopyLink}
                    className="border-emerald-300 text-emerald-700 hover:bg-emerald-100 dark:border-emerald-700 dark:text-emerald-300 dark:hover:bg-emerald-800/50"
                  >
                    Copy Link
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
