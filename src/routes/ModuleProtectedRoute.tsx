import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../stores/auth.store';
import { config } from '../config/env';
import type { ModuleAuth } from '../lib/moduleAuth';

interface ModuleProtectedRouteProps {
  module: ModuleAuth;
  children: React.ReactNode;
}

// Module routes accept either a core-authenticated session (institute admins, exchanged
// transparently for a module token by the axios interceptor) or a staff direct-login
// session for that module. Anyone else is sent to the module's own sign-in page.
export default function ModuleProtectedRoute({ module, children }: ModuleProtectedRouteProps) {
  const isCoreAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (!isCoreAuthenticated && !config.apiToken && !module.isAuthenticated()) {
    return <Navigate to={`${module.basePath}/login`} replace />;
  }

  return <>{children}</>;
}
