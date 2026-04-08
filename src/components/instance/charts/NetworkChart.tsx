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
  NETWORK_Y_AXIS_WIDTH,
  sixChartMargin,
  xAxisPadding,
  xAxisTickStyle,
  yAxisTickCount,
} from "./shared";
import { ChartTitle } from "./shared";

const formatNetworkSpeed = (value: number) => formatBytesCompact(value, true);

interface NetworkChartProps {
  data: { time: string; net_in: number; net_out: number }[];
  currentUp: number;
  currentDown: number;
  timeFormatter: (value: string, index: number) => string;
  labelFormatter: (value: React.ReactNode) => string;
}

const NetworkChartComponent = ({
  data,
  currentUp,
  currentDown,
  timeFormatter,
  labelFormatter,
}: NetworkChartProps) => {
  const chartConfig = useMemo<ChartConfig>(
    () => ({
      net_in: { label: "下载", color: CHART_COLORS[0] },
      net_out: { label: "上传", color: CHART_COLORS[3] },
    }),
    [],
  );

  const networkTooltipFormatter = useMemo(
    () => (value: unknown) => `${formatBytesCompact(toFiniteNumber(value))}/s`,
    [],
  );

  return (
    <Card className="card-blur-target flex h-full w-full flex-col p-5">
      <ChartTitle
        text="网络速度"
        right={`↑ ${formatNetworkSpeed(currentUp)} | ↓ ${formatNetworkSpeed(currentDown)}`}
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
            width={NETWORK_Y_AXIS_WIDTH}
            tickLine={false}
            axisLine={false}
            tickCount={yAxisTickCount}
            tickFormatter={formatNetworkSpeed}
            tick={axisTickStyle}
            orientation="left"
            type="number"
          />
          <ChartTooltip
            cursor={false}
            formatter={networkTooltipFormatter}
            content={<ChartTooltipContent labelFormatter={labelFormatter} indicator="dot" />}
          />
          <Area
            dataKey="net_in"
            animationDuration={0}
            stroke={CHART_COLORS[0]}
            fill={areaFill(0)}
            strokeWidth={2}
            dot={false}
            type="monotone"
          />
          <Area
            dataKey="net_out"
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

export const NetworkChart = memo(NetworkChartComponent, (prev, next) => {
  return (
    prev.data === next.data &&
    prev.currentUp === next.currentUp &&
    prev.currentDown === next.currentDown &&
    prev.timeFormatter === next.timeFormatter &&
    prev.labelFormatter === next.labelFormatter
  );
});

NetworkChart.displayName = "NetworkChart";
