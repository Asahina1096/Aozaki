import React, { useCallback } from "react";
import { toFiniteNumber, toOptionalString, toStringOr } from "@/lib/normalizers/primitives";
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

const TRAFFIC_LIMIT_TYPES = ["sum", "max", "min", "up", "down"] as const;
type TrafficLimitType = NodeBasicInfo["traffic_limit_type"];

function isTrafficLimitType(value: unknown): value is Exclude<TrafficLimitType, undefined> {
  return (
    typeof value === "string" &&
    TRAFFIC_LIMIT_TYPES.includes(value as (typeof TRAFFIC_LIMIT_TYPES)[number])
  );
}

function normalizeNodePayload(payload: NodePayload): NodeBasicInfo {
  const trafficLimitType = isTrafficLimitType(payload.traffic_limit_type)
    ? payload.traffic_limit_type
    : undefined;

  return {
    uuid: toStringOr(payload.uuid),
    name: toStringOr(payload.name),
    cpu_name: toStringOr(payload.cpu_name),
    virtualization: toStringOr(payload.virtualization),
    arch: toStringOr(payload.arch),
    cpu_cores: toFiniteNumber(payload.cpu_cores),
    os: toStringOr(payload.os),
    kernel_version: toStringOr(payload.kernel_version),
    gpu_name: toStringOr(payload.gpu_name),
    region: toStringOr(payload.region),
    mem_total: toFiniteNumber(payload.mem_total),
    swap_total: toFiniteNumber(payload.swap_total),
    disk_total: toFiniteNumber(payload.disk_total),
    version: toStringOr(payload.version),
    weight: toFiniteNumber(payload.weight),
    price: toFiniteNumber(payload.price),
    tags: toStringOr(payload.tags),
    billing_cycle: toFiniteNumber(payload.billing_cycle),
    currency: toStringOr(payload.currency),
    group: toStringOr(payload.group),
    traffic_limit: toFiniteNumber(payload.traffic_limit),
    traffic_limit_type: trafficLimitType,
    expired_at: toStringOr(payload.expired_at),
    created_at: toStringOr(payload.created_at),
    updated_at: toStringOr(payload.updated_at),
    ipv4: toOptionalString(payload.ipv4),
    ipv6: toOptionalString(payload.ipv6),
  };
}

interface NodeListContextType {
  nodeList: NodeBasicInfo[] | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
}

const NodeListContext = React.createContext<NodeListContextType | undefined>(undefined);

export const NodeListProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [nodeList, setNodeList] = React.useState<NodeBasicInfo[] | null>(null);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);
  const { call } = useRPC2Call();

  const refresh = useCallback(() => {
    setError(null);
    call<undefined, Record<string, NodePayload>>("common:getNodes")
      .then((result) => {
        if (!result || typeof result !== "object") {
          setNodeList([]);
          return;
        }
        const list: NodeBasicInfo[] = Object.values(result).map(normalizeNodePayload);
        setNodeList(list);
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "An error occurred while fetching data");
        setNodeList([]);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [call]);

  React.useEffect(() => {
    refresh();
  }, [refresh]);

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
