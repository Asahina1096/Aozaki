import {
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

import { formatChartTimeByRange } from "@/lib/utils";

import { BaseChart } from "@/components/charts/shared/BaseChart";
import { DiskGradient } from "@/components/charts/shared/ChartGradients";

import type { StatusRecord } from "@/lib/types/komari";

interface DiskChartProps {
  data: StatusRecord[];
  timeRange: number;
  onTimeRangeChange: (_value: number) => void;
}

export function DiskChart({
  data,
  timeRange,
  onTimeRangeChange: _onTimeRangeChange,
}: DiskChartProps) {
  return (
    <BaseChart
      data={data}
      timeRange={timeRange}
      title="磁盘使用率"
      description="实时磁盘使用率变化"
      onTimeRangeChange={_onTimeRangeChange}
      transformData={(data, _timeRange) =>
        data.map((record) => ({
          time: formatChartTimeByRange(record.time, _timeRange),
          value: Number(((record.disk / record.disk_total) * 100).toFixed(1)),
          used: record.disk,
          total: record.disk_total,
        }))
      }
      renderChart={(chartData, { xAxis, yAxis, cartesianGrid, tooltip }) => (
        <AreaChart data={chartData}>
          <DiskGradient />
          <CartesianGrid {...cartesianGrid} />
          <XAxis {...xAxis} />
          <YAxis {...yAxis} domain={[0, 100]} unit="%" />
          <Tooltip {...tooltip} />
          <Area
            type="monotone"
            dataKey="value"
            stroke="#8b5cf6"
            fill="url(#colorDisk)"
            strokeWidth={2}
            name="磁盘"
            unit="%"
            isAnimationActive={false}
          />
        </AreaChart>
      )}
    />
  );
}
