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

interface ProcessChartProps {
  data: StatusRecord[];
  timeRange: number;
  onTimeRangeChange: (_value: number) => void;
}

export function ProcessChart({
  data,
  timeRange,
  onTimeRangeChange: _onTimeRangeChange,
}: ProcessChartProps) {
  const shouldShow = useCallback(
    (data: StatusRecord[]) => data.some((record) => record.process > 0),
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
          value: record?.process ?? null,
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
        data={chartData as Array<{ time: string; value: number | null }>}
      >
        <CartesianGrid {...cartesianGrid} />
        <XAxis {...xAxis} />
        <YAxis {...yAxis} />
        <Tooltip {...tooltip} />
        <Line
          type="monotone"
          dataKey="value"
          stroke="#06b6d4"
          strokeWidth={2}
          name="进程数"
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
      title="进程数"
      description="实时进程数变化"
      onTimeRangeChange={_onTimeRangeChange}
      shouldShow={shouldShow}
      transformData={transformData}
      renderChart={renderChart}
    />
  );
}
