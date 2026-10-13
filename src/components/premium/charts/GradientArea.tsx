interface AreaRow {
  label: string;
  value: number;
}

interface GradientAreaProps {
  name: string;
  rows: AreaRow[];
  height?: number;
}

// Small SVG area/line sparkline for a day-by-day trend.
export default function GradientArea({ name, rows, height = 180 }: GradientAreaProps) {
  if (rows.length === 0) {
    return <p className="py-8 text-center text-xs text-slate-400">No data</p>;
  }

  const width = 100;
  const max = Math.max(1, ...rows.map((r) => r.value));
  const stepX = rows.length > 1 ? width / (rows.length - 1) : 0;
  const points = rows.map((r, i) => ({ x: i * stepX, y: height - (r.value / max) * (height - 24) - 4 }));
  const line = points.map((p) => `${p.x},${p.y}`).join(' ');
  const area = `0,${height} ${line} ${width},${height}`;
  const gradientId = `grad-${name.replace(/\s+/g, '-')}`;

  return (
    <div>
      <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className="h-44 w-full">
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#008BE9" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#008BE9" stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon points={area} fill={`url(#${gradientId})`} />
        <polyline points={line} fill="none" stroke="#008BE9" strokeWidth="2" vectorEffect="non-scaling-stroke" />
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="1.6" fill="#008BE9" vectorEffect="non-scaling-stroke" />
        ))}
      </svg>
      <div className="mt-1 flex justify-between text-[10px] text-slate-400">
        <span>{rows[0]?.label}</span>
        <span>{rows[rows.length - 1]?.label}</span>
      </div>
    </div>
  );
}
