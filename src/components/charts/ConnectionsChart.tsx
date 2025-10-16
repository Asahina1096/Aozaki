import {
  LineChart,
  Line,
  Legend,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

import { formatChartTimeByRange } from "@/lib/utils";

import { BaseChart } from "@/components/charts/shared/BaseChart";

import type { StatusRecord } from "@/lib/types/komari";

interface ConnectionsChartProps {
  data: StatusRecord[];
  timeRange: number;
  onTimeRangeChange: (_value: number) => void;
}

export function ConnectionsChart({
  data,
  timeRange,
  onTimeRangeChange: _onTimeRangeChange,
}: ConnectionsChartProps) {
  return (
    <BaseChart
      data={data}
      timeRange={timeRange}
      title="连接数"
      description="实时 TCP/UDP 连接数变化"
      onTimeRangeChange={_onTimeRangeChange}
      transformData={(data, _timeRange) =>
        data.map((record) => ({
          time: formatChartTimeByRange(record.time, _timeRange),
          tcp: record.connections,
          udp: record.connections_udp,
        }))
      }
      renderChart={(chartData, { xAxis, yAxis, cartesianGrid, tooltip }) => (
        <LineChart data={chartData}>
          <CartesianGrid {...cartesianGrid} />
          <XAxis {...xAxis} />
          <YAxis {...yAxis} />
          <Tooltip {...tooltip} />
          <Legend />
          <Line
            type="monotone"
            dataKey="tcp"
            stroke="#3b82f6"
            strokeWidth={2}
            name="TCP"
            dot={false}
            isAnimationActive={false}
          />
          <Line
            type="monotone"
            dataKey="udp"
            stroke="#8b5cf6"
            strokeWidth={2}
            name="UDP"
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      )}
    />
  );
}
