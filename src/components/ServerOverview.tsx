import { Cpu, HardDrive, Network, Server } from "lucide-react";
import type { ServerStats } from "@/lib/types/serverstatus";
import { formatBytes, formatSpeed } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

interface ServerOverviewProps {
  servers: ServerStats[];
}

export function ServerOverview({ servers }: ServerOverviewProps) {
  const totalServers = servers.length;
  const onlineServers = servers.filter((s) => s.online4 || s.online6).length;
  const offlineServers = totalServers - onlineServers;

  // 计算平均CPU使用率（仅在线节点）
  const onlineServersList = servers.filter((s) => s.online4 || s.online6);
  const avgCpu =
    onlineServersList.length > 0
      ? Math.round(
          (onlineServersList.reduce((sum, s) => sum + s.cpu, 0) /
            onlineServersList.length) *
            10
        ) / 10
      : 0;

  // 计算实时网络速率
  const totalRealtimeDownload = servers.reduce(
    (sum, s) => sum + s.network_rx,
    0
  );
  const totalRealtimeUpload = servers.reduce((sum, s) => sum + s.network_tx, 0);

  // 计算累计网络流量
  const totalDataDownloaded = servers.reduce((sum, s) => sum + s.network_in, 0);
  const totalDataUploaded = servers.reduce((sum, s) => sum + s.network_out, 0);

  return (
    <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      {/* 总节点数 */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">节点总数</CardTitle>
          <Server className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalServers}</div>
          <p className="text-xs text-muted-foreground">
            在线 {onlineServers} · 离线 {offlineServers}
          </p>
        </CardContent>
      </Card>

      {/* 平均CPU使用率 */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">平均CPU使用率</CardTitle>
          <Cpu className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{avgCpu}%</div>
        </CardContent>
      </Card>

      {/* 实时网络速率 */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">实时网络速率</CardTitle>
          <HardDrive className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatSpeed(totalRealtimeUpload + totalRealtimeDownload)}
          </div>
          <p className="text-xs text-muted-foreground">
            ↑ 上传 {formatSpeed(totalRealtimeUpload)}· ↓ 下载{" "}
            {formatSpeed(totalRealtimeDownload)}
          </p>
        </CardContent>
      </Card>

      {/* 流量统计 */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">流量统计</CardTitle>
          <Network className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatBytes(totalDataUploaded + totalDataDownloaded)}
          </div>
          <p className="text-xs text-muted-foreground">
            ↑ 上传 {formatBytes(totalDataUploaded)}· ↓ 下载{" "}
            {formatBytes(totalDataDownloaded)}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
