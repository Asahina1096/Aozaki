import { LayoutGrid, List } from "lucide-react";
import {
  useEffect,
  useOptimistic,
  useRef,
  useState,
  useTransition,
} from "react";
import { getAPIClient } from "@/lib/api";
import type { ServerStats, StatsResponse } from "@/lib/types/serverstatus";
import { ServerCard } from "./ServerCard";
import { ServerListSkeleton } from "./ServerListSkeleton";
import { ServerOverview } from "./ServerOverview";
import { ServerTable } from "./ServerTable";

const VIEW_MODE_OPTIONS = [
  { id: "grid", label: "卡片", icon: LayoutGrid },
  { id: "list", label: "列表", icon: List },
] as const;

const VIEW_MODE_STORAGE_KEY = "aozaki-server-view-mode";

type ViewMode = (typeof VIEW_MODE_OPTIONS)[number]["id"];

interface ServerListProps {
  refreshInterval?: number; // 刷新间隔（毫秒）
}

export function ServerList({ refreshInterval = 5000 }: ServerListProps) {
  const abortControllerRef = useRef<AbortController | null>(null);
  const [, startTransition] = useTransition();

  // 使用 useState 存储数据
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const isFirstViewModeRender = useRef(true);

  // 获取服务器数据的函数
  // React Compiler 会自动优化函数引用，无需手动 useCallback
  async function fetchServers(signal?: AbortSignal) {
    try {
      const client = getAPIClient();
      const data = await client.getStats(signal);
      setStats(data);
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
  }

  // 初始数据加载
  useEffect(() => {
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    setLoading(true);
    fetchServers(abortController.signal)
      .then(() => {
        setLoading(false);
      })
      .catch(() => {
        // 只有非 AbortError 才会到达这里
        setLoading(false);
        // 错误已经通过 fetchServers 设置到 error 状态
      });

    return () => {
      abortController.abort();
    };
  }, []);

  // useOptimistic: 提供乐观更新的 UI 反馈
  // 在数据刷新期间保持显示当前数据，避免闪烁
  const currentServers = stats?.servers || [];
  const [optimisticServers, setOptimisticServers] = useOptimistic(
    currentServers,
    (_currentServers, optimisticValue: ServerStats[]) => optimisticValue
  );

  // 定时刷新（仅在初始数据加载完成后启动）
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

        // 设置乐观状态为当前数据
        if (stats?.servers) {
          setOptimisticServers(stats.servers);
        }

        // 获取新数据
        fetchServers(abortController.signal).catch(() => {
          // 只有非 AbortError 才会到达这里
          // 错误已经通过 fetchServers 设置到 error 状态
        });
      });
    }, refreshInterval);

    return () => {
      clearInterval(interval);
      // 清理定时器时，如果还有正在进行的请求，也一并取消
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
    };
  }, [refreshInterval, stats]);

  // 在客户端读取本地偏好
  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem(VIEW_MODE_STORAGE_KEY);
    if (stored === "grid" || stored === "list") {
      setViewMode(stored);
    }
  }, []);

  // 持久化视图偏好
  useEffect(() => {
    if (isFirstViewModeRender.current) {
      isFirstViewModeRender.current = false;
      return;
    }
    if (typeof window === "undefined") return;
    window.localStorage.setItem(VIEW_MODE_STORAGE_KEY, viewMode);
  }, [viewMode]);

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

  const hasServers = currentServers.length > 0;

  function handleRetry() {
    const abortController = new AbortController();
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = abortController;

    setIsRetrying(true);
    setLoading(true);

    fetchServers(abortController.signal)
      .catch(() => {
        // 错误状态由 fetchServers 负责
      })
      .finally(() => {
        setIsRetrying(false);
        setLoading(false);
      });
  }

  // 初始加载或无数据时显示骨架屏
  if (loading && !hasServers) {
    return <ServerListSkeleton />;
  }

  if (!hasServers) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-lg font-semibold text-muted-foreground">
          {error ? "无法加载节点数据" : "暂无节点数据"}
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          {error?.message || "请稍后再试。"}
        </p>
        {error && (
          <button
            type="button"
            onClick={handleRetry}
            disabled={isRetrying}
            className="mt-4 rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90 disabled:opacity-70"
          >
            {isRetrying ? "重试中..." : "重试"}
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
          <p>数据刷新失败：{error.message || "请稍后再试。"}</p>
          <button
            type="button"
            onClick={handleRetry}
            disabled={isRetrying}
            className="mt-3 inline-flex items-center rounded-md border border-destructive/30 px-3 py-1.5 text-sm font-medium hover:bg-destructive/10 disabled:opacity-70"
          >
            {isRetrying ? "重试中..." : "重新获取数据"}
          </button>
        </div>
      )}
      <ServerOverview servers={optimisticServers} />
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <span className="text-xl md:text-2xl font-bold text-primary">
          节点列表
        </span>
        <div className="hidden md:inline-flex items-center rounded-md border bg-muted/60 p-1">
          {VIEW_MODE_OPTIONS.map(({ id, label, icon: Icon }) => {
            const active = viewMode === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setViewMode(id)}
                aria-pressed={active}
                className={`inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-sm font-medium transition ${
                  active
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{label}</span>
              </button>
            );
          })}
        </div>
      </div>
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {sortedServers.map((server) => (
            // 使用 server.name 作为 key：
            // 根据 ServerStatus-Rust 文档，name 字段是唯一标识符（不可重复）
            // 参考：https://github.com/zdz/ServerStatus-Rust
            <ServerCard key={server.name} server={server} />
          ))}
        </div>
      ) : (
        <ServerTable servers={sortedServers} />
      )}
    </div>
  );
}
