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
import { GpuGradient } from "./shared/ChartGradients";
import type { StatusRecord } from "@/lib/types/komari";

interface GpuChartProps {
  data: StatusRecord[];
  timeRange: number;
  onTimeRangeChange: (_value: number) => void;
}

export function GpuChart({
  data,
  timeRange,
  onTimeRangeChange: _onTimeRangeChange,
}: GpuChartProps) {
  return (
    <BaseChart
      data={data}
      timeRange={timeRange}
      title="GPU 使用率"
      description="实时 GPU 使用率变化"
      onTimeRangeChange={_onTimeRangeChange}
      shouldShow={(data) => data.some((record) => record.gpu > 0)}
      transformData={(data, _timeRange) =>
        data.map((record) => ({
          time: formatChartTimeByRange(record.time, _timeRange),
          value: Number(record.gpu.toFixed(1)),
        }))
      }
      renderChart={(chartData, { xAxis, yAxis, cartesianGrid, tooltip }) => (
        <AreaChart data={chartData}>
          <GpuGradient />
          <CartesianGrid {...cartesianGrid} />
          <XAxis {...xAxis} />
          <YAxis {...yAxis} domain={[0, 100]} unit="%" />
          <Tooltip {...tooltip} />
          <Area
            type="monotone"
            dataKey="value"
            stroke="#ec4899"
            fill="url(#colorGpu)"
            strokeWidth={2}
            name="GPU"
            unit="%"
            isAnimationActive={false}
          />
        </AreaChart>
      )}
    />
  );
}
