import { memo, useMemo } from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import type { ChartConfig } from "@/components/ui/chart";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Card } from "@/components/ui/card";
import { formatBytesCompact } from "@/lib/format/bytes";
import { formatBytes } from "@/utils/unitHelper";
import { toFiniteNumber } from "@/lib/normalizers/primitives";
import {
  areaFill,
  axisTickStyle,
  CHART_COLORS,
  formatPercentTick,
  PERCENT_Y_AXIS_WIDTH,
  sixChartMargin,
  xAxisPadding,
  xAxisTickStyle,
  yAxisTickCount,
} from "./shared";
import { ChartTitle } from "./shared";

interface RamSwapChartProps {
  data: { time: string; ram: number; swap: number; ram_raw?: number; swap_raw?: number }[];
  currentRam: number;
  currentSwap: number;
  timeFormatter: (value: string, index: number) => string;
  labelFormatter: (value: React.ReactNode) => string;
}

const RamSwapChartComponent = ({
  data,
  currentRam,
  currentSwap,
  timeFormatter,
  labelFormatter,
}: RamSwapChartProps) => {
  const chartConfig = useMemo<ChartConfig>(
    () => ({
      ram: { label: "内存", color: CHART_COLORS[0] },
      swap: { label: "Swap", color: CHART_COLORS[1] },
    }),
    [],
  );

  const ramSwapTooltipFormatter = useMemo(
    () => (value: unknown, name: unknown, props: unknown) => {
      const payload = props as { payload?: { ram_raw?: number; swap_raw?: number } };
      const raw =
        String(name) === "ram"
          ? toFiniteNumber(payload?.payload?.ram_raw)
          : toFiniteNumber(payload?.payload?.swap_raw);
      const percent = toFiniteNumber(value);
      return `${formatBytes(raw)} (${percent.toFixed(0)}%)`;
    },
    [],
  );

  return (
    <Card className="card-blur-target flex h-full w-full flex-col p-5">
      <ChartTitle
        text="内存"
        right={`RAM ${formatBytesCompact(currentRam)} | SWP ${formatBytesCompact(currentSwap)}`}
      />
      <ChartContainer config={chartConfig} className="h-40 w-full aspect-auto">
        <AreaChart data={data} accessibilityLayer margin={sixChartMargin}>
          <defs>
            <linearGradient id="soft-chart-fill-0" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={CHART_COLORS[0]} stopOpacity={0.4} />
              <stop offset="95%" stopColor="#ffffff" stopOpacity={0.05} />
            </linearGradient>
            <linearGradient id="soft-chart-fill-1" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={CHART_COLORS[1]} stopOpacity={0.4} />
              <stop offset="95%" stopColor="#ffffff" stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <CartesianGrid
            vertical={false}
            stroke="hsl(var(--border) / 0.55)"
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
            width={PERCENT_Y_AXIS_WIDTH}
            tickLine={false}
            axisLine={false}
            domain={[0, 100]}
            tickCount={yAxisTickCount}
            tickFormatter={formatPercentTick}
            tick={axisTickStyle}
            orientation="left"
            type="number"
          />
          <ChartTooltip
            cursor={false}
            formatter={ramSwapTooltipFormatter}
            content={<ChartTooltipContent labelFormatter={labelFormatter} indicator="dot" />}
          />
          <Area
            dataKey="ram"
            animationDuration={0}
            stroke={CHART_COLORS[0]}
            fill={areaFill(0)}
            strokeWidth={2}
            dot={false}
            type="monotone"
          />
          <Area
            dataKey="swap"
            animationDuration={0}
            stroke={CHART_COLORS[1]}
            fill={areaFill(1)}
            strokeWidth={2}
            dot={false}
            type="monotone"
          />
        </AreaChart>
      </ChartContainer>
    </Card>
  );
};

export const RamSwapChart = memo(RamSwapChartComponent, (prev, next) => {
  return (
    prev.data === next.data &&
    prev.currentRam === next.currentRam &&
    prev.currentSwap === next.currentSwap &&
    prev.timeFormatter === next.timeFormatter &&
    prev.labelFormatter === next.labelFormatter
  );
});

RamSwapChart.displayName = "RamSwapChart";
