import { Navigate } from 'react-router-dom';
import HiringManagerLayout from './HiringManagerLayout';

export function HiringManagerRoutes() {
  return (
    <HiringManagerLayout />
  );
}

export function HiringManagerIndexRedirect() {
  return <Navigate to="/hiring-manager/home" replace />;
}

export default HiringManagerRoutes;
