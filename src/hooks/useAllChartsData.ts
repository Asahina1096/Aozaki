import { useState, useEffect, useRef, useCallback } from "react";
import { getSharedClient } from "@/lib/rpc2";
import { getSharedWsClient } from "@/lib/wsRpc2";
import type {
  StatusRecord,
  PingRecord,
  PingBasicInfo,
  PingTaskInfo,
  GetRecordsParams,
  RecordsResponse,
  PingRecordsResponse,
} from "@/lib/types/komari";

// 图表时间范围配置
export interface ChartTimeRanges {
  cpu: number;
  ram: number;
  gpu: number;
  swap: number;
  disk: number;
  network: number;
  load: number;
  temp: number;
  process: number;
  connections: number;
  ping: number;
}

// 图表数据集合
export interface ChartsData {
  cpu: StatusRecord[];
  ram: StatusRecord[];
  gpu: StatusRecord[];
  swap: StatusRecord[];
  disk: StatusRecord[];
  network: StatusRecord[];
  load: StatusRecord[];
  temp: StatusRecord[];
  process: StatusRecord[];
  connections: StatusRecord[];
  ping: {
    records: PingRecord[];
    basicInfo: PingBasicInfo[];
    taskInfo: PingTaskInfo[];
  };
}

export interface UseAllChartsDataResult {
  chartsData: ChartsData;
  loading: boolean;
  timeRanges: ChartTimeRanges;
  setChartTimeRange: (
    _chartType: keyof ChartTimeRanges,
    _hours: number
  ) => void;
  refresh: () => Promise<void>;
  error: Error | null;
}

const DEFAULT_TIME_RANGES: ChartTimeRanges = {
  cpu: 1,
  ram: 1,
  gpu: 1,
  swap: 1,
  disk: 1,
  network: 1,
  load: 1,
  temp: 1,
  process: 1,
  connections: 1,
  ping: 1,
};

export function useAllChartsData(
  uuid: string,
  refreshInterval: number = 30000
): UseAllChartsDataResult {
  const [timeRanges, setTimeRanges] =
    useState<ChartTimeRanges>(DEFAULT_TIME_RANGES);
  const [chartsData, setChartsData] = useState<ChartsData>({
    cpu: [],
    ram: [],
    gpu: [],
    swap: [],
    disk: [],
    network: [],
    load: [],
    temp: [],
    process: [],
    connections: [],
    ping: {
      records: [],
      basicInfo: [],
      taskInfo: [],
    },
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const isFirstLoadRef = useRef(true);
  const requestIdRef = useRef(0);

  // 设置单个图表的时间范围
  const setChartTimeRange = useCallback(
    (chartType: keyof ChartTimeRanges, hours: number) => {
      setTimeRanges((prev) => {
        if (prev[chartType] === hours) {
          return prev;
        }
        return {
          ...prev,
          [chartType]: hours,
        };
      });
    },
    []
  );

  // 获取所有图表数据
  const fetchAllData = useCallback(async () => {
    if (!uuid) return;
    const requestId = ++requestIdRef.current;

    try {
      if (isFirstLoadRef.current) {
        setLoading(true);
      }
      setError(null);

      const httpClient = getSharedClient();
      const wsClient = getSharedWsClient();
      let useHttp = import.meta.env.DEV;

      if (!useHttp) {
        try {
          await wsClient.connect();
        } catch (error) {
          console.error("WebSocket 连接失败，回退至 HTTP 请求:", error);
          useHttp = true;
        }
      }

      // 并发获取所有类型的数据
      const requests = (
        Object.entries(timeRanges) as [keyof ChartTimeRanges, number][]
      ).map(async ([type, hours]) => {
        try {
          let records: StatusRecord[] | PingRecord[] = [];
          let basicInfo: PingBasicInfo[] = [];
          let taskInfo: PingTaskInfo[] = [];

          if (type === "ping") {
            if (useHttp) {
              const result = await httpClient.getPingRecordsWithNames(
                uuid,
                hours
              );

              if (result.records && Array.isArray(result.records)) {
                records = result.records as PingRecord[];
              }
              if (result.tasks && Array.isArray(result.tasks)) {
                taskInfo = result.tasks as PingTaskInfo[];
                basicInfo = result.tasks.map((task) => ({
                  client: "",
                  loss: task.loss,
                  min: 0,
                  max: 0,
                })) as PingBasicInfo[];
              }
            } else {
              const [wsResult, namedResult] = await Promise.all([
                wsClient.call<PingRecordsResponse>("common:getRecords", {
                  type: "ping",
                  uuid,
                  hours,
                  maxCount: 2000,
                }),
                httpClient
                  .getPingRecordsWithNames(uuid, hours)
                  .catch((error) => {
                    console.warn("获取 Ping 任务信息失败:", error);
                    return null;
                  }),
              ]);

              if (wsResult.records && Array.isArray(wsResult.records)) {
                records = wsResult.records as PingRecord[];
              }

              if (wsResult.basic_info && Array.isArray(wsResult.basic_info)) {
                basicInfo = wsResult.basic_info as PingBasicInfo[];
              }

              if (namedResult?.tasks && Array.isArray(namedResult.tasks)) {
                taskInfo = namedResult.tasks as PingTaskInfo[];
              }
            }
          } else {
            const params: GetRecordsParams = {
              type: "load",
              uuid,
              hours,
              load_type: type as GetRecordsParams["load_type"],
              maxCount: 2000,
            };

            let result: RecordsResponse | null = null;

            if (useHttp) {
              result = await httpClient.getRecords(params);
            } else {
              result = await wsClient.call<RecordsResponse>(
                "common:getRecords",
                params as Record<string, unknown>
              );
            }

            if (result?.records) {
              if (Array.isArray(result.records)) {
                records = result.records as StatusRecord[];
              } else {
                const recordsData = result.records[uuid];
                if (recordsData && Array.isArray(recordsData)) {
                  records = recordsData as StatusRecord[];
                }
              }
            }
          }

          return { type, records, basicInfo, taskInfo };
        } catch (err) {
          console.error(`获取 ${type} 数据失败:`, err);
          return { type, records: [], basicInfo: [], taskInfo: [] };
        }
      });

      const results = await Promise.all(requests);

      if (requestId !== requestIdRef.current) {
        return;
      }

      // 更新所有图表数据
      const newChartsData: ChartsData = {
        cpu: [],
        ram: [],
        gpu: [],
        swap: [],
        disk: [],
        network: [],
        load: [],
        temp: [],
        process: [],
        connections: [],
        ping: {
          records: [],
          basicInfo: [],
          taskInfo: [],
        },
      };

      results.forEach(({ type, records, basicInfo, taskInfo }) => {
        if (type === "ping") {
          newChartsData.ping = {
            records: records as PingRecord[],
            basicInfo: basicInfo as PingBasicInfo[],
            taskInfo: taskInfo as PingTaskInfo[],
          };
        } else {
          newChartsData[type as keyof Omit<ChartsData, "ping">] =
            records as StatusRecord[];
        }
      });

      setChartsData(newChartsData);
    } catch (err) {
      console.error("获取图表数据失败:", err);
      if (requestId === requestIdRef.current) {
        const normalizedError =
          err instanceof Error ? err : new Error(String(err));
        setError(normalizedError);
      }
    } finally {
      if (requestId === requestIdRef.current && isFirstLoadRef.current) {
        setLoading(false);
        isFirstLoadRef.current = false;
      }
    }
  }, [uuid, timeRanges]);

  const refresh = useCallback(async () => {
    isFirstLoadRef.current = true;
    setLoading(true);
    await fetchAllData();
  }, [fetchAllData]);

  // 初始加载和定时刷新
  useEffect(() => {
    if (!uuid) return;

    fetchAllData();

    const intervalId = window.setInterval(() => {
      fetchAllData();
    }, refreshInterval);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [uuid, fetchAllData, refreshInterval]);

  // 时间范围变化时，重置首次加载标记
  useEffect(() => {
    isFirstLoadRef.current = true;
  }, [timeRanges]);

  return {
    chartsData,
    loading,
    timeRanges,
    setChartTimeRange,
    refresh,
    error,
  };
}
