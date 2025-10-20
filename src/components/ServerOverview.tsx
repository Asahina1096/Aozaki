import type { ServerStats } from "@/lib/types/serverstatus";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Server, Cpu, Network, HardDrive } from "lucide-react";
import { formatBytes, formatSpeed } from "@/lib/utils";

interface ServerOverviewProps {
  servers: ServerStats[];
}

export function ServerOverview({ servers }: ServerOverviewProps) {
  const totalServers = servers.length;
  const onlineServers = servers.filter((s) => s.online4 || s.online6).length;
  const offlineServers = totalServers - onlineServers;

  // 计算平均负载（仅在线服务器）
  const onlineServersList = servers.filter((s) => s.online4 || s.online6);
  const avgLoad =
    onlineServersList.length > 0
      ? onlineServersList.reduce((sum, s) => sum + s.load_1, 0) /
        onlineServersList.length
      : 0;

  // 计算总网络流量
  const totalNetworkIn = servers.reduce((sum, s) => sum + s.network_in, 0);
  const totalNetworkOut = servers.reduce((sum, s) => sum + s.network_out, 0);

  // 计算总网络传输量
  const totalNetworkRx = servers.reduce((sum, s) => sum + s.network_rx, 0);
  const totalNetworkTx = servers.reduce((sum, s) => sum + s.network_tx, 0);

  return (
    <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      {/* 总服务器数 */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">服务器总数</CardTitle>
          <Server className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalServers}</div>
          <p className="text-xs text-muted-foreground">
            在线 {onlineServers} · 离线 {offlineServers}
          </p>
        </CardContent>
      </Card>

      {/* 平均负载 */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">平均负载</CardTitle>
          <Cpu className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{avgLoad.toFixed(2)}</div>
          <p className="text-xs text-muted-foreground">1 分钟平均负载</p>
        </CardContent>
      </Card>

      {/* 实时网络 */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">实时网络</CardTitle>
          <Network className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatSpeed(totalNetworkOut)}
          </div>
          <p className="text-xs text-muted-foreground">
            ↑ 上传 · ↓ 下载 {formatSpeed(totalNetworkIn)}
          </p>
        </CardContent>
      </Card>

      {/* 网络统计 */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">网络统计</CardTitle>
          <HardDrive className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatBytes(totalNetworkTx)}</div>
          <p className="text-xs text-muted-foreground">
            ↑ 总上传 · ↓ 总下载 {formatBytes(totalNetworkRx)}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
