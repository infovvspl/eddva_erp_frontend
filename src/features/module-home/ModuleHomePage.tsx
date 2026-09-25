import { useLocation } from 'react-router-dom';
import { findActiveModule, moduleHomePath } from '../../layouts/navConfig';
import ModuleSectionCards from '../../components/dashboard/ModuleSectionCards';

/**
 * Landing page for a module that has no dashboard of its own yet: a card per section
 * of that module, taken from the same navigation config the sidebar uses.
 */
export default function ModuleHomePage() {
  const { pathname } = useLocation();
  const module = findActiveModule(pathname);
  if (!module) return null;

  const home = moduleHomePath(module);
  const sections = (module.children ?? []).filter((child) => child.path !== home);

  return (
    <div>
      <div className="flex items-center gap-3">
        <module.icon className="h-7 w-7 text-[#008BE9]" />
        <h1 className="text-2xl font-bold text-slate-900">{module.label}</h1>
      </div>

      <div className="mt-6">
        <ModuleSectionCards sections={sections} />
      </div>
    </div>
  );
}
