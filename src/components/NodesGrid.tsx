import { NodeCard } from "./NodeCard";
import { NodesOverview } from "./NodesOverview";
import { NodesGridSkeleton } from "./NodesGridSkeleton";
import { NodeCardSkeleton } from "./NodeCardSkeleton";
import { useNodesData } from "@/hooks/useNodeStore";

interface NodesGridProps {
  refreshInterval?: number;
  showOffline?: boolean;
}

export function NodesGrid({
  refreshInterval = 1000,
  showOffline = true,
}: NodesGridProps) {
  const { clients, statuses, loading } = useNodesData(refreshInterval);

  if (loading) {
    return <NodesGridSkeleton />;
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
