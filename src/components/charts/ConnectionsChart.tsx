import {
  LineChart,
  Line,
  Legend,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { useCallback } from "react";

import { generateTimeAxis } from "@/lib/utils";

import { BaseChart } from "@/components/charts/shared/BaseChart";
import type { ChartComponents } from "@/components/charts/shared/chartConfig";

import type { StatusRecord } from "@/lib/types/komari";

interface ConnectionsChartProps {
  data: StatusRecord[];
  timeRange: number;
  onTimeRangeChange: (_value: number) => void;
}

export function ConnectionsChart({
  data,
  timeRange,
  onTimeRangeChange: _onTimeRangeChange,
}: ConnectionsChartProps) {
  const shouldShow = useCallback(
    (data: StatusRecord[]) =>
      data.some(
        (record) => record.connections > 0 || record.connections_udp > 0
      ),
    []
  );

  const transformData = useCallback(
    (data: StatusRecord[], timeRange: number) => {
      const timeAxis = generateTimeAxis(data, timeRange);

      return timeAxis.map(({ timestamp, timeLabel }) => {
        // 查找匹配的数据点（容忍 1 分钟误差）
        const record = data.find((r) => {
          const recordTime =
            typeof r.time === "string"
              ? new Date(r.time).getTime()
              : r.time * 1000;
          return Math.abs(recordTime - timestamp) < 60000;
        });

        return {
          time: timeLabel,
          tcp: record?.connections ?? null,
          udp: record?.connections_udp ?? null,
        };
      });
    },
    []
  );

  const renderChart = useCallback(
    (
      chartData: unknown[],
      { xAxis, yAxis, cartesianGrid, tooltip }: ChartComponents
    ) => (
      <LineChart
        data={
          chartData as Array<{
            time: string;
            tcp: number | null;
            udp: number | null;
          }>
        }
      >
        <CartesianGrid {...cartesianGrid} />
        <XAxis {...xAxis} />
        <YAxis {...yAxis} />
        <Tooltip {...tooltip} />
        <Legend />
        <Line
          type="monotone"
          dataKey="tcp"
          stroke="#3b82f6"
          strokeWidth={2}
          name="TCP"
          dot={false}
          isAnimationActive={false}
          connectNulls={false}
        />
        <Line
          type="monotone"
          dataKey="udp"
          stroke="#8b5cf6"
          strokeWidth={2}
          name="UDP"
          dot={false}
          isAnimationActive={false}
          connectNulls={false}
        />
      </LineChart>
    ),
    []
  );

  return (
    <BaseChart
      data={data}
      timeRange={timeRange}
      title="连接数"
      description="实时 TCP/UDP 连接数变化"
      onTimeRangeChange={_onTimeRangeChange}
      shouldShow={shouldShow}
      transformData={transformData}
      renderChart={renderChart}
    />
  );
}
