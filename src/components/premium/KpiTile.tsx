import type { CSSProperties } from 'react';
import type { LucideIcon } from 'lucide-react';

interface KpiTileProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  hint?: string;
  accent: string;
  style?: CSSProperties;
}

// One headline metric on the dashboard's bento grid.
export default function KpiTile({ label, value, icon: Icon, hint, accent, style }: KpiTileProps) {
  return (
    <div
      className="animate-rise rounded-3xl bg-white p-4 shadow-soft ring-1 ring-slate-200/70 transition-shadow hover:shadow-lift"
      style={style}
    >
      <div className="flex items-center gap-2.5">
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl"
          style={{ background: `${accent}1a`, color: accent }}
        >
          <Icon className="h-4.5 w-4.5" />
        </div>
        <p className="truncate text-xs font-medium text-slate-500">{label}</p>
      </div>
      <p className="mt-3 truncate text-xl font-semibold tracking-tight text-slate-900 tabular-nums">{value}</p>
      {hint && <p className="mt-0.5 truncate text-[11px] text-slate-400">{hint}</p>}
    </div>
  );
}
