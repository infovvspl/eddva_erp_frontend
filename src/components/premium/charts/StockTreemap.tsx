const PALETTE = ['#008BE9', '#eb6834', '#15936a', '#d55181', '#7c3aed', '#c98500', '#0891b2', '#4a3aa7'];

interface TreemapRow {
  label: string;
  value: number;
}

interface StockTreemapProps {
  rows: TreemapRow[];
}

// Proportional tile layout for stock-by-location — flex-wrap sized by share of total, not a true treemap packing.
export default function StockTreemap({ rows }: StockTreemapProps) {
  const total = rows.reduce((sum, r) => sum + r.value, 0);

  if (total === 0) {
    return <p className="py-8 text-center text-xs text-slate-400">No data</p>;
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {rows.map((row, i) => {
        const pct = (row.value / total) * 100;
        const basis = Math.max(pct, 12);
        return (
          <div
            key={row.label}
            className="flex flex-col justify-between rounded-xl p-3 text-white"
            style={{ background: PALETTE[i % PALETTE.length], flexBasis: `${basis}%`, flexGrow: 1, minHeight: 72 }}
          >
            <span className="truncate text-xs font-medium opacity-90">{row.label}</span>
            <span className="text-lg font-semibold tabular-nums">{row.value}</span>
          </div>
        );
      })}
    </div>
  );
}
