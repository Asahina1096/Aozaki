import { memo, useMemo } from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { useTranslation } from "react-i18next";
import type { ChartConfig } from "@/components/ui/chart";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Card } from "@/components/ui/card";
import { formatBytes } from "@/utils/unitHelper";
import { toFiniteNumber } from "@/lib/normalizers/primitives";
import { CHART_COLORS } from "./shared";

const gpuChartMargin = {
  top: 10,
  right: 18,
  bottom: 12,
  left: 20,
};

const gpuAxisTickStyle = {
  fontSize: 10,
  fill: "var(--muted-foreground)",
  textAnchor: "start",
  dx: -15,
} as const;

const resolveGpuMemoryPercent = (used: number, total: number): number => {
  if (!Number.isFinite(used) || !Number.isFinite(total) || total <= 0) {
    return 0;
  }
  return (used / total) * 100;
};

interface GpuInfo {
  name: string;
  memory_total: number;
  memory_used: number;
  utilization: number;
  temperature: number;
}

interface GpuChartProps {
  index: number;
  data: {
    time: string;
    gpu_usage: number;
    gpu_memory: number;
    gpu_memory_raw?: number;
    gpu_temp: number;
  }[];
  info: GpuInfo;
  timeFormatter: (value: string, index: number) => string;
  labelFormatter: (value: React.ReactNode) => string;
}

const GpuChartComponent = ({ index, data, info, timeFormatter, labelFormatter }: GpuChartProps) => {
  const { t } = useTranslation();

  const chartConfig = useMemo<ChartConfig>(
    () => ({
      gpu_usage: { label: "GPU", color: CHART_COLORS[0] },
      gpu_memory: { label: t("chart.gpu_memory"), color: CHART_COLORS[1] },
      gpu_temp: { label: t("nodeCard.temperature"), color: CHART_COLORS[2] },
    }),
    [t],
  );

  const gpuTooltipFormatter = useMemo(
    () => (value: unknown, name: unknown, props: unknown) => {
      const payload = props as { payload?: { gpu_memory_raw?: number } };
      if (String(name) === "gpu_temp") return `${value}°C`;
      if (String(name) === "gpu_usage") return `${toFiniteNumber(value).toFixed(1)}%`;
      if (String(name) === "gpu_memory") {
        const percentage = toFiniteNumber(value).toFixed(1);
        const raw = toFiniteNumber(payload?.payload?.gpu_memory_raw);
        return `${formatBytes(raw)}(${percentage}%)`;
      }
      return `${toFiniteNumber(value).toFixed(1)}`;
    },
    [],
  );

  const gpuAxisTickFormatter = useMemo(
    () => (_value: number, i: number) => (i !== 0 ? `${_value}%` : ""),
    [],
  );

  return (
    <Card className="card-blur-target flex h-full w-full flex-col p-5">
      <div className="mb-2 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label className="font-sans text-sm font-semibold uppercase tracking-[0.08em] text-muted-foreground">{`GPU ${index + 1}: ${info.name}`}</label>
          <span className="text-sm font-mono text-foreground">
            {formatBytes(info.memory_total)}
          </span>
        </div>
        <div className="grid grid-cols-3 gap-4 text-xs text-muted-foreground">
          <div className="text-center">
            <div className="font-medium">{t("chart.usage")}</div>
            <div className="text-lg font-mono font-bold text-foreground">{info.utilization}%</div>
          </div>
          <div className="text-center">
            <div className="font-medium">{t("chart.gpu_memory")}</div>
            <div className="text-lg font-mono font-bold text-foreground">
              {resolveGpuMemoryPercent(info.memory_used, info.memory_total).toFixed(1)}%
            </div>
          </div>
          <div className="text-center">
            <div className="font-medium">{t("nodeCard.temperature")}</div>
            <div className="text-lg font-mono font-bold text-foreground">{info.temperature}°C</div>
          </div>
        </div>
      </div>
      <ChartContainer config={chartConfig} className="h-40 w-full aspect-auto">
        <AreaChart data={data} accessibilityLayer margin={gpuChartMargin}>
          <defs>
            <linearGradient id={`gpu-fill-0-${index}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={CHART_COLORS[0]} stopOpacity={0.4} />
              <stop offset="95%" stopColor="#ffffff" stopOpacity={0.05} />
            </linearGradient>
            <linearGradient id={`gpu-fill-1-${index}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={CHART_COLORS[1]} stopOpacity={0.4} />
              <stop offset="95%" stopColor="#ffffff" stopOpacity={0.05} />
            </linearGradient>
            <linearGradient id={`gpu-fill-2-${index}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={CHART_COLORS[2]} stopOpacity={0.4} />
              <stop offset="95%" stopColor="#ffffff" stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <CartesianGrid
            vertical={false}
            stroke="hsl(var(--border) / 0.55)"
            strokeDasharray="3 6"
          />
          <XAxis
            dataKey="time"
            tickLine={false}
            tickFormatter={timeFormatter}
            interval={0}
            padding={{ left: 8, right: 14 }}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            domain={[0, 100]}
            tickFormatter={gpuAxisTickFormatter}
            tick={gpuAxisTickStyle}
            orientation="left"
            type="number"
          />
          <ChartTooltip
            cursor={false}
            formatter={gpuTooltipFormatter}
            content={<ChartTooltipContent labelFormatter={labelFormatter} indicator="dot" />}
          />
          <Area
            dataKey="gpu_usage"
            animationDuration={0}
            stroke={CHART_COLORS[0]}
            fill={`url(#gpu-fill-0-${index})`}
            strokeWidth={2}
            dot={false}
            type="monotone"
          />
          <Area
            dataKey="gpu_memory"
            animationDuration={0}
            stroke={CHART_COLORS[1]}
            fill={`url(#gpu-fill-1-${index})`}
            strokeWidth={2}
            dot={false}
            type="monotone"
          />
          <Area
            dataKey="gpu_temp"
            animationDuration={0}
            stroke={CHART_COLORS[2]}
            fill={`url(#gpu-fill-2-${index})`}
            strokeWidth={2}
            dot={false}
            type="monotone"
          />
        </AreaChart>
      </ChartContainer>
    </Card>
  );
};

export const GpuChart = memo(GpuChartComponent, (prev, next) => {
  return (
    prev.index === next.index &&
    prev.data === next.data &&
    prev.info === next.info &&
    prev.timeFormatter === next.timeFormatter &&
    prev.labelFormatter === next.labelFormatter
  );
});

GpuChart.displayName = "GpuChart";
