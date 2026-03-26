import { Flex, SegmentedControl, Text } from "@radix-ui/themes";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { DetailsGrid } from "@/components/DetailsGrid";
import { Card } from "@/components/ui/card";
import LoadChart from "@/components/instance/LoadChart";
import PingChart from "@/components/instance/PingChart";
import { normalizeRecentStatusRecord } from "@/lib/normalizers/liveData";
import { CARD_CONTAINMENT_STYLE, INFO_CARD_COMPACT_CLASS } from "@/lib/constants";
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
  const { onRefresh } = useLiveDataRefresh();
  const [recent, setRecent] = useState<LiveRecord[]>([]);
  const [chartView, setChartView] = useState<"load" | "ping">("load");
  const [loadView, setLoadView] = useState("real");
  const [pingView, setPingView] = useState("1h");
  const { nodeList } = useNodeList();
  const length = 30 * 5;
  const sectionCardClass = "card-blur-target p-5";
  const rangeOptions =
    chartView === "load"
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
        ];

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
      { uuid },
    )
      .then((result) => {
        if (currentSeq !== requestSeqRef.current) return;

        const raw = result?.records || [];
        const mapped: LiveRecord[] = raw.map((record) => normalizeRecentStatusRecord(record));
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
        const exists = prev.some((item) => item.updated_at === newRecord.updated_at);
        if (exists) return prev;

        const updated = [...prev, newRecord].slice(-length);
        return updated;
      });
    });
    return () => unsubscribe();
  }, [onRefresh, uuid]);

  return (
    <Flex className="items-center px-2 pb-10 pt-2 md:px-4" direction="column" gap="4">
      <div className="flex w-full max-w-[1200px] flex-col gap-4">
        <Card className={sectionCardClass} style={CARD_CONTAINMENT_STYLE}>
          <div className="flex items-start gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-3">
                <Card
                  className={INFO_CARD_COMPACT_CLASS}
                  style={CARD_CONTAINMENT_STYLE}
                >
                  {region}
                </Card>
                <h1 className="text-xl font-bold tracking-tight text-foreground md:text-2xl">
                  <Text as="span" wrap="nowrap">
                    {serverName}
                  </Text>
                </h1>
              </div>

              <DetailsGrid uuid={uuid} />
            </div>
          </div>
        </Card>

        <Card
          className={`${sectionCardClass} mb-1 flex w-full flex-wrap items-center justify-between gap-3`}
          style={CARD_CONTAINMENT_STYLE}
        >
          <div className="w-full max-w-full overflow-x-auto sm:w-auto sm:max-w-none sm:overflow-visible">
            <div className="w-max min-w-full sm:min-w-0">
              <SegmentedControl.Root
                radius="full"
                value={chartView === "load" ? loadView : pingView}
                onValueChange={(value) => {
                  if (chartView === "load") {
                    setLoadView(value);
                    return;
                  }
                  setPingView(value);
                }}
                className="instance-detail-segment control-surface-target"
              >
                {rangeOptions.map((item) => (
                  <SegmentedControl.Item key={item.key} value={item.key}>
                    {item.label}
                  </SegmentedControl.Item>
                ))}
              </SegmentedControl.Root>
            </div>
          </div>

          <div className="inline-flex items-center">
            <SegmentedControl.Root
              radius="full"
              value={chartView}
              onValueChange={(value) => setChartView(value as "load" | "ping")}
              className="instance-detail-segment control-surface-target"
            >
              <SegmentedControl.Item value="load">{t("nodeCard.load")}</SegmentedControl.Item>
              <SegmentedControl.Item value="ping">{t("nodeCard.ping")}</SegmentedControl.Item>
            </SegmentedControl.Root>
          </div>
        </Card>
      </div>

      {(() => {
        return chartView === "load" ? (
          <LoadChart data={liveDataToRecords(uuid, recent)} view={loadView} />
        ) : (
          <PingChart uuid={uuid} view={pingView} />
        );
      })()}
    </Flex>
  );
};

export default InstanceDetail;
