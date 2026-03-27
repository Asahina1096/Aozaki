import { memo } from "react";
import { ArrowUpDown, Cpu, Network, Server } from "lucide-react";
import { CARD_CONTAINMENT_STYLE, PILL_STYLES } from "@/lib/constants";
import type { ServerStats } from "@/lib/types/serverstatus";
import { formatBytes, formatSpeed, isServerOnline } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

interface ServerOverviewProps {
  servers: ServerStats[];
}

function ServerOverviewComponent({ servers }: ServerOverviewProps) {
  const stats = servers.reduce(
    (acc, s) => {
      if (isServerOnline(s)) {
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
    },
  );

  const totalServers = servers.length;
  const onlineServers = stats.onlineCount;
  const offlineServers = totalServers - onlineServers;

  const avgCpu =
    stats.onlineCount > 0 ? Math.round((stats.totalCpu / stats.onlineCount) * 10) / 10 : 0;

  return (
    <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      <Card className="card-blur-target" style={CARD_CONTAINMENT_STYLE}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">节点总数</CardTitle>
          <Server className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalServers}</div>
          <div className="mt-2 flex flex-wrap gap-2">
            <span className={PILL_STYLES.capsule}>在线 {onlineServers}</span>
            <span className={PILL_STYLES.capsule}>离线 {offlineServers}</span>
          </div>
        </CardContent>
      </Card>

      <Card className="card-blur-target" style={CARD_CONTAINMENT_STYLE}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">平均CPU使用率</CardTitle>
          <Cpu className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{avgCpu}%</div>
        </CardContent>
      </Card>

      <Card className="card-blur-target" style={CARD_CONTAINMENT_STYLE}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">实时网络速率</CardTitle>
          <Network className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatSpeed(stats.totalRealtimeUpload + stats.totalRealtimeDownload)}
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            <span className={PILL_STYLES.capsule}>
              ↑ 上传 {formatSpeed(stats.totalRealtimeUpload)}
            </span>
            <span className={PILL_STYLES.capsule}>
              ↓ 下载 {formatSpeed(stats.totalRealtimeDownload)}
            </span>
          </div>
        </CardContent>
      </Card>

      <Card className="card-blur-target" style={CARD_CONTAINMENT_STYLE}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">流量统计</CardTitle>
          <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatBytes(stats.totalDataUploaded + stats.totalDataDownloaded)}
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            <span className={PILL_STYLES.capsule}>
              ↑ 上传 {formatBytes(stats.totalDataUploaded)}
            </span>
            <span className={PILL_STYLES.capsule}>
              ↓ 下载 {formatBytes(stats.totalDataDownloaded)}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export const ServerOverview = memo(ServerOverviewComponent);
