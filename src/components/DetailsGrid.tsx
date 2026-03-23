import {
  Binary,
  Clock3,
  Cpu,
  HardDrive,
  type LucideIcon,
  MemoryStick,
  Monitor,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Progress } from "@/components/ui/progress";
import { useLiveData } from "@/contexts/LiveDataContext";
import { useNodeList } from "@/contexts/NodeListContext";
import { formatBytes } from "@/utils/unitHelper";

type DetailsGridProps = {
  uuid: string;
};

function formatUptime(seconds: number, t: (key: string, opts?: Record<string, unknown>) => string) {
  if (!seconds || seconds < 0) return t("nodeCard.time_second", { val: 0 });
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const parts: string[] = [];
  if (d) parts.push(`${d} ${t("nodeCard.time_day")}`);
  if (h) parts.push(`${h} ${t("nodeCard.time_hour")}`);
  if (m) parts.push(`${m} ${t("nodeCard.time_minute")}`);
  if (s || parts.length === 0) parts.push(`${s} ${t("nodeCard.time_second")}`);
  return parts.join(" ");
}

export const DetailsGrid = ({ uuid }: DetailsGridProps) => {
  const { t } = useTranslation();
  const { nodeList } = useNodeList();
  const { live_data } = useLiveData();
  const node = nodeList?.find((n) => n.uuid === uuid);
  const base = live_data?.data.data[uuid];
  const cpuModel = node?.cpu_name ? `${node.cpu_name} (x${node.cpu_cores || 0})` : "Unknown";
  const cpuUsage = Math.min(Math.max(base?.cpu?.usage ?? 0, 0), 100);
  const memoryUsage = Math.min(
    Math.max(
      node?.mem_total && node.mem_total > 0 ? ((base?.ram?.used ?? 0) / node.mem_total) * 100 : 0,
      0,
    ),
    100,
  );
  const isOnline = Boolean(live_data?.data?.online?.includes(uuid));

  const details: Array<{
    key: string;
    label: string;
    value: string;
    icon: LucideIcon;
  }> = [
    { key: "cpu", label: "CPU", value: cpuModel, icon: Cpu },
    {
      key: "os",
      label: t("nodeCard.os"),
      value: node?.os ? `${node.os} / ${node.arch ?? "-"}` : "Unknown",
      icon: Monitor,
    },
    {
      key: "kernel",
      label: t("nodeCard.kernelVersion"),
      value: node?.kernel_version ?? "Unknown",
      icon: Binary,
    },
    {
      key: "ram",
      label: t("nodeCard.ram"),
      value: formatBytes(node?.mem_total || 0),
      icon: MemoryStick,
    },
    {
      key: "disk",
      label: t("nodeCard.disk"),
      value: formatBytes(node?.disk_total || 0),
      icon: HardDrive,
    },
    {
      key: "uptime",
      label: t("nodeCard.uptime"),
      value: base?.uptime ? formatUptime(base.uptime, t) : "-",
      icon: Clock3,
    },
  ];

  const statBars = [
    {
      key: "cpu",
      label: "CPU",
      value: cpuUsage,
    },
    {
      key: "memory",
      label: t("nodeCard.ram"),
      value: memoryUsage,
    },
  ];

  return (
    <div className="DetailsGrid w-full">
      <div className="mt-4 space-y-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {statBars.map((item) => (
            <div
              key={item.key}
              className="rounded-lg border border-border/20 bg-muted/40 px-3 py-2"
            >
              <div className="mb-1 flex items-center justify-between">
                <span className="font-sans text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
                  {item.label}
                </span>
                <span className="font-mono text-sm font-semibold text-foreground">
                  {item.value.toFixed(1)}%
                </span>
              </div>
              <Progress
                value={item.value}
                max={100}
                variant={isOnline ? "auto" : "muted"}
                className="h-1.5"
              />
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {details.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.key}
                className="min-w-0 rounded-lg border border-border/20 bg-muted/30 px-3 py-2"
              >
                <div className="mb-1 flex items-center gap-2 font-sans text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
                  <Icon className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
                  <span>{item.label}</span>
                </div>
                <div className="truncate text-sm font-medium text-foreground">{item.value}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
