import { useEffect, useState } from "react";
import { getAPIClient } from "@/lib/api";
import type { ServerStats } from "@/lib/types/serverstatus";
import { ServerCard } from "./ServerCard";
import { ServerOverview } from "./ServerOverview";

interface ServerListProps {
  initialServers?: ServerStats[];
  initialError?: string | null;
  refreshInterval?: number; // 刷新间隔（毫秒）
}

export function ServerList({
  initialServers = [],
  initialError = null,
  refreshInterval = 5000,
}: ServerListProps) {
  // 使用 SSR 传入的初始数据，无需初始 loading 状态
  const [servers, setServers] = useState<ServerStats[]>(initialServers);
  const [error, setError] = useState<string | null>(initialError);

  useEffect(() => {
    // 只负责定时刷新，不做初始加载
    if (refreshInterval <= 0) return;

    const fetchServers = async () => {
      try {
        const client = getAPIClient();
        const data = await client.getStats();
        setServers(data.servers);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "获取数据失败");
      }
    };

    const interval = setInterval(fetchServers, refreshInterval);
    return () => clearInterval(interval);
  }, [refreshInterval]);

  // 排序：在线优先，然后按权重排序
  // React Compiler 会自动优化，无需 useMemo
  const sortedServers = [...servers].sort((a, b) => {
    const aOnline = a.online4 || a.online6 ? 1 : 0;
    const bOnline = b.online4 || b.online6 ? 1 : 0;
    if (aOnline !== bOnline) return bOnline - aOnline;
    return (b.weight || 0) - (a.weight || 0);
  });

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-lg font-semibold text-destructive">
          无法加载节点数据
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          {error || "请稍后再试。"}
        </p>
      </div>
    );
  }

  if (servers.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        暂无节点数据
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ServerOverview servers={servers} />
      <div className="flex items-center">
        <span className="text-xl md:text-2xl font-bold text-primary">
          节点列表
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
