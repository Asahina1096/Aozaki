import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { formatChartTimeByRange } from "@/lib/utils";
import { BaseChart } from "./shared/BaseChart";
import type { StatusRecord } from "@/lib/types/komari";

interface TempChartProps {
  data: StatusRecord[];
  timeRange: number;
  onTimeRangeChange: (_value: number) => void;
}

export function TempChart({
  data,
  timeRange,
  onTimeRangeChange: _onTimeRangeChange,
}: TempChartProps) {
  return (
    <BaseChart
      data={data}
      timeRange={timeRange}
      title="温度"
      description="实时温度变化"
      onTimeRangeChange={_onTimeRangeChange}
      shouldShow={(data) => data.some((record) => record.temp > 0)}
      transformData={(data, _timeRange) =>
        data.map((record) => ({
          time: formatChartTimeByRange(record.time, _timeRange),
          value: Number(record.temp.toFixed(1)),
        }))
      }
      yAxisConfig={{
        unit: "°C",
      }}
      tooltipFormatter={(value: unknown) => [`${Number(value)}°C`, ""]}
      renderChart={(chartData, { xAxis, yAxis, cartesianGrid, tooltip }) => (
        <LineChart data={chartData}>
          <CartesianGrid {...cartesianGrid} />
          <XAxis {...xAxis} />
          <YAxis {...yAxis} />
          <Tooltip {...tooltip} />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#f97316"
            strokeWidth={2}
            name="温度"
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      )}
    />
  );
}
