import { useCallback, useMemo } from "react";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";

import { generateTimeAxis, formatSpeed } from "@/lib/utils";

import { BaseChart } from "@/components/charts/shared/BaseChart";
import { CustomSpeedYAxisTick } from "@/components/charts/shared/CustomTicks";

import type { StatusRecord } from "@/lib/types/komari";

interface NetworkChartProps {
  data: StatusRecord[];
  timeRange: number;
  onTimeRangeChange: (_value: number) => void;
}

export function NetworkChart({
  data,
  timeRange,
  onTimeRangeChange: _onTimeRangeChange,
}: NetworkChartProps) {
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
          upload: record?.net_out ?? null,
          download: record?.net_in ?? null,
        };
      });
    },
    []
  );

  const yAxisConfig = useMemo(
    () => ({
      tick: CustomSpeedYAxisTick,
    }),
    []
  );

  const tooltipFormatter = useCallback(
    (value: unknown) => [formatSpeed(Number(value)), ""] as [string, string],
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
      <LineChart
        data={
          chartData as Array<{
            time: string;
            upload: number;
            download: number;
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
          dataKey="upload"
          stroke="#10b981"
          strokeWidth={2}
          name="上传"
          dot={false}
          isAnimationActive={false}
          connectNulls={false}
        />
        <Line
          type="monotone"
          dataKey="download"
          stroke="#3b82f6"
          strokeWidth={2}
          name="下载"
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
      title="网络流量"
      description="实时网络流量变化"
      onTimeRangeChange={_onTimeRangeChange}
      transformData={transformData}
      yAxisConfig={yAxisConfig}
      tooltipFormatter={tooltipFormatter}
      renderChart={renderChart}
    />
  );
}
