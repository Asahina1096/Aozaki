import { Clock4, Cpu, HardDrive, MapPin, MemoryStick, Network, Server } from "lucide-react";
import { memo } from "react";
import type { NodeBasicInfo } from "@/contexts/NodeListContext";
import { CARD_CONTAINMENT_STYLE, PILL_STYLES } from "@/lib/constants";
import { formatBytes } from "@/lib/utils";
import type { Record } from "@/types/LiveData";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Progress } from "./ui/progress";
import { Separator } from "./ui/separator";

interface ServerCardProps {
  node: NodeBasicInfo;
  liveData?: Record;
  isOnline: boolean;
}

function formatUptimeSeconds(seconds: number): string {
  if (!seconds || seconds <= 0) return "--";
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (days > 0) return `${days}天`;
  if (hours > 0) return `${hours}小时`;
  if (minutes > 0) return `${minutes}分钟`;
  return "1分钟";
}

function ServerCardComponent({ node, liveData, isOnline }: ServerCardProps) {
  const cpuUsage = liveData?.cpu?.usage ?? 0;
  const ramUsed = liveData?.ram?.used ?? 0;
  const memTotal = node.mem_total;
  const diskUsed = liveData?.disk?.used ?? 0;
  const diskTotal = node.disk_total;

  const ramPercent = memTotal > 0 ? (ramUsed / memTotal) * 100 : 0;
  const diskPercent = diskTotal > 0 ? (diskUsed / diskTotal) * 100 : 0;
  const load1 = liveData?.load?.load1 ?? 0;
  const load5 = liveData?.load?.load5 ?? 0;
  const load15 = liveData?.load?.load15 ?? 0;

  const networkUp = liveData?.network?.up ?? 0;
  const networkDown = liveData?.network?.down ?? 0;
  const totalUp = liveData?.network?.totalUp ?? 0;
  const totalDown = liveData?.network?.totalDown ?? 0;

  return (
    <Card className="card-blur-target overflow-hidden" style={CARD_CONTAINMENT_STYLE}>
      <CardHeader className="p-5 pb-3 md:p-4 md:pb-2 space-y-0.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 ml-1">
            <Server className="h-5 w-5" />
            <CardTitle className="text-xl md:text-lg">{node.name}</CardTitle>
          </div>
          <span
            className={`h-2.5 w-2.5 rounded-full mr-1 ${
              isOnline
                ? "bg-status-online text-status-online animate-pulse-glow"
                : "bg-status-offline"
            }`}
            aria-label={isOnline ? "在线" : "离线"}
            role="status"
          />
        </div>
        <CardDescription className="flex flex-col gap-1 text-xs text-muted-foreground">
          <div className="flex flex-nowrap items-center gap-1 overflow-x-auto whitespace-nowrap">
            <span className={PILL_STYLES.info}>
              <Clock4 className="h-3 w-3" />
              <span className="leading-none">
                {liveData?.uptime ? formatUptimeSeconds(liveData.uptime) : "--"}
              </span>
            </span>
            <span className={PILL_STYLES.info}>
              <MapPin className="h-3 w-3" />
              <span className="leading-none">{node.region}</span>
            </span>
            {node.group && (
              <span className={PILL_STYLES.info}>
                <span className="leading-none">{node.group}</span>
              </span>
            )}
          </div>
        </CardDescription>
      </CardHeader>
      <CardContent className="p-5 pt-3 md:p-4 md:pt-2 space-y-2">
        <div className="space-y-1">
          <div className="flex items-center justify-between text-sm ml-1">
            <div className="flex items-center gap-2">
              <Cpu className="h-4 w-4" />
              <span>CPU</span>
            </div>
            <span>{cpuUsage.toFixed(1)}%</span>
          </div>
          <Progress value={cpuUsage} max={100} variant={isOnline ? "auto" : "muted"} />
          <p className="text-xs text-muted-foreground">
            负载: {load1.toFixed(2)} / {load5.toFixed(2)} / {load15.toFixed(2)}
          </p>
        </div>

        <Separator className="my-1" />

        <div className="space-y-1">
          <div className="flex items-center justify-between text-sm ml-1">
            <div className="flex items-center gap-2">
              <MemoryStick className="h-4 w-4" />
              <span>内存</span>
            </div>
            <span>{ramPercent.toFixed(1)}%</span>
          </div>
          <Progress value={ramPercent} max={100} variant={isOnline ? "auto" : "muted"} />
          <p className="text-xs text-muted-foreground">
            {formatBytes(ramUsed)} / {formatBytes(memTotal)}
          </p>
        </div>

        <Separator className="my-1" />

        <div className="space-y-1">
          <div className="flex items-center justify-between text-sm ml-1">
            <div className="flex items-center gap-2">
              <HardDrive className="h-4 w-4" />
              <span>磁盘</span>
            </div>
            <span>{diskPercent.toFixed(1)}%</span>
          </div>
          <Progress value={diskPercent} max={100} variant={isOnline ? "auto" : "muted"} />
          <p className="text-xs text-muted-foreground">
            {formatBytes(diskUsed)} / {formatBytes(diskTotal)}
          </p>
        </div>

        <Separator className="my-1" />

        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm ml-1">
            <Network className="h-4 w-4" />
            <span>网络</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className={`${PILL_STYLES.network} justify-between`}>
              <span className="text-muted-foreground">↑ 上传</span>
              <span className="font-medium">{formatBytes(networkUp)}/s</span>
            </div>
            <div className={`${PILL_STYLES.network} justify-between`}>
              <span className="text-muted-foreground">↓ 下载</span>
              <span className="font-medium">{formatBytes(networkDown)}/s</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className={`${PILL_STYLES.network} justify-between`}>
              <span className="text-muted-foreground">↑ 总上传</span>
              <span className="font-medium">{formatBytes(totalUp)}</span>
            </div>
            <div className={`${PILL_STYLES.network} justify-between`}>
              <span className="text-muted-foreground">↓ 总下载</span>
              <span className="font-medium">{formatBytes(totalDown)}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export const ServerCard = memo(ServerCardComponent);
