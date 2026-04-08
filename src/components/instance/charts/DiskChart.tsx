import { memo, useMemo } from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import type { ChartConfig } from "@/components/ui/chart";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Card } from "@/components/ui/card";
import { formatBytesCompact } from "@/lib/format/bytes";
import { toFiniteNumber } from "@/lib/normalizers/primitives";
import {
  areaFill,
  axisTickStyle,
  CHART_COLORS,
  STORAGE_Y_AXIS_WIDTH,
  sixChartMargin,
  xAxisPadding,
  xAxisTickStyle,
  yAxisTickCount,
} from "./shared";
import { ChartTitle } from "./shared";

const formatBytesCompactTick = (value: number) => formatBytesCompact(value, false);

interface DiskChartProps {
  data: { time: string; disk: number }[];
  currentValue: number;
  yAxisMax: number;
  timeFormatter: (value: string, index: number) => string;
  labelFormatter: (value: React.ReactNode) => string;
}

const DiskChartComponent = ({
  data,
  currentValue,
  yAxisMax,
  timeFormatter,
  labelFormatter,
}: DiskChartProps) => {
  const chartConfig = useMemo<ChartConfig>(
    () => ({ disk: { label: "磁盘", color: CHART_COLORS[0] } }),
    [],
  );

  const diskTooltipFormatter = useMemo(
    () => (value: unknown) => formatBytesCompact(toFiniteNumber(value)),
    [],
  );

  return (
    <Card className="card-blur-target flex h-full w-full flex-col p-5">
      <ChartTitle text="磁盘" right={currentValue > 0 ? formatBytesCompact(currentValue) : "-"} />
      <ChartContainer config={chartConfig} className="h-40 w-full aspect-auto">
        <AreaChart data={data} accessibilityLayer margin={sixChartMargin}>
          <defs>
            <linearGradient id="soft-chart-fill-0" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={CHART_COLORS[0]} stopOpacity={0.4} />
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
            width={STORAGE_Y_AXIS_WIDTH}
            tickLine={false}
            axisLine={false}
            domain={[0, yAxisMax]}
            tickCount={yAxisTickCount}
            tickFormatter={formatBytesCompactTick}
            tick={axisTickStyle}
            orientation="left"
            type="number"
          />
          <ChartTooltip
            cursor={false}
            formatter={diskTooltipFormatter}
            content={<ChartTooltipContent labelFormatter={labelFormatter} indicator="dot" />}
          />
          <Area
            dataKey="disk"
            animationDuration={0}
            stroke={CHART_COLORS[0]}
            fill={areaFill(0)}
            strokeWidth={2}
            dot={false}
            type="monotone"
          />
        </AreaChart>
      </ChartContainer>
    </Card>
  );
};

export const DiskChart = memo(DiskChartComponent, (prev, next) => {
  return (
    prev.data === next.data &&
    prev.currentValue === next.currentValue &&
    prev.yAxisMax === next.yAxisMax &&
    prev.timeFormatter === next.timeFormatter &&
    prev.labelFormatter === next.labelFormatter
  );
});

DiskChart.displayName = "DiskChart";
