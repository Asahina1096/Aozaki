import { memo } from "react";
import { BaseAreaChart } from "./shared";
import { formatBytesCompact } from "@/lib/format/bytes";
import { toFiniteNumber } from "@/lib/normalizers/primitives";

interface NetworkChartProps {
  data: { time: string; net_in: number; net_out: number }[];
  currentUp: number;
  currentDown: number;
  timeFormatter: (value: string, index: number) => string;
  labelFormatter: (value: React.ReactNode) => string;
}

const formatNetworkSpeed = (value: number) => formatBytesCompact(value, true);
const networkTooltipFormatter = (value: unknown) =>
  `${formatBytesCompact(toFiniteNumber(value))}/s`;

const NetworkChartComponent = ({
  data,
  currentUp,
  currentDown,
  timeFormatter,
  labelFormatter,
}: NetworkChartProps) => {
  return (
    <BaseAreaChart
      title="网络速度"
      right={`↑ ${formatNetworkSpeed(currentUp)} | ↓ ${formatNetworkSpeed(currentDown)}`}
      data={data}
      dataKeys={[
        { key: "net_in", label: "下载", colorIndex: 0 },
        { key: "net_out", label: "上传", colorIndex: 3 },
      ]}
      yAxisWidth={72}
      yAxisDomain={[0, "auto"]}
      yAxisTickFormatter={formatNetworkSpeed}
      tooltipFormatter={networkTooltipFormatter}
      timeFormatter={timeFormatter}
      labelFormatter={labelFormatter}
    />
  );
};

export const NetworkChart = memo(NetworkChartComponent, (prev, next) => {
  return (
    prev.data === next.data &&
    prev.currentUp === next.currentUp &&
    prev.currentDown === next.currentDown &&
    prev.timeFormatter === next.timeFormatter &&
    prev.labelFormatter === next.labelFormatter
  );
});

NetworkChart.displayName = "NetworkChart";
