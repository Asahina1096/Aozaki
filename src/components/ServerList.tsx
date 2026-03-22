import { Cpu, Network, PlugZap, Wifi } from "lucide-react";
import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useLiveData } from "../contexts/LiveDataContext";
import { useNodeList } from "../contexts/NodeListContext";
import { ServerCard } from "./ServerCard";
import { ServerListSkeleton } from "./ServerListSkeleton";

const DEFAULT_REFRESH_INTERVAL = 2000;
const OVERVIEW_CARD_CLASS =
  "rounded-2xl border border-border/20 bg-card/95 p-5 shadow-sm";
const OVERVIEW_VALUE_CLASS =
  "text-xl font-semibold leading-none tabular-nums text-foreground whitespace-nowrap";

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
        node.group?.toLowerCase().includes(query)
    );
  }, [sortedNodes, deferredSearchQuery]);

  const overviewStats = useMemo(() => {
    const totalNodes = nodeList?.length ?? 0;
    const onlineNodes = onlineSet.size;
    let totalCpu = 0;
    let cpuCount = 0;
    let totalUpRate = 0;
    let totalDownRate = 0;
    let totalUpTraffic = 0;
    let totalDownTraffic = 0;

    (nodeList || []).forEach((node) => {
      const data = live_data?.data?.data?.[node.uuid];
      if (typeof data?.cpu?.usage === "number") {
        totalCpu += data.cpu.usage;
        cpuCount++;
      }
      if (data?.network) {
        totalUpRate += data.network.up || 0;
        totalDownRate += data.network.down || 0;
        totalUpTraffic += data.network.totalUp || 0;
        totalDownTraffic += data.network.totalDown || 0;
      }
    });

    return {
      totalNodes,
      onlineNodes,
      avgCpu: cpuCount > 0 ? totalCpu / cpuCount : null,
      totalUpRate,
      totalDownRate,
      totalUpTraffic,
      totalDownTraffic,
    };
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
        <p className="mt-2 text-sm text-muted-foreground">
          {error || "请稍后再试。"}
        </p>
        {error && (
          <button
            type="button"
            onClick={refresh}
            className="mt-4 rounded-lg bg-primary px-4 py-2 text-primary-foreground shadow-sm hover:bg-primary/90"
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
        <div className="rounded-2xl border border-destructive/20 bg-destructive/10 backdrop-blur-sm p-4 text-sm text-destructive shadow-sm">
          <p>数据刷新失败：{error || "请稍后再试。"}</p>
          <button
            type="button"
            onClick={refresh}
            className="mt-3 inline-flex items-center rounded-lg border border-destructive/20 px-3 py-1.5 text-sm font-medium hover:bg-destructive/10"
          >
            重新获取数据
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className={OVERVIEW_CARD_CLASS}>
          <div className="mb-3 flex items-center justify-between">
            <div className="text-xs tracking-wide text-muted-foreground">
              在线节点
            </div>
            <div className="flex items-center gap-2">
              <PlugZap className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className={OVERVIEW_VALUE_CLASS}>
              {overviewStats.onlineNodes}
            </span>
            <span className="text-sm tabular-nums text-muted-foreground">
              / {overviewStats.totalNodes}
            </span>
          </div>
        </div>

        <div className={OVERVIEW_CARD_CLASS}>
          <div className="mb-3 flex items-center justify-between">
            <div className="text-xs tracking-wide text-muted-foreground">
              平均 CPU 使用率
            </div>
            <Cpu className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className={OVERVIEW_VALUE_CLASS}>
              {overviewStats.avgCpu === null
                ? "-"
                : `${overviewStats.avgCpu.toFixed(1)}%`}
            </span>
          </div>
        </div>

        <div
          className={OVERVIEW_CARD_CLASS}
          style={{
            backgroundImage:
              "linear-gradient(120deg, transparent 0%, rgba(59,130,246,0.04) 50%, transparent 100%)",
          }}
        >
          <div className="mb-3 flex items-center justify-between">
            <div className="text-xs tracking-wide text-muted-foreground">
              实时网络速率
            </div>
            <Network className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-baseline gap-2 text-foreground">
              <span className="text-base font-semibold leading-none">↑</span>
              <span className={OVERVIEW_VALUE_CLASS}>
                {formatBytes(overviewStats.totalUpRate)}
                <span className="ml-1 text-xs text-muted-foreground">/s</span>
              </span>
            </div>
            <div className="flex items-baseline gap-2 text-foreground justify-self-end">
              <span className="text-base font-semibold leading-none">↓</span>
              <span className={OVERVIEW_VALUE_CLASS}>
                {formatBytes(overviewStats.totalDownRate)}
                <span className="ml-1 text-xs text-muted-foreground">/s</span>
              </span>
            </div>
          </div>
        </div>

        <div className={OVERVIEW_CARD_CLASS}>
          <div className="mb-3 flex items-center justify-between">
            <div className="text-xs tracking-wide text-muted-foreground">
              总流量
            </div>
            <Wifi className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-baseline gap-2 text-foreground">
              <span className="text-base font-semibold leading-none">↑</span>
              <span className={OVERVIEW_VALUE_CLASS}>
                {formatBytes(overviewStats.totalUpTraffic)}
              </span>
            </div>
            <div className="flex items-baseline gap-2 text-foreground justify-self-end">
              <span className="text-base font-semibold leading-none">↓</span>
              <span className={OVERVIEW_VALUE_CLASS}>
                {formatBytes(overviewStats.totalDownTraffic)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xl md:text-2xl font-bold text-primary">
            节点列表
          </span>
          <div className="relative">
            <input
              type="search"
              placeholder="搜索名称/地区..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="搜索节点"
              className="h-8 w-40 md:w-48 rounded-md border border-input bg-background px-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
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

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
}
