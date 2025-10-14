import { useState, useEffect, useRef } from "react";
import { getSharedClient } from "@/lib/rpc2";
import type { StatusRecord } from "@/lib/types/komari";

export type LoadType =
  | "cpu"
  | "gpu"
  | "ram"
  | "swap"
  | "load"
  | "temp"
  | "disk"
  | "network"
  | "process"
  | "connections"
  | "all";

interface UseChartDataOptions {
  uuid: string;
  loadType: LoadType;
  initialHours?: number;
  refreshInterval?: number; // 刷新间隔（毫秒），默认 30 秒
}

export function useChartData({
  uuid,
  loadType,
  initialHours = 1,
  refreshInterval = 30000, // 默认 30 秒刷新一次
}: UseChartDataOptions) {
  const [data, setData] = useState<StatusRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<number>(initialHours);
  const isFirstLoadRef = useRef(true); // 跟踪是否首次加载

  useEffect(() => {
    if (!uuid) return;

    const fetchData = async () => {
      try {
        // 只在首次加载或时间范围变化时显示 loading
        if (isFirstLoadRef.current) {
          setLoading(true);
        }

        const rpc = getSharedClient();
        const result = await rpc.getRecords({
          type: "load",
          uuid,
          hours: timeRange,
          load_type: loadType,
          maxCount: 4000,
        });

        if (result.records) {
          if (Array.isArray(result.records)) {
            setData(result.records);
          } else {
            const recordsData = result.records[uuid];
            if (recordsData && Array.isArray(recordsData)) {
              setData(recordsData);
            } else {
              setData([]);
            }
          }
        } else {
          setData([]);
        }
      } catch (err) {
        console.error(`获取 ${loadType} 图表数据失败:`, err);
        if (isFirstLoadRef.current) {
          setData([]);
        }
      } finally {
        if (isFirstLoadRef.current) {
          setLoading(false);
          isFirstLoadRef.current = false;
        }
      }
    };

    // 首次加载
    fetchData();

    // 设置定时刷新
    const intervalId = window.setInterval(() => {
      fetchData();
    }, refreshInterval);

    // 清理定时器
    return () => {
      window.clearInterval(intervalId);
    };
  }, [uuid, timeRange, loadType, refreshInterval]);

  // 当时间范围变化时，重置首次加载标记
  useEffect(() => {
    isFirstLoadRef.current = true;
  }, [timeRange]);

  return { data, loading, timeRange, setTimeRange };
}
