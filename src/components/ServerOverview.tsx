import { Cpu, HardDrive, Network, Server } from "lucide-react";
import { css } from "../../styled-system/css";
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
    <div
      className={css({
        mb: "6",
        display: "grid",
        gridTemplateColumns: "1",
        gap: "4",
        md: { gridTemplateColumns: "2" },
        xl: { gridTemplateColumns: "4" },
      })}
    >
      {/* 总节点数 */}
      <Card>
        <CardHeader
          className={css({
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "0",
            pb: "2",
          })}
        >
          <CardTitle className={css({ fontSize: "lg", fontWeight: "medium" })}>
            节点总数
          </CardTitle>
          <Server
            className={css({ h: "4", w: "4", color: "muted.foreground" })}
          />
        </CardHeader>
        <CardContent>
          <div className={css({ fontSize: "md", fontWeight: "bold" })}>
            {totalServers}
          </div>
          <p className={css({ fontSize: "xs", color: "muted.foreground" })}>
            在线 {onlineServers} · 离线 {offlineServers}
          </p>
        </CardContent>
      </Card>

      {/* 平均CPU使用率 */}
      <Card>
        <CardHeader
          className={css({
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "0",
            pb: "2",
          })}
        >
          <CardTitle className={css({ fontSize: "lg", fontWeight: "medium" })}>
            平均CPU使用率
          </CardTitle>
          <Cpu className={css({ h: "4", w: "4", color: "muted.foreground" })} />
        </CardHeader>
        <CardContent>
          <div className={css({ fontSize: "md", fontWeight: "bold" })}>
            {avgCpu}%
          </div>
        </CardContent>
      </Card>

      {/* 实时网络速率 */}
      <Card>
        <CardHeader
          className={css({
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "0",
            pb: "2",
          })}
        >
          <CardTitle className={css({ fontSize: "lg", fontWeight: "medium" })}>
            实时网络速率
          </CardTitle>
          <HardDrive
            className={css({ h: "4", w: "4", color: "muted.foreground" })}
          />
        </CardHeader>
        <CardContent>
          <div className={css({ fontSize: "md", fontWeight: "bold" })}>
            {formatSpeed(totalRealtimeUpload + totalRealtimeDownload)}
          </div>
          <p className={css({ fontSize: "xs", color: "muted.foreground" })}>
            ↑ 上传 {formatSpeed(totalRealtimeUpload)}· ↓ 下载{" "}
            {formatSpeed(totalRealtimeDownload)}
          </p>
        </CardContent>
      </Card>

      {/* 流量统计 */}
      <Card>
        <CardHeader
          className={css({
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "0",
            pb: "2",
          })}
        >
          <CardTitle className={css({ fontSize: "lg", fontWeight: "medium" })}>
            流量统计
          </CardTitle>
          <Network
            className={css({ h: "4", w: "4", color: "muted.foreground" })}
          />
        </CardHeader>
        <CardContent>
          <div className={css({ fontSize: "md", fontWeight: "bold" })}>
            {formatBytes(totalDataUploaded + totalDataDownloaded)}
          </div>
          <p className={css({ fontSize: "xs", color: "muted.foreground" })}>
            ↑ 上传 {formatBytes(totalDataUploaded)}· ↓ 下载{" "}
            {formatBytes(totalDataDownloaded)}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
