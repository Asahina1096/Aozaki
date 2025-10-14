import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Progress } from "./ui/progress";
import { Separator } from "./ui/separator";
import {
  Box,
  Binary,
  Cpu,
  HardDrive,
  Activity,
  Clock4,
  Network,
  MemoryStick,
  MapPin,
} from "lucide-react";
import {
  formatBytes,
  formatDuration,
  formatPercent,
  formatSpeed,
  getCpuColor,
  getMemoryColor,
} from "@/lib/utils";
import type { Client, NodeStatus } from "@/lib/types/komari";
import { OSIcon } from "./OSIcon";
import { Skeleton } from "./ui/skeleton";

interface NodeCardProps {
  client: Client;
  status?: NodeStatus;
}

export function NodeCard({ client, status }: NodeCardProps) {
  const isOnline = status?.online ?? false;
  const cpuUsage = status?.cpu ?? 0;
  const memUsage = status?.ram ?? 0;
  const memTotal = status?.ram_total ?? client.mem_total;
  const diskUsage = status?.disk ?? 0;
  const diskTotal = status?.disk_total ?? client.disk_total;
  const hasStatus = Boolean(status);
  const hasLoadMetrics =
    status?.load !== undefined ||
    status?.load5 !== undefined ||
    status?.load15 !== undefined;
  const infoPillClass =
    "inline-flex items-center gap-1 rounded-full border border-border/40 bg-muted/40 px-1.5 py-0.5 whitespace-nowrap";

  const getCpuVariant = (
    usage: number,
  ): "default" | "success" | "warning" | "danger" => {
    if (usage >= 80) return "danger";
    if (usage >= 60) return "warning";
    return "success";
  };

  const getMemVariant = (
    usage: number,
    total: number,
  ): "default" | "success" | "warning" | "danger" => {
    const percent = (usage / total) * 100;
    if (percent >= 90) return "danger";
    if (percent >= 75) return "warning";
    return "success";
  };

  const formatLoadValue = (value?: number) =>
    value === undefined || Number.isNaN(value) ? "--" : value.toFixed(2);

  return (
    <Card className="min-h-[420px] overflow-hidden transition-all hover:shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <OSIcon os={client.os} className="h-5 w-5" />
            <CardTitle className="text-lg">{client.name}</CardTitle>
          </div>
          <div
            className={`h-2.5 w-2.5 rounded-full mr-1 ${
              isOnline
                ? "bg-green-500 text-green-500 animate-pulse-glow"
                : "bg-gray-400"
            }`}
          />
        </div>
        <CardDescription className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          {status?.uptime !== undefined && status?.uptime > 0 ? (
            <span className={infoPillClass}>
              <Clock4 className="h-3.5 w-3.5" />
              <span className="leading-none">
                {formatDuration(status.uptime)}
              </span>
            </span>
          ) : (
            <span className={infoPillClass}>
              <Clock4 className="h-3.5 w-3.5" />
              <span className="leading-none">--</span>
            </span>
          )}
          {client.virtualization && (
            <span className={infoPillClass}>
              <Box className="h-3.5 w-3.5" />
              <span className="leading-none">{client.virtualization}</span>
            </span>
          )}
          {client.arch && (
            <span className={infoPillClass}>
              <Binary className="h-3.5 w-3.5" />
              <span className="leading-none">{client.arch}</span>
            </span>
          )}
          {client.region && (
            <span className={infoPillClass}>
              <MapPin className="h-3.5 w-3.5" />
              <span className="leading-none">{client.region}</span>
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* CPU */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Cpu className="h-4 w-4" />
              <span>CPU</span>
            </div>
            <span className={getCpuColor(cpuUsage)}>
              {cpuUsage.toFixed(1)}%
            </span>
          </div>
          <Progress
            value={cpuUsage}
            max={100}
            variant={getCpuVariant(cpuUsage)}
          />
          <p className="text-xs text-muted-foreground truncate">
            {client.cpu_name}
          </p>
        </div>

        <Separator />

        {/* 内存 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <MemoryStick className="h-4 w-4" />
              <span>内存</span>
            </div>
            <span className={getMemoryColor(memUsage, memTotal)}>
              {formatPercent(memUsage, memTotal)}
            </span>
          </div>
          <Progress
            value={memUsage}
            max={memTotal}
            variant={getMemVariant(memUsage, memTotal)}
          />
          <p className="text-xs text-muted-foreground">
            {formatBytes(memUsage)} / {formatBytes(memTotal)}
          </p>
        </div>

        <Separator />

        {/* 磁盘 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <HardDrive className="h-4 w-4" />
              <span>磁盘</span>
            </div>
            <span>{formatPercent(diskUsage, diskTotal)}</span>
          </div>
          <Progress
            value={diskUsage}
            max={diskTotal}
            variant={getMemVariant(diskUsage, diskTotal)}
          />
          <p className="text-xs text-muted-foreground">
            {formatBytes(diskUsage)} / {formatBytes(diskTotal)}
          </p>
        </div>

        <Separator />

        {/* 网络 */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <Network className="h-4 w-4" />
            <span>网络</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="space-y-1">
              <p className="text-muted-foreground">↑ 上传</p>
              <div className="font-medium">
                {hasStatus ? (
                  formatSpeed(status?.net_out ?? 0)
                ) : (
                  <Skeleton className="h-4 w-16" />
                )}
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-muted-foreground">↓ 下载</p>
              <div className="font-medium">
                {hasStatus ? (
                  formatSpeed(status?.net_in ?? 0)
                ) : (
                  <Skeleton className="h-4 w-16" />
                )}
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* 负载 */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <Activity className="h-4 w-4" />
            <span>负载</span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-xs">
            {["1m", "5m", "15m"].map((label, index) => {
              const value =
                index === 0
                  ? status?.load
                  : index === 1
                    ? status?.load5
                    : status?.load15;
              const hasValue = hasLoadMetrics && value !== undefined;
              return (
                <div key={label}>
                  <p className="text-muted-foreground">{label}</p>
                  <div className="font-medium">
                    {hasStatus ? (
                      hasValue ? (
                        formatLoadValue(value)
                      ) : (
                        "--"
                      )
                    ) : (
                      <Skeleton className="h-4 w-12" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
