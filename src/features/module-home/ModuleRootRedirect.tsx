import { Navigate, useLocation } from 'react-router-dom';
import { findActiveModule, moduleHomePath } from '../../layouts/navConfig';

/** A module's bare URL (e.g. /hostel) forwards to the page that acts as its dashboard. */
export default function ModuleRootRedirect() {
  const { pathname } = useLocation();
  const module = findActiveModule(pathname);
  return <Navigate to={module ? moduleHomePath(module) : '/dashboard'} replace />;
}
