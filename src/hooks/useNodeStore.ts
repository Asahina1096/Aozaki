import { useState, useEffect, useCallback, useRef } from "react";
import { nodeStore } from "@/lib/nodeStore";
import type { Client, NodeStatus } from "@/lib/types/komari";

const normalizeError = (err: unknown): Error =>
  err instanceof Error ? err : new Error(String(err));

interface UseNodesDataResult {
  clients: Record<string, Client>;
  statuses: Record<string, NodeStatus>;
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

interface UseNodeDataResult {
  client: Client | null;
  status: NodeStatus | null;
  loading: boolean;
  notFound: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

// Hook：订阅所有节点数据
export function useNodesData(
  refreshInterval: number = 1000
): UseNodesDataResult {
  const [clients, setClients] = useState<Record<string, Client>>({});
  const [statuses, setStatuses] = useState<Record<string, NodeStatus>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const refresh = useCallback(async () => {
    if (!isMountedRef.current) return;
    setError(null);
    setLoading(true);
    try {
      await nodeStore.start(refreshInterval);
    } catch (err) {
      if (!isMountedRef.current) return;
      setError(normalizeError(err));
      setLoading(false);
    }
  }, [refreshInterval]);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout | null = null;
    let isActive = true;
    setError(null);

    const stopLoadingIfNeeded = () => {
      setLoading((prev) => (prev ? false : prev));
    };

    // 启动数据轮询
    void nodeStore.start(refreshInterval).catch((err) => {
      if (!isActive) return;
      setError(normalizeError(err));
      stopLoadingIfNeeded();
    });

    // 初始数据
    const initialClients = nodeStore.getClients();
    const initialStatuses = nodeStore.getStatuses();

    setClients((prev) => (prev === initialClients ? prev : initialClients));
    setStatuses((prev) => (prev === initialStatuses ? prev : initialStatuses));

    // 只有在真正有数据时才设置 loading 为 false
    const hasInitialData =
      Object.keys(initialClients).length > 0 ||
      Object.keys(initialStatuses).length > 0;
    if (hasInitialData) {
      stopLoadingIfNeeded();
    } else {
      // 如果没有初始数据，等待最多 2 秒
      timeoutId = setTimeout(() => {
        stopLoadingIfNeeded();
      }, 2000);
    }

    // 订阅更新
    const unsubscribe = nodeStore.subscribe(() => {
      const newClients = nodeStore.getClients();
      const newStatuses = nodeStore.getStatuses();
      setClients((prev) => (prev === newClients ? prev : newClients));
      setStatuses((prev) => (prev === newStatuses ? prev : newStatuses));

      // 收到数据后立即停止 loading（如果有超时定时器，清除它）
      const hasData =
        Object.keys(newClients).length > 0 ||
        Object.keys(newStatuses).length > 0;
      if (hasData) {
        if (timeoutId) {
          clearTimeout(timeoutId);
          timeoutId = null;
        }
        if (isActive) {
          stopLoadingIfNeeded();
        }
      }
    });

    // 清理
    return () => {
      isActive = false;
      if (timeoutId) clearTimeout(timeoutId);
      unsubscribe();
    };
  }, [refreshInterval]);

  return { clients, statuses, loading, error, refresh };
}

// Hook：订阅单个节点数据
export function useNodeData(
  uuid: string,
  refreshInterval: number = 1000,
  loadingTimeout: number = 3000
): UseNodeDataResult {
  const [client, setClient] = useState<Client | null>(null);
  const [status, setStatus] = useState<NodeStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const refresh = useCallback(async () => {
    if (!uuid || !isMountedRef.current) return;
    setError(null);
    setNotFound((prev) => (prev ? false : prev));
    setLoading(true);
    try {
      await nodeStore.start(refreshInterval);
    } catch (err) {
      if (!isMountedRef.current) return;
      setError(normalizeError(err));
      setLoading((prev) => (prev ? false : prev));
    }
  }, [refreshInterval, uuid]);

  useEffect(() => {
    if (!uuid) {
      setClient((prev) => (prev ? null : prev));
      setStatus((prev) => (prev ? null : prev));
      setLoading((prev) => (prev ? false : prev));
      setNotFound((prev) => (prev ? false : prev));
      setError((prev) => (prev ? null : prev));
      return;
    }

    // 重置状态
    setLoading(true);
    setNotFound(false);
    setError(null);

    // 启动数据轮询
    let isActive = true;
    void nodeStore.start(refreshInterval).catch((err) => {
      if (!isActive) return;
      setError(normalizeError(err));
      setLoading((prev) => (prev ? false : prev));
    });

    // 用于追踪清理资源的引用
    const cleanupRefs: {
      timeoutId: NodeJS.Timeout | null;
      unsubscribe: (() => void) | null;
    } = {
      timeoutId: null,
      unsubscribe: null,
    };

    const stopLoadingIfNeeded = () => {
      setLoading((prev) => (prev ? false : prev));
    };

    const updateClientState = (
      nextClient: Client | null,
      nextStatus: NodeStatus | null
    ) => {
      setClient((prev) => (prev === nextClient ? prev : nextClient));
      setStatus((prev) => (prev === nextStatus ? prev : nextStatus));
    };

    // 初始数据
    const initialClient = nodeStore.getClient(uuid);
    const initialStatus = nodeStore.getStatus(uuid);

    if (initialClient) {
      // 如果立即找到数据，直接设置
      updateClientState(initialClient, initialStatus);
      stopLoadingIfNeeded();
    } else {
      // 如果没有立即找到数据，设置超时检查
      cleanupRefs.timeoutId = setTimeout(() => {
        const currentClient = nodeStore.getClient(uuid);
        if (!currentClient) {
          // 超时后仍未找到节点，标记为不存在
          setNotFound((prev) => (prev ? prev : true));
        }
        stopLoadingIfNeeded();
      }, loadingTimeout);
    }

    // 统一的订阅更新处理
    const handleUpdate = () => {
      const currentClient = nodeStore.getClient(uuid);
      const currentStatus = nodeStore.getStatus(uuid);

      updateClientState(currentClient, currentStatus);

      if (currentClient) {
        if (cleanupRefs.timeoutId) {
          clearTimeout(cleanupRefs.timeoutId);
          cleanupRefs.timeoutId = null;
        }
        setNotFound((prev) => (prev ? false : prev));
        stopLoadingIfNeeded();
      }
    };

    // 订阅更新
    cleanupRefs.unsubscribe = nodeStore.subscribe(handleUpdate);

    return () => {
      isActive = false;
      if (cleanupRefs.timeoutId) {
        clearTimeout(cleanupRefs.timeoutId);
      }
      if (cleanupRefs.unsubscribe) {
        cleanupRefs.unsubscribe();
      }
    };
  }, [uuid, refreshInterval, loadingTimeout]);

  return { client, status, loading, notFound, error, refresh };
}
