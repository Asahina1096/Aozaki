import { useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { formatChartTimeByRange } from "@/lib/utils";
import { ChartContainer } from "./ChartContainer";
import type { StatusRecord } from "@/lib/types/komari";

interface CpuChartProps {
  data: StatusRecord[];
  loading: boolean;
  timeRange: number;
  onTimeRangeChange: (hours: number) => void;
}

export function CpuChart({
  data,
  loading,
  timeRange,
  onTimeRangeChange,
}: CpuChartProps) {
  const chartData = useMemo(
    () =>
      data.map((record) => ({
        time: formatChartTimeByRange(record.time, timeRange),
        value: Number(record.cpu.toFixed(1)),
      })),
    [data, timeRange]
  );

  const hasData = data && data.length > 0;

  return (
    <ChartContainer
      title="CPU 使用率"
      description="实时 CPU 使用率变化"
      timeRange={timeRange}
      onTimeRangeChange={onTimeRangeChange}
    >
      {!hasData ? (
        <div className="flex items-center justify-center h-[300px] text-muted-foreground">
          暂无数据
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="hsl(var(--primary))"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="hsl(var(--primary))"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="time"
              className="text-xs"
              tick={{ fill: "hsl(var(--muted-foreground))" }}
            />
            <YAxis
              className="text-xs"
              tick={{ fill: "hsl(var(--muted-foreground))" }}
              domain={[0, 100]}
              unit="%"
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--background))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "6px",
              }}
              labelStyle={{ color: "hsl(var(--foreground))" }}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="hsl(var(--primary))"
              fill="url(#colorCpu)"
              strokeWidth={2}
              name="CPU"
              unit="%"
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </ChartContainer>
  );
}
