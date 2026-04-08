import { memo, useMemo } from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import type { ChartConfig } from "@/components/ui/chart";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Card } from "@/components/ui/card";
import {
  areaFill,
  axisTickStyle,
  CHART_COLORS,
  COUNT_Y_AXIS_WIDTH,
  sixChartMargin,
  xAxisPadding,
  xAxisTickStyle,
  yAxisTickCount,
} from "./shared";
import { ChartTitle } from "./shared";

const formatCountCompact = (value: number) => {
  const num = Number(value);
  if (!Number.isFinite(num) || num <= 0) return "0";
  if (num >= 1_000_000_000)
    return `${(num / 1_000_000_000).toFixed(num >= 10_000_000_000 ? 0 : 1)}B`;
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(num >= 10_000_000 ? 0 : 1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(num >= 10_000 ? 0 : 1)}K`;
  return `${Math.round(num)}`;
};

interface ConnectionsChartProps {
  data: { time: string; connections: number; connections_udp: number }[];
  currentTcp: number;
  currentUdp: number;
  timeFormatter: (value: string, index: number) => string;
  labelFormatter: (value: React.ReactNode) => string;
}

const ConnectionsChartComponent = ({
  data,
  currentTcp,
  currentUdp,
  timeFormatter,
  labelFormatter,
}: ConnectionsChartProps) => {
  const chartConfig = useMemo<ChartConfig>(
    () => ({
      connections: { label: "TCP", color: CHART_COLORS[0] },
      connections_udp: { label: "UDP", color: CHART_COLORS[3] },
    }),
    [],
  );

  return (
    <Card className="card-blur-target flex h-full w-full flex-col p-5">
      <ChartTitle
        text="连接数"
        right={`TCP ${formatCountCompact(currentTcp)} | UDP ${formatCountCompact(currentUdp)}`}
      />
      <ChartContainer config={chartConfig} className="h-40 w-full aspect-auto">
        <AreaChart data={data} accessibilityLayer margin={sixChartMargin}>
          <defs>
            <linearGradient id="soft-chart-fill-0" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={CHART_COLORS[0]} stopOpacity={0.4} />
              <stop offset="95%" stopColor="#ffffff" stopOpacity={0.05} />
            </linearGradient>
            <linearGradient id="soft-chart-fill-3" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={CHART_COLORS[3]} stopOpacity={0.4} />
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
            width={COUNT_Y_AXIS_WIDTH}
            tickLine={false}
            axisLine={false}
            tickCount={yAxisTickCount}
            tickFormatter={formatCountCompact}
            tick={axisTickStyle}
            orientation="left"
            type="number"
          />
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent labelFormatter={labelFormatter} indicator="dot" />}
          />
          <Area
            dataKey="connections"
            animationDuration={0}
            stroke={CHART_COLORS[0]}
            fill={areaFill(0)}
            strokeWidth={2}
            dot={false}
            type="monotone"
          />
          <Area
            dataKey="connections_udp"
            animationDuration={0}
            stroke={CHART_COLORS[3]}
            fill={areaFill(3)}
            strokeWidth={2}
            dot={false}
            type="monotone"
          />
        </AreaChart>
      </ChartContainer>
    </Card>
  );
};

export const ConnectionsChart = memo(ConnectionsChartComponent, (prev, next) => {
  return (
    prev.data === next.data &&
    prev.currentTcp === next.currentTcp &&
    prev.currentUdp === next.currentUdp &&
    prev.timeFormatter === next.timeFormatter &&
    prev.labelFormatter === next.labelFormatter
  );
});

ConnectionsChart.displayName = "ConnectionsChart";
