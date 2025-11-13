const OVERVIEW_SKELETON_COUNT = 4;
const SERVER_SKELETON_COUNT = 8;

/**
 * ServerList 加载骨架屏组件
 * 在 Suspense fallback 中使用
 */
export function ServerListSkeleton() {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* ServerOverview 骨架屏 */}
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: OVERVIEW_SKELETON_COUNT }, (_, i) => (
          <div
            key={i}
            className="h-24 animate-pulse rounded-2xl border border-border/20 bg-muted/60 backdrop-blur-sm shadow-sm"
          />
        ))}
      </div>
      {/* 标题 */}
      <div className="flex items-center">
        <span className="text-xl md:text-2xl font-bold text-primary">
          节点列表
        </span>
      </div>
      {/* 服务器列表骨架屏 */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: SERVER_SKELETON_COUNT }, (_, i) => (
          <div
            key={i}
            className="h-[420px] animate-pulse rounded-2xl border border-border/20 bg-muted/60 backdrop-blur-sm shadow-sm"
            style={{
              animationDelay: `${Math.min(i * 50, 400)}ms`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
