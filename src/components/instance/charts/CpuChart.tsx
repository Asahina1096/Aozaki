import { memo } from "react";
import { BaseAreaChart } from "./shared";
import { formatPercentTick } from "./shared";

interface CpuChartProps {
  data: { time: string; cpu: number }[];
  currentValue: number;
  timeFormatter: (value: string, index: number) => string;
  labelFormatter: (value: React.ReactNode) => string;
}

const CpuChartComponent = ({
  data,
  currentValue,
  timeFormatter,
  labelFormatter,
}: CpuChartProps) => {
  return (
    <BaseAreaChart
      title="CPU"
      right={currentValue > 0 ? `${currentValue.toFixed(2)}%` : "-"}
      data={data}
      dataKeys={[{ key: "cpu", label: "CPU", colorIndex: 0 }]}
      yAxisWidth={72}
      yAxisDomain={[0, 100]}
      yAxisTickFormatter={formatPercentTick}
      tooltipFormatter={(value) => `${Number(value).toFixed(2)}%`}
      timeFormatter={timeFormatter}
      labelFormatter={labelFormatter}
    />
  );
};

export const CpuChart = memo(CpuChartComponent, (prev, next) => {
  return (
    prev.data === next.data &&
    prev.currentValue === next.currentValue &&
    prev.timeFormatter === next.timeFormatter &&
    prev.labelFormatter === next.labelFormatter
  );
});

CpuChart.displayName = "CpuChart";
