import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import type { NavItem } from '../../layouts/navConfig';

interface ModuleSectionCardsProps {
  sections: NavItem[];
}

/** A card per section of a module, linking to that section. */
export default function ModuleSectionCards({ sections }: ModuleSectionCardsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {sections.map((section) => (
        <Link
          key={section.path}
          to={section.path}
          className="group flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-colors hover:border-[#008BE9]"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#008BE9]/10 text-[#002C6D]">
            <section.icon className="h-5 w-5" />
          </span>
          <span className="flex-1 text-sm font-medium text-slate-900">{section.label}</span>
          <ArrowRight className="h-4 w-4 text-slate-400 transition-transform group-hover:translate-x-0.5" />
        </Link>
      ))}
    </div>
  );
}
