import {
  LineChart,
  Line,
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

interface LoadChartProps {
  data: StatusRecord[];
  timeRange: number;
  onTimeRangeChange: (_value: number) => void;
}

export function LoadChart({
  data,
  timeRange,
  onTimeRangeChange: _onTimeRangeChange,
}: LoadChartProps) {
  const shouldShow = useCallback(
    (data: StatusRecord[]) => data.some((record) => record.load > 0),
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
          load1: record ? Number(record.load.toFixed(2)) : null,
        };
      });
    },
    []
  );

  const tooltipFormatter = useCallback(
    (value: unknown) => [`${Number(value)}`, "负载"] as [string, string],
    []
  );

  const renderChart = useCallback(
    (
      chartData: unknown,
      { xAxis, yAxis, cartesianGrid, tooltip }: ChartComponents
    ) => (
      <LineChart data={chartData as Array<{ time: string; load1: number }>}>
        <CartesianGrid {...cartesianGrid} />
        <XAxis {...xAxis} />
        <YAxis {...yAxis} />
        <Tooltip {...tooltip} />
        <Line
          type="monotone"
          dataKey="load1"
          stroke="#ef4444"
          strokeWidth={2}
          name="负载"
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
      title="系统负载"
      description="实时系统负载变化"
      onTimeRangeChange={_onTimeRangeChange}
      shouldShow={shouldShow}
      transformData={transformData}
      tooltipFormatter={tooltipFormatter}
      renderChart={renderChart}
    />
  );
}
