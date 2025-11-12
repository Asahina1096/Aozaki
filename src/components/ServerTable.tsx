import type { ServerStats } from "@/lib/types/serverstatus";
import {
  formatBytes,
  formatPercent,
  formatSpeed,
  formatUptime,
} from "@/lib/utils";

const INFO_PILL_CLASS =
  "inline-flex items-center gap-1 rounded-full border border-border/40 bg-muted/60 px-1.5 py-0.5 whitespace-nowrap";
const STATUS_PILL_CLASS =
  "inline-flex items-center gap-1 rounded-full border border-border/40 bg-muted/60 px-1.5 py-0.5 whitespace-nowrap";

interface ServerTableProps {
  servers: ServerStats[];
}

export function ServerTable({ servers }: ServerTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[820px] text-sm">
          <thead className="bg-muted/60 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3 text-left">节点</th>
              <th className="px-4 py-3 text-center">CPU</th>
              <th className="px-4 py-3 text-center">内存</th>
              <th className="px-4 py-3 text-center">磁盘</th>
              <th className="px-4 py-3 text-center">网络</th>
            </tr>
          </thead>
          <tbody className="divide-y">
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
                <tr
                  key={server.name}
                  className="transition-colors hover:bg-muted/40"
                >
                  <td className="px-4 py-3 align-middle">
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
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <span className={INFO_PILL_CLASS}>
                        {server.uptime ? formatUptime(server.uptime) : "--"}
                      </span>
                      {server.location && (
                        <span className={INFO_PILL_CLASS}>
                          {server.location}
                        </span>
                      )}
                      <StatusPill label="v4" online={ipv4Online} />
                      <StatusPill label="v6" online={ipv6Online} />
                    </div>
                  </td>

                  <td className="px-4 py-3 text-center align-middle">
                    <p className="text-base font-semibold text-foreground">
                      {cpuPercent}%
                    </p>
                    <p className="text-xs text-muted-foreground">
                      负载 {formatLoad(server.load_1)}/
                      {formatLoad(server.load_5)}/{formatLoad(server.load_15)}
                    </p>
                  </td>

                  <td className="px-4 py-3 text-center align-middle">
                    <p className="text-base font-semibold text-foreground">
                      {memPercent}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatBytes(server.memory_used * 1024)} /{" "}
                      {formatBytes(server.memory_total * 1024)}
                    </p>
                  </td>

                  <td className="px-4 py-3 text-center align-middle">
                    <p className="text-base font-semibold text-foreground">
                      {diskPercent}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatBytes(server.hdd_used * 1024 * 1024)} /{" "}
                      {formatBytes(server.hdd_total * 1024 * 1024)}
                    </p>
                  </td>

                  <td className="px-4 py-3 text-center align-middle">
                    <p className="text-base font-semibold text-foreground">
                      {formatSpeed(server.network_tx)} ↑ ·{" "}
                      {formatSpeed(server.network_rx)} ↓
                    </p>
                    <p className="text-xs text-muted-foreground">
                      总 {formatBytes(server.network_out)} ↑ /{" "}
                      {formatBytes(server.network_in)} ↓
                    </p>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function formatLoad(value: number) {
  return Math.round(value * 100) / 100;
}

function StatusPill({ label, online }: { label: string; online: boolean }) {
  return (
    <span className={STATUS_PILL_CLASS}>
      <span
        className={`h-2 w-2 rounded-full ${
          online ? "bg-green-500" : "bg-gray-400"
        }`}
      />
      <span
        className={`leading-none ${
          online ? "text-foreground" : "text-muted-foreground"
        }`}
      >
        {label}
      </span>
    </span>
  );
}
