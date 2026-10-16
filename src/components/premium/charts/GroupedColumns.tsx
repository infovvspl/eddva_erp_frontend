import { CartesianGrid, Line, LineChart, XAxis } from 'recharts';
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '../../ui-shadcn/chart';

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
  const fmt = format ?? ((v: number) => String(v));

  const config: ChartConfig = Object.fromEntries(
    series.map((s, i) => [s.key, { label: s.name, color: PALETTE[i % PALETTE.length] }]),
  );

  const tickColor = dark ? 'rgba(224, 242, 254, 0.7)' : undefined;
  const gridColor = dark ? 'rgba(255, 255, 255, 0.1)' : undefined;

  return (
    <ChartContainer config={config} style={{ height }} className="aspect-auto w-full">
      <LineChart data={rows} margin={{ top: showValues ? 16 : 8, left: 0, right: 12, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke={gridColor} />
        <XAxis
          dataKey="label"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tick={tickColor ? { fill: tickColor } : undefined}
        />
        <ChartTooltip
          cursor={{ stroke: dark ? 'rgba(255,255,255,0.15)' : 'rgba(15,23,42,0.1)' }}
          content={<ChartTooltipContent formatter={(value) => fmt(Number(value))} />}
        />
        {series.length > 1 && <ChartLegend content={<ChartLegendContent />} />}
        {series.map((s, i) => (
          <Line
            key={s.key}
            type="monotone"
            dataKey={s.key}
            name={s.name}
            stroke={PALETTE[i % PALETTE.length]}
            strokeWidth={2}
            dot={{ r: 3, fill: PALETTE[i % PALETTE.length] }}
            activeDot={{ r: 5 }}
            label={showValues ? { position: 'top', fontSize: 10, fill: tickColor ?? '#64748b', formatter: fmt } : undefined}
          />
        ))}
      </LineChart>
    </ChartContainer>
  );
}
