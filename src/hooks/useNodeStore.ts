import { useState, useEffect } from "react";
import { nodeStore } from "@/lib/nodeStore";
import type { Client, NodeStatus } from "@/lib/types/komari";

// Hook：订阅所有节点数据
export function useNodesData(refreshInterval: number = 1000) {
  const [clients, setClients] = useState<Record<string, Client>>({});
  const [statuses, setStatuses] = useState<Record<string, NodeStatus>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 启动数据轮询
    nodeStore.start(refreshInterval);

    // 初始数据
    setClients(nodeStore.getClients());
    setStatuses(nodeStore.getStatuses());
    setLoading(false);

    // 订阅更新
    const unsubscribe = nodeStore.subscribe(() => {
      setClients(nodeStore.getClients());
      setStatuses(nodeStore.getStatuses());
    });

    // 清理
    return () => {
      unsubscribe();
    };
  }, [refreshInterval]);

  return { clients, statuses, loading };
}

// Hook：订阅单个节点数据
export function useNodeData(uuid: string, refreshInterval: number = 1000) {
  const [client, setClient] = useState<Client | null>(null);
  const [status, setStatus] = useState<NodeStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uuid) return;

    // 启动数据轮询
    nodeStore.start(refreshInterval);

    // 初始数据
    setClient(nodeStore.getClient(uuid));
    setStatus(nodeStore.getStatus(uuid));
    setLoading(false);

    // 订阅更新
    const unsubscribe = nodeStore.subscribe(() => {
      setClient(nodeStore.getClient(uuid));
      setStatus(nodeStore.getStatus(uuid));
    });

    // 清理
    return () => {
      unsubscribe();
    };
  }, [uuid, refreshInterval]);

  return { client, status, loading };
}
