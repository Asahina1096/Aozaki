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
  return (
    <BaseChart
      data={data}
      timeRange={timeRange}
      title="进程数"
      description="实时进程数变化"
      onTimeRangeChange={_onTimeRangeChange}
      transformData={(data, _timeRange) =>
        data.map((record) => ({
          time: formatChartTimeByRange(record.time, _timeRange),
          value: record.process,
        }))
      }
      renderChart={(chartData, { xAxis, yAxis, cartesianGrid, tooltip }) => (
        <LineChart data={chartData}>
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
          />
        </LineChart>
      )}
    />
  );
}
