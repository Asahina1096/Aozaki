import { Flex, Text } from "@radix-ui/themes";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { DetailsGrid } from "@/components/DetailsGrid";
import { liveDataToRecords } from "@/utils/RecordHelper";
import { useLiveData } from "../contexts/LiveDataContext";
import { useNodeList } from "../contexts/NodeListContext";
import LoadChart from "../pages/instance/LoadChart";
import PingChart from "../pages/instance/PingChart";
import type { Record as LiveRecord } from "../types/LiveData";

interface InstanceDetailProps {
  uuid: string;
}

const InstanceDetail: React.FC<InstanceDetailProps> = ({ uuid }) => {
  const { t } = useTranslation();
  const { onRefresh } = useLiveData();
  const [recent, setRecent] = useState<LiveRecord[]>([]);
  const [chartView, setChartView] = useState<"load" | "ping">("load");
  const [loadView, setLoadView] = useState("real");
  const [pingView, setPingView] = useState("1h");
  const { nodeList } = useNodeList();
  const length = 30 * 5;
  const sectionCardClass =
    "rounded-2xl border border-border/20 bg-card/95 p-4 shadow-sm";
  const controlBaseClass =
    "rounded-lg border border-border/25 bg-background px-3 py-1.5 text-sm font-medium text-muted-foreground transition hover:bg-muted/40 sm:px-4";
  const controlActiveClass =
    "border-transparent bg-primary text-primary-foreground hover:bg-primary/90";

  const node = nodeList?.find((n) => n.uuid === uuid);
  const serverName = node?.name?.trim() || uuid;
  const region = (node?.region || "Unknown").toUpperCase();
  useEffect(() => {
    fetch(`/api/recent/${uuid}`)
      .then((res) => res.json())
      .then((data) => setRecent(data.data?.slice(-length) || []))
      .catch((err) => console.error("Failed to fetch recent data:", err));
  }, [uuid]);

  useEffect(() => {
    onRefresh((resp) => {
      if (!uuid) return;
      const data = resp.data.data[uuid];
      if (!data) return;

      setRecent((prev) => {
        const newRecord = data;
        const exists = prev.some(
          (item) => item.updated_at === newRecord.updated_at
        );
        if (exists) return prev;

        const updated = [...prev, newRecord].slice(-length);
        return updated;
      });
    });
  }, [onRefresh, uuid]);

  return (
    <Flex
      className="items-center px-2 pb-10 pt-2 md:px-4"
      direction="column"
      gap="4"
    >
      <div className="flex w-full max-w-[1200px] flex-col gap-4">
        <div className={sectionCardClass}>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <span className="inline-flex rounded-full border border-border/30 bg-muted px-2.5 py-0.5 text-xs font-semibold tracking-wide text-muted-foreground">
                {region}
              </span>
              <h1 className="text-xl font-bold tracking-tight text-foreground md:text-2xl">
                <Text as="span" wrap="nowrap">
                  {serverName}
                </Text>
              </h1>
            </div>
          </div>
          <DetailsGrid uuid={uuid ?? ""} />
        </div>

        <div
          className={`${sectionCardClass} mb-1 flex w-full flex-wrap items-center justify-between gap-3`}
        >
          <div className="inline-flex flex-wrap items-center gap-2">
            {(chartView === "load"
              ? [
                  { key: "real", label: t("common.real_time") },
                  { key: "4h", label: t("chart.hours", { count: 4 }) },
                  { key: "1d", label: t("chart.days", { count: 1 }) },
                  { key: "7d", label: t("chart.days", { count: 7 }) },
                  { key: "30d", label: t("chart.days", { count: 30 }) },
                ]
              : [
                  { key: "1h", label: t("chart.hours", { count: 1 }) },
                  { key: "6h", label: t("chart.hours", { count: 6 }) },
                  { key: "12h", label: t("chart.hours", { count: 12 }) },
                  { key: "1d", label: t("chart.days", { count: 1 }) },
                ]
            ).map((item) => (
              <button
                type="button"
                key={item.key}
                onClick={() =>
                  chartView === "load"
                    ? setLoadView(item.key)
                    : setPingView(item.key)
                }
                className={`${controlBaseClass} ${(chartView === "load" ? loadView : pingView) === item.key ? controlActiveClass : ""}`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="inline-flex items-center gap-2">
            <button
              type="button"
              onClick={() => setChartView("load")}
              className={`${controlBaseClass} ${chartView === "load" ? controlActiveClass : ""}`}
            >
              {t("nodeCard.load")}
            </button>
            <button
              type="button"
              onClick={() => setChartView("ping")}
              className={`${controlBaseClass} ${chartView === "ping" ? controlActiveClass : ""}`}
            >
              {t("nodeCard.ping")}
            </button>
          </div>
        </div>
      </div>

      {(() => {
        return chartView === "load" ? (
          <LoadChart
            data={liveDataToRecords(uuid ?? "", recent)}
            view={loadView}
          />
        ) : (
          <PingChart uuid={uuid} view={pingView} />
        );
      })()}
    </Flex>
  );
};

export default InstanceDetail;
