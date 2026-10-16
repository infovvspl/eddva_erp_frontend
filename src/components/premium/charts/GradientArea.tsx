import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '../../ui-shadcn/chart';

interface AreaRow {
  label: string;
  value: number;
}

interface GradientAreaProps {
  name: string;
  rows: AreaRow[];
  height?: number;
}

const config: ChartConfig = {
  value: { label: 'Count', color: '#008BE9' },
};

// Day-by-day trend area chart (e.g. campus visitors over a date range).
export default function GradientArea({ name, rows, height = 180 }: GradientAreaProps) {
  if (rows.length === 0) {
    return <p className="py-8 text-center text-xs text-slate-400">No data</p>;
  }

  const gradientId = `grad-${name.replace(/\s+/g, '-')}`;

  return (
    <ChartContainer config={config} style={{ height }} className="aspect-auto w-full">
      <AreaChart data={rows} margin={{ top: 8, left: 0, right: 12, bottom: 0 }}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#008BE9" stopOpacity={0.35} />
            <stop offset="100%" stopColor="#008BE9" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="label"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          minTickGap={32}
        />
        <ChartTooltip cursor={{ stroke: 'rgba(15,23,42,0.1)' }} content={<ChartTooltipContent hideLabel={false} />} />
        <Area
          type="monotone"
          dataKey="value"
          name={name}
          stroke="#008BE9"
          strokeWidth={2}
          fill={`url(#${gradientId})`}
          dot={false}
          activeDot={{ r: 4 }}
        />
      </AreaChart>
    </ChartContainer>
  );
}
