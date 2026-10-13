interface FunnelRow {
  label: string;
  value: number;
}

interface FunnelProps {
  rows: FunnelRow[];
}

// Horizontal bars, widest-first, each scaled against the funnel's top stage.
export default function Funnel({ rows }: FunnelProps) {
  const max = Math.max(1, ...rows.map((r) => r.value));

  if (rows.length === 0) {
    return <p className="py-8 text-center text-xs text-slate-400">No data</p>;
  }

  return (
    <div className="space-y-3">
      {rows.map((row, i) => {
        const pct = Math.max((row.value / max) * 100, row.value > 0 ? 6 : 0);
        const prev = rows[i - 1]?.value;
        const dropoff = i > 0 && prev ? Math.round(((prev - row.value) / prev) * 100) : null;
        return (
          <div key={row.label}>
            <div className="mb-1 flex items-baseline justify-between text-xs">
              <span className="font-medium text-slate-600">{row.label}</span>
              <span className="text-slate-400">
                <span className="font-semibold text-slate-900 tabular-nums">{row.value}</span>
                {dropoff !== null && dropoff > 0 && <span className="ml-1.5 text-red-500">-{dropoff}%</span>}
              </span>
            </div>
            <div className="h-6 overflow-hidden rounded-lg bg-slate-100">
              <div
                className="h-full rounded-lg bg-gradient-to-r from-brand-navy to-brand transition-[width] duration-700 ease-out"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
