import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";

import { formatChartTimeByRange, formatSpeed } from "@/lib/utils";

import { BaseChart } from "@/components/charts/shared/BaseChart";

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
  return (
    <BaseChart
      data={data}
      timeRange={timeRange}
      title="网络流量"
      description="实时网络流量变化"
      onTimeRangeChange={_onTimeRangeChange}
      transformData={(data, _timeRange) =>
        data.map((record) => ({
          time: formatChartTimeByRange(record.time, _timeRange),
          upload: record.net_out,
          download: record.net_in,
        }))
      }
      yAxisConfig={{
        tickFormatter: (value: number) => formatSpeed(value),
      }}
      tooltipFormatter={(value: unknown) => [formatSpeed(Number(value)), ""]}
      renderChart={(chartData, { xAxis, yAxis, cartesianGrid, tooltip }) => (
        <LineChart data={chartData}>
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
          />
          <Line
            type="monotone"
            dataKey="download"
            stroke="#3b82f6"
            strokeWidth={2}
            name="下载"
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      )}
    />
  );
}
