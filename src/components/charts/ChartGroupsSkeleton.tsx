import { ChartSkeleton } from "./ChartSkeleton";

export function ChartGroupsSkeleton() {
  return (
    <div className="space-y-8">
      {/* 系统资源组 */}
      <div className="space-y-4">
        <div className="mb-6">
          <h2 className="text-xl font-bold">系统资源</h2>
          <p className="text-sm text-muted-foreground">
            CPU、内存、磁盘等资源使用情况
          </p>
        </div>
        <div className="grid grid-cols-1 gap-6">
          {/* 6 个图表：CPU、内存、交换分区、磁盘、GPU、温度 */}
          {Array.from({ length: 6 }).map((_, idx) => (
            <ChartSkeleton key={`system-${idx}`} />
          ))}
        </div>
      </div>

      {/* 网络组 */}
      <div className="space-y-4">
        <div className="mb-6">
          <h2 className="text-xl font-bold">网络状态</h2>
          <p className="text-sm text-muted-foreground">网络速度和连接数变化</p>
        </div>
        <div className="grid grid-cols-1 gap-6">
          {/* 2 个图表：网络速度、连接数 */}
          {Array.from({ length: 2 }).map((_, idx) => (
            <ChartSkeleton key={`network-${idx}`} />
          ))}
        </div>
      </div>

      {/* 系统负载组 */}
      <div className="space-y-4">
        <div className="mb-6">
          <h2 className="text-xl font-bold">系统负载</h2>
          <p className="text-sm text-muted-foreground">系统负载和进程信息</p>
        </div>
        <div className="grid grid-cols-1 gap-6">
          {/* 2 个图表：系统负载、进程数 */}
          {Array.from({ length: 2 }).map((_, idx) => (
            <ChartSkeleton key={`load-${idx}`} />
          ))}
        </div>
      </div>
    </div>
  );
}
