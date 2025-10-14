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
import { formatChartTimeByRange, formatBytes } from "@/lib/utils";
import { ChartContainer } from "./ChartContainer";
import type { StatusRecord } from "@/lib/types/komari";

interface SwapChartProps {
  data: StatusRecord[];
  loading: boolean;
  timeRange: number;
  onTimeRangeChange: (hours: number) => void;
}

export function SwapChart({
  data,
  loading,
  timeRange,
  onTimeRangeChange,
}: SwapChartProps) {
  const hasSwap = data.some((record) => record.swap_total > 0);

  const chartData = useMemo(
    () =>
      data.map((record) => ({
        time: formatChartTimeByRange(record.time, timeRange),
        value:
          record.swap_total > 0
            ? Number(((record.swap / record.swap_total) * 100).toFixed(1))
            : 0,
        used: record.swap,
        total: record.swap_total,
      })),
    [data, timeRange]
  );

  if (!data || data.length === 0 || !hasSwap) {
    return null;
  }

  return (
    <ChartContainer
      title="交换分区使用率"
      description="实时交换分区使用率变化"
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
              <linearGradient id="colorSwap" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.1} />
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
              formatter={(value, name, props) => {
                if (
                  name === "交换分区" &&
                  props &&
                  typeof props === "object" &&
                  "payload" in props
                ) {
                  const payload = props.payload as {
                    used: number;
                    total: number;
                  };
                  return [
                    `${value}% (${formatBytes(payload.used)} / ${formatBytes(payload.total)})`,
                    name,
                  ];
                }
                return [value, name];
              }}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#f59e0b"
              fill="url(#colorSwap)"
              strokeWidth={2}
              name="交换分区"
              unit="%"
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </ChartContainer>
  );
}
