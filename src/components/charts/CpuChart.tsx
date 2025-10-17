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
import { CpuGradient } from "@/components/charts/shared/ChartGradients";

import type { StatusRecord } from "@/lib/types/komari";

interface CpuChartProps {
  data: StatusRecord[];
  timeRange: number;
  onTimeRangeChange: (_value: number) => void;
}

export function CpuChart({
  data,
  timeRange,
  onTimeRangeChange: _onTimeRangeChange,
}: CpuChartProps) {
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
          value: record ? Number(record.cpu.toFixed(1)) : null,
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
        <CpuGradient />
        <CartesianGrid {...cartesianGrid} />
        <XAxis {...xAxis} />
        <YAxis {...yAxis} domain={[0, 100]} unit="%" />
        <Tooltip {...tooltip} />
        <Area
          type="monotone"
          dataKey="value"
          stroke="#0ea5e9"
          fill="url(#colorCpu)"
          strokeWidth={2}
          name="CPU"
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
      title="CPU 使用率"
      description="实时 CPU 使用率变化"
      onTimeRangeChange={_onTimeRangeChange}
      transformData={transformData}
      renderChart={renderChart}
    />
  );
}
