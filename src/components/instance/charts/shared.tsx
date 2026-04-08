import { memo } from "react";

export const CHART_COLORS = ["#FF8A98", "#8FD6FF", "#9DE8C9", "#B7C4FF"] as const;
export const SOFT_GRID_STROKE = "hsl(var(--border) / 0.55)";
export const SOFT_FILL_END = "#ffffff";
export const AREA_GRADIENT_IDS = [
  "soft-chart-fill-0",
  "soft-chart-fill-1",
  "soft-chart-fill-2",
  "soft-chart-fill-3",
] as const;

export const softFillDef = (
  <defs>
    {CHART_COLORS.map((color, idx) => (
      <linearGradient
        key={AREA_GRADIENT_IDS[idx]}
        id={AREA_GRADIENT_IDS[idx]}
        x1="0"
        y1="0"
        x2="0"
        y2="1"
      >
        <stop offset="5%" stopColor={color} stopOpacity={0.4} />
        <stop offset="95%" stopColor={SOFT_FILL_END} stopOpacity={0.05} />
      </linearGradient>
    ))}
  </defs>
);

export const areaFill = (idx: number) =>
  `url(#${AREA_GRADIENT_IDS[idx % AREA_GRADIENT_IDS.length]})`;

export const sixChartMargin = {
  top: 10,
  right: 18,
  bottom: 12,
  left: 4,
};

export const axisTickStyle = {
  fontSize: 10,
  fill: "var(--foreground)",
  textAnchor: "end",
  dx: -5,
} as const;

export const xAxisTickStyle = {
  fontSize: 10,
  fill: "var(--muted-foreground)",
  dy: 10,
} as const;

export const xAxisPadding = {
  left: 8,
  right: 14,
};

export const yAxisTickCount = 5;
export const PERCENT_Y_AXIS_WIDTH = 72;
export const NETWORK_Y_AXIS_WIDTH = 72;
export const STORAGE_Y_AXIS_WIDTH = 72;
export const COUNT_Y_AXIS_WIDTH = 72;

export const formatPercentTick = (value: number) => `${Number(value).toFixed(1)}%`;

interface ChartTitleProps {
  text: string;
  right: React.ReactNode;
}

export const ChartTitle = memo(({ text, right }: ChartTitleProps) => (
  <div className="mb-2 flex items-center justify-between gap-4">
    <label className="font-sans text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground md:text-sm">
      {text}
    </label>
    <div className="text-right font-mono text-sm text-foreground">{right}</div>
  </div>
));

ChartTitle.displayName = "ChartTitle";
