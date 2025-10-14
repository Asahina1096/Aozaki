import { useState, useEffect, useRef, useCallback } from "react";
import { getSharedClient } from "@/lib/rpc2";
import type { StatusRecord } from "@/lib/types/komari";

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
          const result = await rpc.getRecords({
            type: "load",
            uuid,
            hours,
            load_type: type as any,
            maxCount: 4000,
          });

          let records: StatusRecord[] = [];
          if (result.records) {
            if (Array.isArray(result.records)) {
              records = result.records;
            } else {
              const recordsData = result.records[uuid];
              if (recordsData && Array.isArray(recordsData)) {
                records = recordsData;
              }
            }
          }

          return { type, records };
        } catch (err) {
          console.error(`获取 ${type} 数据失败:`, err);
          return { type, records: [] };
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
      };

      results.forEach(({ type, records }) => {
        newChartsData[type as keyof ChartsData] = records;
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
