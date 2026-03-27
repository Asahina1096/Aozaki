import React, { useCallback, useMemo, useRef } from "react";
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

function isSameNodeInfo(prev: NodeBasicInfo, next: NodeBasicInfo): boolean {
  return (
    prev.uuid === next.uuid &&
    prev.name === next.name &&
    prev.cpu_name === next.cpu_name &&
    prev.virtualization === next.virtualization &&
    prev.arch === next.arch &&
    prev.cpu_cores === next.cpu_cores &&
    prev.os === next.os &&
    prev.kernel_version === next.kernel_version &&
    prev.gpu_name === next.gpu_name &&
    prev.region === next.region &&
    prev.mem_total === next.mem_total &&
    prev.swap_total === next.swap_total &&
    prev.disk_total === next.disk_total &&
    prev.version === next.version &&
    prev.weight === next.weight &&
    prev.price === next.price &&
    prev.tags === next.tags &&
    prev.billing_cycle === next.billing_cycle &&
    prev.currency === next.currency &&
    prev.group === next.group &&
    prev.traffic_limit === next.traffic_limit &&
    prev.traffic_limit_type === next.traffic_limit_type &&
    prev.expired_at === next.expired_at &&
    prev.created_at === next.created_at &&
    prev.updated_at === next.updated_at &&
    prev.ipv4 === next.ipv4 &&
    prev.ipv6 === next.ipv6
  );
}

interface NodeListContextType {
  nodeList: NodeBasicInfo[] | null;
  nodeByUuid: ReadonlyMap<string, NodeBasicInfo>;
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
  const runningRef = useRef(false);
  const requestSeqRef = useRef(0);

  const refresh = useCallback(() => {
    if (runningRef.current) {
      return;
    }

    runningRef.current = true;
    const currentSeq = ++requestSeqRef.current;

    setError(null);
    call<undefined, Record<string, NodePayload>>("common:getNodes")
      .then((result) => {
        if (currentSeq !== requestSeqRef.current) {
          return;
        }

        if (!result || typeof result !== "object") {
          setNodeList((prev) => {
            if (prev !== null && prev.length === 0) {
              return prev;
            }
            return [];
          });
          return;
        }
        const list: NodeBasicInfo[] = Object.values(result).map(normalizeNodePayload);
        setNodeList((prev) => {
          if (prev === null) {
            return list;
          }

          const prevByUuid = new Map(prev.map((node) => [node.uuid, node]));
          let changed = prev.length !== list.length;

          const nextList = list.map((node) => {
            const prevNode = prevByUuid.get(node.uuid);
            if (prevNode && isSameNodeInfo(prevNode, node)) {
              return prevNode;
            }
            changed = true;
            return node;
          });

          return changed ? nextList : prev;
        });
      })
      .catch((err: unknown) => {
        if (currentSeq !== requestSeqRef.current) {
          return;
        }

        setError(err instanceof Error ? err.message : "An error occurred while fetching data");
        setNodeList((prev) => {
          if (prev !== null && prev.length === 0) {
            return prev;
          }
          return [];
        });
      })
      .finally(() => {
        if (currentSeq === requestSeqRef.current) {
          runningRef.current = false;
          setIsLoading(false);
        }
      });
  }, [call]);

  React.useEffect(() => {
    refresh();
  }, [refresh]);

  const nodeByUuid = useMemo(() => {
    if (!nodeList || nodeList.length === 0) {
      return new Map<string, NodeBasicInfo>();
    }

    return new Map(nodeList.map((node) => [node.uuid, node]));
  }, [nodeList]);

  const value = useMemo(
    () => ({ nodeList, nodeByUuid, isLoading, error, refresh }),
    [nodeList, nodeByUuid, isLoading, error, refresh],
  );

  return <NodeListContext.Provider value={value}>{children}</NodeListContext.Provider>;
};

export const useNodeList = () => {
  const context = React.useContext(NodeListContext);
  if (!context) {
    throw new Error("useNodeList must be used within a NodeListProvider");
  }
  return context;
};
