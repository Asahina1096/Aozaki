import {
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { formatChartTimeByRange } from "@/lib/utils";
import { BaseChart } from "./shared/BaseChart";
import { SwapGradient } from "./shared/ChartGradients";
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
  return (
    <BaseChart
      data={data}
      timeRange={timeRange}
      title="Swap 使用率"
      description="实时 Swap 使用率变化"
      onTimeRangeChange={_onTimeRangeChange}
      shouldShow={(data) => data.some((record) => record.swap_total > 0)}
      transformData={(data, _timeRange) =>
        data.map((record) => ({
          time: formatChartTimeByRange(record.time, _timeRange),
          value:
            record.swap_total > 0
              ? Number(((record.swap / record.swap_total) * 100).toFixed(1))
              : 0,
          used: record.swap,
          total: record.swap_total,
        }))
      }
      renderChart={(chartData, { xAxis, yAxis, cartesianGrid, tooltip }) => (
        <AreaChart data={chartData}>
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
          />
        </AreaChart>
      )}
    />
  );
}
