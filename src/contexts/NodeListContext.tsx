import React from "react";
import { useRPC2Call } from "./RPC2Context";

export type NodeBasicInfo = {
  uuid: string;
  name: string;
  cpu_name: string;
  virtualization: string;
  arch: string;
  cpu_cores: number;
  os: string;
  kernel_version: string;
  gpu_name: string;
  region: string;
  mem_total: number;
  swap_total: number;
  disk_total: number;
  version: string;
  weight: number;
  price: number;
  tags: string;
  billing_cycle: number;
  currency: string;
  group: string;
  traffic_limit: number;
  traffic_limit_type: undefined | "sum" | "max" | "min" | "up" | "down";
  expired_at: string;
  created_at: string;
  updated_at: string;
  ipv4?: string; 
  ipv6?: string;
};

interface NodeListContextType {
  nodeList: NodeBasicInfo[] | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
}

const NodeListContext = React.createContext<NodeListContextType | undefined>(
  undefined
);

export const NodeListProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [nodeList, setNodeList] = React.useState<NodeBasicInfo[] | null>(null);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);
  const { call } = useRPC2Call();

  const refresh = () => {
    setError(null);
    call<{ uuid?: string }, Record<string, any>>("common:getNodes")
      .then((result) => {
        if (!result || typeof result !== "object") {
          setNodeList([]);
          return;
        }
        const list: NodeBasicInfo[] = Object.values(result).map((n: any) => ({
          uuid: n.uuid,
          name: n.name,
          cpu_name: n.cpu_name,
          virtualization: n.virtualization,
          arch: n.arch,
          cpu_cores: n.cpu_cores,
          os: n.os,
          kernel_version: n.kernel_version,
          gpu_name: n.gpu_name,
          region: n.region,
          mem_total: n.mem_total,
          swap_total: n.swap_total,
          disk_total: n.disk_total,
          version: n.version ?? "",
          weight: n.weight ?? 0,
          price: n.price ?? 0,
          tags: n.tags ?? "",
          billing_cycle: n.billing_cycle ?? 0,
          currency: n.currency ?? "",
          group: n.group ?? "",
          traffic_limit: n.traffic_limit ?? 0,
          traffic_limit_type: n.traffic_limit_type,
          expired_at: n.expired_at ?? "",
          created_at: n.created_at ?? "",
          updated_at: n.updated_at ?? "",
          ipv4: n.ipv4,
          ipv6: n.ipv6,
        }));
        setNodeList(list);
      })
      .catch((err: any) => {
        setError(err?.message || "An error occurred while fetching data");
        setNodeList([]);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  React.useEffect(() => {
    refresh();
  }, []);

  return (
    <NodeListContext.Provider value={{ nodeList, isLoading, error, refresh }}>
      {children}
    </NodeListContext.Provider>
  );
};

export const useNodeList = () => {
  const context = React.useContext(NodeListContext);
  if (!context) {
    throw new Error("useNodeList must be used within a NodeListProvider");
  }
  return context;
};