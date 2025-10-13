import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { Separator } from "./ui/separator";
import {
  Server,
  Cpu,
  HardDrive,
  Activity,
  Network,
  MemoryStick,
} from "lucide-react";
import {
  formatBytes,
  formatPercent,
  formatSpeed,
  getStatusColor,
  getCpuColor,
  getMemoryColor,
} from "@/lib/utils";
import type { Client, NodeStatus } from "@/lib/types/komari";

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

  return (
    <Card className="overflow-hidden transition-all hover:shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Server className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">{client.name}</CardTitle>
          </div>
          <Badge variant={isOnline ? "success" : "destructive"}>
            {isOnline ? "在线" : "离线"}
          </Badge>
        </div>
        <CardDescription>
          {client.region && <span>{client.region} • </span>}
          {client.os} {client.arch}
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

        {status && (
          <>
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
                  <p className="font-medium">{formatSpeed(status.net_out)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground">↓ 下载</p>
                  <p className="font-medium">{formatSpeed(status.net_in)}</p>
                </div>
              </div>
            </div>

            {/* 负载 */}
            {status.load !== undefined && (
              <>
                <Separator />
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Activity className="h-4 w-4" />
                    <span>负载</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <p className="text-muted-foreground">1m</p>
                      <p className="font-medium">{status.load.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">5m</p>
                      <p className="font-medium">{status.load5.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">15m</p>
                      <p className="font-medium">{status.load15.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
