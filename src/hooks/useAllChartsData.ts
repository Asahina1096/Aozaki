import { useState, useEffect, useRef, useCallback } from "react";
import { getSharedClient } from "@/lib/rpc2";
import type {
  StatusRecord,
  PingRecord,
  PingBasicInfo,
  PingTaskInfo,
  GetRecordsParams,
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
) {
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
  const isFirstLoadRef = useRef(true);

  // 设置单个图表的时间范围
  const setChartTimeRange = useCallback(
    (chartType: keyof ChartTimeRanges, hours: number) => {
      setTimeRanges((prev) => ({
        ...prev,
        [chartType]: hours,
      }));
    },
    []
  );

  // 获取所有图表数据
  const fetchAllData = useCallback(async () => {
    if (!uuid) return;

    try {
      if (isFirstLoadRef.current) {
        setLoading(true);
      }

      const rpc = getSharedClient();

      // 并发获取所有类型的数据
      const requests = Object.entries(timeRanges).map(async ([type, hours]) => {
        try {
          let result;
          let records: StatusRecord[] | PingRecord[] = [];
          let basicInfo: PingBasicInfo[] = [];
          let taskInfo: PingTaskInfo[] = [];

          if (type === "ping") {
            // Ping 数据使用专门的 API 调用方式
            result = await rpc.getPingRecordsWithNames(uuid, hours);

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
            // 其他数据使用原有的 API 调用方式
            result = await rpc.getRecords({
              type: "load",
              uuid,
              hours,
              load_type: type as GetRecordsParams["load_type"],
              maxCount: 4000,
            });

            if (result.records) {
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
    } finally {
      if (isFirstLoadRef.current) {
        setLoading(false);
        isFirstLoadRef.current = false;
      }
    }
  }, [uuid, timeRanges]);

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
  };
}
