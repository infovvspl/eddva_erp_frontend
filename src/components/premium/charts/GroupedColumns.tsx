interface Series {
  key: string;
  name: string;
}

interface GroupedColumnsProps {
  rows: Record<string, string | number>[];
  series: Series[];
  tone?: 'light' | 'dark';
  format?: (value: number) => string;
  height?: number;
  showValues?: boolean;
}

const PALETTE = ['#008BE9', '#eb6834', '#15936a', '#d55181'];

// Grouped bar comparison across a small set of rows (e.g. sales vs purchase per metric).
export default function GroupedColumns({ rows, series, tone = 'light', format, height = 220, showValues }: GroupedColumnsProps) {
  const dark = tone === 'dark';
  const max = Math.max(1, ...rows.flatMap((r) => series.map((s) => Number(r[s.key]) || 0)));
  const fmt = format ?? ((v: number) => String(v));

  return (
    <div style={{ height }} className="flex items-end gap-4">
      {rows.map((row) => (
        <div key={String(row.label)} className="flex flex-1 flex-col items-center gap-2">
          <div className="flex h-full items-end gap-1.5">
            {series.map((s, i) => {
              const value = Number(row[s.key]) || 0;
              const pct = Math.max((value / max) * 100, value > 0 ? 3 : 0);
              return (
                <div key={s.key} className="flex w-6 flex-col items-center justify-end" style={{ height: '100%' }}>
                  {showValues && (
                    <span className={`mb-1 text-[10px] tabular-nums ${dark ? 'text-sky-100/70' : 'text-slate-500'}`}>
                      {fmt(value)}
                    </span>
                  )}
                  <div
                    className="w-full rounded-t-md transition-[height] duration-700 ease-out"
                    style={{ height: `${pct}%`, background: PALETTE[i % PALETTE.length], minHeight: value > 0 ? 2 : 0 }}
                  />
                </div>
              );
            })}
          </div>
          <span className={`text-center text-[11px] ${dark ? 'text-sky-100/70' : 'text-slate-500'}`}>{row.label}</span>
        </div>
      ))}
      <div className="sr-only">
        {series.map((s) => (
          <span key={s.key}>{s.name}</span>
        ))}
      </div>
    </div>
  );
}
