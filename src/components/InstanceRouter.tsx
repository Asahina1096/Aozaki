import { Flex, SegmentedControl, Text } from "@radix-ui/themes";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import LoadChart from "@/components/instance/LoadChart";
import PingChart from "@/components/instance/PingChart";
import { useNodeList } from "../contexts/NodeListContext";
import { formatBytes } from "../lib/utils";
import Flag from "./Flag";

interface InstanceDetailProps {
  uuid: string;
}

const InstanceDetail: React.FC<InstanceDetailProps> = ({ uuid }) => {
  const { t } = useTranslation();
  const { nodeList } = useNodeList();
  const [chartView, setChartView] = useState<"load" | "ping">("load");

  const node = nodeList?.find((n) => n.uuid === uuid);

  if (!node) {
    return (
      <Flex className="items-center" direction="column" gap="2">
        <Text>Instance not found: {uuid}</Text>
      </Flex>
    );
  }

  return (
    <Flex className="items-center" direction="column" gap="2">
      <div className="flex flex-col gap-1 md:p-4 p-3 border-0 rounded-md w-full max-w-4xl">
        <h1 className="flex items-center flex-wrap gap-2">
          <Flag flag={node.region} />
          <Text size="3" weight="bold" wrap="nowrap">
            {node.name}
          </Text>
          <Text size="1" className="text-muted-foreground" wrap="nowrap">
            {node.uuid}
          </Text>
        </h1>

        <Flex gap="4" mt="2" wrap="wrap">
          <Flex direction="column" gap="1">
            <Text size="1" color="gray">
              OS
            </Text>
            <Text size="2">
              {node.os} / {node.arch}
            </Text>
          </Flex>
          <Flex direction="column" gap="1">
            <Text size="1" color="gray">
              CPU
            </Text>
            <Text size="2">
              {node.cpu_name} ({node.cpu_cores} cores)
            </Text>
          </Flex>
          <Flex direction="column" gap="1">
            <Text size="1" color="gray">
              Memory
            </Text>
            <Text size="2">{formatBytes(node.mem_total)}</Text>
          </Flex>
        </Flex>
      </div>

      <SegmentedControl.Root
        radius="full"
        value={chartView}
        onValueChange={(value) => setChartView(value as "load" | "ping")}
      >
        <SegmentedControl.Item value="load">
          {t("nodeCard.load")}
        </SegmentedControl.Item>
        <SegmentedControl.Item value="ping">
          {t("nodeCard.ping")}
        </SegmentedControl.Item>
      </SegmentedControl.Root>

      {chartView === "load" ? (
        <LoadChart data={[]} view="real" />
      ) : (
        <PingChart uuid={uuid} view="1h" />
      )}
    </Flex>
  );
};

const InstanceRouter: React.FC = () => {
  const navigate = useNavigate();
  const [selectedUuid, setSelectedUuid] = useState<string | null>(null);

  const handleBack = () => {
    setSelectedUuid(null);
    navigate("/");
  };

  if (selectedUuid) {
    return (
      <div>
        <button
          onClick={handleBack}
          aria-label="Back to list"
          className="mb-4 -ml-2 inline-flex items-center rounded-lg p-2 text-sm font-medium text-muted-foreground transition-colors duration-200 hover:bg-muted hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        </button>
        <InstanceDetail uuid={selectedUuid} />
      </div>
    );
  }

  return (
    <div className="text-center py-8">
      <p className="text-muted-foreground">
        Select an instance to view details
      </p>
    </div>
  );
};

export { InstanceDetail, InstanceRouter };
export default InstanceDetail;
