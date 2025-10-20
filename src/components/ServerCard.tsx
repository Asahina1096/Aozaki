import type { ServerStats } from "@/lib/types/serverstatus";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";

interface ServerCardProps {
  server: ServerStats;
}

export function ServerCard({ server }: ServerCardProps) {
  const isOnline = server.online4 || server.online6;

  // 计算百分比
  const cpuPercent = server.cpu;
  const memoryPercent = (server.memory_used / server.memory_total) * 100;
  const diskPercent = (server.hdd_used / server.hdd_total) * 100;

  // 格式化字节
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
  };

  // 格式化速度
  const formatSpeed = (bytesPerSecond: number) => {
    return `${formatBytes(bytesPerSecond)}/s`;
  };

  // 格式化运行时间
  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    if (days > 0) return `${days}天`;
    if (hours > 0) return `${hours}小时`;
    return `${Math.floor(seconds / 60)}分钟`;
  };

  return (
    <Card className="p-4 hover:shadow-lg transition-shadow">
      <div className="space-y-3">
        {/* 头部 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-lg">
              {server.alias || server.name}
            </h3>
            {isOnline ? (
              <Badge variant="default" className="bg-green-500">
                在线
              </Badge>
            ) : (
              <Badge variant="destructive">离线</Badge>
            )}
          </div>
          {server.location && (
            <span className="text-2xl">{server.location}</span>
          )}
        </div>

        {/* 基本信息 */}
        <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
          {server.type && (
            <div>
              <span className="font-medium">类型:</span> {server.type}
            </div>
          )}
          <div>
            <span className="font-medium">运行:</span> {formatUptime(server.uptime)}
          </div>
        </div>

        {/* 资源使用情况 */}
        {isOnline && (
          <div className="space-y-2">
            {/* CPU */}
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>CPU</span>
                <span className="font-medium">{cpuPercent.toFixed(1)}%</span>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all"
                  style={{ width: `${Math.min(cpuPercent, 100)}%` }}
                />
              </div>
            </div>

            {/* 内存 */}
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>内存</span>
                <span className="font-medium">
                  {formatBytes(server.memory_used)} / {formatBytes(server.memory_total)}
                </span>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 transition-all"
                  style={{ width: `${Math.min(memoryPercent, 100)}%` }}
                />
              </div>
            </div>

            {/* 磁盘 */}
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>磁盘</span>
                <span className="font-medium">
                  {formatBytes(server.hdd_used)} / {formatBytes(server.hdd_total)}
                </span>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-yellow-500 transition-all"
                  style={{ width: `${Math.min(diskPercent, 100)}%` }}
                />
              </div>
            </div>

            {/* 网络 */}
            <div className="flex justify-between text-sm pt-2 border-t">
              <div>
                <span className="text-muted-foreground">↓ </span>
                <span className="font-medium">{formatSpeed(server.network_in)}</span>
              </div>
              <div>
                <span className="text-muted-foreground">↑ </span>
                <span className="font-medium">{formatSpeed(server.network_out)}</span>
              </div>
            </div>

            {/* 负载 */}
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>负载:</span>
              <span className="font-medium">
                {server.load_1.toFixed(2)} / {server.load_5.toFixed(2)} / {server.load_15.toFixed(2)}
              </span>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
