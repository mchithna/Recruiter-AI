import { Navigate, Outlet } from 'react-router-dom';
import { RecruiterJobsProvider } from './JobsContext';

export function RecruiterRoutes() {
  return (
    <RecruiterJobsProvider>
      <Outlet />
    </RecruiterJobsProvider>
  );
}

export function RecruiterIndexRedirect() {
  return <Navigate to="/recruiter/jobs" replace />;
}

export default RecruiterRoutes;
