import { Button, Flex, Switch } from "@radix-ui/themes";
import { Eye, EyeOff } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Area, CartesianGrid, ComposedChart, Line, XAxis, YAxis } from "recharts";
import type { ChartConfig } from "@/components/ui/chart";
import {
  ChartContainer,
  ChartLegend,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { useRPC2Call } from "@/contexts/RPC2Context";
import { cutPeakValues, interpolateNullsLinear } from "@/utils/RecordHelper";

interface PingRecord {
  client: string;
  task_id: number;
  time: string;
  value: number;
}

interface TaskInfo {
  id: number;
  name: string;
  interval: number;
  loss: number;
  p99?: number;
  p50?: number;
  p99_p50_ratio?: number;
  min?: number;
  max?: number;
  avg?: number;
  latest?: number;
  total?: number;
  type?: string;
}

type PingRow = {
  time: string;
} & Record<string, number | string | null | undefined>;

const colors = [
  "#FF8A98",
  "#8FD6FF",
  "#9DE8C9",
  "#B7C4FF",
  "#79D9F8",
  "#C5B4FF",
  "#FFB28F",
  "#FBD89A",
];
const SOFT_GRID_STROKE = "hsl(var(--border) / 0.55)";
const SOFT_FILL_END = "#ffffff";
const AREA_GRADIENT_IDS = colors.map((_, idx) => `soft-ping-fill-${idx}`);
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

const presetViews = [
  { key: "1h", hours: 1 },
  { key: "6h", hours: 6 },
  { key: "12h", hours: 12 },
  { key: "1d", hours: 24 },
];

const Y_AXIS_WIDTH = 82;

const yAxisTickStyle = {
  fill: "hsl(var(--foreground))",
  fontSize: 11,
} as const;

const PingChart = ({ uuid, view }: { uuid: string; view: string }) => {
  const { t } = useTranslation();
  const { call } = useRPC2Call();

  const [hours, setHours] = useState(1);
  const [remoteData, setRemoteData] = useState<PingRecord[] | null>(null);
  const [tasks, setTasks] = useState<TaskInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cutPeak, setCutPeak] = useState(false);
  const [hiddenLines, setHiddenLines] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const selected = presetViews.find((v) => v.key === view);
    setHours(selected?.hours || 1);
  }, [view]);

  useEffect(() => {
    if (!uuid || !hours) {
      setRemoteData(null);
      return;
    }

    setLoading(true);
    setError(null);

    (async () => {
      try {
        type RpcResp = {
          count: number;
          records: PingRecord[];
          tasks?: TaskInfo[];
        };
        const result = await call<{ uuid: string; type: "ping"; hours: number }, RpcResp>(
          "common:getRecords",
          {
            uuid,
            type: "ping",
            hours,
          },
        );
        const records = result?.records || [];
        records.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
        setRemoteData(records);
        setTasks(result?.tasks || []);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Error");
      } finally {
        setLoading(false);
      }
    })();
  }, [call, hours, uuid]);

  const midData = useMemo(() => {
    const source = remoteData || [];
    if (!source.length) return [];

    const intervals = tasks
      .map((task) => task.interval)
      .filter((v): v is number => typeof v === "number" && v > 0);
    const fallbackIntervalSec = intervals.length ? Math.min(...intervals) : 60;

    const bucketMs = Math.max(1000, Math.min(6000, Math.floor(fallbackIntervalSec * 1000 * 0.25)));

    const buckets = new Map<number, PingRow>();

    for (const rec of source) {
      const ts = new Date(rec.time).getTime();
      const bucketKey = Math.floor(ts / bucketMs) * bucketMs;
      const use = bucketKey;

      if (!buckets.has(use)) {
        buckets.set(use, { time: new Date(use).toISOString() });
      }
      buckets.get(use)![rec.task_id] = rec.value < 0 ? null : rec.value;
    }

    const merged = Array.from(buckets.values()).sort(
      (a, b) => new Date(a.time).getTime() - new Date(b.time).getTime(),
    );

    if (!merged.length) return [];

    const lastTs = new Date(merged[merged.length - 1].time).getTime();
    const fromTs = lastTs - hours * 3600_000;

    let startIdx = 0;
    for (let i = 0; i < merged.length; i++) {
      if (new Date(merged[i].time).getTime() >= fromTs) {
        startIdx = Math.max(0, i - 1);
        break;
      }
    }

    return merged.slice(startIdx);
  }, [hours, remoteData, tasks]);

  const chartData = useMemo(() => {
    let output = midData;
    if (cutPeak && tasks.length > 0) {
      const keys = tasks.map((task) => String(task.id));
      output = cutPeakValues(midData, keys);
    }
    if (tasks.length > 0 && output.length > 0) {
      output = interpolateNullsLinear(
        output,
        tasks.map((task) => String(task.id)),
        {
          maxGapMultiplier: 6,
          minCapMs: 2 * 60_000,
          maxCapMs: 30 * 60_000,
        },
      );
    }
    return output;
  }, [cutPeak, midData, tasks]);

  const timeFormatter = (value: string, index: number) => {
    if (!chartData.length) return "";
    if (index === 0 || index === chartData.length - 1) {
      if (hours < 24) {
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
    if (hours < 24) {
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

  const chartConfig = useMemo(() => {
    const config: ChartConfig = {};
    tasks.forEach((task, idx) => {
      config[String(task.id)] = {
        label: task.name,
        color: colors[idx % colors.length],
      };
    });
    return config;
  }, [tasks]);

  const latestValues = useMemo(() => {
    if (!remoteData || !tasks.length) return [];
    const latestByTask = new Map<number, number>();
    for (let i = remoteData.length - 1; i >= 0; i--) {
      const rec = remoteData[i];
      if (rec.value >= 0 && !latestByTask.has(rec.task_id)) {
        latestByTask.set(rec.task_id, rec.value);
      }
    }
    return tasks.map((task, idx) => ({
      ...task,
      value: latestByTask.get(task.id) ?? null,
      color: colors[idx % colors.length],
    }));
  }, [remoteData, tasks]);

  const handleLegendClick = useCallback((entry: unknown) => {
    if (typeof entry !== "object" || entry === null || !("dataKey" in entry)) {
      return;
    }
    const key = String(entry.dataKey ?? "");
    setHiddenLines((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const toggleAllLines = useCallback(() => {
    const allHidden = tasks.every((task) => hiddenLines[String(task.id)]);
    const next: Record<string, boolean> = {};
    tasks.forEach((task) => {
      next[String(task.id)] = !allHidden;
    });
    setHiddenLines(next);
  }, [hiddenLines, tasks]);

  const cardClass =
    "w-full max-w-[1200px] rounded-2xl border border-border/20 bg-card/95 p-5 shadow-sm";

  return (
    <Flex direction="column" align="center" gap="4" className="w-full">
      {loading && <div className="text-center text-muted-foreground">Loading...</div>}
      {error && <div className="w-full text-center text-destructive">{error}</div>}

      {latestValues.length > 0 ? (
        <div className={`mb-3 ${cardClass}`}>
          <div
            className="mb-2 grid w-full gap-2"
            style={{
              gridTemplateColumns: "repeat(auto-fit, minmax(240px,1fr))",
            }}
          >
            {latestValues.map((task) => (
              <div key={task.id} className="flex items-center rounded">
                <div className="h-6 w-1 rounded-xs" style={{ backgroundColor: task.color }} />
                <div className="ml-1 flex flex-col items-start justify-center">
                  <label className="font-sans text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                    {task.name}
                  </label>
                  <div className="flex gap-2 text-sm font-mono text-foreground">
                    <span>{task.value !== null ? `${Number(task.value).toFixed(0)} ms` : "-"}</span>
                    <span>{`${Number(task.loss).toFixed(1)}%${t("chart.lossRate")}`}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="mb-3 w-full max-w-[980px] text-center text-muted-foreground">
          {t("common.none")}
        </div>
      )}

      <div className={cardClass}>
        {chartData.length === 0 ? (
          <div className="flex h-40 w-full items-center justify-center text-muted-foreground">
            {t("common.none")}
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="h-40 w-full aspect-auto">
            <ComposedChart
              data={chartData}
              accessibilityLayer
              margin={{ top: 4, right: 16, bottom: 4, left: 12 }}
            >
              {softFillDef}
              <CartesianGrid vertical={false} stroke={SOFT_GRID_STROKE} strokeDasharray="3 6" />
              <XAxis
                dataKey="time"
                tickLine={false}
                tickFormatter={timeFormatter}
                interval="preserveStartEnd"
                minTickGap={30}
                allowDuplicatedCategory={false}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                unit="ms"
                allowDecimals={false}
                orientation="left"
                type="number"
                width={Y_AXIS_WIDTH}
                tick={yAxisTickStyle}
              />
              <ChartTooltip
                cursor={false}
                formatter={(v) => `${Math.round(Number(v))} ms`}
                content={<ChartTooltipContent labelFormatter={labelFormatter} indicator="dot" />}
              />
              <ChartLegend onClick={handleLegendClick} />
              {tasks.map((task, idx) => [
                <Area
                  key={`area-${task.id}`}
                  dataKey={String(task.id)}
                  stroke={colors[idx % colors.length]}
                  fill={areaFill(idx)}
                  isAnimationActive={false}
                  connectNulls={false}
                  type="monotone"
                  hide={!!hiddenLines[String(task.id)]}
                />,
                <Line
                  key={task.id}
                  dataKey={String(task.id)}
                  name={task.name}
                  stroke={colors[idx % colors.length]}
                  dot={false}
                  isAnimationActive={false}
                  strokeWidth={2}
                  connectNulls={false}
                  type="monotone"
                  hide={!!hiddenLines[String(task.id)]}
                />,
              ])}
            </ComposedChart>
          </ChartContainer>
        )}

        <div
          className="mt-3 flex items-center justify-between gap-4"
          style={{ display: loading ? "none" : "flex" }}
        >
          <div className="flex items-center gap-2">
            <Switch id="cut-peak" checked={cutPeak} onCheckedChange={setCutPeak} />
            <label
              htmlFor="cut-peak"
              className="flex items-center gap-1 font-sans text-xs font-medium text-muted-foreground"
            >
              {t("chart.cutPeak")}
            </label>
          </div>
          <Button
            variant="soft"
            size="2"
            onClick={toggleAllLines}
            className="flex items-center gap-2"
          >
            {tasks.every((task) => hiddenLines[String(task.id)]) ? (
              <>
                <Eye size={16} />
                {t("chart.showAll")}
              </>
            ) : (
              <>
                <EyeOff size={16} />
                {t("chart.hideAll")}
              </>
            )}
          </Button>
        </div>
      </div>
    </Flex>
  );
};

export default PingChart;
