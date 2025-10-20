import { useEffect, useState } from "react";
import { getAPIClient } from "@/lib/api";
import type { ServerStats } from "@/lib/types/serverstatus";
import { ServerCard } from "./ServerCard";

interface ServerListProps {
  refreshInterval?: number; // 刷新间隔（毫秒）
}

export function ServerList({ refreshInterval = 5000 }: ServerListProps) {
  const [servers, setServers] = useState<ServerStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchServers = async () => {
    try {
      const client = getAPIClient();
      const data = await client.getStats();
      setServers(data.servers);
      setLastUpdated(new Date(data.updated * 1000));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "获取数据失败");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServers();

    // 设置定时刷新
    if (refreshInterval > 0) {
      const interval = setInterval(fetchServers, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [refreshInterval]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-64 bg-secondary/20 animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive text-lg mb-4">错误: {error}</p>
        <button
          onClick={fetchServers}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
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

  // 排序：在线优先，然后按权重排序
  const sortedServers = [...servers].sort((a, b) => {
    const aOnline = a.online4 || a.online6 ? 1 : 0;
    const bOnline = b.online4 || b.online6 ? 1 : 0;
    if (aOnline !== bOnline) return bOnline - aOnline;
    return (b.weight || 0) - (a.weight || 0);
  });

  return (
    <div className="space-y-4">
      {/* 统计信息 */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <div>
          共 {servers.length} 台服务器，
          在线 {servers.filter((s) => s.online4 || s.online6).length} 台
        </div>
        {lastUpdated && (
          <div>更新于: {lastUpdated.toLocaleTimeString()}</div>
        )}
      </div>

      {/* 服务器卡片网格 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {sortedServers.map((server) => (
          <ServerCard key={server.name} server={server} />
        ))}
      </div>
    </div>
  );
}
