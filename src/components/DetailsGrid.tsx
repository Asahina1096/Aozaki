import { useTranslation } from "react-i18next";
import { UpDownStack } from "@/components/UpDownStack";
import { useLiveData } from "@/contexts/LiveDataContext";
import { useNodeList } from "@/contexts/NodeListContext";
import { formatBytes } from "@/utils/unitHelper";

type DetailsGridProps = {
  uuid: string;
};

function formatUptime(
  seconds: number,
  t: (key: string, opts?: Record<string, unknown>) => string
) {
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
  const cpuModel = node?.cpu_name
    ? `${node.cpu_name} (x${node.cpu_cores || 0})`
    : "Unknown";
  const detailItemClass = "min-w-0";

  return (
    <div className="DetailsGrid w-full">
      <div className="mt-4 grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <UpDownStack className={detailItemClass} up="CPU" down={cpuModel} />
        <UpDownStack
          className={detailItemClass}
          up={t("nodeCard.os")}
          down={node?.os ?? "Unknown"}
        />
        <UpDownStack
          className={detailItemClass}
          up={t("nodeCard.kernelVersion")}
          down={node?.kernel_version ?? "Unknown"}
        />

        <UpDownStack
          className={detailItemClass}
          up={t("nodeCard.ram")}
          down={formatBytes(node?.mem_total || 0)}
        />
        <UpDownStack
          className={detailItemClass}
          up={t("nodeCard.disk")}
          down={formatBytes(node?.disk_total || 0)}
        />
        <UpDownStack
          up={t("nodeCard.uptime")}
          className={detailItemClass}
          down={base?.uptime ? formatUptime(base.uptime, t) : "-"}
        />
      </div>
    </div>
  );
};
