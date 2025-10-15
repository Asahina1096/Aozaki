import type { ReactElement } from "react";

// 统一的图表配置
export const CHART_CONFIG = {
  height: 300,
  cartesianGrid: {
    strokeDasharray: "3 3",
    className: "stroke-muted",
  },
  xAxis: {
    className: "text-xs",
    tick: { fill: "hsl(var(--muted-foreground))" },
  },
  yAxis: {
    className: "text-xs",
    tick: { fill: "hsl(var(--muted-foreground))" },
  },
  tooltip: {
    contentStyle: {
      backgroundColor: "hsl(var(--background))",
      border: "1px solid hsl(var(--border))",
      borderRadius: "6px",
    },
    labelStyle: { color: "hsl(var(--foreground))" },
  },
} as const;

// 统一的空数据组件
export function EmptyChart() {
  return (
    <div className="flex items-center justify-center h-[300px] text-muted-foreground">
      暂无数据
    </div>
  );
}

// 图表组件配置类型
export interface ChartComponents {
  xAxis: Record<string, unknown>;
  yAxis: Record<string, unknown>;
  cartesianGrid: Record<string, unknown>;
  tooltip: Record<string, unknown>;
}

// 统一的图表类型定义
export interface BaseChartProps<T> {
  data: T[];
  timeRange: number;
  title: string;
  description: string;
  onTimeRangeChange: (_value: number) => void;
  transformData: (_data: T[], _timeRange: number) => unknown[];
  renderChart: (
    _data: unknown[],
    _chartComponents: ChartComponents
  ) => ReactElement;
  shouldShow?: (_data: T[]) => boolean;
  yAxisConfig?: {
    domain?: [number, number];
    unit?: string;
    tickFormatter?: (_value: number) => string;
  };
  tooltipFormatter?: (
    _value: unknown,
    _name: unknown,
    _props: unknown
  ) => [string, string];
}

// 图表颜色主题
export const CHART_COLORS = {
  primary: "hsl(var(--primary))",
  success: "#10b981",
  info: "#3b82f6",
  warning: "#f59e0b",
  danger: "#ef4444",
  purple: "#8b5cf6",
  pink: "#ec4899",
  cyan: "#06b6d4",
  orange: "#f97316",
} as const;

// Tooltip 格式化器
export const tooltipFormatters = {
  percentage: (_value: number) => `${_value}%`,
  bytes: (_value: number, _payload: unknown) => {
    if (_payload && typeof _payload === "object" && "payload" in _payload) {
      const data = _payload.payload as { used: number; total: number };
      return [
        `${_value}% (${formatBytes(data.used)} / ${formatBytes(data.total)})`,
        "",
      ];
    }
    return [_value, ""];
  },
  speed: (_value: number) => formatSpeed(Number(_value)),
  temperature: (_value: number) => `${_value}°C`,
  load: (_value: number) => [`${_value}`, "负载"],
} as const;

// 导入工具函数（避免循环依赖）
function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

function formatSpeed(bytesPerSecond: number): string {
  return `${formatBytes(bytesPerSecond)}/s`;
}
