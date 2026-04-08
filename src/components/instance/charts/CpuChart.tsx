import { memo, useMemo } from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import type { ChartConfig } from "@/components/ui/chart";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Card } from "@/components/ui/card";
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

interface CpuChartProps {
  data: { time: string; cpu: number }[];
  currentValue: number;
  timeFormatter: (value: string, index: number) => string;
  labelFormatter: (value: React.ReactNode) => string;
}

const CpuChartComponent = ({
  data,
  currentValue,
  timeFormatter,
  labelFormatter,
}: CpuChartProps) => {
  const chartConfig = useMemo<ChartConfig>(
    () => ({ cpu: { label: "CPU", color: CHART_COLORS[0] } }),
    [],
  );

  const percentageFormatter = useMemo(() => (value: unknown) => `${Number(value).toFixed(2)}%`, []);

  return (
    <Card className="card-blur-target flex h-full w-full flex-col p-5">
      <ChartTitle text="CPU" right={currentValue > 0 ? `${currentValue.toFixed(2)}%` : "-"} />
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
            formatter={percentageFormatter}
            content={<ChartTooltipContent labelFormatter={labelFormatter} indicator="dot" />}
          />
          <Area
            dataKey="cpu"
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

export const CpuChart = memo(CpuChartComponent, (prev, next) => {
  return (
    prev.data === next.data &&
    prev.currentValue === next.currentValue &&
    prev.timeFormatter === next.timeFormatter &&
    prev.labelFormatter === next.labelFormatter
  );
});

CpuChart.displayName = "CpuChart";
