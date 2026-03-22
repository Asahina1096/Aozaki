import { Flex, Text } from "@radix-ui/themes";
import { ArrowLeft } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { DetailsGrid } from "@/components/DetailsGrid";
import LoadChart from "@/components/instance/LoadChart";
import PingChart from "@/components/instance/PingChart";
import { useRPC2Call } from "@/contexts/RPC2Context";
import { liveDataToRecords } from "@/utils/RecordHelper";
import { useLiveDataRefresh } from "../contexts/LiveDataContext";
import { useNodeList } from "../contexts/NodeListContext";
import type { Record as LiveRecord } from "../types/LiveData";

type StatusRecordRPC = {
  client: string;
  time: string;
  cpu: number;
  gpu: number;
  ram: number;
  ram_total: number;
  swap: number;
  swap_total: number;
  load: number;
  temp: number;
  disk: number;
  disk_total: number;
  net_in: number;
  net_out: number;
  net_total_up: number;
  net_total_down: number;
  process: number;
  connections: number;
  connections_udp: number;
};

interface InstanceDetailProps {
  uuid: string;
}

const InstanceDetail: React.FC<InstanceDetailProps> = ({ uuid }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { onRefresh } = useLiveDataRefresh();
  const [recent, setRecent] = useState<LiveRecord[]>([]);
  const [chartView, setChartView] = useState<"load" | "ping">("load");
  const [loadView, setLoadView] = useState("real");
  const [pingView, setPingView] = useState("1h");
  const { nodeList } = useNodeList();
  const length = 30 * 5;
  const sectionCardClass =
    "rounded-2xl border border-border/20 bg-card/95 p-5 shadow-sm";
  const controlBaseClass =
    "rounded-lg border border-input bg-background px-3 py-1.5 text-sm font-medium text-muted-foreground transition hover:bg-accent hover:text-accent-foreground sm:px-4";
  const controlActiveClass =
    "border-transparent bg-primary text-primary-foreground hover:bg-primary/90";

  const node = nodeList?.find((n) => n.uuid === uuid);
  const serverName = node?.name?.trim() || uuid;
  const region = (node?.region || "Unknown").toUpperCase();
  const { call } = useRPC2Call();
  const requestSeqRef = useRef(0);

  useEffect(() => {
    if (!uuid) return;

    const currentSeq = ++requestSeqRef.current;
    setRecent([]);

    call<{ uuid: string }, { count: number; records: StatusRecordRPC[] }>(
      "common:getNodeRecentStatus",
      { uuid }
    )
      .then((result) => {
        if (currentSeq !== requestSeqRef.current) return;

        const raw = result?.records || [];
        const mapped: LiveRecord[] = raw.map((r) => ({
          cpu: { usage: r.cpu ?? 0 },
          ram: { used: r.ram ?? 0 },
          swap: { used: r.swap ?? 0 },
          load: {
            load1: r.load ?? 0,
            load5: 0,
            load15: 0,
          },
          disk: { used: r.disk ?? 0 },
          network: {
            up: r.net_out ?? 0,
            down: r.net_in ?? 0,
            totalUp: r.net_total_up ?? 0,
            totalDown: r.net_total_down ?? 0,
          },
          connections: {
            tcp: r.connections ?? 0,
            udp: r.connections_udp ?? 0,
          },
          uptime: 0,
          process: r.process ?? 0,
          message: "",
          updated_at: r.time ?? "",
        }));
        setRecent(mapped.slice(-length));
      })
      .catch((err) => console.error("Failed to fetch recent data:", err));
  }, [uuid, call]);

  useEffect(() => {
    const unsubscribe = onRefresh((resp) => {
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
    return () => unsubscribe();
  }, [onRefresh, uuid]);

  return (
    <Flex
      className="items-center px-2 pb-10 pt-2 md:px-4"
      direction="column"
      gap="4"
    >
      <div className="flex w-full max-w-[1200px] flex-col gap-4">
        <div className={sectionCardClass}>
          <div className="flex items-start gap-3">
            <button
              type="button"
              onClick={() => navigate("/")}
              aria-label="Back to list"
              className="inline-flex h-9 w-10 shrink-0 items-center justify-center rounded-lg border border-input bg-background text-foreground transition hover:bg-accent"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            </button>

            <div className="min-w-0 flex-1">
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

              <DetailsGrid uuid={uuid ?? ""} />
            </div>
          </div>
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
