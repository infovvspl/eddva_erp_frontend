import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../stores/auth.store';
import { config } from '../config/env';
import type { ModuleAuth } from '../lib/moduleAuth';

interface ModulePublicRouteProps {
  module: ModuleAuth;
  children: React.ReactNode;
}

// Guards a module's sign-in page: anyone already signed in (core admin or module staff)
// goes straight into the module instead of seeing the form.
export default function ModulePublicRoute({ module, children }: ModulePublicRouteProps) {
  const isCoreAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (isCoreAuthenticated || config.apiToken || module.isAuthenticated()) {
    return <Navigate to={module.basePath} replace />;
  }

  return <>{children}</>;
}
