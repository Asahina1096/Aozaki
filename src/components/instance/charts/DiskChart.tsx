import { memo } from "react";
import { BaseAreaChart } from "./shared";
import { formatBytesCompact } from "@/lib/format/bytes";
import { toFiniteNumber } from "@/lib/normalizers/primitives";

interface DiskChartProps {
  data: { time: string; disk: number }[];
  currentValue: number;
  yAxisMax: number;
  timeFormatter: (value: string, index: number) => string;
  labelFormatter: (value: React.ReactNode) => string;
}

const formatBytesCompactTick = (value: number) => formatBytesCompact(value, false);
const diskTooltipFormatter = (value: unknown) => formatBytesCompact(toFiniteNumber(value));

const DiskChartComponent = ({
  data,
  currentValue,
  yAxisMax,
  timeFormatter,
  labelFormatter,
}: DiskChartProps) => {
  return (
    <BaseAreaChart
      title="磁盘"
      right={currentValue > 0 ? formatBytesCompact(currentValue) : "-"}
      data={data}
      dataKeys={[{ key: "disk", label: "磁盘", colorIndex: 0 }]}
      yAxisWidth={72}
      yAxisDomain={[0, yAxisMax]}
      yAxisTickFormatter={formatBytesCompactTick}
      tooltipFormatter={diskTooltipFormatter}
      timeFormatter={timeFormatter}
      labelFormatter={labelFormatter}
    />
  );
};

export const DiskChart = memo(DiskChartComponent, (prev, next) => {
  return (
    prev.data === next.data &&
    prev.currentValue === next.currentValue &&
    prev.yAxisMax === next.yAxisMax &&
    prev.timeFormatter === next.timeFormatter &&
    prev.labelFormatter === next.labelFormatter
  );
});

DiskChart.displayName = "DiskChart";
