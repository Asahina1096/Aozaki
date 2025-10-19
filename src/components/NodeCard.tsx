import {
  Box,
  Binary,
  Cpu,
  HardDrive,
  Clock4,
  Network,
  MemoryStick,
  MapPin,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

import {
  formatBytes,
  formatDuration,
  formatPercent,
  formatSpeed,
} from "@/lib/utils";

import { OSIcon } from "@/components/OSIcon";

import type { Client, NodeStatus } from "@/lib/types/komari";

// 纯函数，移到组件外部避免不必要的重新创建
const INFO_PILL_CLASS =
  "inline-flex items-center gap-1 rounded-full border border-border/40 bg-muted/40 px-1.5 py-0.5 whitespace-nowrap";

const getCpuVariant = (
  usage: number
): "default" | "success" | "warning" | "danger" => {
  if (usage >= 80) return "danger";
  if (usage >= 60) return "warning";
  return "success";
};

const getMemVariant = (
  usage: number,
  total: number
): "default" | "success" | "warning" | "danger" => {
  const percent = (usage / total) * 100;
  if (percent >= 90) return "danger";
  if (percent >= 75) return "warning";
  return "success";
};

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

  // React Compiler 会自动优化这些计算
  const cpuVariant = getCpuVariant(cpuUsage);
  const memVariant = getMemVariant(memUsage, memTotal);
  const diskVariant = getMemVariant(diskUsage, diskTotal);
  const memPercent = formatPercent(memUsage, memTotal);
  const diskPercent = formatPercent(diskUsage, diskTotal);
  const cpuDisplay = cpuUsage.toFixed(1);

  return (
    <a href={`/node.html?uuid=${client.uuid}`} className="block">
      <Card className="min-h-[420px] overflow-hidden transition-all hover:shadow-lg cursor-pointer">
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
              <span className={INFO_PILL_CLASS}>
                <Clock4 className="h-3.5 w-3.5" />
                <span className="leading-none">
                  {formatDuration(status.uptime)}
                </span>
              </span>
            ) : (
              <span className={INFO_PILL_CLASS}>
                <Clock4 className="h-3.5 w-3.5" />
                <span className="leading-none">--</span>
              </span>
            )}
            {client.virtualization && (
              <span className={INFO_PILL_CLASS}>
                <Box className="h-3.5 w-3.5" />
                <span className="leading-none">{client.virtualization}</span>
              </span>
            )}
            {client.arch && (
              <span className={INFO_PILL_CLASS}>
                <Binary className="h-3.5 w-3.5" />
                <span className="leading-none">{client.arch}</span>
              </span>
            )}
            {client.region && (
              <span className={INFO_PILL_CLASS}>
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
              <span className="text-black">{cpuDisplay}%</span>
            </div>
            <Progress
              value={cpuUsage}
              max={100}
              variant={isOnline ? cpuVariant : "muted"}
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
              <span className="text-black">{memPercent}</span>
            </div>
            <Progress
              value={memUsage}
              max={memTotal}
              variant={isOnline ? memVariant : "muted"}
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
              <span>{diskPercent}</span>
            </div>
            <Progress
              value={diskUsage}
              max={diskTotal}
              variant={isOnline ? diskVariant : "muted"}
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
              <div className={`${INFO_PILL_CLASS} justify-between`}>
                <span className="text-muted-foreground">↑ 上传</span>
                <span className="font-medium">
                  {hasStatus ? (
                    formatSpeed(status?.net_out ?? 0)
                  ) : (
                    <Skeleton className="h-4 w-16 rounded-full" />
                  )}
                </span>
              </div>
              <div className={`${INFO_PILL_CLASS} justify-between`}>
                <span className="text-muted-foreground">↓ 下载</span>
                <span className="font-medium">
                  {hasStatus ? (
                    formatSpeed(status?.net_in ?? 0)
                  ) : (
                    <Skeleton className="h-4 w-16 rounded-full" />
                  )}
                </span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className={`${INFO_PILL_CLASS} justify-between`}>
                <span className="text-muted-foreground">↑ 总上传</span>
                <span className="font-medium">
                  {hasStatus ? (
                    formatBytes(status?.net_total_up ?? 0)
                  ) : (
                    <Skeleton className="h-4 w-20 rounded-full" />
                  )}
                </span>
              </div>
              <div className={`${INFO_PILL_CLASS} justify-between`}>
                <span className="text-muted-foreground">↓ 总下载</span>
                <span className="font-medium">
                  {hasStatus ? (
                    formatBytes(status?.net_total_down ?? 0)
                  ) : (
                    <Skeleton className="h-4 w-20 rounded-full" />
                  )}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </a>
  );
}
