import { useEffect, useOptimistic, useRef, useState, useTransition } from "react";
import { getAPIClient } from "@/lib/api";
import type { ServerStats, StatsResponse } from "@/lib/types/serverstatus";
import { ServerCard } from "./ServerCard";
import { ServerOverview } from "./ServerOverview";
import { ServerListSkeleton } from "./ServerListSkeleton";

interface ServerListProps {
  refreshInterval?: number; // 刷新间隔（毫秒）
}

export function ServerList({
  refreshInterval = 5000,
}: ServerListProps) {
  const abortControllerRef = useRef<AbortController | null>(null);
  const statsRef = useRef<StatsResponse | null>(null);
  const [, startTransition] = useTransition();

  // 使用 useState 存储数据
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // 获取服务器数据的函数
  const fetchServers = async (signal?: AbortSignal) => {
    try {
      const client = getAPIClient();
      const data = await client.getStats(signal);
      setStats(data);
      statsRef.current = data;
      setError(null);
      return data;
    } catch (err) {
      // 如果请求被取消，不更新状态
      if (err instanceof Error && err.name === "AbortError") {
        return null;
      }
      // 其他错误设置错误状态
      setError(err instanceof Error ? err : new Error("未知错误"));
      throw err;
    }
  };

  // 初始数据加载
  useEffect(() => {
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    setLoading(true);
    fetchServers(abortController.signal)
      .then(() => {
        setLoading(false);
      })
      .catch((err) => {
        // 只有非 AbortError 才会到达这里
        setLoading(false);
        // 错误已经通过 fetchServers 设置到 error 状态
        // ErrorBoundary 无法捕获异步错误，所以我们需要在渲染时处理
      });

    return () => {
      abortController.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    if (!stats) return; // 如果还没有初始数据，不启动定时刷新

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
        const latestData = statsRef.current;
        if (latestData?.servers) {
          setOptimisticServers(latestData.servers);
        }

        // 获取新数据
        fetchServers(abortController.signal)
          .then((newData) => {
            if (newData) {
              setStats(newData);
              statsRef.current = newData;
            }
          })
          .catch((err) => {
            // 只有非 AbortError 才会到达这里
            // 错误已经通过 fetchServers 设置到 error 状态
            // 在下次渲染时会抛出错误，触发 ErrorBoundary
          });
      });
    }, refreshInterval);

    return () => {
      clearInterval(interval);
    };
  }, [refreshInterval, stats, setOptimisticServers]);

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

  // 初始加载时显示骨架屏
  if (loading) {
    return <ServerListSkeleton />;
  }

  // 如果有错误，抛出错误让 ErrorBoundary 处理
  // 注意：这只能在同步渲染时工作，异步错误需要通过状态处理
  if (error) {
    throw error;
  }

  // 如果没有数据，显示空状态
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
