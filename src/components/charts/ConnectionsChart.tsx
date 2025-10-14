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
import { formatChartTimeByRange } from "@/lib/utils";
import { ChartContainer } from "./ChartContainer";
import type { StatusRecord } from "@/lib/types/komari";

interface ConnectionsChartProps {
  data: StatusRecord[];
  loading: boolean;
  timeRange: number;
  onTimeRangeChange: (hours: number) => void;
}

export function ConnectionsChart({
  data,
  loading,
  timeRange,
  onTimeRangeChange,
}: ConnectionsChartProps) {
  const chartData = useMemo(
    () =>
      data.map((record) => ({
        time: formatChartTimeByRange(record.time, timeRange),
        tcp: record.connections,
        udp: record.connections_udp,
      })),
    [data, timeRange]
  );

  const hasData = data && data.length > 0;

  return (
    <ChartContainer
      title="连接数"
      description="实时 TCP/UDP 连接数变化"
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
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--background))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "6px",
              }}
              labelStyle={{ color: "hsl(var(--foreground))" }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="tcp"
              stroke="#3b82f6"
              strokeWidth={2}
              name="TCP"
              dot={false}
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="udp"
              stroke="#8b5cf6"
              strokeWidth={2}
              name="UDP"
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </ChartContainer>
  );
}
