import { ArrowUpDown, Cpu, Network, Server } from "lucide-react";
import type { StatsOverview } from "@/lib/types/serverstatus";
import { formatBytes, formatSpeed } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

interface ServerOverviewProps {
  overview: StatsOverview;
}

export function ServerOverview({ overview }: ServerOverviewProps) {
  const capsuleClass =
    "inline-flex items-center rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground";

  return (
    <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      {/* 总节点数 */}
      <Card className="hover:shadow-md hover:-translate-y-0.5 hover:border-border/30">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">节点总数</CardTitle>
          <Server className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{overview.totalServers}</div>
          <div className="mt-2 flex flex-wrap gap-2">
            <span className={capsuleClass}>在线 {overview.onlineServers}</span>
            <span className={capsuleClass}>离线 {overview.offlineServers}</span>
          </div>
        </CardContent>
      </Card>

      {/* 平均CPU使用率 */}
      <Card className="hover:shadow-md hover:-translate-y-0.5 hover:border-border/30">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">平均CPU使用率</CardTitle>
          <Cpu className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{overview.avgCpu}%</div>
        </CardContent>
      </Card>

      {/* 实时网络速率 */}
      <Card className="hover:shadow-md hover:-translate-y-0.5 hover:border-border/30">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">实时网络速率</CardTitle>
          <Network className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatSpeed(
              overview.totalRealtimeUpload + overview.totalRealtimeDownload
            )}
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            <span className={capsuleClass}>
              ↑ 上传 {formatSpeed(overview.totalRealtimeUpload)}
            </span>
            <span className={capsuleClass}>
              ↓ 下载 {formatSpeed(overview.totalRealtimeDownload)}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* 流量统计 */}
      <Card className="hover:shadow-md hover:-translate-y-0.5 hover:border-border/30">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">流量统计</CardTitle>
          <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatBytes(
              overview.totalDataUploaded + overview.totalDataDownloaded
            )}
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            <span className={capsuleClass}>
              ↑ 上传 {formatBytes(overview.totalDataUploaded)}
            </span>
            <span className={capsuleClass}>
              ↓ 下载 {formatBytes(overview.totalDataDownloaded)}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
