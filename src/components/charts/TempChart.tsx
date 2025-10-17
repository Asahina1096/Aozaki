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

interface TempChartProps {
  data: StatusRecord[];
  timeRange: number;
  onTimeRangeChange: (_value: number) => void;
}

export function TempChart({
  data,
  timeRange,
  onTimeRangeChange: _onTimeRangeChange,
}: TempChartProps) {
  const shouldShow = useCallback(
    (data: StatusRecord[]) => data.some((record) => record.temp > 0),
    []
  );

  const transformData = useCallback(
    (data: StatusRecord[], _timeRange: number) => {
      const timeAxis = generateTimeAxis(data, _timeRange);

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
          value: record ? Number(record.temp.toFixed(1)) : null,
        };
      });
    },
    []
  );

  const tooltipFormatter = useCallback(
    (value: unknown) => [`${Number(value)}°C`, ""] as [string, string],
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
          stroke="#f97316"
          strokeWidth={2}
          name="温度"
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
      title="温度"
      description="实时温度变化"
      onTimeRangeChange={_onTimeRangeChange}
      shouldShow={shouldShow}
      transformData={transformData}
      yAxisConfig={{
        unit: "°C",
      }}
      tooltipFormatter={tooltipFormatter}
      renderChart={renderChart}
    />
  );
}
