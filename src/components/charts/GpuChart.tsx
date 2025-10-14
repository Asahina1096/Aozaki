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

interface GpuChartProps {
  data: StatusRecord[];
  loading: boolean;
  timeRange: number;
  onTimeRangeChange: (hours: number) => void;
}

export function GpuChart({
  data,
  loading,
  timeRange,
  onTimeRangeChange,
}: GpuChartProps) {
  const hasGpu = data.some((record) => record.gpu > 0);

  const chartData = useMemo(
    () =>
      data.map((record) => ({
        time: formatChartTimeByRange(record.time, timeRange),
        value: Number(record.gpu.toFixed(1)),
      })),
    [data, timeRange]
  );

  if (!data || data.length === 0 || !hasGpu) {
    return null;
  }

  return (
    <ChartContainer
      title="GPU 使用率"
      description="实时 GPU 使用率变化"
      timeRange={timeRange}
      onTimeRangeChange={onTimeRangeChange}
    >
      {loading ? (
        <div className="flex items-center justify-center h-[300px]">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent" />
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorGpu" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ec4899" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#ec4899" stopOpacity={0.1} />
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
              stroke="#ec4899"
              fill="url(#colorGpu)"
              strokeWidth={2}
              name="GPU"
              unit="%"
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </ChartContainer>
  );
}
