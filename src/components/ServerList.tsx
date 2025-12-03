import {
  useDeferredValue,
  useEffect,
  useMemo,
  useOptimistic,
  useState,
} from "react";
import { preconnect, prefetchDNS } from "react-dom";
import { getAPIOrigin } from "@/lib/api";
import { usePollingStats } from "@/lib/hooks";
import type { ServerStats } from "@/lib/types/serverstatus";
import { formatRelativeTime } from "@/lib/utils";
import { ServerListSkeleton } from "./ServerListSkeleton";
import { ServerOverview } from "./ServerOverview";
import { VirtualizedServerGrid } from "./VirtualizedServerGrid";

const DEFAULT_REFRESH_INTERVAL = 2000;

interface ServerListProps {
  refreshInterval?: number;
}

export function ServerList({
  refreshInterval = DEFAULT_REFRESH_INTERVAL,
}: ServerListProps) {
  const { stats, loading, error, isRetrying, retry, lastFetchTime } =
    usePollingStats({
      refreshInterval,
      enabled: true,
    });

  const [relativeTime, setRelativeTime] = useState(() =>
    formatRelativeTime(lastFetchTime)
  );

  useEffect(() => {
    setRelativeTime(formatRelativeTime(lastFetchTime));

    const interval = setInterval(() => {
      setRelativeTime(formatRelativeTime(lastFetchTime));
    }, 1000);

    return () => clearInterval(interval);
  }, [lastFetchTime]);

  useEffect(() => {
    const apiOrigin = getAPIOrigin();
    if (apiOrigin) {
      prefetchDNS(apiOrigin);
      preconnect(apiOrigin);
    }
  }, []);

  const currentServers = stats?.servers || [];
  const [optimisticServers] = useOptimistic(
    currentServers,
    (_currentServers, optimisticValue: ServerStats[]) => optimisticValue
  );

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

  const [searchQuery, setSearchQuery] = useState("");
  const deferredSearchQuery = useDeferredValue(searchQuery);

  const sortedServers = useMemo(() => {
    return [...optimisticServers].sort((a, b) => {
      const aOnline = a.online4 || a.online6 ? 1 : 0;
      const bOnline = b.online4 || b.online6 ? 1 : 0;
      if (aOnline !== bOnline) return bOnline - aOnline;
      return (b.weight || 0) - (a.weight || 0);
    });
  }, [optimisticServers]);

  const filteredServers = useMemo(() => {
    if (!deferredSearchQuery.trim()) {
      return sortedServers;
    }
    const query = deferredSearchQuery.toLowerCase().trim();
    return sortedServers.filter(
      (server) =>
        server.alias?.toLowerCase().includes(query) ||
        server.location?.toLowerCase().includes(query)
    );
  }, [sortedServers, deferredSearchQuery]);

  const hasServers = currentServers.length > 0;
  const isSearchPending = searchQuery !== deferredSearchQuery;

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
            onClick={retry}
            disabled={isRetrying}
            aria-busy={isRetrying}
            aria-label={isRetrying ? "正在重试连接服务器" : "重试连接服务器"}
            className="mt-4 rounded-lg bg-primary px-4 py-2 text-primary-foreground shadow-sm disabled:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
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
        <div className="rounded-2xl border border-destructive/20 bg-destructive/10 backdrop-blur-sm p-4 text-sm text-destructive shadow-sm">
          <p>数据刷新失败：{error.message || "请稍后再试。"}</p>
          <button
            type="button"
            onClick={retry}
            disabled={isRetrying}
            aria-busy={isRetrying}
            aria-label={isRetrying ? "正在重新获取数据" : "重新获取服务器数据"}
            className="mt-3 inline-flex items-center rounded-lg border border-destructive/20 backdrop-blur-sm px-3 py-1.5 text-sm font-medium disabled:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            {isRetrying ? "重试中..." : "重新获取数据"}
          </button>
        </div>
      )}
      <ServerOverview servers={optimisticServers} />
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xl md:text-2xl font-bold text-primary">
            节点列表
          </span>
          <div className="relative">
            <input
              type="search"
              placeholder="搜索别名/位置..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="搜索服务器（按别名或位置）"
              className="h-8 w-40 md:w-48 rounded-md border border-input bg-background px-3 text-sm placeholder:text-muted-foreground focus:outline-none"
            />
            {isSearchPending && (
              <span
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground"
                aria-label="正在搜索"
              >
                <svg
                  className="animate-spin h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              </span>
            )}
          </div>
          {searchQuery && (
            <span className="text-sm text-muted-foreground">
              {filteredServers.length}/{sortedServers.length}
            </span>
          )}
        </div>
        {lastFetchTime > 0 && (
          <span className="text-sm text-muted-foreground">
            上次更新：{relativeTime}
          </span>
        )}
      </div>
      <VirtualizedServerGrid servers={filteredServers} />
    </div>
  );
}
