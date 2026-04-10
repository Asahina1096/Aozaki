import { memo } from "react";
import { BaseAreaChart } from "./shared";
import { formatBytesCompact } from "@/lib/format/bytes";
import { formatBytes } from "@/utils/unitHelper";
import { toFiniteNumber } from "@/lib/normalizers/primitives";
import { formatPercentTick } from "./shared";

interface RamSwapChartProps {
  data: { time: string; ram: number; swap: number; ram_raw?: number; swap_raw?: number }[];
  currentRam: number;
  currentSwap: number;
  timeFormatter: (value: string, index: number) => string;
  labelFormatter: (value: React.ReactNode) => string;
}

const ramSwapTooltipFormatter = (value: unknown, name: unknown, props: unknown) => {
  const payload = props as { payload?: { ram_raw?: number; swap_raw?: number } };
  const raw =
    String(name) === "ram"
      ? toFiniteNumber(payload?.payload?.ram_raw)
      : toFiniteNumber(payload?.payload?.swap_raw);
  const percent = toFiniteNumber(value);
  return `${formatBytes(raw)} (${percent.toFixed(0)}%)`;
};

const RamSwapChartComponent = ({
  data,
  currentRam,
  currentSwap,
  timeFormatter,
  labelFormatter,
}: RamSwapChartProps) => {
  return (
    <BaseAreaChart
      title="内存"
      right={`RAM ${formatBytesCompact(currentRam)} | SWP ${formatBytesCompact(currentSwap)}`}
      data={data}
      dataKeys={[
        { key: "ram", label: "内存", colorIndex: 0 },
        { key: "swap", label: "Swap", colorIndex: 1 },
      ]}
      yAxisWidth={72}
      yAxisDomain={[0, 100]}
      yAxisTickFormatter={formatPercentTick}
      tooltipFormatter={ramSwapTooltipFormatter}
      timeFormatter={timeFormatter}
      labelFormatter={labelFormatter}
    />
  );
};

export const RamSwapChart = memo(RamSwapChartComponent, (prev, next) => {
  return (
    prev.data === next.data &&
    prev.currentRam === next.currentRam &&
    prev.currentSwap === next.currentSwap &&
    prev.timeFormatter === next.timeFormatter &&
    prev.labelFormatter === next.labelFormatter
  );
});

RamSwapChart.displayName = "RamSwapChart";
