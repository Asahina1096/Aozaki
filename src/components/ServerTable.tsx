import type { ServerStats } from "@/lib/types/serverstatus";
import {
  formatBytes,
  formatPercent,
  formatSpeed,
  formatUptime,
} from "@/lib/utils";

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
                        className={`h-2.5 w-2.5 rounded-full ${
                          isOnline ? "bg-emerald-500" : "bg-gray-400"
                        }`}
                        aria-label={isOnline ? "在线" : "离线"}
                      />
                      <p className="font-semibold text-foreground">
                        {server.alias || server.name}
                      </p>
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      <span>{formatUptime(server.uptime)}</span>
                      {server.location && <span>{server.location}</span>}
                      <span>
                        {server.online4 ? "IPv4 ✓" : "IPv4 ×"} ·{" "}
                        {server.online6 ? "IPv6 ✓" : "IPv6 ×"}
                      </span>
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
