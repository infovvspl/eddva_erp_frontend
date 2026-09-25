import { useState } from 'react';
import { LogOut, User, Settings } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/auth.store';
import { ROUTES } from '../../constants/routes';
import { config } from '../../config/env';
import { clearAllModuleSessions, findModuleAuth } from '../../lib/moduleAuth';

export default function UserMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const isCoreSession = useAuthStore((state) => state.isAuthenticated) || !!config.apiToken;

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
