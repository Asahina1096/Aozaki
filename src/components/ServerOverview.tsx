import { ArrowUpDown, Cpu, Network, Server } from "lucide-react";
import type { ServerStats } from "@/lib/types/serverstatus";
import { formatBytes, formatSpeed } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

interface ServerOverviewProps {
  servers: ServerStats[];
}

export function ServerOverview({ servers }: ServerOverviewProps) {
  // 单次遍历计算所有统计数据
  const stats = servers.reduce(
    (acc, s) => {
      const isOnline = s.online4 || s.online6;
      if (isOnline) {
        acc.onlineCount++;
        acc.totalCpu += s.cpu;
      }
      acc.totalRealtimeDownload += s.network_rx;
      acc.totalRealtimeUpload += s.network_tx;
      acc.totalDataDownloaded += s.network_in;
      acc.totalDataUploaded += s.network_out;
      return acc;
    },
    {
      onlineCount: 0,
      totalCpu: 0,
      totalRealtimeDownload: 0,
      totalRealtimeUpload: 0,
      totalDataDownloaded: 0,
      totalDataUploaded: 0,
    }
  );

  const totalServers = servers.length;
  const onlineServers = stats.onlineCount;
  const offlineServers = totalServers - onlineServers;

  // 计算平均CPU使用率（仅在线节点）
  const avgCpu =
    stats.onlineCount > 0
      ? Math.round((stats.totalCpu / stats.onlineCount) * 10) / 10
      : 0;

  const capsuleClass =
    "inline-flex items-center rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground";

  return (
    <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      {/* 总节点数 */}
      <Card
        className="hover:shadow-md hover:-translate-y-0.5 hover:border-border/30"
        style={{ contain: "layout style paint" }}
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">节点总数</CardTitle>
          <Server className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalServers}</div>
          <div className="mt-2 flex flex-wrap gap-2">
            <span className={capsuleClass}>在线 {onlineServers}</span>
            <span className={capsuleClass}>离线 {offlineServers}</span>
          </div>
        </CardContent>
      </Card>

      {/* 平均CPU使用率 */}
      <Card
        className="hover:shadow-md hover:-translate-y-0.5 hover:border-border/30"
        style={{ contain: "layout style paint" }}
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">平均CPU使用率</CardTitle>
          <Cpu className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{avgCpu}%</div>
        </CardContent>
      </Card>

      {/* 实时网络速率 */}
      <Card
        className="hover:shadow-md hover:-translate-y-0.5 hover:border-border/30"
        style={{ contain: "layout style paint" }}
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">实时网络速率</CardTitle>
          <Network className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatSpeed(
              stats.totalRealtimeUpload + stats.totalRealtimeDownload
            )}
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            <span className={capsuleClass}>
              ↑ 上传 {formatSpeed(stats.totalRealtimeUpload)}
            </span>
            <span className={capsuleClass}>
              ↓ 下载 {formatSpeed(stats.totalRealtimeDownload)}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* 流量统计 */}
      <Card
        className="hover:shadow-md hover:-translate-y-0.5 hover:border-border/30"
        style={{ contain: "layout style paint" }}
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">流量统计</CardTitle>
          <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatBytes(stats.totalDataUploaded + stats.totalDataDownloaded)}
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            <span className={capsuleClass}>
              ↑ 上传 {formatBytes(stats.totalDataUploaded)}
            </span>
            <span className={capsuleClass}>
              ↓ 下载 {formatBytes(stats.totalDataDownloaded)}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
