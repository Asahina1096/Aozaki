const OVERVIEW_SKELETON_COUNT = 4;
const SERVER_SKELETON_COUNT = 8;

export function ServerListSkeleton() {
  return (
    <div className="space-y-6">
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: OVERVIEW_SKELETON_COUNT }, (_, i) => (
          <div key={i} className="h-24 rounded-2xl border border-border/20 bg-muted/60 shadow-sm" />
        ))}
      </div>
      <div className="flex items-center">
        <span className="text-xl md:text-2xl font-bold text-primary">节点列表</span>
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: SERVER_SKELETON_COUNT }, (_, i) => (
          <div
            key={i}
            className="h-[420px] rounded-2xl border border-border/20 bg-muted/60 shadow-sm"
          />
        ))}
      </div>
    </div>
  );
}
