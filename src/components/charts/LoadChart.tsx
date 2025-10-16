import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

import { formatChartTimeByRange } from "@/lib/utils";

import { BaseChart } from "@/components/charts/shared/BaseChart";

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
  return (
    <BaseChart
      data={data}
      timeRange={timeRange}
      title="系统负载"
      description="实时系统负载变化"
      onTimeRangeChange={_onTimeRangeChange}
      transformData={(data, _timeRange) =>
        data.map((record) => ({
          time: formatChartTimeByRange(record.time, _timeRange),
          load1: Number(record.load.toFixed(2)),
        }))
      }
      tooltipFormatter={(value: unknown) => [`${Number(value)}`, "负载"]}
      renderChart={(chartData, { xAxis, yAxis, cartesianGrid, tooltip }) => (
        <LineChart data={chartData}>
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
          />
        </LineChart>
      )}
    />
  );
}
