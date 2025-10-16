import { useMemo, useCallback } from "react";

import { NodeCard } from "@/components/NodeCard";
import { NodesOverview } from "@/components/NodesOverview";
import { NodesGridSkeleton } from "@/components/NodesGridSkeleton";
import { NodeCardSkeleton } from "@/components/NodeCardSkeleton";

import { useNodesData } from "@/hooks/useNodeStore";

interface NodesGridProps {
  refreshInterval?: number;
  showOffline?: boolean;
}

export function NodesGrid({
  refreshInterval = 1000,
  showOffline = true,
}: NodesGridProps) {
  const { clients, statuses, loading, error, refresh } =
    useNodesData(refreshInterval);

  const handleRefresh = useCallback(() => {
    void refresh();
  }, [refresh]);

  const clientArray = useMemo(() => {
    return Object.entries(clients)
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
  }, [clients, showOffline, statuses]);

  if (loading) {
    return <NodesGridSkeleton />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-lg font-semibold text-destructive">
          无法加载节点数据
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          {error.message || "请稍后再试。"}
        </p>
        <button
          type="button"
          onClick={handleRefresh}
          className="mt-4 inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          重试
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <NodesOverview clients={clients} statuses={statuses} />
      <div className="flex items-center">
        <span className="text-xl md:text-2xl font-bold text-primary">
          节点列表
        </span>
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {clientArray.length === 0
          ? Array.from({ length: 4 }).map((_, index) => (
              <NodeCardSkeleton key={`node-skeleton-${index}`} />
            ))
          : clientArray.map((client) => (
              <NodeCard
                key={client.uuid}
                client={client}
                status={client.status}
              />
            ))}
      </div>
    </div>
  );
}
