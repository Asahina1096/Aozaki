import { useEffect, useOptimistic, useState, useTransition } from "react";
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
  const [, startTransition] = useTransition();

  // useOptimistic: 提供乐观更新的 UI 反馈
  // 注意：setOptimisticServers 由 React Compiler 自动管理，不需要手动调用
  const [optimisticServers, _setOptimisticServers] = useOptimistic(
    servers,
    (_currentServers, optimisticValue: ServerStats[]) => optimisticValue
  );

  // 开发环境：验证 name 字段的唯一性
  if (import.meta.env.DEV && servers.length > 0) {
    const names = servers.map((s) => s.name);
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
        servers.filter((s) => duplicates.includes(s.name))
      );
    }
  }

  // 自动刷新
  useEffect(() => {
    // 只负责定时刷新，不做初始加载
    if (refreshInterval <= 0) return;

    const interval = setInterval(() => {
      startTransition(async () => {
        try {
          const client = getAPIClient();
          const data = await client.getStats();
          setServers(data.servers);
          setError(null);
        } catch (err) {
          setError(err instanceof Error ? err.message : "获取数据失败");
        }
      });
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [refreshInterval]);

  // 排序：在线优先，然后按权重排序
  // React Compiler 会自动优化，无需 useMemo
  const sortedServers = [...optimisticServers].sort((a, b) => {
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
