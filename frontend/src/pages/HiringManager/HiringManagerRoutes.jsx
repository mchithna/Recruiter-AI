import { Navigate, Outlet } from 'react-router-dom';

export function HiringManagerRoutes() {
  return <Outlet />;
}

export function HiringManagerIndexRedirect() {
  return <Navigate to="/hiring-manager/home" replace />;
}

export default HiringManagerRoutes;
