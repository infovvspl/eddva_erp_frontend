import type { LucideIcon } from 'lucide-react';
import { RefreshCw } from 'lucide-react';

export interface HeroHighlight {
  icon: LucideIcon;
  label: string;
}

interface PageHeroProps {
  eyebrow: string;
  title: string;
  subtitle: string;
  highlights: HeroHighlight[];
  updatedAt: number;
  refreshing: boolean;
  onRefresh: () => void;
}

function timeAgo(timestamp: number): string {
  if (!timestamp) return 'just now';
  const seconds = Math.max(0, Math.floor((Date.now() - timestamp) / 1000));
  if (seconds < 10) return 'just now';
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ago`;
}

// Top-of-dashboard banner: greeting, a few headline facts, and a refresh control.
export default function PageHero({ eyebrow, title, subtitle, highlights, updatedAt, refreshing, onRefresh }: PageHeroProps) {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-navy via-brand-navy to-brand p-6 text-white shadow-lift sm:p-8">
      <div aria-hidden className="pointer-events-none absolute -top-16 -right-16 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
      <div className="relative flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sky-100/80">{eyebrow}</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>
          <p className="mt-1 text-sm text-sky-100/80">{subtitle}</p>
        </div>
        <button
          type="button"
          onClick={onRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 self-start rounded-full bg-white/10 px-4 py-2 text-xs font-medium ring-1 ring-white/20 transition-colors hover:bg-white/20 disabled:opacity-60"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Refreshing…' : `Updated ${timeAgo(updatedAt)}`}
        </button>
      </div>

      {highlights.length > 0 && (
        <div className="relative mt-6 flex flex-wrap gap-3">
          {highlights.map((h, i) => (
            <div key={i} className="flex items-center gap-2 rounded-2xl bg-white/[0.08] px-3.5 py-2 text-sm ring-1 ring-white/15">
              <h.icon className="h-4 w-4 text-sky-100/90" />
              <span>{h.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
