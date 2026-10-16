import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

export interface AttentionItem {
  module: string;
  label: string;
  count: number;
  severity: 'critical' | 'warning';
  to: string;
  detail?: string;
  // When true, the count drives inclusion/filtering but isn't shown (e.g. a boolean flag encoded as 0/1).
  hideCount?: boolean;
}

const SEVERITY_DOT: Record<AttentionItem['severity'], string> = {
  critical: 'bg-red-500',
  warning: 'bg-amber-500',
};

interface AttentionListProps {
  items: AttentionItem[];
  footer?: ReactNode;
}

// Everything across modules that needs a human to look at it, newest-flagged first.
export default function AttentionList({ items, footer }: AttentionListProps) {
  if (items.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center py-10 text-center">
        <p className="text-sm font-medium text-slate-600">Nothing needs attention</p>
        <p className="mt-1 text-xs text-slate-400">All modules are clear right now.</p>
        {footer}
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <ul className="-mx-1 min-h-0 flex-1 space-y-1 overflow-y-auto">
        {items.map((item, i) => (
          <li key={`${item.module}-${item.label}-${i}`}>
            <Link
              to={item.to}
              className="group flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-slate-50"
            >
              <span className={`h-2 w-2 shrink-0 rounded-full ${SEVERITY_DOT[item.severity]}`} />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-slate-800">{item.label}</span>
                <span className="block truncate text-xs text-slate-400">
                  {item.module}
                  {item.detail ? ` · ${item.detail}` : ''}
                </span>
              </span>
              {!item.hideCount && (
                <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold tabular-nums text-slate-600">
                  {item.count}
                </span>
              )}
              <ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-300 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </li>
        ))}
      </ul>
      {footer}
    </div>
  );
}
