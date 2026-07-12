import React, { useState, useEffect } from 'react';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Spinner from '../../components/ui/Spinner';
import { useToast } from '../../lib/ToastContext';
import api from '../../api';
import { Copy } from 'lucide-react';

const DepartmentDetailModal = ({ isOpen, onClose, department }) => {
  const { showToast } = useToast();
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Form state
  const [email, setEmail] = useState('');
  const [roleName, setRoleName] = useState('Recruiter');
  const [inviting, setInviting] = useState(false);
  
  // Success state for displaying link
  const [lastInviteUrl, setLastInviteUrl] = useState(null);

  useEffect(() => {
    if (isOpen && department) {
      fetchInvitations();
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
      <div className="space-y-8">
        {/* Staff Section */}
        <section>
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-3">Staff</h3>
          <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800 text-center text-slate-500 dark:text-slate-400">
            No staff assigned yet.
          </div>
        </section>

        {/* Pending Invitations Section */}
        <section>
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-3">Pending Invitations</h3>
          
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            {loading ? (
              <div className="flex justify-center p-6">
                <Spinner size="md" className="text-indigo-600" />
              </div>
            ) : invitations.length === 0 ? (
              <div className="p-6 text-center text-slate-500 dark:text-slate-400 text-sm">
                No pending invitations.
              </div>
            ) : (
              <ul className="divide-y divide-slate-100 dark:divide-slate-700">
                {invitations.map(inv => (
                  <li key={inv.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="font-medium text-slate-800 dark:text-slate-100">{inv.email}</div>
                      <div className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-0.5">
                        <span className="bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded text-xs">
                          {inv.roleName}
                        </span>
                        <span>•</span>
                        <span className={inv.status === 'Pending' ? 'text-amber-600 dark:text-amber-500' : ''}>
                          {inv.status}
                        </span>
                        <span>•</span>
                        <span>Expires: {new Date(inv.expiresAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    
                    {inv.status === 'Pending' && (
                      <Button 
                        variant="secondary" 
                        size="sm" 
                        onClick={() => handleRevoke(inv.id)}
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

        {/* Invite Someone Section */}
        <section>
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-3">Invite Someone</h3>
          <div className="bg-slate-50 dark:bg-slate-900/50 p-5 rounded-xl border border-slate-200 dark:border-slate-800">
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
