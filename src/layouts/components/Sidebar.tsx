import { Link, NavLink, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { ArrowLeft, ArrowRight, ChevronDown, GraduationCap, LayoutDashboard } from 'lucide-react';
import { cn } from '../../utils/cn';
import { useUIStore } from '../../stores/ui.store';
import { useAuthStore } from '../../stores/auth.store';
import { config } from '../../config/env';
import { useIsInstituteAdmin } from '../../features/sales-purchase/utils/rbac.utils';
import { useIsInstituteAdmin as useIsCanteenInstituteAdmin } from '../../features/canteen/utils/rbac.utils';
import { useIsInstituteAdmin as useIsAdmissionInstituteAdmin } from '../../features/admission/utils/rbac.utils';
import { useIsInstituteAdmin as useIsHostelInstituteAdmin } from '../../features/hostel/utils/rbac.utils';
import { useIsInstituteAdmin as useIsAlumniInstituteAdmin } from '../../features/alumni/utils/rbac.utils';
import { findActiveModule, moduleHomePath, navItems } from '../navConfig';
import type { NavItem } from '../navConfig';

export default function Sidebar() {
  const sidebarOpen = useUIStore((state) => state.sidebarOpen);
  const toggleSidebar = useUIStore((state) => state.toggleSidebar);
  const [expandedMenus, setExpandedMenus] = useState<Set<string>>(new Set());

  const isSalesPurchaseAdmin = useIsInstituteAdmin();
  const isCanteenAdmin = useIsCanteenInstituteAdmin();
  const isAdmissionAdmin = useIsAdmissionInstituteAdmin();
  const isHostelAdmin = useIsHostelInstituteAdmin();
  const isAlumniAdmin = useIsAlumniInstituteAdmin();
  const visibleNavItems = navItems.map((item) => {
    if (item.path === '/sales-purchase' && item.children && !isSalesPurchaseAdmin) {
      return {
        ...item,
        children: item.children.filter(
          (child) => child.path !== '/sales-purchase/roles' && child.path !== '/sales-purchase/users'
        ),
      };
    }
    if (item.path === '/canteen' && item.children && !isCanteenAdmin) {
      return {
        ...item,
        children: item.children.filter(
          (child) => child.path !== '/canteen/roles' && child.path !== '/canteen/users'
        ),
      };
    }
    if (item.path === '/admission' && item.children && !isAdmissionAdmin) {
      return {
        ...item,
        children: item.children.filter(
          (child) => child.path !== '/admission/roles' && child.path !== '/admission/users'
        ),
      };
    }
    if (item.path === '/hostel' && item.children && !isHostelAdmin) {
      return {
        ...item,
        children: item.children.filter(
          (child) => child.path !== '/hostel/roles' && child.path !== '/hostel/users'
        ),
      };
    }
    if (item.path === '/alumni' && item.children && !isAlumniAdmin) {
      return {
        ...item,
        children: item.children.filter(
          (child) => child.path !== '/alumni/roles' && child.path !== '/alumni/users'
        ),
      };
    }
    return item;
  });

  // Inside a module the sidebar shows only that module, so each module reads as its own
  // workspace; the full module list lives on the ERP dashboard.
  const { pathname } = useLocation();
  // Module staff have no core session, so the all-modules dashboard is not theirs to open.
  const canSeeAllModules = useAuthStore((state) => state.isAuthenticated) || !!config.apiToken;
  const activeModule = findActiveModule(pathname, visibleNavItems);
  const moduleHome = activeModule ? moduleHomePath(activeModule) : null;
  const moduleNavItems: NavItem[] =
    activeModule && moduleHome
      ? [
          ...(activeModule.children?.some((child) => child.path === moduleHome)
            ? []
            : [{ path: moduleHome, label: 'Dashboard', icon: LayoutDashboard }]),
          ...(activeModule.children ?? []),
        ]
      : [];

  const toggleMenu = (path: string) => {
    setExpandedMenus((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(path)) {
        newSet.delete(path);
      } else {
        newSet.add(path);
      }
      return newSet;
    });
  };

  const renderNavItem = (item: NavItem, level: number = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedMenus.has(item.path);

    if (hasChildren) {
      return (
        <li key={item.path}>
          <button
            onClick={() => toggleMenu(item.path)}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors w-full',
              'text-slate-700 hover:bg-slate-100'
            )}
          >
            <item.icon className="h-5 w-5" />
            <span className="flex-1 text-left">{item.label}</span>
            <ChevronDown 
              className={cn(
                'h-4 w-4 transition-transform',
                isExpanded ? 'rotate-180' : ''
              )}
            />
          </button>
          {isExpanded && (
            <ul className={cn('mt-1 space-y-1', level > 0 ? 'ml-4' : '')}>
              {item.children?.map((child) => renderNavItem(child, level + 1))}
            </ul>
          )}
        </li>
      );
    }

    return (
      <li key={item.path}>
        <NavLink
          to={item.path}
          end={item.path === moduleHome}
          onClick={() => {
            // Close sidebar on mobile after navigation
            if (window.innerWidth < 1024) {
              toggleSidebar();
            }
          }}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
              isActive
                ? 'bg-[#008BE9]/10 text-[#002C6D]'
                : 'text-slate-700 hover:bg-slate-100'
            )
          }
        >
          {level > 0 && <ArrowRight className="h-4 w-4 text-slate-400" />}
          <item.icon className={cn('h-5 w-5', level > 0 ? 'h-4 w-4' : '')} />
          <span>{item.label}</span>
          {item.badge && (
            <span className="ml-auto rounded-full bg-[#008BE9]/10 px-2 py-0.5 text-xs text-[#002C6D]">
              {item.badge}
            </span>
          )}
        </NavLink>
      </li>
    );
  };

  return (
    <>
      {/* Mobile overlay - only shows on mobile when sidebar is open */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={toggleSidebar}
        />
      )}
      
      <aside
        className={cn(
          'fixed left-0 top-0 z-50 h-screen w-64 bg-white border-r border-slate-200 transition-transform duration-300 ease-in-out',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-full flex-col">
          <div className="flex h-16 items-center justify-center border-b border-slate-200">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full" style={{ background: 'linear-gradient(135deg, #002C6D 0%, #008BE9 100%)' }}>
                <GraduationCap className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-bold text-slate-900">School ERP</span>
            </div>
          </div>

          <nav className="flex-1 overflow-y-auto p-4">
            {activeModule ? (
              <>
                {canSeeAllModules && (
                  <Link
                    to="/dashboard"
                    className="mb-3 flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    <span>All modules</span>
                  </Link>
                )}
                <div className="mb-2 flex items-center gap-3 px-3 py-2 text-slate-900">
                  <activeModule.icon className="h-5 w-5 text-[#008BE9]" />
                  <span className="text-sm font-bold">{activeModule.label}</span>
                </div>
                <ul className="space-y-1">{moduleNavItems.map((item) => renderNavItem(item))}</ul>
              </>
            ) : (
              <ul className="space-y-1">
                {visibleNavItems.map((item) => renderNavItem(item))}
              </ul>
            )}
          </nav>
        </div>
      </aside>
    </>
  );
}
