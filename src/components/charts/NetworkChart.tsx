import { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { formatChartTimeByRange, formatSpeed } from "@/lib/utils";
import { ChartContainer } from "./ChartContainer";
import type { StatusRecord } from "@/lib/types/komari";

interface NetworkChartProps {
  data: StatusRecord[];
  loading: boolean;
  timeRange: number;
  onTimeRangeChange: (hours: number) => void;
}

export function NetworkChart({
  data,
  loading,
  timeRange,
  onTimeRangeChange,
}: NetworkChartProps) {
  const chartData = useMemo(
    () =>
      data.map((record) => ({
        time: formatChartTimeByRange(record.time, timeRange),
        upload: record.net_out,
        download: record.net_in,
      })),
    [data, timeRange]
  );

  const hasData = data && data.length > 0;

  return (
    <ChartContainer
      title="网络速度"
      description="实时网络上传/下载速度"
      timeRange={timeRange}
      onTimeRangeChange={onTimeRangeChange}
    >
      {!hasData ? (
        <div className="flex items-center justify-center h-[300px] text-muted-foreground">
          暂无数据
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="time"
              className="text-xs"
              tick={{ fill: "hsl(var(--muted-foreground))" }}
            />
            <YAxis
              className="text-xs"
              tick={{ fill: "hsl(var(--muted-foreground))" }}
              tickFormatter={(value) => formatSpeed(value)}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--background))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "6px",
              }}
              labelStyle={{ color: "hsl(var(--foreground))" }}
              formatter={(value: any) => formatSpeed(Number(value))}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="upload"
              stroke="#10b981"
              strokeWidth={2}
              name="上传"
              dot={false}
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="download"
              stroke="#3b82f6"
              strokeWidth={2}
              name="下载"
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </ChartContainer>
  );
}
