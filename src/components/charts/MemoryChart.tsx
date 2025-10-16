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
import { MemoryGradient } from "@/components/charts/shared/ChartGradients";

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
  return (
    <BaseChart
      data={data}
      timeRange={timeRange}
      title="内存使用率"
      description="实时内存使用率变化"
      onTimeRangeChange={_onTimeRangeChange}
      transformData={(data, _timeRange) =>
        data.map((record) => ({
          time: formatChartTimeByRange(record.time, _timeRange),
          value: Number(((record.ram / record.ram_total) * 100).toFixed(1)),
          used: record.ram,
          total: record.ram_total,
        }))
      }
      renderChart={(chartData, { xAxis, yAxis, cartesianGrid, tooltip }) => (
        <AreaChart data={chartData}>
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
          />
        </AreaChart>
      )}
    />
  );
}
