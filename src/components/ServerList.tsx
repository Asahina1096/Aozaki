import { useEffect, useState, useCallback, useMemo } from "react";
import { getAPIClient } from "@/lib/api";
import type { ServerStats } from "@/lib/types/serverstatus";
import { ServerCard } from "./ServerCard";
import { ServerOverview } from "./ServerOverview";
import { Skeleton } from "./ui/skeleton";

interface ServerListProps {
  refreshInterval?: number; // 刷新间隔（毫秒）
}

export function ServerList({ refreshInterval = 5000 }: ServerListProps) {
  const [servers, setServers] = useState<ServerStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchServers = useCallback(async () => {
    try {
      const client = getAPIClient();
      const data = await client.getStats();
      setServers(data.servers);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "获取数据失败");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchServers();

    // 设置定时刷新
    if (refreshInterval > 0) {
      const interval = setInterval(fetchServers, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [refreshInterval, fetchServers]);

  // 排序：在线优先，然后按权重排序
  const sortedServers = useMemo(() => {
    return [...servers].sort((a, b) => {
      const aOnline = a.online4 || a.online6 ? 1 : 0;
      const bOnline = b.online4 || b.online6 ? 1 : 0;
      if (aOnline !== bOnline) return bOnline - aOnline;
      return (b.weight || 0) - (a.weight || 0);
    });
  }, [servers]);

  if (loading) {
    return (
      <div className="space-y-6">
        {/* 概览骨架屏 */}
        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={`overview-skeleton-${index}`} className="h-24 rounded-lg" />
          ))}
        </div>
        {/* 卡片骨架屏 */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={`card-skeleton-${index}`} className="h-[420px] rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-lg font-semibold text-destructive">
          无法加载服务器数据
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          {error || "请稍后再试。"}
        </p>
        <button
          type="button"
          onClick={fetchServers}
          className="mt-4 inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          重试
        </button>
      </div>
    );
  }

  if (servers.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        暂无服务器数据
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ServerOverview servers={servers} />
      <div className="flex items-center">
        <span className="text-xl md:text-2xl font-bold text-primary">
          服务器列表
        </span>
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {sortedServers.map((server) => (
          <ServerCard key={server.name} server={server} />
        ))}
      </div>
    </div>
  );
}
