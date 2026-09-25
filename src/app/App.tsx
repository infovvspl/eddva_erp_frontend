import { BrowserRouter } from 'react-router-dom';
import AppProviders from './providers/AppProviders';
import AppRoutes from '../routes/AppRoutes';
import DashboardLayout from '../layouts/DashboardLayout';
import AuthLayout from '../layouts/AuthLayout';
import { useLocation } from 'react-router-dom';
import { moduleAuthList } from '../lib/moduleAuth';

function AppContent() {
  const location = useLocation();
  const isAuthPage =
    ['/login', '/canteen/login', '/admission/login', '/sso'].includes(location.pathname) ||
    moduleAuthList.some((m) => location.pathname === m.basePath + '/login');
  const isKioskPage = location.pathname.startsWith('/kiosk');
  const isGpsIngestPage = location.pathname.startsWith('/gps-ingest');

  if (isAuthPage || isKioskPage || isGpsIngestPage) {
    return (
      <AuthLayout>
        <AppRoutes />
      </AuthLayout>
    );
  }

  return (
    <DashboardLayout>
      <AppRoutes />
    </DashboardLayout>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppProviders>
        <AppContent />
      </AppProviders>
    </BrowserRouter>
  );
}
