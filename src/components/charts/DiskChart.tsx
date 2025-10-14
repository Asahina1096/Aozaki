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

interface DiskChartProps {
  data: StatusRecord[];
  loading: boolean;
  timeRange: number;
  onTimeRangeChange: (hours: number) => void;
}

export function DiskChart({
  data,
  loading,
  timeRange,
  onTimeRangeChange,
}: DiskChartProps) {
  const chartData = useMemo(
    () =>
      data.map((record) => ({
        time: formatChartTimeByRange(record.time, timeRange),
        value: Number(((record.disk / record.disk_total) * 100).toFixed(1)),
        used: record.disk,
        total: record.disk_total,
      })),
    [data, timeRange]
  );

  const hasData = data && data.length > 0;

  return (
    <ChartContainer
      title="磁盘使用率"
      description="实时磁盘使用率变化"
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
              <linearGradient id="colorDisk" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1} />
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
              formatter={(value: any, name: string, props: any) => {
                if (name === "磁盘") {
                  return [
                    `${value}% (${formatBytes(props.payload.used)} / ${formatBytes(props.payload.total)})`,
                    name,
                  ];
                }
                return [value, name];
              }}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#8b5cf6"
              fill="url(#colorDisk)"
              strokeWidth={2}
              name="磁盘"
              unit="%"
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </ChartContainer>
  );
}
