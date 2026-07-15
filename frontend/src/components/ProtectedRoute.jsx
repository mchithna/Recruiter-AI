import React, { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../api';
import { getDashboardPathForRole, getProfileRole, normalizeRole } from '../lib/roles';

const ProtectedRoute = ({ allowedRoles }) => {
  const { session, profile, loading } = useAuth();
  const [retryLoading, setRetryLoading] = useState(false);
  const [localProfile, setLocalProfile] = useState(profile);
  const [provisionFailed, setProvisionFailed] = useState(false);

  useEffect(() => {
    setLocalProfile(profile);
  }, [profile]);

  useEffect(() => {
    let timeout;
    if (!loading && session && !localProfile && !provisionFailed) {
      setRetryLoading(true);
      // Wait a short time to allow pending provisioning calls to complete
      timeout = setTimeout(async () => {
        try {
          const res = await api.get('/profile/me');
          setLocalProfile(res.data);
        } catch (err) {
          setProvisionFailed(true);
        } finally {
          setRetryLoading(false);
        }
      }, 3000);
    }
    return () => clearTimeout(timeout);
  }, [loading, session, localProfile, provisionFailed]);

  if (loading || retryLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  if (provisionFailed || !localProfile) {
    return <Navigate to="/login" state={{ message: "We couldn't finish setting up your account — please try signing in again." }} replace />;
  }

  const role = getProfileRole(localProfile, session);

  if (allowedRoles && !allowedRoles.map(normalizeRole).includes(role)) {
    return <Navigate to={getDashboardPathForRole(role)} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
