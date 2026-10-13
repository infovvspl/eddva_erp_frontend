interface GaugeProps {
  label: string;
  value: number;
  max: number;
  caption?: string;
  color: string;
}

// Semicircular gauge for a single value-against-capacity metric.
export default function Gauge({ label, value, max, caption, color }: GaugeProps) {
  const pct = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;
  const radius = 42;
  const circumference = Math.PI * radius;
  const dash = (pct / 100) * circumference;

  return (
    <div className="rounded-2xl bg-slate-50/80 p-3 ring-1 ring-slate-100">
      <div className="relative mx-auto h-[62px] w-[120px]">
        <svg viewBox="0 0 100 55" className="h-full w-full overflow-visible">
          <path d="M 8 50 A 42 42 0 0 1 92 50" fill="none" stroke="#e2e8f0" strokeWidth="9" strokeLinecap="round" />
          <path
            d="M 8 50 A 42 42 0 0 1 92 50"
            fill="none"
            stroke={color}
            strokeWidth="9"
            strokeLinecap="round"
            strokeDasharray={`${dash} ${circumference - dash}`}
          />
        </svg>
        <div className="absolute inset-x-0 bottom-0 text-center">
          <span className="text-base font-semibold tabular-nums text-slate-900">{Math.round(pct)}%</span>
        </div>
      </div>
      <p className="mt-1 text-center text-xs font-medium text-slate-600">{label}</p>
      {caption && <p className="text-center text-[11px] text-slate-400">{caption}</p>}
    </div>
  );
}
