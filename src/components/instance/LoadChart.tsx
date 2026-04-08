import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toFiniteNumber } from "@/lib/normalizers/primitives";
import { useLiveData } from "@/contexts/LiveDataContext";
import { useNodeList } from "@/contexts/NodeListContext";
import fillMissingTimePoints, {
  normalizeLoadRecordFromAPI,
  type LoadRecordAPI,
  type RecordFormat,
} from "@/utils/RecordHelper";
import {
  CpuChart,
  RamSwapChart,
  NetworkChart,
  DiskChart,
  ConnectionsChart,
  ProcessChart,
  GpuChart,
} from "./charts";

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

const LoadChart = ({ data = [], view }: LoadChartProps) => {
  const { nodeByUuid } = useNodeList();
  const { live_data } = useLiveData();
  const [remoteData, setRemoteData] = useState<RecordFormat[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestSeqRef = useRef(0);

  const uuid =
    typeof window === "undefined"
      ? ""
      : window.location.pathname.split("/").filter(Boolean).pop() || "";

  const node = nodeByUuid.get(uuid);
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
  const realtimeData = useMemo(() => (Array.isArray(data) ? data.slice(-150) : []), [data]);

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
      ram_raw: item.ram ?? undefined,
      swap: resolveUsagePercent(item.swap, item.swap_total, node?.swap_total ?? 0),
      swap_raw: item.swap ?? undefined,
    }));
  }, [chartData, node?.mem_total, node?.swap_total]);

  const networkChartData = useMemo(() => {
    return chartData.map((item) => ({
      time: item.time,
      net_in: toFiniteNumber(item.net_in),
      net_out: toFiniteNumber(item.net_out),
    }));
  }, [chartData]);

  const diskChartData = useMemo(() => {
    return chartData.map((item) => ({
      time: item.time,
      disk: toFiniteNumber(item.disk),
    }));
  }, [chartData]);

  const connectionsChartData = useMemo(() => {
    return chartData.map((item) => ({
      time: item.time,
      connections: toFiniteNumber(item.connections),
      connections_udp: toFiniteNumber(item.connections_udp),
    }));
  }, [chartData]);

  const processChartData = useMemo(() => {
    return chartData.map((item) => ({
      time: item.time,
      process: toFiniteNumber(item.process),
    }));
  }, [chartData]);

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

  const timeFormatter = useCallback(
    (value: string, index: number) => {
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
    },
    [chartData.length, isRealtime, view],
  );

  const labelFormatter = useCallback(
    (value: React.ReactNode) => {
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
    },
    [isRealtime, view],
  );

  const gpuSeriesData = useMemo(() => {
    const gpuCount = current?.gpu?.detailed_info?.length ?? 0;
    if (gpuCount === 0) {
      return [];
    }

    return Array.from({ length: gpuCount }, (_, index) =>
      chartData.map((item) => ({
        time: item.time,
        gpu_usage: toFiniteNumber(item.gpu_detailed?.[index]?.usage ?? item.gpu_usage),
        gpu_memory: toFiniteNumber(item.gpu_detailed?.[index]?.memory ?? item.gpu_memory),
        gpu_memory_raw:
          toFiniteNumber(item.gpu_detailed?.[index]?.mem_used) ||
          (toFiniteNumber(current?.gpu?.detailed_info?.[index]?.memory_total) *
            toFiniteNumber(item.gpu_detailed?.[index]?.memory)) /
            100,
        gpu_temp: toFiniteNumber(item.gpu_detailed?.[index]?.temperature),
      })),
    );
  }, [chartData, current?.gpu?.detailed_info]);

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      {loading && <div className="text-center text-muted-foreground">Loading...</div>}
      {error && <div className="w-full text-center text-destructive">{error}</div>}

      <div className="mx-auto mt-2 grid w-full max-w-[1200px] grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <CpuChart
          data={chartData.map((item) => ({ time: item.time, cpu: toFiniteNumber(item.cpu) }))}
          currentValue={currentMetrics.cpu}
          timeFormatter={timeFormatter}
          labelFormatter={labelFormatter}
        />

        <RamSwapChart
          data={ramSwapChartData}
          currentRam={currentMetrics.ram}
          currentSwap={currentMetrics.swap}
          timeFormatter={timeFormatter}
          labelFormatter={labelFormatter}
        />

        <NetworkChart
          data={networkChartData}
          currentUp={currentMetrics.networkUp}
          currentDown={currentMetrics.networkDown}
          timeFormatter={timeFormatter}
          labelFormatter={labelFormatter}
        />

        <DiskChart
          data={diskChartData}
          currentValue={currentMetrics.disk}
          yAxisMax={diskYAxisMax}
          timeFormatter={timeFormatter}
          labelFormatter={labelFormatter}
        />

        <ConnectionsChart
          data={connectionsChartData}
          currentTcp={currentMetrics.connectionsTcp}
          currentUdp={currentMetrics.connectionsUdp}
          timeFormatter={timeFormatter}
          labelFormatter={labelFormatter}
        />

        <ProcessChart
          data={processChartData}
          currentValue={currentMetrics.process}
          timeFormatter={timeFormatter}
          labelFormatter={labelFormatter}
        />

        {current?.gpu &&
          current.gpu.count > 0 &&
          current.gpu.detailed_info?.map((gpu, index) => (
            <GpuChart
              key={`gpu-${index}`}
              index={index}
              data={gpuSeriesData[index] ?? []}
              info={gpu}
              timeFormatter={timeFormatter}
              labelFormatter={labelFormatter}
            />
          ))}
      </div>
    </div>
  );
};

export default LoadChart;
