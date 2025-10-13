import { useEffect, useState } from "react";
import { NodeCard } from "./NodeCard";
import { NodesOverview } from "./NodesOverview";
import { getSharedClient } from "@/lib/rpc2";
import type { Client, NodeStatus } from "@/lib/types/komari";
import { Loader2 } from "lucide-react";

interface NodesGridProps {
  refreshInterval?: number;
  showOffline?: boolean;
}

export function NodesGrid({
  refreshInterval = 3000,
  showOffline = true,
}: NodesGridProps) {
  const [clients, setClients] = useState<Record<string, Client>>({});
  const [statuses, setStatuses] = useState<Record<string, NodeStatus>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const rpc = getSharedClient();
      const [nodesData, statusData] = await Promise.all([
        rpc.getNodes(),
        rpc.getNodesLatestStatus(),
      ]);

      // 处理节点数据
      if (typeof nodesData === "object" && !Array.isArray(nodesData)) {
        setClients(nodesData as Record<string, Client>);
      }

      // 处理状态数据
      setStatuses(statusData);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch data:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // 设置自动刷新
    const interval = setInterval(fetchData, refreshInterval);

    return () => clearInterval(interval);
  }, [refreshInterval]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <p className="text-destructive text-lg">加载失败</p>
        <p className="text-muted-foreground text-sm">{error}</p>
        <button
          onClick={fetchData}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          重试
        </button>
      </div>
    );
  }

  const clientArray = Object.entries(clients)
    .map(([uuid, client]) => ({
      ...client,
      uuid,
      status: statuses[uuid],
    }))
    .filter((item) => showOffline || item.status?.online)
    .sort((a, b) => {
      // 在线的排在前面
      if (a.status?.online && !b.status?.online) return -1;
      if (!a.status?.online && b.status?.online) return 1;
      // 按权重排序（权重越小越靠前）
      return (a.weight ?? 0) - (b.weight ?? 0);
    });

  if (clientArray.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground text-lg">暂无节点数据</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <NodesOverview clients={clients} statuses={statuses} />
      <div className="flex items-center">
        <span className="inline-flex items-center rounded-full border border-primary/40 bg-primary/10 px-4 py-1 text-lg font-semibold text-primary">
          节点列表
        </span>
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {clientArray.map((client) => (
          <NodeCard key={client.uuid} client={client} status={client.status} />
        ))}
      </div>
    </div>
  );
}
