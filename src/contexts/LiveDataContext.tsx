import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import type { LiveDataResponse } from "../types/LiveData";
import { useRPC2Call } from "./RPC2Context";

interface LiveDataContextType {
  live_data: LiveDataResponse | null;
  showCallout: boolean;
}

interface LiveDataRefreshContextType {
  onRefresh: (callback: (data: LiveDataResponse) => void) => () => void;
}

type LatestStatusRecord = {
  online?: boolean;
  client?: string;
  cpu?: number;
  ram?: number;
  swap?: number;
  load?: number;
  load5?: number;
  load15?: number;
  disk?: number;
  net_out?: number;
  net_in?: number;
  net_total_out?: number;
  net_total_up?: number;
  net_total_in?: number;
  net_total_down?: number;
  connections?: number;
  connections_udp?: number;
  gpu?: number;
  uptime?: number;
  process?: number;
  time?: string | number;
};

const LiveDataContext = createContext<LiveDataContextType>({
  live_data: null,
  showCallout: true,
});

const LiveDataRefreshContext = createContext<LiveDataRefreshContextType>({
  onRefresh: () => () => undefined,
});

export const LiveDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [live_data, setLiveData] = useState<LiveDataResponse | null>(null);
  const [showCallout, setShowCallout] = useState(false);
  const callbacksRef = useRef<Set<(data: LiveDataResponse) => void>>(new Set());
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
    let timer: number | undefined;
    let stopped = false;
    let running = false;
    const intervalMs = 2000;

    const fetchLatest = async () => {
      if (running) return;
      running = true;
      try {
        const result = await call<undefined, Record<string, LatestStatusRecord>>(
          "common:getNodesLatestStatus",
        );
        const online = Object.values(result)
          .filter((v) => v?.online && typeof v.client === "string")
          .map((v) => v.client as string);

        const dataMap: LiveDataResponse["data"]["data"] = {};
        for (const [uuid, v] of Object.entries(result)) {
          const rec = v;
          dataMap[uuid] = {
            cpu: { usage: typeof rec.cpu === "number" ? rec.cpu : 0 },
            ram: { used: rec.ram ?? 0 },
            swap: { used: rec.swap ?? 0 },
            load: {
              load1: rec.load ?? 0,
              load5: rec.load5 ?? 0,
              load15: rec.load15 ?? 0,
            },
            disk: { used: rec.disk ?? 0 },
            network: {
              up: rec.net_out ?? 0,
              down: rec.net_in ?? 0,
              totalUp: rec.net_total_out ?? rec.net_total_up ?? 0,
              totalDown: rec.net_total_in ?? rec.net_total_down ?? 0,
            },
            connections: {
              tcp: rec.connections ?? 0,
              udp: rec.connections_udp ?? 0,
            },
            gpu:
              rec.gpu !== undefined
                ? { count: 0, average_usage: rec.gpu, detailed_info: [] }
                : undefined,
            uptime: rec.uptime ?? 0,
            process: rec.process ?? 0,
            message: "",
            updated_at: String(rec.time ?? ""),
          };
        }

        const live: LiveDataResponse = {
          data: {
            online,
            data: dataMap,
          },
          status: "ok",
        };
        setLiveData(live);
        setShowCallout(true);
        notifyRefreshCallbacks(live);
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

  return (
    <LiveDataContext.Provider value={{ live_data, showCallout }}>
      <LiveDataRefreshContext.Provider value={{ onRefresh }}>
        {children}
      </LiveDataRefreshContext.Provider>
    </LiveDataContext.Provider>
  );
};

export const useLiveData = () => useContext(LiveDataContext);

export const useLiveDataRefresh = () => useContext(LiveDataRefreshContext);

export default LiveDataContext;
