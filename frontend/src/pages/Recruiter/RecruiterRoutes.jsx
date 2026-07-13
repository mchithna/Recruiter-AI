import { Navigate } from 'react-router-dom';
import { RecruiterJobsProvider } from './JobsContext';
import RecruiterLayout from './RecruiterLayout';

export function RecruiterRoutes() {
  return (
    <RecruiterJobsProvider>
      <RecruiterLayout />
    </RecruiterJobsProvider>
  );
}

export function RecruiterIndexRedirect() {
  return <Navigate to="/recruiter/home" replace />;
}

export default RecruiterRoutes;
