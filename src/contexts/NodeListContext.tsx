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

type NodePayload = Partial<NodeBasicInfo> & Record<string, unknown>;

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
    call<undefined, Record<string, NodePayload>>("common:getNodes")
      .then((result) => {
        if (!result || typeof result !== "object") {
          setNodeList([]);
          return;
        }
        const list: NodeBasicInfo[] = Object.values(result).map((n) => ({
          uuid: typeof n.uuid === "string" ? n.uuid : "",
          name: typeof n.name === "string" ? n.name : "",
          cpu_name: typeof n.cpu_name === "string" ? n.cpu_name : "",
          virtualization:
            typeof n.virtualization === "string" ? n.virtualization : "",
          arch: typeof n.arch === "string" ? n.arch : "",
          cpu_cores: typeof n.cpu_cores === "number" ? n.cpu_cores : 0,
          os: typeof n.os === "string" ? n.os : "",
          kernel_version:
            typeof n.kernel_version === "string" ? n.kernel_version : "",
          gpu_name: typeof n.gpu_name === "string" ? n.gpu_name : "",
          region: typeof n.region === "string" ? n.region : "",
          mem_total: typeof n.mem_total === "number" ? n.mem_total : 0,
          swap_total: typeof n.swap_total === "number" ? n.swap_total : 0,
          disk_total: typeof n.disk_total === "number" ? n.disk_total : 0,
          version: typeof n.version === "string" ? n.version : "",
          weight: typeof n.weight === "number" ? n.weight : 0,
          price: typeof n.price === "number" ? n.price : 0,
          tags: typeof n.tags === "string" ? n.tags : "",
          billing_cycle:
            typeof n.billing_cycle === "number" ? n.billing_cycle : 0,
          currency: typeof n.currency === "string" ? n.currency : "",
          group: typeof n.group === "string" ? n.group : "",
          traffic_limit:
            typeof n.traffic_limit === "number" ? n.traffic_limit : 0,
          traffic_limit_type:
            n.traffic_limit_type === "sum" ||
            n.traffic_limit_type === "max" ||
            n.traffic_limit_type === "min" ||
            n.traffic_limit_type === "up" ||
            n.traffic_limit_type === "down"
              ? n.traffic_limit_type
              : undefined,
          expired_at: typeof n.expired_at === "string" ? n.expired_at : "",
          created_at: typeof n.created_at === "string" ? n.created_at : "",
          updated_at: typeof n.updated_at === "string" ? n.updated_at : "",
          ipv4: typeof n.ipv4 === "string" ? n.ipv4 : undefined,
          ipv6: typeof n.ipv6 === "string" ? n.ipv6 : undefined,
        }));
        setNodeList(list);
      })
      .catch((err: unknown) => {
        setError(
          err instanceof Error
            ? err.message
            : "An error occurred while fetching data"
        );
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
