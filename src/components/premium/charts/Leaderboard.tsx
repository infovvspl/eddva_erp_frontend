interface LeaderboardRow {
  label: string;
  value: number;
  detail?: string;
}

interface LeaderboardProps {
  rows: LeaderboardRow[];
  format?: (value: number) => string;
}

// Ranked list with an inline bar showing relative share of the top entry.
export default function Leaderboard({ rows, format }: LeaderboardProps) {
  if (rows.length === 0) {
    return <p className="py-8 text-center text-xs text-slate-400">No data</p>;
  }

  const max = Math.max(1, ...rows.map((r) => r.value));
  const fmt = format ?? ((v: number) => String(v));

  return (
    <ol className="space-y-3">
      {rows.map((row, i) => (
        <li key={row.label}>
          <div className="mb-1 flex items-baseline justify-between gap-2 text-xs">
            <span className="flex min-w-0 items-baseline gap-2">
              <span className="w-4 shrink-0 text-right font-semibold text-slate-400">{i + 1}</span>
              <span className="truncate font-medium text-slate-700">{row.label}</span>
            </span>
            <span className="shrink-0 font-semibold tabular-nums text-slate-900">{fmt(row.value)}</span>
          </div>
          <div className="ml-6 h-1.5 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-gradient-to-r from-brand-navy to-brand"
              style={{ width: `${Math.max((row.value / max) * 100, 4)}%` }}
            />
          </div>
          {row.detail && <p className="ml-6 mt-0.5 truncate text-[11px] text-slate-400">{row.detail}</p>}
        </li>
      ))}
    </ol>
  );
}
