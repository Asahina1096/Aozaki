import { memo } from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import type { ChartConfig } from "@/components/ui/chart";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Card } from "@/components/ui/card";

export const CHART_COLORS = [
  "#FF8A98",
  "#8FD6FF",
  "#9DE8C9",
  "#B7C4FF",
  "#79D9F8",
  "#C5B4FF",
  "#FFB28F",
  "#FBD89A",
] as const;
export const SOFT_GRID_STROKE = "hsl(var(--border) / 0.55)";
export const SOFT_FILL_END = "#ffffff";
export const AREA_GRADIENT_IDS = [
  "soft-chart-fill-0",
  "soft-chart-fill-1",
  "soft-chart-fill-2",
  "soft-chart-fill-3",
  "soft-chart-fill-4",
  "soft-chart-fill-5",
  "soft-chart-fill-6",
  "soft-chart-fill-7",
] as const;

interface SoftGradientProps {
  indices?: number[];
}

export const SoftGradient = memo<SoftGradientProps>(({ indices = [0, 1, 2, 3] }) => (
  <defs>
    {indices.map((idx) => (
      <linearGradient
        key={AREA_GRADIENT_IDS[idx]}
        id={AREA_GRADIENT_IDS[idx]}
        x1="0"
        y1="0"
        x2="0"
        y2="1"
      >
        <stop offset="5%" stopColor={CHART_COLORS[idx]} stopOpacity={0.4} />
        <stop offset="95%" stopColor={SOFT_FILL_END} stopOpacity={0.05} />
      </linearGradient>
    ))}
  </defs>
));

SoftGradient.displayName = "SoftGradient";

// Legacy support - renders all 4 gradients
export const softFillDef = <SoftGradient />;

export const areaFill = (idx: number) =>
  `url(#${AREA_GRADIENT_IDS[idx % AREA_GRADIENT_IDS.length]})`;

export const sixChartMargin = {
  top: 10,
  right: 18,
  bottom: 12,
  left: 4,
};

export const axisTickStyle = {
  fontSize: 10,
  fill: "var(--foreground)",
  textAnchor: "end",
  dx: -5,
} as const;

export const xAxisTickStyle = {
  fontSize: 10,
  fill: "var(--muted-foreground)",
  dy: 10,
} as const;

export const xAxisPadding = {
  left: 8,
  right: 14,
};

export const yAxisTickCount = 5;
export const PERCENT_Y_AXIS_WIDTH = 72;
export const NETWORK_Y_AXIS_WIDTH = 72;
export const STORAGE_Y_AXIS_WIDTH = 72;
export const COUNT_Y_AXIS_WIDTH = 72;

export const formatPercentTick = (value: number) => `${Number(value).toFixed(1)}%`;

export const formatCountCompact = (value: number): string => {
  const num = Number(value);
  if (!Number.isFinite(num) || num <= 0) return "0";
  if (num >= 1_000_000_000)
    return `${(num / 1_000_000_000).toFixed(num >= 10_000_000_000 ? 0 : 1)}B`;
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(num >= 10_000_000 ? 0 : 1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(num >= 10_000 ? 0 : 1)}K`;
  return `${Math.round(num)}`;
};

interface ChartTitleProps {
  text: string;
  right: React.ReactNode;
}

export const ChartTitle = memo(({ text, right }: ChartTitleProps) => (
  <div className="mb-2 flex items-center justify-between gap-4">
    <label className="font-sans text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground md:text-sm">
      {text}
    </label>
    <div className="text-right font-mono text-sm text-foreground">{right}</div>
  </div>
));

ChartTitle.displayName = "ChartTitle";

// ============================================================
// BaseAreaChart - Shared chart component to eliminate duplication
// ============================================================

interface DataKeyConfig {
  key: string;
  label: string;
  colorIndex: number;
}

interface BaseAreaChartProps {
  title: string;
  right: React.ReactNode;
  data: Record<string, unknown>[];
  dataKeys: DataKeyConfig[];
  yAxisWidth?: number;
  yAxisDomain?: [number | string, number | string];
  yAxisTickFormatter?: (value: number) => string;
  tooltipFormatter?: (value: unknown, name?: unknown, props?: unknown) => string;
  timeFormatter?: (value: string, index: number) => string;
  labelFormatter?: (value: React.ReactNode) => string;
}

export const BaseAreaChart = memo(function BaseAreaChart({
  title,
  right,
  data,
  dataKeys,
  yAxisWidth = PERCENT_Y_AXIS_WIDTH,
  yAxisDomain,
  yAxisTickFormatter = formatPercentTick,
  tooltipFormatter,
  timeFormatter,
  labelFormatter,
}: BaseAreaChartProps) {
  const chartConfig: ChartConfig = {};
  dataKeys.forEach(({ key, label, colorIndex }) => {
    chartConfig[key] = { label, color: CHART_COLORS[colorIndex % CHART_COLORS.length] };
  });

  const defaultFormatter = (value: unknown) => `${Number(value).toFixed(2)}%`;
  const formatter = tooltipFormatter ?? defaultFormatter;

  return (
    <Card className="card-blur-target flex h-full w-full flex-col p-5">
      <ChartTitle text={title} right={right} />
      <ChartContainer config={chartConfig} className="h-40 w-full aspect-auto">
        <AreaChart data={data} accessibilityLayer margin={sixChartMargin}>
          <SoftGradient indices={dataKeys.map(({ colorIndex }) => colorIndex)} />
          <CartesianGrid
            vertical={false}
            stroke={SOFT_GRID_STROKE}
            strokeDasharray="3 6"
          />
          <XAxis
            dataKey="time"
            axisLine={false}
            tickLine={false}
            tickFormatter={timeFormatter}
            tick={xAxisTickStyle}
            interval={0}
            padding={xAxisPadding}
          />
          <YAxis
            width={yAxisWidth}
            tickLine={false}
            axisLine={false}
            domain={yAxisDomain ?? [0, "auto"]}
            tickCount={yAxisTickCount}
            tickFormatter={yAxisTickFormatter}
            tick={axisTickStyle}
            orientation="left"
            type="number"
          />
          <ChartTooltip
            cursor={false}
            formatter={formatter}
            content={<ChartTooltipContent labelFormatter={labelFormatter ?? ((v) => String(v))} indicator="dot" />}
          />
          {dataKeys.map(({ key, colorIndex }) => (
            <Area
              key={key}
              dataKey={key}
              animationDuration={0}
              stroke={CHART_COLORS[colorIndex % CHART_COLORS.length]}
              fill={areaFill(colorIndex)}
              strokeWidth={2}
              dot={false}
              type="monotone"
            />
          ))}
        </AreaChart>
      </ChartContainer>
    </Card>
  );
});

BaseAreaChart.displayName = "BaseAreaChart";
