import { Clock4, Layers, MapPin } from "lucide-react";
import { GRID_STYLES, PILL_STYLES } from "@/lib/constants";
import type { ServerStats } from "@/lib/types/serverstatus";
import {
  formatBytes,
  formatLoad,
  formatPercent,
  formatSpeed,
  formatUptime,
} from "@/lib/utils";
import { StatusPill } from "./ui/status-pill";

const ROW_CONTAINER_CLASS = `${GRID_STYLES.template} items-center gap-4 rounded-2xl border border-border/20 bg-card/95 backdrop-blur-sm px-4 py-4 text-sm shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 hover:border-border/30`;
const HEADER_CONTAINER_CLASS = `${GRID_STYLES.template} items-center gap-4 rounded-2xl border border-border/20 bg-card/95 backdrop-blur-sm px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground shadow-sm`;

interface ServerTableProps {
  servers: ServerStats[];
}

export function ServerTable({ servers }: ServerTableProps) {
  return (
    <div className="overflow-x-auto">
      <div className="min-w-[820px] space-y-4 p-2">
        <div className={HEADER_CONTAINER_CLASS}>
          <span className="text-left">节点名</span>
          <span className="text-center">CPU</span>
          <span className="text-center">内存</span>
          <span className="text-center">磁盘</span>
          <span className="text-center">网络</span>
        </div>
        <div className="space-y-3">
          {servers.map((server) => {
            const isOnline = server.online4 || server.online6;
            const ipv4Online = server.online4;
            const ipv6Online = server.online6;
            const cpuPercent = Math.round(server.cpu * 10) / 10;
            const memPercent = formatPercent(
              server.memory_used,
              server.memory_total
            );
            const diskPercent = formatPercent(
              server.hdd_used,
              server.hdd_total
            );

            return (
              <div key={server.name} className={ROW_CONTAINER_CLASS}>
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`relative top-[-1.5px] h-2.5 w-2.5 self-center rounded-full ${
                        isOnline
                          ? "bg-green-500 text-green-500 animate-pulse-glow"
                          : "bg-gray-400"
                      }`}
                      aria-label={isOnline ? "在线" : "离线"}
                    />
                    <p className="font-semibold text-foreground">
                      {server.alias || server.name}
                    </p>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
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
                    <StatusPill label="v4" online={ipv4Online} />
                    <StatusPill label="v6" online={ipv6Online} />
                    {server.type && (
                      <span className={PILL_STYLES.info}>
                        <Layers className="h-3 w-3" />
                        <span className="leading-none">{server.type}</span>
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-center">
                  <p className="text-base font-semibold text-foreground">
                    {cpuPercent}%
                  </p>
                  <p className="text-xs text-muted-foreground">
                    负载 {formatLoad(server.load_1)}/{formatLoad(server.load_5)}
                    /{formatLoad(server.load_15)}
                  </p>
                </div>

                <div className="text-center">
                  <p className="text-base font-semibold text-foreground">
                    {memPercent}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatBytes(server.memory_used * 1024)} /{" "}
                    {formatBytes(server.memory_total * 1024)}
                  </p>
                </div>

                <div className="text-center">
                  <p className="text-base font-semibold text-foreground">
                    {diskPercent}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatBytes(server.hdd_used * 1024 * 1024)} /{" "}
                    {formatBytes(server.hdd_total * 1024 * 1024)}
                  </p>
                </div>

                <div className="text-center">
                  <p className="text-base font-semibold text-foreground">
                    {formatSpeed(server.network_tx)} ↑ ·{" "}
                    {formatSpeed(server.network_rx)} ↓
                  </p>
                  <p className="text-xs text-muted-foreground">
                    总 {formatBytes(server.network_out)} ↑ /{" "}
                    {formatBytes(server.network_in)} ↓
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
