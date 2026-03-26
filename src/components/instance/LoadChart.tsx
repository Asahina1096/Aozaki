import { Flex } from "@radix-ui/themes";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Card } from "@/components/ui/card";
import { formatBytesCompact } from "@/lib/format/bytes";
import { toFiniteNumber } from "@/lib/normalizers/primitives";
import { useLiveData } from "@/contexts/LiveDataContext";
import { useNodeList } from "@/contexts/NodeListContext";
import { CARD_CONTAINMENT_STYLE } from "@/lib/constants";
import fillMissingTimePoints, {
  normalizeLoadRecordFromAPI,
  type LoadRecordAPI,
  type RecordFormat,
} from "@/utils/RecordHelper";
import { formatBytes } from "@/utils/unitHelper";

type LoadChartProps = {
  data: RecordFormat[];
  view: string;
};

type LoadRecordsAPIResponse = {
  status: string;
  message: string;
  data?: {
    count: number;
    records: LoadRecordAPI[];
  };
};

const presetViews = [
  { key: "real", hours: 0 },
  { key: "4h", hours: 4 },
  { key: "1d", hours: 24 },
  { key: "7d", hours: 168 },
  { key: "30d", hours: 720 },
];

const colors = ["#FF8A98", "#8FD6FF", "#9DE8C9", "#B7C4FF"];
const SOFT_GRID_STROKE = "hsl(var(--border) / 0.55)";
const SOFT_FILL_END = "#ffffff";
const AREA_GRADIENT_IDS = [
  "soft-chart-fill-0",
  "soft-chart-fill-1",
  "soft-chart-fill-2",
  "soft-chart-fill-3",
] as const;
const softFillDef = (
  <defs>
    {colors.map((color, idx) => (
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

const areaFill = (idx: number) => `url(#${AREA_GRADIENT_IDS[idx % AREA_GRADIENT_IDS.length]})`;

const sixChartMargin = {
  top: 10,
  right: 18,
  bottom: 12,
  left: 4,
};

const gpuChartMargin = {
  top: 10,
  right: 18,
  bottom: 12,
  left: 20,
};

const xAxisPadding = {
  left: 8,
  right: 14,
};

const axisTickStyle = {
  fontSize: 10,
  fill: "var(--foreground)",
  textAnchor: "end",
  dx: -5,
} as const;

const xAxisTickStyle = {
  fontSize: 10,
  fill: "var(--muted-foreground)",
  dy: 10,
} as const;

const yAxisTickCount = 5;
const NETWORK_Y_AXIS_WIDTH = 72;
const PERCENT_Y_AXIS_WIDTH = 58;
const STORAGE_Y_AXIS_WIDTH = 72;
const COUNT_Y_AXIS_WIDTH = 72;

const gpuAxisTickStyle = {
  fontSize: 10,
  fill: "var(--muted-foreground)",
  textAnchor: "start",
  dx: -15,
} as const;

const formatPercentTick = (value: number) => `${Number(value).toFixed(1)}%`;

const formatBytesCompactTick = (value: number) => formatBytesCompact(value, false);

const formatNetworkSpeed = (value: number) => formatBytesCompact(value, true);

const formatCountCompact = (value: number) => {
  const num = Number(value);

  if (!Number.isFinite(num) || num <= 0) {
    return "0";
  }

  if (num >= 1_000_000_000) {
    return `${(num / 1_000_000_000).toFixed(num >= 10_000_000_000 ? 0 : 1)}B`;
  }

  if (num >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(num >= 10_000_000 ? 0 : 1)}M`;
  }

  if (num >= 1_000) {
    return `${(num / 1_000).toFixed(num >= 10_000 ? 0 : 1)}K`;
  }

  return `${Math.round(num)}`;
};

const toTooltipNumber = (value: unknown): number => {
  if (Array.isArray(value)) {
    return toFiniteNumber(value[0]);
  }
  return toFiniteNumber(value);
};

const getTooltipPayload = <T extends object>(props: unknown): Partial<T> | undefined => {
  if (
    typeof props !== "object" ||
    props === null ||
    !("payload" in props) ||
    typeof props.payload !== "object" ||
    props.payload === null
  ) {
    return undefined;
  }

  return props.payload as Partial<T>;
};

const resolveUsagePercent = (
  used: number | null | undefined,
  total: number | null | undefined,
  fallbackTotal: number,
): number => {
  const normalizedUsed = toFiniteNumber(used);
  const normalizedTotal = toFiniteNumber(total);
  const baseTotal =
    normalizedTotal > 0 ? normalizedTotal : Math.max(toFiniteNumber(fallbackTotal), 1);

  return (normalizedUsed / baseTotal) * 100;
};

const resolveGpuMemoryPercent = (used: number, total: number): number => {
  if (!Number.isFinite(used) || !Number.isFinite(total) || total <= 0) {
    return 0;
  }
  return (used / total) * 100;
};

const LoadChart = ({ data = [], view }: LoadChartProps) => {
  const { t } = useTranslation();
  const { nodeList } = useNodeList();
  const { live_data } = useLiveData();
  const [remoteData, setRemoteData] = useState<RecordFormat[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestSeqRef = useRef(0);

  const uuid =
    typeof window === "undefined"
      ? ""
      : window.location.pathname.split("/").filter(Boolean).pop() || "";

  const node = nodeList?.find((n) => n.uuid === uuid);
  const current = live_data?.data?.data?.[uuid];
  const currentMetrics = useMemo(
    () => ({
      cpu: toFiniteNumber(current?.cpu?.usage),
      ram: toFiniteNumber(current?.ram?.used),
      swap: toFiniteNumber(current?.swap?.used),
      networkUp: toFiniteNumber(current?.network?.up),
      networkDown: toFiniteNumber(current?.network?.down),
      disk: toFiniteNumber(current?.disk?.used),
      connectionsTcp: toFiniteNumber(current?.connections?.tcp),
      connectionsUdp: toFiniteNumber(current?.connections?.udp),
      process: toFiniteNumber(current?.process),
    }),
    [current],
  );

  const selected = useMemo(() => presetViews.find((v) => v.key === view), [view]);

  useEffect(() => {
    if (!uuid || !selected || selected.hours === 0) {
      ++requestSeqRef.current;
      setRemoteData(null);
      setError(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const currentSeq = ++requestSeqRef.current;

    const query = new URLSearchParams({
      uuid,
      hours: String(selected.hours),
    });

    fetch(`/api/records/load?${query.toString()}`)
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const payload = (await response.json()) as LoadRecordsAPIResponse;

        if (payload.status !== "success") {
          throw new Error(payload.message || "Failed to fetch load records");
        }

        return payload;
      })
      .then((payload) => {
        if (currentSeq !== requestSeqRef.current) return;

        const records = (payload.data?.records || []).map(normalizeLoadRecordFromAPI);
        records.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
        setRemoteData(records);
      })
      .catch((err) => {
        if (currentSeq !== requestSeqRef.current) return;
        setError(err instanceof Error ? err.message : "Error");
      })
      .finally(() => {
        if (currentSeq === requestSeqRef.current) setLoading(false);
      });
  }, [selected, uuid]);

  const minute = 60;
  const hour = minute * 60;
  const isRealtime = view === "real";
  const realtimeData = Array.isArray(data) ? data.slice(-150) : [];

  const chartData = useMemo(() => {
    if (isRealtime) return realtimeData;
    if (view === "4h") {
      return fillMissingTimePoints(remoteData ?? [], minute, hour * 4, minute * 2);
    }
    const selectedHours = selected?.hours || 24;
    const interval = selectedHours > 120 ? hour : minute * 15;
    const maxGap = interval * 2;
    return fillMissingTimePoints(remoteData ?? [], interval, hour * selectedHours, maxGap);
  }, [isRealtime, realtimeData, view, remoteData, selected, hour, minute]);

  const ramSwapChartData = useMemo(() => {
    return chartData.map((item) => ({
      time: item.time,
      ram: resolveUsagePercent(item.ram, item.ram_total, node?.mem_total ?? 0),
      ram_raw: item.ram,
      swap: resolveUsagePercent(item.swap, item.swap_total, node?.swap_total ?? 0),
      swap_raw: item.swap,
    }));
  }, [chartData, node?.mem_total, node?.swap_total]);

  const diskYAxisMax = useMemo(() => {
    const historyMax = chartData.reduce((max, item) => {
      const total = toFiniteNumber(item.disk_total);
      return total > max ? total : max;
    }, 0);

    if (historyMax > 0) {
      return historyMax;
    }

    return toFiniteNumber(node?.disk_total) || 100;
  }, [chartData, node?.disk_total]);

  const timeFormatter = (value: string, index: number) => {
    if (index === 0 || index === chartData.length - 1) {
      if (isRealtime || view === "4h") {
        return new Date(value).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });
      }
      return new Date(value).toLocaleDateString([], {
        month: "2-digit",
        day: "2-digit",
      });
    }
    return "";
  };

  const labelFormatter = (value: React.ReactNode) => {
    const date = new Date(String(value));
    if (isRealtime || view === "4h") {
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
    }
    return date.toLocaleString([], {
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const percentageFormatter = (value: unknown) => `${toTooltipNumber(value).toFixed(2)}%`;
  const cardClass = "card-blur-target flex h-full w-full flex-col p-5";
  const chartBodyClass = "h-40 w-full aspect-auto";

  const chartTitle = (text: string, right: React.ReactNode) => (
    <div className="mb-2 flex items-center justify-between gap-4">
      <label className="font-sans text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground md:text-sm">
        {text}
      </label>
      <div className="text-right font-mono text-sm text-foreground">{right}</div>
    </div>
  );

  return (
    <Flex direction="column" align="center" gap="4" className="w-full">
      {loading && <div className="text-center text-muted-foreground">Loading...</div>}
      {error && <div className="w-full text-center text-destructive">{error}</div>}

      <div className="mx-auto mt-2 grid w-full max-w-[1200px] grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className={cardClass} style={CARD_CONTAINMENT_STYLE}>
          {chartTitle("CPU", currentMetrics.cpu > 0 ? `${currentMetrics.cpu.toFixed(2)}%` : "-")}
          <ChartContainer
            config={{ cpu: { label: "CPU", color: colors[0] } }}
            className={chartBodyClass}
          >
            <AreaChart data={chartData} accessibilityLayer margin={sixChartMargin}>
              {softFillDef}
              <CartesianGrid vertical={false} stroke={SOFT_GRID_STROKE} strokeDasharray="3 6" />
              <XAxis
                dataKey="time"
                axisLine={false}
                tickLine={false}
                tickFormatter={timeFormatter}
                tick={xAxisTickStyle}
                interval={0}
                padding={xAxisPadding}
              />
              <YAxis
                width={PERCENT_Y_AXIS_WIDTH}
                tickLine={false}
                axisLine={false}
                domain={[0, 100]}
                tickCount={yAxisTickCount}
                tickFormatter={formatPercentTick}
                tick={axisTickStyle}
                orientation="left"
                type="number"
              />
              <ChartTooltip
                cursor={false}
                formatter={percentageFormatter}
                content={<ChartTooltipContent labelFormatter={labelFormatter} indicator="dot" />}
              />
              <Area
                dataKey="cpu"
                animationDuration={0}
                stroke={colors[0]}
                fill={areaFill(0)}
                strokeWidth={2}
                dot={false}
                type="monotone"
              />
            </AreaChart>
          </ChartContainer>
        </Card>

        <Card className={cardClass} style={CARD_CONTAINMENT_STYLE}>
          {chartTitle(
            "内存",
            `RAM ${formatBytesCompact(currentMetrics.ram)} | SWP ${formatBytesCompact(currentMetrics.swap)}`,
          )}
          <ChartContainer
            config={{
              ram: { label: "内存", color: colors[0] },
              swap: { label: "Swap", color: colors[1] },
            }}
            className={chartBodyClass}
          >
            <AreaChart data={ramSwapChartData} accessibilityLayer margin={sixChartMargin}>
              {softFillDef}
              <CartesianGrid vertical={false} stroke={SOFT_GRID_STROKE} strokeDasharray="3 6" />
              <XAxis
                dataKey="time"
                axisLine={false}
                tickLine={false}
                tickFormatter={timeFormatter}
                tick={xAxisTickStyle}
                interval={0}
                padding={xAxisPadding}
              />
              <YAxis
                width={PERCENT_Y_AXIS_WIDTH}
                tickLine={false}
                axisLine={false}
                domain={[0, 100]}
                tickCount={yAxisTickCount}
                tickFormatter={formatPercentTick}
                tick={axisTickStyle}
                orientation="left"
                type="number"
              />
              <ChartTooltip
                cursor={false}
                formatter={(value: unknown, name: unknown, props: unknown) => {
                  const payload = getTooltipPayload<{ ram_raw?: number; swap_raw?: number }>(props);
                  const raw =
                    String(name) === "ram"
                      ? toFiniteNumber(payload?.ram_raw)
                      : toFiniteNumber(payload?.swap_raw);
                  const percent = toTooltipNumber(value);
                  return `${formatBytes(raw)} (${percent.toFixed(0)}%)`;
                }}
                content={<ChartTooltipContent labelFormatter={labelFormatter} indicator="dot" />}
              />
              <Area
                dataKey="ram"
                animationDuration={0}
                stroke={colors[0]}
                fill={areaFill(0)}
                strokeWidth={2}
                dot={false}
                type="monotone"
              />
              <Area
                dataKey="swap"
                animationDuration={0}
                stroke={colors[1]}
                fill={areaFill(1)}
                strokeWidth={2}
                dot={false}
                type="monotone"
              />
            </AreaChart>
          </ChartContainer>
        </Card>

        <Card className={cardClass} style={CARD_CONTAINMENT_STYLE}>
          {chartTitle(
            t("nodeCard.networkSpeed"),
            `↑ ${formatNetworkSpeed(currentMetrics.networkUp)} | ↓ ${formatNetworkSpeed(currentMetrics.networkDown)}`,
          )}
          <ChartContainer
            config={{
              net_in: { label: t("chart.network_down"), color: colors[0] },
              net_out: { label: t("chart.network_up"), color: colors[3] },
            }}
            className={chartBodyClass}
          >
            <AreaChart data={chartData} accessibilityLayer margin={sixChartMargin}>
              {softFillDef}
              <CartesianGrid vertical={false} stroke={SOFT_GRID_STROKE} strokeDasharray="3 6" />
              <XAxis
                dataKey="time"
                axisLine={false}
                tickLine={false}
                tickFormatter={timeFormatter}
                tick={xAxisTickStyle}
                interval={0}
                padding={xAxisPadding}
              />
              <YAxis
                width={NETWORK_Y_AXIS_WIDTH}
                tickLine={false}
                axisLine={false}
                tickCount={yAxisTickCount}
                tickFormatter={formatNetworkSpeed}
                tick={axisTickStyle}
                orientation="left"
                type="number"
              />
              <ChartTooltip
                cursor={false}
                formatter={(value) => `${formatBytes(toFiniteNumber(value))}/s`}
                content={<ChartTooltipContent labelFormatter={labelFormatter} indicator="dot" />}
              />
              <Area
                dataKey="net_in"
                animationDuration={0}
                stroke={colors[0]}
                fill={areaFill(0)}
                strokeWidth={2}
                dot={false}
                type="monotone"
              />
              <Area
                dataKey="net_out"
                animationDuration={0}
                stroke={colors[3]}
                fill={areaFill(3)}
                strokeWidth={2}
                dot={false}
                type="monotone"
              />
            </AreaChart>
          </ChartContainer>
        </Card>

        <Card className={cardClass} style={CARD_CONTAINMENT_STYLE}>
          {chartTitle(
            "磁盘",
            currentMetrics.disk > 0 ? formatBytesCompact(currentMetrics.disk) : "-",
          )}
          <ChartContainer
            config={{ disk: { label: "磁盘", color: colors[0] } }}
            className={chartBodyClass}
          >
            <AreaChart data={chartData} accessibilityLayer margin={sixChartMargin}>
              {softFillDef}
              <CartesianGrid vertical={false} stroke={SOFT_GRID_STROKE} strokeDasharray="3 6" />
              <XAxis
                dataKey="time"
                axisLine={false}
                tickLine={false}
                tickFormatter={timeFormatter}
                tick={xAxisTickStyle}
                interval={0}
                padding={xAxisPadding}
              />
              <YAxis
                width={STORAGE_Y_AXIS_WIDTH}
                tickLine={false}
                axisLine={false}
                domain={[0, diskYAxisMax]}
                tickCount={yAxisTickCount}
                tickFormatter={formatBytesCompactTick}
                tick={axisTickStyle}
                orientation="left"
                type="number"
              />
              <ChartTooltip
                cursor={false}
                formatter={(value) => formatBytes(toFiniteNumber(value))}
                content={<ChartTooltipContent labelFormatter={labelFormatter} indicator="dot" />}
              />
              <Area
                dataKey="disk"
                animationDuration={0}
                stroke={colors[0]}
                fill={areaFill(0)}
                strokeWidth={2}
                dot={false}
                type="monotone"
              />
            </AreaChart>
          </ChartContainer>
        </Card>

        <Card className={cardClass} style={CARD_CONTAINMENT_STYLE}>
          {chartTitle(
            t("chart.connections"),
            `TCP ${formatCountCompact(currentMetrics.connectionsTcp)} | UDP ${formatCountCompact(currentMetrics.connectionsUdp)}`,
          )}
          <ChartContainer
            config={{
              connections: { label: "TCP", color: colors[0] },
              connections_udp: { label: "UDP", color: colors[3] },
            }}
            className={chartBodyClass}
          >
            <AreaChart data={chartData} accessibilityLayer margin={sixChartMargin}>
              {softFillDef}
              <CartesianGrid vertical={false} stroke={SOFT_GRID_STROKE} strokeDasharray="3 6" />
              <XAxis
                dataKey="time"
                axisLine={false}
                tickLine={false}
                tickFormatter={timeFormatter}
                tick={xAxisTickStyle}
                interval={0}
                padding={xAxisPadding}
              />
              <YAxis
                width={COUNT_Y_AXIS_WIDTH}
                tickLine={false}
                axisLine={false}
                tickCount={yAxisTickCount}
                tickFormatter={formatCountCompact}
                tick={axisTickStyle}
                orientation="left"
                type="number"
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent labelFormatter={labelFormatter} indicator="dot" />}
              />
              <Area
                dataKey="connections"
                animationDuration={0}
                stroke={colors[0]}
                fill={areaFill(0)}
                strokeWidth={2}
                dot={false}
                type="monotone"
              />
              <Area
                dataKey="connections_udp"
                animationDuration={0}
                stroke={colors[3]}
                fill={areaFill(3)}
                strokeWidth={2}
                dot={false}
                type="monotone"
              />
            </AreaChart>
          </ChartContainer>
        </Card>

        <Card className={cardClass} style={CARD_CONTAINMENT_STYLE}>
          {chartTitle(t("chart.process"), formatCountCompact(currentMetrics.process))}
          <ChartContainer
            config={{
              process: { label: t("chart.process"), color: colors[0] },
            }}
            className={chartBodyClass}
          >
            <AreaChart data={chartData} accessibilityLayer margin={sixChartMargin}>
              {softFillDef}
              <CartesianGrid vertical={false} stroke={SOFT_GRID_STROKE} strokeDasharray="3 6" />
              <XAxis
                dataKey="time"
                axisLine={false}
                tickLine={false}
                tickFormatter={timeFormatter}
                tick={xAxisTickStyle}
                interval={0}
                padding={xAxisPadding}
              />
              <YAxis
                width={COUNT_Y_AXIS_WIDTH}
                tickLine={false}
                axisLine={false}
                domain={[0, 100]}
                tickCount={yAxisTickCount}
                tickFormatter={formatCountCompact}
                tick={axisTickStyle}
                orientation="left"
                type="number"
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent labelFormatter={labelFormatter} indicator="dot" />}
              />
              <Area
                dataKey="process"
                animationDuration={0}
                stroke={colors[0]}
                fill={areaFill(0)}
                strokeWidth={2}
                dot={false}
                type="monotone"
              />
            </AreaChart>
          </ChartContainer>
        </Card>

        {current?.gpu &&
          current.gpu.count > 0 &&
          current.gpu.detailed_info?.map((gpu, index) => (
            <Card
              key={`gpu-${index}`}
              className={cardClass}
              style={CARD_CONTAINMENT_STYLE}
            >
              <Flex direction="column" gap="2" className="mb-2">
                <div className="flex items-center justify-between">
                  <label className="font-sans text-sm font-semibold uppercase tracking-[0.08em] text-muted-foreground">{`GPU ${index + 1}: ${gpu.name}`}</label>
                  <span className="text-sm font-mono text-foreground">
                    {formatBytes(gpu.memory_total)}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-4 text-xs text-muted-foreground">
                  <div className="text-center">
                    <div className="font-medium">{t("chart.usage")}</div>
                    <div className="text-lg font-mono font-bold text-foreground">
                      {gpu.utilization}%
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium">{t("chart.gpu_memory")}</div>
                    <div className="text-lg font-mono font-bold text-foreground">
                      {resolveGpuMemoryPercent(gpu.memory_used, gpu.memory_total).toFixed(1)}%
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium">{t("nodeCard.temperature")}</div>
                    <div className="text-lg font-mono font-bold text-foreground">
                      {gpu.temperature}°C
                    </div>
                  </div>
                </div>
              </Flex>
              <ChartContainer
                config={{
                  gpu_usage: { label: "GPU", color: colors[0] },
                  gpu_memory: {
                    label: t("chart.gpu_memory"),
                    color: colors[1],
                  },
                  gpu_temp: {
                    label: t("nodeCard.temperature"),
                    color: colors[2],
                  },
                }}
                className={chartBodyClass}
              >
                <AreaChart
                  data={chartData.map((item) => ({
                    time: item.time,
                    gpu_usage: toFiniteNumber(item.gpu_detailed?.[index]?.usage ?? item.gpu_usage),
                    gpu_memory: toFiniteNumber(
                      item.gpu_detailed?.[index]?.memory ?? item.gpu_memory,
                    ),
                    gpu_memory_raw:
                      toFiniteNumber(item.gpu_detailed?.[index]?.mem_used) ||
                      (gpu.memory_total * toFiniteNumber(item.gpu_detailed?.[index]?.memory)) / 100,
                    gpu_temp: toFiniteNumber(item.gpu_detailed?.[index]?.temperature),
                  }))}
                  accessibilityLayer
                  margin={gpuChartMargin}
                >
                  {softFillDef}
                  <CartesianGrid vertical={false} stroke={SOFT_GRID_STROKE} strokeDasharray="3 6" />
                  <XAxis
                    dataKey="time"
                    tickLine={false}
                    tickFormatter={timeFormatter}
                    interval={0}
                    padding={xAxisPadding}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    domain={[0, 100]}
                    tickFormatter={(value: number, i: number) => (i !== 0 ? `${value}%` : "")}
                    tick={gpuAxisTickStyle}
                    orientation="left"
                    type="number"
                  />
                  <ChartTooltip
                    cursor={false}
                    formatter={(value: unknown, name: unknown, props: unknown) => {
                      const payload = getTooltipPayload<{ gpu_memory_raw?: number }>(props);
                      if (String(name) === "gpu_temp") return `${value}°C`;
                      if (String(name) === "gpu_usage")
                        return `${toTooltipNumber(value).toFixed(1)}%`;
                      if (String(name) === "gpu_memory") {
                        const percentage = toTooltipNumber(value).toFixed(1);
                        const raw = toFiniteNumber(payload?.gpu_memory_raw);
                        return `${formatBytes(raw)}(${percentage}%)`;
                      }
                      return `${toTooltipNumber(value).toFixed(1)}`;
                    }}
                    content={
                      <ChartTooltipContent labelFormatter={labelFormatter} indicator="dot" />
                    }
                  />
                  <Area
                    dataKey="gpu_usage"
                    animationDuration={0}
                    stroke={colors[0]}
                    fill={areaFill(0)}
                    strokeWidth={2}
                    dot={false}
                    type="monotone"
                  />
                  <Area
                    dataKey="gpu_memory"
                    animationDuration={0}
                    stroke={colors[1]}
                    fill={areaFill(1)}
                    strokeWidth={2}
                    dot={false}
                    type="monotone"
                  />
                  <Area
                    dataKey="gpu_temp"
                    animationDuration={0}
                    stroke={colors[2]}
                    fill={areaFill(2)}
                    strokeWidth={2}
                    dot={false}
                    type="monotone"
                  />
                </AreaChart>
              </ChartContainer>
            </Card>
          ))}
      </div>
    </Flex>
  );
};

export default LoadChart;
