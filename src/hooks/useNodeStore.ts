import { useState, useEffect } from "react";
import { nodeStore } from "@/lib/nodeStore";
import type { Client, NodeStatus } from "@/lib/types/komari";

// Hook：订阅所有节点数据
export function useNodesData(refreshInterval: number = 1000) {
  const [clients, setClients] = useState<Record<string, Client>>({});
  const [statuses, setStatuses] = useState<Record<string, NodeStatus>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout | null = null;

    // 启动数据轮询
    nodeStore.start(refreshInterval);

    // 初始数据
    const initialClients = nodeStore.getClients();
    const initialStatuses = nodeStore.getStatuses();

    setClients(initialClients);
    setStatuses(initialStatuses);

    // 只有在真正有数据时才设置 loading 为 false
    const hasInitialData =
      Object.keys(initialClients).length > 0 ||
      Object.keys(initialStatuses).length > 0;
    if (hasInitialData) {
      setLoading(false);
    } else {
      // 如果没有初始数据，等待最多 2 秒
      timeoutId = setTimeout(() => {
        setLoading(false);
      }, 2000);
    }

    // 订阅更新
    const unsubscribe = nodeStore.subscribe(() => {
      const newClients = nodeStore.getClients();
      const newStatuses = nodeStore.getStatuses();
      setClients(newClients);
      setStatuses(newStatuses);

      // 收到数据后立即停止 loading（如果有超时定时器，清除它）
      const hasData =
        Object.keys(newClients).length > 0 ||
        Object.keys(newStatuses).length > 0;
      if (hasData) {
        if (timeoutId) clearTimeout(timeoutId);
        setLoading(false);
      }
    });

    // 清理
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      unsubscribe();
    };
  }, [refreshInterval]);

  return { clients, statuses, loading };
}

// Hook：订阅单个节点数据
export function useNodeData(
  uuid: string,
  refreshInterval: number = 1000,
  loadingTimeout: number = 3000
) {
  const [client, setClient] = useState<Client | null>(null);
  const [status, setStatus] = useState<NodeStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!uuid) return;

    // 重置状态
    setLoading(true);
    setNotFound(false);

    // 启动数据轮询
    nodeStore.start(refreshInterval);

    // 初始数据
    const initialClient = nodeStore.getClient(uuid);
    const initialStatus = nodeStore.getStatus(uuid);

    if (initialClient) {
      // 如果立即找到数据，直接设置
      setClient(initialClient);
      setStatus(initialStatus);
      setLoading(false);
    } else {
      // 如果没有立即找到数据，设置超时检查
      const timeoutId = setTimeout(() => {
        const currentClient = nodeStore.getClient(uuid);
        if (!currentClient) {
          // 超时后仍未找到节点，标记为不存在
          setNotFound(true);
        }
        setLoading(false);
      }, loadingTimeout);

      // 订阅更新，如果在超时前收到数据，立即更新
      const unsubscribe = nodeStore.subscribe(() => {
        const currentClient = nodeStore.getClient(uuid);
        const currentStatus = nodeStore.getStatus(uuid);

        if (currentClient && loading) {
          // 找到数据了，清除超时并更新状态
          clearTimeout(timeoutId);
          setClient(currentClient);
          setStatus(currentStatus);
          setLoading(false);
          setNotFound(false);
        } else if (!loading) {
          // 已经加载完成，正常更新
          setClient(currentClient);
          setStatus(currentStatus);
        }
      });

      return () => {
        clearTimeout(timeoutId);
        unsubscribe();
      };
    }

    // 订阅更新（已有数据的情况）
    const unsubscribe = nodeStore.subscribe(() => {
      setClient(nodeStore.getClient(uuid));
      setStatus(nodeStore.getStatus(uuid));
    });

    // 清理
    return () => {
      unsubscribe();
    };
  }, [uuid, refreshInterval, loadingTimeout]);

  return { client, status, loading, notFound };
}
