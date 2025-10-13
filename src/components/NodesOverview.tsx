import React from "react";
import { TotalNodesCard } from "./overview/TotalNodesCard";
import { AverageLoadCard } from "./overview/AverageLoadCard";
import { RealtimeNetworkCard } from "./overview/RealtimeNetworkCard";
import { NetworkStatsCard } from "./overview/NetworkStatsCard";
import type { Client, NodeStatus } from "@/lib/types/komari";

interface NodesOverviewProps {
  clients: Record<string, Client>;
  statuses: Record<string, NodeStatus>;
}

export function NodesOverview({ clients, statuses }: NodesOverviewProps) {
  const statusList = Object.values(statuses);

  const totalNodes = Object.keys(clients).length;
  const onlineNodes = statusList.filter((status) => status?.online).length;

  const computeAverage = (key: keyof NodeStatus) => {
    const values = statusList
      .map((status) => status?.[key])
      .filter((value): value is number => typeof value === "number");
    if (values.length === 0) return 0;
    const total = values.reduce((sum, value) => sum + value, 0);
    return total / values.length;
  };

  const averageLoad = {
    load1: computeAverage("load"),
    load5: computeAverage("load5"),
    load15: computeAverage("load15"),
  };

  const totalNet = statusList.reduce(
    (acc, status) => {
      return {
        netIn: acc.netIn + Math.max(status.net_in ?? 0, 0),
        netOut: acc.netOut + Math.max(status.net_out ?? 0, 0),
        netTotalUp: acc.netTotalUp + Math.max(status.net_total_up ?? 0, 0),
        netTotalDown:
          acc.netTotalDown + Math.max(status.net_total_down ?? 0, 0),
      };
    },
    { netIn: 0, netOut: 0, netTotalUp: 0, netTotalDown: 0 },
  );

  const offlineNodes = Math.max(totalNodes - onlineNodes, 0);

  return (
    <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      <TotalNodesCard
        total={totalNodes}
        online={onlineNodes}
        offline={offlineNodes}
      />
      <AverageLoadCard
        load1={averageLoad.load1}
        load5={averageLoad.load5}
        load15={averageLoad.load15}
      />
      <RealtimeNetworkCard upload={totalNet.netOut} download={totalNet.netIn} />
      <NetworkStatsCard
        totalUpload={totalNet.netTotalUp}
        totalDownload={totalNet.netTotalDown}
      />
    </div>
  );
}
