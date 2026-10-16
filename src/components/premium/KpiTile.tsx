import type { CSSProperties } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

interface KpiTileProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  hint?: string;
  accent: string;
  style?: CSSProperties;
  // True when the module has no real activity yet (not just a zero worth
  // flagging, e.g. "0 overdue") — renders muted instead of looking like a
  // real reading, and links through to the module so it's a nudge, not dead air.
  empty?: boolean;
  to?: string;
}

// One headline metric on the dashboard's bento grid.
export default function KpiTile({ label, value, icon: Icon, hint, accent, style, empty, to }: KpiTileProps) {
  const content = (
    <>
      <div className="flex items-center gap-2.5">
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl"
          style={empty ? { background: '#f1f5f9', color: '#94a3b8' } : { background: `${accent}1a`, color: accent }}
        >
          <Icon className="h-4.5 w-4.5" />
        </div>
        <p className="truncate text-xs font-medium text-slate-500">{label}</p>
      </div>
      <p className={`mt-3 truncate text-xl font-semibold tracking-tight tabular-nums ${empty ? 'text-slate-400' : 'text-slate-900'}`}>
        {value}
      </p>
      {empty ? (
        <p className="mt-0.5 truncate text-[11px] text-slate-400">{to ? 'Not set up yet — tap to get started' : 'No activity yet'}</p>
      ) : (
        hint && <p className="mt-0.5 truncate text-[11px] text-slate-400">{hint}</p>
      )}
    </>
  );

  const shellClass = [
    'animate-rise block rounded-3xl p-4 transition-shadow',
    empty
      ? 'border border-dashed border-slate-200 bg-slate-50/60 hover:border-slate-300'
      : 'bg-white shadow-soft ring-1 ring-slate-200/70 hover:shadow-lift',
  ].join(' ');

  if (to) {
    return (
      <Link to={to} style={style} className={shellClass}>
        {content}
      </Link>
    );
  }

  return (
    <div className={shellClass} style={style}>
      {content}
    </div>
  );
}
