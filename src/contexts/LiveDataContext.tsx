import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { normalizeLatestStatusRecord, type LatestStatusRecord } from "@/lib/normalizers/liveData";
import type { LiveDataResponse, Record as LiveRecord } from "../types/LiveData";
import { useRPC2Call } from "./RPC2Context";

interface LiveDataContextType {
  live_data: LiveDataResponse | null;
  showCallout: boolean;
}

interface LiveDataRefreshContextType {
  onRefresh: (callback: (data: LiveDataResponse) => void) => () => void;
}

type LatestStatusResponseRecord = LatestStatusRecord & {
  online?: boolean;
  client?: string;
};

const LiveDataContext = createContext<LiveDataContextType>({
  live_data: null,
  showCallout: true,
});

const LiveDataRefreshContext = createContext<LiveDataRefreshContextType>({
  onRefresh: () => () => undefined,
});

function isSameOnlineList(prev: string[], next: string[]): boolean {
  if (prev.length !== next.length) {
    return false;
  }

  const prevSet = new Set(prev);
  for (const uuid of next) {
    if (!prevSet.has(uuid)) {
      return false;
    }
  }

  return true;
}

function isSameGpuDetails(prev?: LiveRecord["gpu"], next?: LiveRecord["gpu"]): boolean {
  if (!prev && !next) {
    return true;
  }

  if (!prev || !next) {
    return false;
  }

  if (prev.count !== next.count || prev.average_usage !== next.average_usage) {
    return false;
  }

  if (prev.detailed_info.length !== next.detailed_info.length) {
    return false;
  }

  for (let index = 0; index < prev.detailed_info.length; index++) {
    const prevItem = prev.detailed_info[index];
    const nextItem = next.detailed_info[index];
    if (
      prevItem.name !== nextItem.name ||
      prevItem.memory_total !== nextItem.memory_total ||
      prevItem.memory_used !== nextItem.memory_used ||
      prevItem.utilization !== nextItem.utilization ||
      prevItem.temperature !== nextItem.temperature
    ) {
      return false;
    }
  }

  return true;
}

function isSameStatusRecord(prev: LiveRecord, next: LiveRecord): boolean {
  return (
    prev.updated_at === next.updated_at &&
    prev.message === next.message &&
    prev.uptime === next.uptime &&
    prev.process === next.process &&
    prev.cpu.usage === next.cpu.usage &&
    prev.ram.used === next.ram.used &&
    prev.swap.used === next.swap.used &&
    prev.load.load1 === next.load.load1 &&
    prev.load.load5 === next.load.load5 &&
    prev.load.load15 === next.load.load15 &&
    prev.disk.used === next.disk.used &&
    prev.network.up === next.network.up &&
    prev.network.down === next.network.down &&
    prev.network.totalUp === next.network.totalUp &&
    prev.network.totalDown === next.network.totalDown &&
    prev.connections.tcp === next.connections.tcp &&
    prev.connections.udp === next.connections.udp &&
    isSameGpuDetails(prev.gpu, next.gpu)
  );
}

function mergeLiveData(prev: LiveDataResponse, next: LiveDataResponse): LiveDataResponse {
  const prevData = prev.data.data;
  const nextData = next.data.data;
  const nextKeys = Object.keys(nextData);
  const online = isSameOnlineList(prev.data.online, next.data.online)
    ? prev.data.online
    : next.data.online;

  let changed = prev.status !== next.status;
  if (online !== prev.data.online) {
    changed = true;
  }

  if (Object.keys(prevData).length !== nextKeys.length) {
    changed = true;
  }

  const mergedData: LiveDataResponse["data"]["data"] = {};
  for (const key of nextKeys) {
    const nextRecord = nextData[key];
    const prevRecord = prevData[key];

    if (prevRecord && isSameStatusRecord(prevRecord, nextRecord)) {
      mergedData[key] = prevRecord;
      continue;
    }

    mergedData[key] = nextRecord;
    changed = true;
  }

  if (!changed) {
    return prev;
  }

  return {
    status: next.status,
    data: {
      online,
      data: mergedData,
    },
  };
}

export const LiveDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [live_data, setLiveData] = useState<LiveDataResponse | null>(null);
  const [showCallout, setShowCallout] = useState(false);
  const callbacksRef = useRef<Set<(data: LiveDataResponse) => void>>(new Set());
  const liveDataRef = useRef<LiveDataResponse | null>(null);
  const { call } = useRPC2Call();

  const onRefresh = useCallback((callback: (data: LiveDataResponse) => void) => {
    callbacksRef.current.add(callback);
    return () => {
      callbacksRef.current.delete(callback);
    };
  }, []);

  const notifyRefreshCallbacks = useCallback((data: LiveDataResponse) => {
    callbacksRef.current.forEach((callback) => callback(data));
  }, []);

  useEffect(() => {
    liveDataRef.current = live_data;
  }, [live_data]);

  useEffect(() => {
    let timer: number | undefined;
    let stopped = false;
    let running = false;
    const intervalMs = 2000;

    const fetchLatest = async () => {
      if (running) return;
      running = true;
      try {
        const result = await call<undefined, Record<string, LatestStatusResponseRecord>>(
          "common:getNodesLatestStatus",
        );
        const online = Object.values(result)
          .filter((v): v is LatestStatusResponseRecord & { online: true; client: string } =>
            Boolean(v?.online && typeof v.client === "string"),
          )
          .map((v) => v.client);

        const dataMap: LiveDataResponse["data"]["data"] = {};
        for (const [uuid, v] of Object.entries(result)) {
          dataMap[uuid] = normalizeLatestStatusRecord(v);
        }

        const live: LiveDataResponse = {
          data: {
            online,
            data: dataMap,
          },
          status: "ok",
        };

        const previousLive = liveDataRef.current;
        const nextLive = previousLive ? mergeLiveData(previousLive, live) : live;

        if (nextLive !== previousLive) {
          liveDataRef.current = nextLive;
          setLiveData(nextLive);
          notifyRefreshCallbacks(nextLive);
        }

        setShowCallout((prev) => (prev ? prev : true));
      } catch (e) {
        console.error("RPC2 获取最新状态失败:", e);
        setShowCallout(false);
      } finally {
        running = false;
        if (!stopped) {
          timer = window.setTimeout(fetchLatest, intervalMs);
        }
      }
    };

    fetchLatest();

    return () => {
      stopped = true;
      if (timer) window.clearTimeout(timer);
    };
  }, [call, notifyRefreshCallbacks]);

  const liveDataValue = useMemo(() => ({ live_data, showCallout }), [live_data, showCallout]);
  const refreshValue = useMemo(() => ({ onRefresh }), [onRefresh]);

  return (
    <LiveDataContext.Provider value={liveDataValue}>
      <LiveDataRefreshContext.Provider value={refreshValue}>
        {children}
      </LiveDataRefreshContext.Provider>
    </LiveDataContext.Provider>
  );
};

export const useLiveData = () => useContext(LiveDataContext);

export const useLiveDataRefresh = () => useContext(LiveDataRefreshContext);

export default LiveDataContext;
