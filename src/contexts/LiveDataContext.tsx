import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { normalizeLatestStatusRecord, type LatestStatusRecord } from "@/lib/normalizers/liveData";
import type { LiveDataResponse } from "../types/LiveData";
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
