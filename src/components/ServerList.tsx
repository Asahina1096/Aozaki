import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useLiveData } from "../contexts/LiveDataContext";
import { useNodeList } from "../contexts/NodeListContext";
import type { ServerStats } from "@/lib/types/serverstatus";
import { ServerCard } from "./ServerCard";
import { ServerOverview } from "./ServerOverview";
import { ServerListSkeleton } from "./ServerListSkeleton";

const DEFAULT_REFRESH_INTERVAL = 2000;

interface ServerListProps {
  refreshInterval?: number;
}

export default function ServerList({
  refreshInterval = DEFAULT_REFRESH_INTERVAL,
}: ServerListProps) {
  const { nodeList, isLoading, error, refresh } = useNodeList();
  const { live_data } = useLiveData();

  useEffect(() => {
    const interval = setInterval(() => {
      refresh();
    }, refreshInterval);
    return () => clearInterval(interval);
  }, [refresh, refreshInterval]);

  const [searchQuery, setSearchQuery] = useState("");
  const deferredSearchQuery = useDeferredValue(searchQuery);

  const onlineSet = useMemo(() => {
    return new Set(live_data?.data?.online || []);
  }, [live_data]);

  const sortedNodes = useMemo(() => {
    if (!nodeList) return [];
    return [...nodeList].sort((a, b) => {
      const aOnline = onlineSet.has(a.uuid);
      const bOnline = onlineSet.has(b.uuid);
      if (aOnline !== bOnline) return bOnline ? 1 : -1;
      return (a.weight || 0) - (b.weight || 0);
    });
  }, [nodeList, onlineSet]);

  const filteredNodes = useMemo(() => {
    if (!deferredSearchQuery.trim()) {
      return sortedNodes;
    }
    const query = deferredSearchQuery.toLowerCase().trim();
    return sortedNodes.filter(
      (node) =>
        node.name?.toLowerCase().includes(query) ||
        node.region?.toLowerCase().includes(query) ||
        node.group?.toLowerCase().includes(query),
    );
  }, [sortedNodes, deferredSearchQuery]);

  const serverStats = useMemo((): ServerStats[] => {
    return (nodeList || []).map((node) => {
      const data = live_data?.data?.data?.[node.uuid];
      const isOnline = onlineSet.has(node.uuid);
      return {
        name: node.uuid,
        online4: isOnline,
        online6: false,
        uptime: "",
        load_1: 0,
        load_5: 0,
        load_15: 0,
        cpu: data?.cpu?.usage ?? 0,
        memory_total: 0,
        memory_used: 0,
        swap_total: 0,
        swap_used: 0,
        hdd_total: 0,
        hdd_used: 0,
        network_rx: data?.network?.down ?? 0,
        network_tx: data?.network?.up ?? 0,
        network_in: data?.network?.totalDown ?? 0,
        network_out: data?.network?.totalUp ?? 0,
      };
    });
  }, [nodeList, live_data, onlineSet]);

  const hasNodes = nodeList && nodeList.length > 0;

  if (isLoading && !hasNodes) {
    return <ServerListSkeleton />;
  }

  if (!hasNodes) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-lg font-semibold text-muted-foreground">
          {error ? "无法加载节点数据" : "暂无节点数据"}
        </p>
        <p className="mt-2 text-sm text-muted-foreground">{error || "请稍后再试。"}</p>
        {error && (
          <button
            type="button"
            onClick={refresh}
            className="control-surface-target mt-4 rounded-lg border border-primary/25 px-4 py-2 text-primary shadow-sm hover:bg-primary/10"
          >
            重试
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="card-opacity-target card-blur-target rounded-2xl border border-destructive/20 p-4 text-sm text-destructive shadow-sm">
          <p>数据刷新失败：{error || "请稍后再试。"}</p>
          <button
            type="button"
            onClick={refresh}
            className="control-surface-target mt-3 inline-flex items-center rounded-lg border border-destructive/25 px-3 py-1.5 text-sm font-medium text-destructive hover:bg-destructive/10"
          >
            重新获取数据
          </button>
        </div>
      )}

      <ServerOverview servers={serverStats} />

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xl md:text-2xl font-bold text-primary">节点列表</span>
          <div className="relative">
            <input
              type="search"
              placeholder="搜索名称/地区..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="搜索节点"
              className="control-surface-target h-8 w-40 rounded-md px-3 text-sm text-black placeholder:text-black/45 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 dark:text-foreground/75 dark:placeholder:text-foreground/45 md:w-48"
            />
          </div>
          {searchQuery && (
            <span className="text-sm text-muted-foreground">
              {filteredNodes.length}/{sortedNodes.length}
            </span>
          )}
        </div>
      </div>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredNodes.map((node) => {
          const isOnline = onlineSet.has(node.uuid);
          const liveData = live_data?.data?.data?.[node.uuid];

          return (
            <Link
              key={node.uuid}
              className="w-full border-0 bg-transparent p-0 text-left"
              to={`/instance/${node.uuid}`}
            >
              <ServerCard node={node} liveData={liveData} isOnline={isOnline} />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
