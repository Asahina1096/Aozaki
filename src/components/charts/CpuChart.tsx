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
import { CpuGradient } from "./shared/ChartGradients";
import type { StatusRecord } from "@/lib/types/komari";

interface CpuChartProps {
  data: StatusRecord[];
  timeRange: number;
  onTimeRangeChange: (_value: number) => void;
}

export function CpuChart({
  data,
  timeRange,
  onTimeRangeChange: _onTimeRangeChange,
}: CpuChartProps) {
  return (
    <BaseChart
      data={data}
      timeRange={timeRange}
      title="CPU 使用率"
      description="实时 CPU 使用率变化"
      onTimeRangeChange={_onTimeRangeChange}
      transformData={(data, _timeRange) =>
        data.map((record) => ({
          time: formatChartTimeByRange(record.time, _timeRange),
          value: Number(record.cpu.toFixed(1)),
        }))
      }
      renderChart={(chartData, { xAxis, yAxis, cartesianGrid, tooltip }) => (
        <AreaChart data={chartData}>
          <CpuGradient />
          <CartesianGrid {...cartesianGrid} />
          <XAxis {...xAxis} />
          <YAxis {...yAxis} domain={[0, 100]} unit="%" />
          <Tooltip {...tooltip} />
          <Area
            type="monotone"
            dataKey="value"
            stroke="hsl(var(--primary))"
            fill="url(#colorCpu)"
            strokeWidth={2}
            name="CPU"
            unit="%"
            isAnimationActive={false}
          />
        </AreaChart>
      )}
    />
  );
}
