import { useEffect, use, useOptimistic, useRef, useState, useTransition } from "react";
import { getAPIClient } from "@/lib/api";
import type { ServerStats, StatsResponse } from "@/lib/types/serverstatus";
import { ServerCard } from "./ServerCard";
import { ServerOverview } from "./ServerOverview";

interface ServerListProps {
  refreshInterval?: number; // 刷新间隔（毫秒）
}

/**
 * 创建获取服务器数据的 Promise
 * 包装原始 Promise 以处理 AbortError（不会触发 Error Boundary）
 */
function createStatsPromise(
  signal?: AbortSignal,
  previousData?: StatsResponse
): Promise<StatsResponse> {
  const client = getAPIClient();
  const originalPromise = client.getStats(signal);

  // 包装 Promise 以处理 AbortError
  // 如果请求被取消，返回之前的数据（如果有）
  return originalPromise.catch((err) => {
    // 如果请求被取消，返回之前的数据
    if (err instanceof Error && err.name === "AbortError") {
      if (previousData) {
        return previousData;
      }
      // 如果没有之前的数据，重新抛出错误
      // 这不应该发生在正常流程中，因为首次加载不应该被取消
      throw err;
    }
    // 其他错误继续抛出，由 Error Boundary 处理
    throw err;
  });
}

export function ServerList({
  refreshInterval = 5000,
}: ServerListProps) {
  const abortControllerRef = useRef<AbortController | null>(null);
  const previousDataRef = useRef<StatsResponse | undefined>(undefined);
  const [, startTransition] = useTransition();

  // 使用 useState 存储 Promise，用于 use hook 读取
  // 初始 Promise 在组件挂载时创建
  const [statsPromise, setStatsPromise] = useState<Promise<StatsResponse>>(
    () => {
      const abortController = new AbortController();
      abortControllerRef.current = abortController;
      return createStatsPromise(abortController.signal);
    }
  );

  // 使用 use hook 读取 Promise
  // 如果 Promise pending，会触发 Suspense（显示 fallback）
  // 如果 Promise reject（非 AbortError），会触发 Error Boundary
  // 如果 Promise resolve，返回数据
  const stats = use(statsPromise);

  // 保存当前数据到 ref，用于乐观更新和 AbortError 处理
  useEffect(() => {
    if (stats) {
      previousDataRef.current = stats;
    }
  }, [stats]);

  // useOptimistic: 提供乐观更新的 UI 反馈
  // 在数据刷新期间保持显示当前数据，避免闪烁
  const currentServers = stats?.servers || [];
  const [optimisticServers, setOptimisticServers] = useOptimistic(
    currentServers,
    (_currentServers, optimisticValue: ServerStats[]) => optimisticValue
  );

  // 定时刷新
  useEffect(() => {
    if (refreshInterval <= 0) return;

    const interval = setInterval(() => {
      startTransition(() => {
        // 取消之前的请求
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }

        // 创建新的 AbortController
        const abortController = new AbortController();
        abortControllerRef.current = abortController;

        // 设置乐观状态为当前数据（从 ref 获取最新值）
        const latestData = previousDataRef.current;
        if (latestData?.servers) {
          setOptimisticServers(latestData.servers);
        }

        // 创建新的 Promise 并更新状态
        // use hook 会自动读取新的 Promise，如果 pending 会触发 Suspense
        // 但由于 useTransition，不会阻塞 UI，而且 useOptimistic 会显示旧数据
        const newPromise = createStatsPromise(
          abortController.signal,
          latestData
        );
        setStatsPromise(newPromise);
      });
    }, refreshInterval);

    return () => {
      clearInterval(interval);
    };
  }, [refreshInterval, setOptimisticServers]);

  // 组件卸载时取消请求
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
    };
  }, []);

  // 开发环境：验证 name 字段的唯一性
  if (import.meta.env.DEV && currentServers.length > 0) {
    const names = currentServers.map((s) => s.name);
    const duplicates = names.filter(
      (name, index) => names.indexOf(name) !== index
    );
    if (duplicates.length > 0) {
      console.error(
        "⚠️ ServerList: 检测到重复的 server.name 值，这会导致 React key 警告:",
        [...new Set(duplicates)]
      );
      console.error(
        "受影响的服务器:",
        currentServers.filter((s) => duplicates.includes(s.name))
      );
    }
  }

  // 排序：在线优先，然后按权重排序
  // React Compiler 会自动优化，无需 useMemo
  const sortedServers = [...optimisticServers].sort((a, b) => {
    const aOnline = a.online4 || a.online6 ? 1 : 0;
    const bOnline = b.online4 || b.online6 ? 1 : 0;
    if (aOnline !== bOnline) return bOnline - aOnline;
    return (b.weight || 0) - (a.weight || 0);
  });

  if (currentServers.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        暂无节点数据
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ServerOverview servers={optimisticServers} />
      <div className="flex items-center">
        <span className="text-xl md:text-2xl font-bold text-primary">
          节点列表
        </span>
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {sortedServers.map((server) => (
          // 使用 server.name 作为 key：
          // 根据 ServerStatus-Rust 文档，name 字段是唯一标识符（不可重复）
          // 参考：https://github.com/zdz/ServerStatus-Rust
          <ServerCard key={server.name} server={server} />
        ))}
      </div>
    </div>
  );
}
