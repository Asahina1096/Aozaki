import {
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { useCallback } from "react";

import { generateTimeAxis } from "@/lib/utils";

import { BaseChart } from "@/components/charts/shared/BaseChart";
import { MemoryGradient } from "@/components/charts/shared/ChartGradients";
import type { ChartComponents } from "@/components/charts/shared/chartConfig";

import type { StatusRecord } from "@/lib/types/komari";

interface MemoryChartProps {
  data: StatusRecord[];
  timeRange: number;
  onTimeRangeChange: (_value: number) => void;
}

export function MemoryChart({
  data,
  timeRange,
  onTimeRangeChange: _onTimeRangeChange,
}: MemoryChartProps) {
  const shouldShow = useCallback(
    (data: StatusRecord[]) =>
      data.some((record) => record.ram > 0 && record.ram_total > 0),
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
          value: record
            ? Number(((record.ram / record.ram_total) * 100).toFixed(1))
            : null,
          used: record?.ram ?? 0,
          total: record?.ram_total ?? 0,
        };
      });
    },
    []
  );

  const renderChart = useCallback(
    (
      chartData: unknown,
      { xAxis, yAxis, cartesianGrid, tooltip }: ChartComponents
    ) => (
      <AreaChart
        data={
          chartData as Array<{
            time: string;
            value: number;
            used: number;
            total: number;
          }>
        }
      >
        <MemoryGradient />
        <CartesianGrid {...cartesianGrid} />
        <XAxis {...xAxis} />
        <YAxis {...yAxis} domain={[0, 100]} unit="%" />
        <Tooltip {...tooltip} />
        <Area
          type="monotone"
          dataKey="value"
          stroke="#10b981"
          fill="url(#colorMemory)"
          strokeWidth={2}
          name="内存"
          unit="%"
          isAnimationActive={false}
          connectNulls={false}
        />
      </AreaChart>
    ),
    []
  );

  return (
    <BaseChart
      data={data}
      timeRange={timeRange}
      title="内存使用率"
      description="实时内存使用率变化"
      onTimeRangeChange={_onTimeRangeChange}
      shouldShow={shouldShow}
      transformData={transformData}
      renderChart={renderChart}
    />
  );
}
