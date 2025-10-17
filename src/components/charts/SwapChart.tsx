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
import { SwapGradient } from "@/components/charts/shared/ChartGradients";

import type { StatusRecord } from "@/lib/types/komari";

interface SwapChartProps {
  data: StatusRecord[];
  timeRange: number;
  onTimeRangeChange: (_value: number) => void;
}

export function SwapChart({
  data,
  timeRange,
  onTimeRangeChange: _onTimeRangeChange,
}: SwapChartProps) {
  const shouldShow = useCallback(
    (data: StatusRecord[]) => data.some((record) => record.swap_total > 0),
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
          value:
            record && record.swap_total > 0
              ? Number(((record.swap / record.swap_total) * 100).toFixed(1))
              : null,
          used: record?.swap ?? 0,
          total: record?.swap_total ?? 0,
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
        <SwapGradient />
        <CartesianGrid {...cartesianGrid} />
        <XAxis {...xAxis} />
        <YAxis {...yAxis} domain={[0, 100]} unit="%" />
        <Tooltip {...tooltip} />
        <Area
          type="monotone"
          dataKey="value"
          stroke="#f59e0b"
          fill="url(#colorSwap)"
          strokeWidth={2}
          name="交换分区"
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
      title="Swap 使用率"
      description="实时 Swap 使用率变化"
      onTimeRangeChange={_onTimeRangeChange}
      shouldShow={shouldShow}
      transformData={transformData}
      renderChart={renderChart}
    />
  );
}
