import React, { useState, useEffect } from 'react';
import Spinner from '../../components/ui/Spinner';
import Button from '../../components/ui/Button';
import { useToast } from '../../lib/ToastContext';
import api from '../../api';

const formatAction = (action) => {
  if (!action) return 'unknown action';
  return action.toLowerCase().replace(/_/g, ' ');
};

const ActivityLog = () => {
  const [logs, setLogs] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const pageSize = 15;
  const { showToast } = useToast();

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/activity-log?page=${page}&pageSize=${pageSize}`);
        
        const data = response.data;
        if (Array.isArray(data)) {
          setLogs(data);
          setTotalCount(data.length);
        } else {
          setLogs(data.items || data.data || []);
          setTotalCount(data.totalCount || data.total || 0);
        }
      } catch (error) {
        showToast('Failed to load activity log.', 'danger');
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, [page, showToast]);

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h3 className="text-h3 font-bold text-secondary-900 dark:text-white">Activity Log</h3>
        <p className="text-secondary-500 dark:text-secondary-400 text-body-sm mt-1">
          Track actions and changes made across the platform.
        </p>
      </div>

      <div className="bg-white dark:bg-secondary-800 rounded-xl border border-secondary-200 dark:border-secondary-700 shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-secondary-50 dark:bg-secondary-900/50 border-b border-secondary-200 dark:border-secondary-700">
                <th className="p-4 text-body-sm font-semibold text-secondary-600 dark:text-secondary-300">Time</th>
                <th className="p-4 text-body-sm font-semibold text-secondary-600 dark:text-secondary-300">Actor</th>
                <th className="p-4 text-body-sm font-semibold text-secondary-600 dark:text-secondary-300">Action</th>
                <th className="p-4 text-body-sm font-semibold text-secondary-600 dark:text-secondary-300">Entity</th>
              </tr>
            </thead>
            <tbody>
              {loading && logs.length === 0 ? (
                <tr>
                  <td colSpan="4" className="p-8 text-center">
                    <Spinner size="md" className="text-primary-700 mx-auto" />
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan="4" className="p-8 text-center text-secondary-500 dark:text-secondary-400">
                    No activity logs found.
                  </td>
                </tr>
              ) : (
                logs.map((log, idx) => (
                  <tr key={log.id || idx} className="border-b border-secondary-100 dark:border-secondary-700/50 hover:bg-secondary-50 dark:hover:bg-secondary-800/50 transition-colors">
                    <td className="p-4 text-body-sm text-secondary-500 dark:text-secondary-400 whitespace-nowrap">
                      {log.occurredAt ? new Date(log.occurredAt).toLocaleString() : '-'}
                    </td>
                    <td className="p-4 text-body-sm font-medium text-secondary-900 dark:text-secondary-100">
                      {log.actorName || 'System'}
                    </td>
                    <td className="p-4 text-body-sm text-secondary-700 dark:text-secondary-200 capitalize">
                      {formatAction(log.action)}
                    </td>
                    <td className="p-4 text-body-sm text-secondary-500 dark:text-secondary-400">
                      <span className="font-medium text-secondary-600 dark:text-secondary-300">{log.entityType}</span> 
                      {log.entityId && ` (#${log.entityId})`}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-secondary-200 dark:border-secondary-700 bg-secondary-50/50 dark:bg-secondary-900/30 flex items-center justify-between">
          <span className="text-body-sm text-secondary-500 dark:text-secondary-400">
            Showing page {page} of {totalPages}
          </span>
          <div className="flex items-center gap-2">
            <Button 
              variant="secondary" 
              size="sm" 
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1 || loading}
            >
              Previous
            </Button>
            <Button 
              variant="secondary" 
              size="sm" 
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages || loading}
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityLog;
