import type { CSSProperties, ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

interface ChartCardProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  className?: string;
  style?: CSSProperties;
  tone?: 'light' | 'dark';
  // Stretches to fill the row (used for the attention rail, which has no fixed content height).
  fill?: boolean;
  children: ReactNode;
}

// Shared card shell for every dashboard widget — a title row plus a content slot.
export default function ChartCard({ title, subtitle, icon: Icon, className = '', style, tone = 'light', fill, children }: ChartCardProps) {
  const dark = tone === 'dark';
  return (
    <div
      className={[
        'animate-rise flex flex-col rounded-3xl p-5 shadow-soft ring-1 transition-shadow hover:shadow-lift',
        dark ? 'bg-gradient-to-br from-brand-navy to-slate-900 text-white ring-white/10' : 'bg-white ring-slate-200/70',
        fill ? 'min-h-0' : '',
        className,
      ].join(' ')}
      style={style}
    >
      <div className="flex items-center gap-2.5">
        {Icon && (
          <div
            className={[
              'flex h-8 w-8 shrink-0 items-center justify-center rounded-xl',
              dark ? 'bg-white/10 text-white' : 'bg-brand/10 text-brand',
            ].join(' ')}
          >
            <Icon className="h-4 w-4" />
          </div>
        )}
        <div className="min-w-0">
          <h3 className={`truncate text-sm font-semibold tracking-tight ${dark ? 'text-white' : 'text-slate-900'}`}>{title}</h3>
          {subtitle && <p className={`truncate text-xs ${dark ? 'text-sky-100/70' : 'text-slate-400'}`}>{subtitle}</p>}
        </div>
      </div>
      <div className={`mt-4 ${fill ? 'flex flex-1 flex-col' : ''}`}>{children}</div>
    </div>
  );
}
