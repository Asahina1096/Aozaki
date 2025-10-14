import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import {
  Cpu,
  MemoryStick,
  HardDrive,
  Network,
  Activity,
  Gauge,
  Thermometer,
  RefreshCcw,
  ListTree,
  Cable,
} from "lucide-react";
import {
  formatBytes,
  formatPercent,
  formatSpeed,
  formatLoad,
} from "@/lib/utils";
import type { Client, NodeStatus } from "@/lib/types/komari";

interface NodeRealtimeCardProps {
  client: Client;
  status: NodeStatus | null;
}

export function NodeRealtimeCard({ client, status }: NodeRealtimeCardProps) {
  const isOnline = status?.online ?? false;

  const getProgressVariant = (
    percent: number
  ): "success" | "warning" | "danger" => {
    if (percent >= 90) return "danger";
    if (percent >= 75) return "warning";
    return "success";
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{client.name}</CardTitle>
          <Badge variant={isOnline ? "success" : "destructive"}>
            {isOnline ? "在线" : "离线"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {!status ? (
          <div className="text-center py-8 text-muted-foreground">
            暂无实时数据
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* CPU */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Cpu className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">CPU</span>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>{status.cpu.toFixed(1)}%</span>
                  <span className="text-muted-foreground">
                    {client.cpu_cores} 核
                  </span>
                </div>
                <Progress
                  value={status.cpu}
                  max={100}
                  variant={getProgressVariant(status.cpu)}
                />
              </div>
            </div>

            {/* 内存 */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <MemoryStick className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">内存</span>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>{formatPercent(status.ram, status.ram_total)}</span>
                  <span className="text-muted-foreground">
                    {formatBytes(status.ram)} / {formatBytes(status.ram_total)}
                  </span>
                </div>
                <Progress
                  value={(status.ram / status.ram_total) * 100}
                  max={100}
                  variant={getProgressVariant(
                    (status.ram / status.ram_total) * 100
                  )}
                />
              </div>
            </div>

            {/* 磁盘 */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <HardDrive className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">磁盘</span>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>{formatPercent(status.disk, status.disk_total)}</span>
                  <span className="text-muted-foreground">
                    {formatBytes(status.disk)} /{" "}
                    {formatBytes(status.disk_total)}
                  </span>
                </div>
                <Progress
                  value={(status.disk / status.disk_total) * 100}
                  max={100}
                  variant={getProgressVariant(
                    (status.disk / status.disk_total) * 100
                  )}
                />
              </div>
            </div>

            {/* 网络速度 */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Network className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">网络速度</span>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-green-500">
                    ↑ {formatSpeed(status.net_out)}
                  </span>
                  <span className="text-blue-500">
                    ↓ {formatSpeed(status.net_in)}
                  </span>
                </div>
              </div>
            </div>

            {/* 系统负载 */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">系统负载</span>
              </div>
              <div className="space-y-1">
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div>
                    <div className="text-muted-foreground text-xs">1m</div>
                    <div>{formatLoad(status.load)}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground text-xs">5m</div>
                    <div>{formatLoad(status.load5)}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground text-xs">15m</div>
                    <div>{formatLoad(status.load15)}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* GPU */}
            {status.gpu > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Gauge className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">GPU</span>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>{status.gpu.toFixed(1)}%</span>
                  </div>
                  <Progress
                    value={status.gpu}
                    max={100}
                    variant={getProgressVariant(status.gpu)}
                  />
                </div>
              </div>
            )}

            {/* 温度 */}
            {status.temp > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Thermometer className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">温度</span>
                </div>
                <div className="text-sm">{status.temp.toFixed(1)}°C</div>
              </div>
            )}

            {/* 交换分区 */}
            {client.swap_total > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <RefreshCcw className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">交换分区</span>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>{formatPercent(status.swap, status.swap_total)}</span>
                    <span className="text-muted-foreground">
                      {formatBytes(status.swap)} /{" "}
                      {formatBytes(status.swap_total)}
                    </span>
                  </div>
                  <Progress
                    value={(status.swap / status.swap_total) * 100}
                    max={100}
                    variant={getProgressVariant(
                      (status.swap / status.swap_total) * 100
                    )}
                  />
                </div>
              </div>
            )}

            {/* 进程数和连接数 */}
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-4">
                {/* 进程数 */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <ListTree className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">进程数</span>
                  </div>
                  <div className="text-sm">{status.process}</div>
                </div>

                {/* 连接数 */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Cable className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">连接数</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <div className="text-muted-foreground text-xs">TCP</div>
                      <div>{status.connections}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground text-xs">UDP</div>
                      <div>{status.connections_udp}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
