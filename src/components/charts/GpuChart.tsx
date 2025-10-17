import { useCallback } from "react";
import {
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

import { generateTimeAxis } from "@/lib/utils";

import { BaseChart } from "@/components/charts/shared/BaseChart";
import { GpuGradient } from "@/components/charts/shared/ChartGradients";

import type { StatusRecord } from "@/lib/types/komari";

interface GpuChartProps {
  data: StatusRecord[];
  timeRange: number;
  onTimeRangeChange: (_value: number) => void;
}

export function GpuChart({
  data,
  timeRange,
  onTimeRangeChange: _onTimeRangeChange,
}: GpuChartProps) {
  const shouldShow = useCallback(
    (data: StatusRecord[]) => data.some((record) => record.gpu > 0),
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
          value: record ? Number(record.gpu.toFixed(1)) : null,
        };
      });
    },
    []
  );

  const renderChart = useCallback(
    (
      chartData: unknown[],
      {
        xAxis,
        yAxis,
        cartesianGrid,
        tooltip,
      }: {
        xAxis: Record<string, unknown>;
        yAxis: Record<string, unknown>;
        cartesianGrid: Record<string, unknown>;
        tooltip: Record<string, unknown>;
      }
    ) => (
      <AreaChart data={chartData as Array<{ time: string; value: number }>}>
        <GpuGradient />
        <CartesianGrid {...cartesianGrid} />
        <XAxis {...xAxis} />
        <YAxis {...yAxis} domain={[0, 100]} unit="%" />
        <Tooltip {...tooltip} />
        <Area
          type="monotone"
          dataKey="value"
          stroke="#ec4899"
          fill="url(#colorGpu)"
          strokeWidth={2}
          name="GPU"
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
      title="GPU 使用率"
      description="实时 GPU 使用率变化"
      onTimeRangeChange={_onTimeRangeChange}
      shouldShow={shouldShow}
      transformData={transformData}
      renderChart={renderChart}
    />
  );
}
