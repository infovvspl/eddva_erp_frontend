const PALETTE = ['#008BE9', '#eb6834', '#15936a', '#d55181', '#7c3aed', '#c98500', '#0891b2', '#4a3aa7'];

interface DonutRow {
  label: string;
  value: number;
}

interface DonutChartProps {
  rows: DonutRow[];
  totalLabel?: string;
}

// Simple SVG donut — no external chart library needed for a handful of status segments.
export default function DonutChart({ rows, totalLabel }: DonutChartProps) {
  const total = rows.reduce((sum, r) => sum + r.value, 0);

  if (total === 0) {
    return <p className="py-8 text-center text-xs text-slate-400">No data</p>;
  }

  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative h-32 w-32">
        <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
          <circle cx="50" cy="50" r={radius} fill="none" stroke="#f1f5f9" strokeWidth="14" />
          {rows.map((row, i) => {
            const fraction = row.value / total;
            const dash = fraction * circumference;
            const dashoffset = -offset;
            offset += dash;
            if (row.value === 0) return null;
            return (
              <circle
                key={row.label}
                cx="50"
                cy="50"
                r={radius}
                fill="none"
                stroke={PALETTE[i % PALETTE.length]}
                strokeWidth="14"
                strokeDasharray={`${dash} ${circumference - dash}`}
                strokeDashoffset={dashoffset}
                strokeLinecap="butt"
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-lg font-semibold tabular-nums text-slate-900">{total}</span>
          {totalLabel && <span className="text-[10px] text-slate-400">{totalLabel}</span>}
        </div>
      </div>
      <ul className="flex w-full flex-wrap justify-center gap-x-3 gap-y-1">
        {rows.map((row, i) => (
          <li key={row.label} className="flex items-center gap-1.5 text-[11px] text-slate-500">
            <span className="h-2 w-2 rounded-full" style={{ background: PALETTE[i % PALETTE.length] }} />
            {row.label} ({row.value})
          </li>
        ))}
      </ul>
    </div>
  );
}
