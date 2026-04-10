import { memo } from "react";
import { BaseAreaChart } from "./shared";
import { formatCountCompact } from "./shared";

interface ProcessChartProps {
  data: { time: string; process: number }[];
  currentValue: number;
  timeFormatter: (value: string, index: number) => string;
  labelFormatter: (value: React.ReactNode) => string;
}

const ProcessChartComponent = ({
  data,
  currentValue,
  timeFormatter,
  labelFormatter,
}: ProcessChartProps) => {
  return (
    <BaseAreaChart
      title="进程数"
      right={formatCountCompact(currentValue)}
      data={data}
      dataKeys={[{ key: "process", label: "进程数", colorIndex: 0 }]}
      yAxisWidth={72}
      yAxisDomain={[0, "auto"]}
      yAxisTickFormatter={formatCountCompact}
      timeFormatter={timeFormatter}
      labelFormatter={labelFormatter}
    />
  );
};

export const ProcessChart = memo(ProcessChartComponent, (prev, next) => {
  return (
    prev.data === next.data &&
    prev.currentValue === next.currentValue &&
    prev.timeFormatter === next.timeFormatter &&
    prev.labelFormatter === next.labelFormatter
  );
});

ProcessChart.displayName = "ProcessChart";
