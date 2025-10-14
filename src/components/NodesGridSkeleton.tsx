import { NodesOverviewSkeleton } from "./overview/NodesOverviewSkeleton";
import { NodeCardSkeleton } from "./NodeCardSkeleton";

export function NodesGridSkeleton() {
  return (
    <div className="space-y-6">
      <NodesOverviewSkeleton />
      <div className="flex items-center">
        <span className="inline-flex items-center rounded-full border border-primary/40 bg-primary/10 px-4 py-1 text-lg font-bold text-primary">
          节点列表
        </span>
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <NodeCardSkeleton key={index} />
        ))}
      </div>
    </div>
  );
}
