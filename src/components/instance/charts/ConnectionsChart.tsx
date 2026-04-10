import { memo } from "react";
import { BaseAreaChart } from "./shared";
import { formatCountCompact } from "./shared";

interface ConnectionsChartProps {
  data: { time: string; connections: number; connections_udp: number }[];
  currentTcp: number;
  currentUdp: number;
  timeFormatter: (value: string, index: number) => string;
  labelFormatter: (value: React.ReactNode) => string;
}

const ConnectionsChartComponent = ({
  data,
  currentTcp,
  currentUdp,
  timeFormatter,
  labelFormatter,
}: ConnectionsChartProps) => {
  return (
    <BaseAreaChart
      title="连接数"
      right={`TCP ${formatCountCompact(currentTcp)} | UDP ${formatCountCompact(currentUdp)}`}
      data={data}
      dataKeys={[
        { key: "connections", label: "TCP", colorIndex: 0 },
        { key: "connections_udp", label: "UDP", colorIndex: 3 },
      ]}
      yAxisWidth={72}
      yAxisDomain={[0, "auto"]}
      yAxisTickFormatter={formatCountCompact}
      timeFormatter={timeFormatter}
      labelFormatter={labelFormatter}
    />
  );
};

export const ConnectionsChart = memo(ConnectionsChartComponent, (prev, next) => {
  return (
    prev.data === next.data &&
    prev.currentTcp === next.currentTcp &&
    prev.currentUdp === next.currentUdp &&
    prev.timeFormatter === next.timeFormatter &&
    prev.labelFormatter === next.labelFormatter
  );
});

ConnectionsChart.displayName = "ConnectionsChart";
