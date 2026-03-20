import { Flex } from "@radix-ui/themes";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { useLiveData } from "@/contexts/LiveDataContext";
import { useNodeList } from "@/contexts/NodeListContext";
import fillMissingTimePoints, { type RecordFormat } from "@/utils/RecordHelper";
import { formatBytes } from "@/utils/unitHelper";

type LoadChartProps = {
  data: RecordFormat[];
  view: string;
};

const presetViews = [
  { key: "real", hours: 0 },
  { key: "4h", hours: 4 },
  { key: "1d", hours: 24 },
  { key: "7d", hours: 168 },
  { key: "30d", hours: 720 },
];

const colors = ["#F38181", "#FCE38A", "#EAFFD0", "#95E1D3"];

const sixChartMargin = {
  top: 10,
  right: 10,
  bottom: 0,
  left: 0,
};

const gpuChartMargin = {
  top: 10,
  right: 10,
  bottom: 0,
  left: 20,
};

const axisTickStyle = {
  fontSize: 10,
  fill: "#71717a",
  textAnchor: "end",
  dx: -5,
} as const;

const xAxisTickStyle = {
  fontSize: 10,
  fill: "#71717a",
  dy: 10,
} as const;

const yAxisTickCount = 5;

const gpuAxisTickStyle = {
  fontSize: 10,
  fill: "#a1a1aa",
  textAnchor: "start",
  dx: -15,
} as const;

const formatPercentTick = (value: number) => `${Number(value).toFixed(1)}%`;

const formatGigabytesTick = (value: number) => {
  const gb = Number(value) / 1024 / 1024 / 1024;
  return `${gb.toFixed(2)} GB`;
};

const formatKilobytesPerSecTick = (value: number) => {
  const kb = Number(value) / 1024;
  return `${kb.toFixed(2)} KB/s`;
};

const LoadChart = ({ data = [], view }: LoadChartProps) => {
  const { t } = useTranslation();
  const { nodeList } = useNodeList();
  const { live_data } = useLiveData();
  const [remoteData, setRemoteData] = useState<RecordFormat[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uuid =
    typeof window === "undefined"
      ? ""
      : window.location.pathname.split("/").filter(Boolean).pop() || "";

  const node = nodeList?.find((n) => n.uuid === uuid);
  const current = live_data?.data?.data?.[uuid];

  const selected = useMemo(
    () => presetViews.find((v) => v.key === view),
    [view]
  );

  useEffect(() => {
    if (!uuid || !selected || selected.hours === 0) {
      setRemoteData(null);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    fetch(`/api/records/load?uuid=${uuid}&hours=${selected.hours}`)
      .then((res) => {
        if (!res.ok) throw new Error(res.statusText);
        return res.json();
      })
      .then((resp) => {
        const records = (resp.data?.records || []) as RecordFormat[];
        records.sort(
          (a, b) => new Date(a.time).getTime() - new Date(b.time).getTime()
        );
        setRemoteData(records);
      })
      .catch((err) => setError(err?.message || "Error"))
      .finally(() => setLoading(false));
  }, [selected, uuid]);

  const minute = 60;
  const hour = minute * 60;
  const isRealtime = view === "real";
  const realtimeData = Array.isArray(data) ? data.slice(-150) : [];

  const chartData = isRealtime
    ? realtimeData
    : view === "4h"
      ? fillMissingTimePoints(remoteData ?? [], minute, hour * 4, minute * 2)
      : (() => {
          const selectedHours = selected?.hours || 24;
          const interval = selectedHours > 120 ? hour : minute * 15;
          const maxGap = interval * 2;
          return fillMissingTimePoints(
            remoteData ?? [],
            interval,
            hour * selectedHours,
            maxGap
          );
        })();

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

  const labelFormatter = (value: string) => {
    const date = new Date(value);
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

  const percentageFormatter = (value: number) => `${value.toFixed(2)}%`;
  const cardClass =
    "flex h-full w-full flex-col rounded-2xl border border-border/20 bg-card/95 p-4 shadow-sm";
  const chartBodyClass = "h-40 w-full aspect-auto";

  const chartTitle = (text: string, right: React.ReactNode) => (
    <div className="mb-2 flex items-center justify-between gap-4">
      <label className="text-lg font-bold leading-none text-foreground md:text-xl">
        {text}
      </label>
      <div className="text-right font-mono text-sm text-muted-foreground">
        {right}
      </div>
    </div>
  );

  return (
    <Flex direction="column" align="center" gap="4" className="w-full">
      {loading && (
        <div className="text-center text-muted-foreground">Loading...</div>
      )}
      {error && (
        <div className="w-full text-center text-destructive">{error}</div>
      )}

      <div className="mx-auto mt-2 grid w-full max-w-[1200px] grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className={cardClass}>
          {chartTitle(
            "CPU",
            current?.cpu?.usage ? `${current.cpu.usage.toFixed(2)}%` : "-"
          )}
          <ChartContainer
            config={{ cpu: { label: "CPU", color: colors[0] } }}
            className={chartBodyClass}
          >
            <AreaChart
              data={chartData}
              accessibilityLayer
              margin={sixChartMargin}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="time"
                axisLine={false}
                tickLine={false}
                tickFormatter={timeFormatter}
                tick={xAxisTickStyle}
                interval={0}
              />
              <YAxis
                width={50}
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
                formatter={percentageFormatter as any}
                content={
                  <ChartTooltipContent
                    labelFormatter={labelFormatter as any}
                    indicator="dot"
                  />
                }
              />
              <Area
                dataKey="cpu"
                animationDuration={0}
                stroke={colors[0]}
                fill={colors[0]}
                opacity={0.8}
                dot={false}
              />
            </AreaChart>
          </ChartContainer>
        </div>

        <div className={cardClass}>
          {chartTitle(
            "RAM",
            `Used: ${formatBytes(current?.ram?.used || 0)} | Swap: ${formatBytes(current?.swap?.used || 0)}`
          )}
          <ChartContainer
            config={{
              ram: { label: "Ram", color: colors[0] },
              swap: { label: "Swap", color: colors[1] },
            }}
            className={chartBodyClass}
          >
            <AreaChart
              data={chartData.map((item) => ({
                time: item.time,
                ram: ((item.ram ?? 0) / (node?.mem_total ?? 1)) * 100,
                ram_raw: item.ram,
                swap: ((item.swap ?? 0) / (node?.swap_total ?? 1)) * 100,
                swap_raw: item.swap,
              }))}
              accessibilityLayer
              margin={sixChartMargin}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="time"
                axisLine={false}
                tickLine={false}
                tickFormatter={timeFormatter}
                tick={xAxisTickStyle}
                interval={0}
              />
              <YAxis
                width={50}
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
                formatter={
                  ((value: number, name: string, props: any) => {
                    const raw =
                      name === "ram"
                        ? (props?.payload?.ram_raw ?? 0)
                        : (props?.payload?.swap_raw ?? 0);
                    const percent =
                      typeof value === "number" ? value : Number(value) || 0;
                    return `${formatBytes(raw)} (${percent.toFixed(0)}%)`;
                  }) as any
                }
                content={
                  <ChartTooltipContent
                    labelFormatter={labelFormatter as any}
                    indicator="dot"
                  />
                }
              />
              <Area
                dataKey="ram"
                animationDuration={0}
                stroke={colors[0]}
                fill={colors[0]}
                opacity={0.8}
                dot={false}
              />
              <Area
                dataKey="swap"
                animationDuration={0}
                stroke={colors[1]}
                fill={colors[1]}
                opacity={0.8}
                dot={false}
              />
            </AreaChart>
          </ChartContainer>
        </div>

        <div className={cardClass}>
          {chartTitle(
            t("nodeCard.networkSpeed"),
            `↑ ${formatBytes(current?.network?.up || 0)}/s | ↓ ${formatBytes(current?.network?.down || 0)}/s`
          )}
          <ChartContainer
            config={{
              net_in: { label: t("chart.network_down"), color: colors[0] },
              net_out: { label: t("chart.network_up"), color: colors[3] },
            }}
            className={chartBodyClass}
          >
            <AreaChart
              data={chartData}
              accessibilityLayer
              margin={sixChartMargin}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="time"
                axisLine={false}
                tickLine={false}
                tickFormatter={timeFormatter}
                tick={xAxisTickStyle}
                interval={0}
              />
              <YAxis
                width={50}
                tickLine={false}
                axisLine={false}
                tickCount={yAxisTickCount}
                tickFormatter={formatKilobytesPerSecTick}
                tick={axisTickStyle}
                orientation="left"
                type="number"
              />
              <ChartTooltip
                cursor={false}
                formatter={formatBytes as any}
                content={
                  <ChartTooltipContent
                    labelFormatter={labelFormatter as any}
                    indicator="dot"
                  />
                }
              />
              <Area
                dataKey="net_in"
                animationDuration={0}
                stroke={colors[0]}
                fill={colors[0]}
                fillOpacity={0.14}
                strokeWidth={2}
                dot={false}
                type="monotone"
              />
              <Area
                dataKey="net_out"
                animationDuration={0}
                stroke={colors[3]}
                fill={colors[3]}
                fillOpacity={0.14}
                strokeWidth={2}
                dot={false}
                type="monotone"
              />
            </AreaChart>
          </ChartContainer>
        </div>

        <div className={cardClass}>
          {chartTitle(
            "Disk",
            current?.disk?.used
              ? `Used: ${formatBytes(current.disk.used)}`
              : "-"
          )}
          <ChartContainer
            config={{ disk: { label: "Disk", color: colors[0] } }}
            className={chartBodyClass}
          >
            <AreaChart
              data={chartData}
              accessibilityLayer
              margin={sixChartMargin}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="time"
                axisLine={false}
                tickLine={false}
                tickFormatter={timeFormatter}
                tick={xAxisTickStyle}
                interval={0}
              />
              <YAxis
                width={50}
                tickLine={false}
                axisLine={false}
                domain={[0, node?.disk_total || 100]}
                tickCount={yAxisTickCount}
                tickFormatter={formatGigabytesTick}
                tick={axisTickStyle}
                orientation="left"
                type="number"
              />
              <ChartTooltip
                cursor={false}
                formatter={formatBytes as any}
                content={
                  <ChartTooltipContent
                    labelFormatter={labelFormatter as any}
                    indicator="dot"
                  />
                }
              />
              <Area
                dataKey="disk"
                animationDuration={0}
                stroke={colors[0]}
                fill={colors[0]}
                opacity={0.8}
                dot={false}
              />
            </AreaChart>
          </ChartContainer>
        </div>

        <div className={cardClass}>
          {chartTitle(
            t("chart.connections"),
            `TCP: ${current?.connections?.tcp ?? 0} | UDP: ${current?.connections?.udp ?? 0}`
          )}
          <ChartContainer
            config={{
              connections: { label: "TCP", color: colors[0] },
              connections_udp: { label: "UDP", color: colors[3] },
            }}
            className={chartBodyClass}
          >
            <AreaChart
              data={chartData}
              accessibilityLayer
              margin={sixChartMargin}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="time"
                axisLine={false}
                tickLine={false}
                tickFormatter={timeFormatter}
                tick={xAxisTickStyle}
                interval={0}
              />
              <YAxis
                width={50}
                tickLine={false}
                axisLine={false}
                tickCount={yAxisTickCount}
                tickFormatter={(value: number) => `${Math.round(value)}`}
                tick={axisTickStyle}
                orientation="left"
                type="number"
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    labelFormatter={labelFormatter as any}
                    indicator="dot"
                  />
                }
              />
              <Area
                dataKey="connections"
                animationDuration={0}
                stroke={colors[0]}
                fill={colors[0]}
                fillOpacity={0.14}
                strokeWidth={2}
                dot={false}
                type="monotone"
              />
              <Area
                dataKey="connections_udp"
                animationDuration={0}
                stroke={colors[3]}
                fill={colors[3]}
                fillOpacity={0.14}
                strokeWidth={2}
                dot={false}
                type="monotone"
              />
            </AreaChart>
          </ChartContainer>
        </div>

        <div className={cardClass}>
          {chartTitle(t("chart.process"), current?.process ?? 0)}
          <ChartContainer
            config={{
              process: { label: t("chart.process"), color: colors[0] },
            }}
            className={chartBodyClass}
          >
            <AreaChart
              data={chartData}
              accessibilityLayer
              margin={sixChartMargin}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="time"
                axisLine={false}
                tickLine={false}
                tickFormatter={timeFormatter}
                tick={xAxisTickStyle}
                interval={0}
              />
              <YAxis
                width={50}
                tickLine={false}
                axisLine={false}
                domain={[0, 100]}
                tickCount={yAxisTickCount}
                tickFormatter={(value: number) => `${Math.round(value)}`}
                tick={axisTickStyle}
                orientation="left"
                type="number"
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    labelFormatter={labelFormatter as any}
                    indicator="dot"
                  />
                }
              />
              <Area
                dataKey="process"
                animationDuration={0}
                stroke={colors[0]}
                fill={colors[0]}
                fillOpacity={0.14}
                strokeWidth={2}
                dot={false}
                type="monotone"
              />
            </AreaChart>
          </ChartContainer>
        </div>

        {current?.gpu &&
          current.gpu.count > 0 &&
          current.gpu.detailed_info?.map((gpu, index) => (
            <div key={`gpu-${index}`} className={cardClass}>
              <Flex direction="column" gap="2" className="mb-2">
                <div className="flex items-center justify-between">
                  <label className="text-xl font-bold text-foreground">{`GPU ${index + 1}: ${gpu.name}`}</label>
                  <span className="text-sm text-muted-foreground">
                    {formatBytes(gpu.memory_total)}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm text-muted-foreground">
                  <div className="text-center">
                    <div className="font-medium">{t("chart.usage")}</div>
                    <div className="text-lg font-bold text-foreground">
                      {gpu.utilization}%
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium">{t("chart.gpu_memory")}</div>
                    <div className="text-lg font-bold text-foreground">
                      {((gpu.memory_used / gpu.memory_total) * 100).toFixed(1)}%
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium">
                      {t("nodeCard.temperature")}
                    </div>
                    <div className="text-lg font-bold text-foreground">
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
                    gpu_usage:
                      item.gpu_detailed?.[index]?.usage ?? item.gpu_usage ?? 0,
                    gpu_memory:
                      item.gpu_detailed?.[index]?.memory ??
                      item.gpu_memory ??
                      0,
                    gpu_memory_raw:
                      item.gpu_detailed?.[index]?.mem_used ??
                      (gpu.memory_total *
                        (item.gpu_detailed?.[index]?.memory || 0)) /
                        100,
                    gpu_temp: item.gpu_detailed?.[index]?.temperature ?? 0,
                  }))}
                  accessibilityLayer
                  margin={gpuChartMargin}
                >
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="time"
                    tickLine={false}
                    tickFormatter={timeFormatter}
                    interval={0}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    domain={[0, 100]}
                    tickFormatter={(value: number, i: number) =>
                      i !== 0 ? `${value}%` : ""
                    }
                    tick={gpuAxisTickStyle}
                    orientation="left"
                    type="number"
                  />
                  <ChartTooltip
                    cursor={false}
                    formatter={
                      ((value: number, name: string, props: any) => {
                        if (name === "gpu_temp") return `${value}°C`;
                        if (name === "gpu_usage")
                          return `${Number(value).toFixed(1)}%`;
                        if (name === "gpu_memory") {
                          const percentage = Number(value).toFixed(1);
                          const raw = props.payload?.gpu_memory_raw || 0;
                          return `${formatBytes(raw)}(${percentage}%)`;
                        }
                        return `${Number(value).toFixed(1)}`;
                      }) as any
                    }
                    content={
                      <ChartTooltipContent
                        labelFormatter={labelFormatter as any}
                        indicator="dot"
                      />
                    }
                  />
                  <Area
                    dataKey="gpu_usage"
                    animationDuration={0}
                    stroke={colors[0]}
                    fill={colors[0]}
                    opacity={0.8}
                    dot={false}
                  />
                  <Area
                    dataKey="gpu_memory"
                    animationDuration={0}
                    stroke={colors[1]}
                    fill={colors[1]}
                    opacity={0.8}
                    dot={false}
                  />
                  <Area
                    dataKey="gpu_temp"
                    animationDuration={0}
                    stroke={colors[2]}
                    fill={colors[2]}
                    opacity={0.6}
                    dot={false}
                  />
                </AreaChart>
              </ChartContainer>
            </div>
          ))}
      </div>
    </Flex>
  );
};

export default LoadChart;
