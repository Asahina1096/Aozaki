import {
  Clock4,
  Cpu,
  HardDrive,
  Layers,
  MapPin,
  MemoryStick,
  Network,
  Server,
} from "lucide-react";
import { PILL_STYLES } from "@/lib/constants";
import type { ServerStats } from "@/lib/types/serverstatus";
import {
  formatBytes,
  formatLoad,
  formatPercent,
  formatSpeed,
  formatUptime,
} from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Progress } from "./ui/progress";
import { Separator } from "./ui/separator";
import { StatusPill } from "./ui/status-pill";

interface ServerCardProps {
  server: ServerStats;
}

export function ServerCard({ server }: ServerCardProps) {
  const isOnline = server.online4 || server.online6;
  const cpuUsage = server.cpu;
  const memUsage = server.memory_used;
  const memTotal = server.memory_total;
  const diskUsage = server.hdd_used;
  const diskTotal = server.hdd_total;

  const memPercent = formatPercent(memUsage, memTotal);
  const diskPercent = formatPercent(diskUsage, diskTotal);
  const cpuDisplay = Math.round(cpuUsage * 10) / 10;
  const load1 = formatLoad(server.load_1);
  const load5 = formatLoad(server.load_5);
  const load15 = formatLoad(server.load_15);

  return (
    <Card className="min-h-[420px] overflow-hidden hover:shadow-lg">
      <CardHeader className="pb-0 space-y-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            <CardTitle className="text-lg">
              {server.alias || server.name}
            </CardTitle>
          </div>
          <div
            className={`h-2.5 w-2.5 rounded-full mr-1 ${
              isOnline
                ? "bg-green-500 text-green-500 animate-pulse-glow"
                : "bg-gray-400"
            }`}
          />
        </div>
        <CardDescription className="flex flex-col gap-1 text-xs text-muted-foreground">
          {/* 第一行：运行时间 + 地区 + IPV4 + IPV6 + 类型 */}
          <div className="flex flex-nowrap items-center gap-1 overflow-x-auto whitespace-nowrap">
            <span className={PILL_STYLES.info}>
              <Clock4 className="h-3 w-3" />
              <span className="leading-none">
                {server.uptime ? formatUptime(server.uptime) : "--"}
              </span>
            </span>
            {server.location && (
              <span className={PILL_STYLES.info}>
                <MapPin className="h-3 w-3" />
                <span className="leading-none">{server.location}</span>
              </span>
            )}
            <StatusPill label="v4" online={server.online4} />
            <StatusPill label="v6" online={server.online6} />
            {server.type && (
              <span className={PILL_STYLES.info}>
                <Layers className="h-3 w-3" />
                <span className="leading-none">{server.type}</span>
              </span>
            )}
          </div>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 pt-1">
        {/* CPU */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Cpu className="h-4 w-4" />
              <span>CPU</span>
            </div>
            <span>{cpuDisplay}%</span>
          </div>
          <Progress
            value={cpuUsage}
            max={100}
            variant={isOnline ? "auto" : "muted"}
          />
          <p className="text-xs text-muted-foreground">
            负载: {load1} / {load5} / {load15}
          </p>
        </div>

        <Separator className="my-2" />

        {/* 内存 */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <MemoryStick className="h-4 w-4" />
              <span>内存</span>
            </div>
            <span>{memPercent}</span>
          </div>
          <Progress
            value={memUsage}
            max={memTotal}
            variant={isOnline ? "auto" : "muted"}
          />
          <p className="text-xs text-muted-foreground">
            {formatBytes(memUsage * 1024)} / {formatBytes(memTotal * 1024)}
          </p>
        </div>

        <Separator className="my-2" />

        {/* 磁盘 */}
        <div className="space-y-1.5">
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
            variant={isOnline ? "auto" : "muted"}
          />
          <p className="text-xs text-muted-foreground">
            {formatBytes(diskUsage * 1024 * 1024)} /{" "}
            {formatBytes(diskTotal * 1024 * 1024)}
          </p>
        </div>

        <Separator className="my-2" />

        {/* 网络 */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-sm">
            <Network className="h-4 w-4" />
            <span>网络</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className={`${PILL_STYLES.network} justify-between`}>
              <span className="text-muted-foreground">↑ 上传</span>
              <span className="font-medium">
                {formatSpeed(server.network_tx)}
              </span>
            </div>
            <div className={`${PILL_STYLES.network} justify-between`}>
              <span className="text-muted-foreground">↓ 下载</span>
              <span className="font-medium">
                {formatSpeed(server.network_rx)}
              </span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className={`${PILL_STYLES.network} justify-between`}>
              <span className="text-muted-foreground">↑ 总上传</span>
              <span className="font-medium">
                {formatBytes(server.network_out)}
              </span>
            </div>
            <div className={`${PILL_STYLES.network} justify-between`}>
              <span className="text-muted-foreground">↓ 总下载</span>
              <span className="font-medium">
                {formatBytes(server.network_in)}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
