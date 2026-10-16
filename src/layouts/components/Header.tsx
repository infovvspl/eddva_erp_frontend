import { useState } from 'react';
import { GraduationCap, Menu, Search } from 'lucide-react';
import Button from '../../components/ui/Button';
import { useUIStore } from '../../stores/ui.store';
import { useAuthStore } from '../../stores/auth.store';
import { openLms } from '../../lib/lmsSso';
import UserMenu from './UserMenu';
import NotificationDropdown from './NotificationDropdown';

export default function Header() {
  const toggleSidebar = useUIStore((state) => state.toggleSidebar);
  const user = useAuthStore((state) => state.user);
  const [switchingToLms, setSwitchingToLms] = useState(false);

  // Only an institute admin can switch — see mintLmsSsoToken in the ERP backend.
  const canSwitchToLms = user?.role === 'INSTITUTE_ADMIN';

  const handleSwitchToLms = async () => {
    setSwitchingToLms(true);
    try {
      await openLms('/school/admin');
      // openLms navigates the whole page away on success; nothing left to do here.
    } catch {
      setSwitchingToLms(false);
    }
  };

  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4">
      <div className="flex items-center gap-2 sm:gap-4 flex-1">
        <Button variant="ghost" size="sm" onClick={toggleSidebar}>
          <Menu className="h-5 w-5 text-slate-600" />
        </Button>
        <div className="relative hidden sm:block flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search..."
            className="h-9 w-full max-w-64 rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-800 placeholder:text-slate-400 focus:border-[#008BE9] focus:outline-none focus:ring-2 focus:ring-[#008BE9]/20 transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        {canSwitchToLms && (
          <Button variant="ghost" size="sm" onClick={handleSwitchToLms} isLoading={switchingToLms}>
            {!switchingToLms && <GraduationCap className="mr-2 h-4 w-4 text-slate-600" />}
            <span className="hidden sm:inline text-slate-600">Switch to LMS</span>
          </Button>
        )}
        <NotificationDropdown />
        <UserMenu />
      </div>
    </header>
  );
}
