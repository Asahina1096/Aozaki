import { useCallback, useEffect, useRef, useState } from "react";
import { getAPIClient } from "./api";
import type { StatsResponse } from "./types/serverstatus";

/**
 * 自定义 Hook: 管理 AbortController 实例
 *
 * 提供创建、重置和自动清理 AbortController 的功能
 * 常用于取消 fetch 请求或其他异步操作
 *
 * @returns {Object} 包含 controllerRef 和 reset 函数
 * @example
 * const { controllerRef, reset } = useAbortController();
 *
 * // 发起新请求前重置
 * const controller = reset();
 * fetch(url, { signal: controller.signal });
 */
export function useAbortController() {
  const controllerRef = useRef<AbortController | null>(null);

  /**
   * 重置 AbortController：中止旧请求并创建新实例
   * @returns {AbortController} 新的 AbortController 实例
   */
  const reset = useCallback(() => {
    // 如果存在旧的 controller，先中止它
    if (controllerRef.current) {
      controllerRef.current.abort();
    }
    // 创建新的 controller
    const newController = new AbortController();
    controllerRef.current = newController;
    return newController;
  }, []);

  // 组件卸载时自动清理
  useEffect(() => {
    return () => {
      if (controllerRef.current) {
        controllerRef.current.abort();
      }
    };
  }, []);

  return { controllerRef, reset };
}

/**
 * 自定义 Hook: 智能轮询服务器统计数据
 *
 * 提供自动数据获取、轮询、错误处理和智能暂停/恢复功能
 * - 初始数据加载
 * - 可配置的轮询间隔
 * - 页面不可见或失焦时自动暂停轮询
 * - 恢复时智能决定是否立即刷新（基于距离上次请求的时间）
 * - 自动管理 AbortController 以取消过时的请求
 *
 * @param {Object} options - 配置选项
 * @param {number} options.refreshInterval - 轮询间隔（毫秒），默认 2000ms
 * @param {boolean} options.enabled - 是否启用轮询，默认 true
 * @returns {Object} 包含 stats、loading、error、isRetrying 和 retry 函数
 *
 * @example
 * const { stats, loading, error, retry } = usePollingStats({
 *   refreshInterval: 2000,
 *   enabled: true
 * });
 */
export function usePollingStats(options: {
  refreshInterval?: number;
  enabled?: boolean;
}) {
  const { refreshInterval = 2000, enabled = true } = options;
  const { reset: resetAbortController } = useAbortController();
  const statsRef = useRef<StatsResponse | null>(null);
  const lastFetchTimeRef = useRef<number>(0);
  const isFetchingRef = useRef<boolean>(false); // 防重入标志

  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const [isPageVisible, setIsPageVisible] = useState(
    typeof document !== "undefined" ? !document.hidden : true
  );
  const [hasFocus, setHasFocus] = useState(
    typeof document !== "undefined" ? document.hasFocus() : true
  );

  // 获取服务器数据的函数
  const fetchServers = useCallback(
    async (signal?: AbortSignal): Promise<StatsResponse | null> => {
      try {
        const client = getAPIClient();
        const data = await client.getStats(signal);
        setStats(data);
        setError(null);
        lastFetchTimeRef.current = Date.now();
        return data;
      } catch (err) {
        // 如果请求被取消，不更新状态
        if (err instanceof Error && err.name === "AbortError") {
          return null;
        }
        // 其他错误设置错误状态
        setError(err instanceof Error ? err : new Error("未知错误"));
        throw err;
      }
    },
    []
  );

  // 安全的数据获取包装器：用于定时器等不需要手动处理错误的场景
  // 带有防重入保护，避免多个触发点同时发起请求
  const safeFetch = useCallback(
    async (signal?: AbortSignal): Promise<void> => {
      // 防重入：如果当前正在请求，则跳过
      if (isFetchingRef.current) return;

      isFetchingRef.current = true;
      try {
        await fetchServers(signal);
      } catch {
        // 错误已由 fetchServers 设置到 error 状态，静默处理
      } finally {
        isFetchingRef.current = false;
      }
    },
    [fetchServers]
  );

  // 手动重试函数
  const retry = useCallback(() => {
    // 防重入：如果当前正在请求，则跳过
    if (isFetchingRef.current) return;

    const abortController = resetAbortController();
    setIsRetrying(true);
    setLoading(true);
    isFetchingRef.current = true;

    fetchServers(abortController.signal)
      .catch(() => {
        // 错误状态由 fetchServers 负责
      })
      .finally(() => {
        isFetchingRef.current = false;
        setIsRetrying(false);
        setLoading(false);
      });
  }, [fetchServers, resetAbortController]);

  // 同步 stats 到 ref，确保事件处理器总是访问最新值
  useEffect(() => {
    statsRef.current = stats;
  }, [stats]);

  // 初始数据加载
  useEffect(() => {
    if (!enabled) return;
    // 防重入：如果当前正在请求，则跳过
    if (isFetchingRef.current) return;

    const abortController = resetAbortController();
    setLoading(true);
    isFetchingRef.current = true;

    fetchServers(abortController.signal)
      .then(() => {
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      })
      .finally(() => {
        isFetchingRef.current = false;
      });
  }, [enabled, fetchServers, resetAbortController]);

  // 监听页面可见性变化和窗口焦点变化
  useEffect(() => {
    const handleVisibilityChange = () => {
      const visible = !document.hidden;
      setIsPageVisible(visible);
    };

    const handleFocus = () => {
      setHasFocus(true);
    };

    const handleBlur = () => {
      setHasFocus(false);
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleFocus);
    window.addEventListener("blur", handleBlur);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("blur", handleBlur);
    };
  }, []);

  // 智能恢复：页面可见且获得焦点时，根据距离上次请求的时间决定是否立即刷新
  useEffect(() => {
    if (!enabled) return;
    // 只有在页面可见且有焦点时才触发
    if (!isPageVisible || !hasFocus) return;
    // 必须有初始数据才执行恢复逻辑
    if (!statsRef.current) return;

    const timeSinceLastFetch = Date.now() - lastFetchTimeRef.current;
    const threshold = refreshInterval * 2;

    // 如果距离上次请求时间过长，立即请求
    if (timeSinceLastFetch > threshold) {
      const abortController = resetAbortController();
      safeFetch(abortController.signal);
    }
    // 否则什么都不做，等待正常的定时轮询
  }, [
    enabled,
    isPageVisible,
    hasFocus,
    refreshInterval,
    safeFetch,
    resetAbortController,
  ]);

  // 定时刷新（仅在初始数据加载完成后启动，且页面可见+有焦点时才刷新）
  useEffect(() => {
    if (!enabled) return;
    if (refreshInterval <= 0) return;
    if (!stats) return; // 如果还没有初始数据，不启动定时刷新
    if (!isPageVisible || !hasFocus) return; // 页面不可见或失焦时不刷新

    const interval = setInterval(() => {
      // 重置 AbortController（自动中止旧请求）
      const abortController = resetAbortController();

      // 获取新数据
      safeFetch(abortController.signal);
    }, refreshInterval);

    return () => {
      clearInterval(interval);
    };
  }, [
    enabled,
    refreshInterval,
    stats,
    isPageVisible,
    hasFocus,
    safeFetch,
    resetAbortController,
  ]);

  return {
    stats,
    loading,
    error,
    isRetrying,
    retry,
    lastFetchTime: lastFetchTimeRef.current,
  };
}
