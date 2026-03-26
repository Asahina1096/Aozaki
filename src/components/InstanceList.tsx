import { Card, Flex, Text } from "@radix-ui/themes";
import React from "react";
import { Link } from "react-router-dom";
import { useLiveData } from "../contexts/LiveDataContext";
import { useNodeList } from "../contexts/NodeListContext";
import { formatBytes } from "../lib/utils";
import Flag from "./Flag";

export const InstanceList: React.FC = () => {
  const { live_data } = useLiveData();
  const { nodeList } = useNodeList();
  const [currentTime, setCurrentTime] = React.useState(new Date().toLocaleTimeString());

  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (!nodeList || nodeList.length === 0) {
    return (
      <Flex className="items-center" direction="column" gap="4" p="4">
        <Text size="4" color="gray">
          No instances available
        </Text>
      </Flex>
    );
  }

  const onlineSet = new Set(live_data?.data?.online || []);

  return (
    <Flex direction="column" gap="4" p="4">
      <Card className="p-4">
        <Flex justify="between" align="center">
          <Text size="3" weight="bold">
            Instance List
          </Text>
          <Text size="2" color="gray">
            {currentTime}
          </Text>
        </Flex>
        <Flex gap="2" mt="2">
          <Text size="2" color="gray">
            Online: {onlineSet.size} / {nodeList.length}
          </Text>
        </Flex>
      </Card>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {nodeList.map((node) => {
          const isOnline = onlineSet.has(node.uuid);
          const liveData = live_data?.data?.data?.[node.uuid];

          return (
            <Link
              key={node.uuid}
              className="card-opacity-target rounded-lg border bg-card text-card-foreground shadow-sm cursor-pointer hover:shadow-lg transition-shadow"
              style={{ opacity: isOnline ? 1 : 0.7 }}
              to={`/instance/${node.uuid}`}
            >
              <Card className="border-0 bg-transparent">
                <Flex justify="between" align="start">
                  <Flex gap="2" align="center">
                    <Flag flag={node.region} />
                    <Text weight="bold" size="3">
                      {node.name}
                    </Text>
                  </Flex>
                  <Text size="1" color={isOnline ? "green" : "red"}>
                    {isOnline ? "Online" : "Offline"}
                  </Text>
                </Flex>

                <Flex direction="column" gap="1" mt="2">
                  <Flex justify="between">
                    <Text size="1" color="gray">
                      CPU
                    </Text>
                    <Text size="1">{liveData?.cpu?.usage?.toFixed(1) || 0}%</Text>
                  </Flex>
                  <Flex justify="between">
                    <Text size="1" color="gray">
                      RAM
                    </Text>
                    <Text size="1">
                      {liveData
                        ? `${formatBytes(liveData.ram?.used || 0)} / ${formatBytes(node.mem_total)}`
                        : "-"}
                    </Text>
                  </Flex>
                  <Flex justify="between">
                    <Text size="1" color="gray">
                      Network
                    </Text>
                    <Text size="1">
                      ↑ {formatBytes(liveData?.network?.up || 0)}/s ↓{" "}
                      {formatBytes(liveData?.network?.down || 0)}/s
                    </Text>
                  </Flex>
                </Flex>
              </Card>
            </Link>
          );
        })}
      </div>
    </Flex>
  );
};

export default InstanceList;
