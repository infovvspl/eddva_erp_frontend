import { useState } from 'react';
import { LogOut, User, Settings, GraduationCap, Loader2 } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/auth.store';
import { ROUTES } from '../../constants/routes';
import { config } from '../../config/env';
import { clearAllModuleSessions, findModuleAuth } from '../../lib/moduleAuth';
import { openLms } from '../../lib/lmsSso';

export default function UserMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [switchingToLms, setSwitchingToLms] = useState(false);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const isCoreSession = useAuthStore((state) => state.isAuthenticated) || !!config.apiToken;
  const canSwitchToLms = isCoreSession && user?.role === 'INSTITUTE_ADMIN';

  const handleSwitchToLms = async () => {
    setSwitchingToLms(true);
    try {
      await openLms('/school/admin');
      // openLms navigates the whole page away on success; nothing left to do here.
    } catch {
      setSwitchingToLms(false);
    }
  };

  // Staff who signed in through a module's own login have no core session: show and
  // sign out that module session instead.
  const staffModule = !isCoreSession ? findModuleAuth(pathname) : undefined;
  const staffUser = staffModule?.getUser() ?? null;
  const displayName = staffModule ? staffUser?.user_name || 'User' : user?.name;
  const displayEmail = staffModule ? staffUser?.user_email : user?.email;

  const handleLogout = () => {
    if (staffModule) {
      staffModule.clear();
      navigate(staffModule.basePath + '/login', { replace: true });
      setIsOpen(false);
      return;
    }
    logout();
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    clearAllModuleSessions();

    // Arrived here via the LMS's "Switch to ERP" SSO hand-off (see SsoLanding.tsx)?
    // Send the admin back to the LMS's login instead of this app's own one.
    let ssoOrigin: string | null = null;
    try {
      ssoOrigin = sessionStorage.getItem('ssoOrigin');
      sessionStorage.removeItem('ssoOrigin');
    } catch {
      // ignore — falls back to this app's own login below
    }
    if (ssoOrigin === 'lms') {
      const lmsFrontendUrl = import.meta.env.VITE_LMS_FRONTEND_URL || 'http://localhost:8080';
      window.location.replace(`${lmsFrontendUrl}/login`);
      setIsOpen(false);
      return;
    }

    navigate(ROUTES.LOGIN);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-md px-3 py-2 hover:bg-slate-100 transition-colors"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-full" style={{ background: 'linear-gradient(135deg, #002C6D 0%, #008BE9 100%)' }}>
          <span className="text-sm font-medium text-white">
            {displayName?.charAt(0).toUpperCase() || 'U'}
          </span>
        </div>
        <span className="text-sm font-medium text-slate-700">{displayName || 'User'}</span>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-full z-20 mt-2 w-48 rounded-lg border border-slate-200 bg-white shadow-lg">
            <div className="border-b border-slate-200 px-4 py-3">
              <p className="text-sm font-medium text-slate-900">{displayName}</p>
              <p className="text-xs text-slate-500">{displayEmail}</p>
            </div>
            <div className="py-1">
              <button
                onClick={() => setIsOpen(false)}
                className="flex w-full items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <User className="h-4 w-4" />
                Profile
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="flex w-full items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <Settings className="h-4 w-4" />
                Settings
              </button>
              {canSwitchToLms && (
                <button
                  onClick={handleSwitchToLms}
                  disabled={switchingToLms}
                  className="flex w-full items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 transition-colors disabled:opacity-60"
                >
                  {switchingToLms ? <Loader2 className="h-4 w-4 animate-spin" /> : <GraduationCap className="h-4 w-4" />}
                  Switch to LMS
                </button>
              )}
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-2 px-4 py-2 text-sm text-[#002C6D] hover:bg-slate-100 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
