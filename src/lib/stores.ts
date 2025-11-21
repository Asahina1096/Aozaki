import { writable, type Writable } from "svelte/store";
import { getAPIClient } from "./api";
import type { StatsResponse } from "./types/serverstatus";

/**
 * AbortController 管理器
 *
 * 提供创建、重置和自动清理 AbortController 的功能
 * 用于取消 fetch 请求或其他异步操作
 */
export class AbortControllerManager {
  private controller: AbortController | null = null;

  /**
   * 重置 AbortController：中止旧请求并创建新实例
   */
  reset(): AbortController {
    if (this.controller) {
      this.controller.abort();
    }
    this.controller = new AbortController();
    return this.controller;
  }

  /**
   * 中止当前控制器
   */
  abort(): void {
    if (this.controller) {
      this.controller.abort();
      this.controller = null;
    }
  }

  /**
   * 获取当前控制器
   */
  get current(): AbortController | null {
    return this.controller;
  }
}

/**
 * 轮询统计数据的 Store 接口
 */
export interface PollingStatsStore {
  stats: Writable<StatsResponse | null>;
  loading: Writable<boolean>;
  error: Writable<Error | null>;
  isRetrying: Writable<boolean>;
  retry: () => void;
  destroy: () => void;
}

/**
 * 创建智能轮询服务器统计数据的 Store
 *
 * 提供自动数据获取、轮询、错误处理和智能暂停/恢复功能
 * - 初始数据加载
 * - 可配置的轮询间隔
 * - 页面不可见或失焦时自动暂停轮询
 * - 恢复时智能决定是否立即刷新（基于距离上次请求的时间）
 * - 自动管理 AbortController 以取消过时的请求
 *
 * @example
 * const pollingStore = createPollingStatsStore({
 *   refreshInterval: 2000,
 *   enabled: true
 * });
 *
 * // 在组件中使用
 * $: stats = $pollingStore.stats;
 *
 * // 清理
 * onDestroy(() => pollingStore.destroy());
 */
export function createPollingStatsStore(options: {
  refreshInterval?: number;
  enabled?: boolean;
}): PollingStatsStore {
  const { refreshInterval = 2000, enabled = true } = options;

  // Stores
  const stats = writable<StatsResponse | null>(null);
  const loading = writable<boolean>(true);
  const error = writable<Error | null>(null);
  const isRetrying = writable<boolean>(false);

  // Internal state
  const abortManager = new AbortControllerManager();
  let statsValue: StatsResponse | null = null;
  let lastFetchTime = 0;
  let isFetching = false;
  let isPageVisible = typeof document !== "undefined" ? !document.hidden : true;
  let hasFocus = typeof document !== "undefined" ? document.hasFocus() : true;
  let pollingInterval: ReturnType<typeof setInterval> | null = null;

  // Subscribe to stats to keep internal value in sync
  stats.subscribe((value) => {
    statsValue = value;
  });

  /**
   * 获取服务器数据
   */
  async function fetchServers(
    signal?: AbortSignal
  ): Promise<StatsResponse | null> {
    try {
      const client = getAPIClient();
      const data = await client.getStats(signal);
      stats.set(data);
      error.set(null);
      lastFetchTime = Date.now();
      return data;
    } catch (err) {
      // 如果请求被取消，不更新状态
      if (err instanceof Error && err.name === "AbortError") {
        return null;
      }
      // 其他错误设置错误状态
      error.set(err instanceof Error ? err : new Error("未知错误"));
      throw err;
    }
  }

  /**
   * 安全的数据获取包装器：用于定时器等不需要手动处理错误的场景
   * 带有防重入保护，避免多个触发点同时发起请求
   */
  async function safeFetch(signal?: AbortSignal): Promise<void> {
    // 防重入：如果当前正在请求，则跳过
    if (isFetching) return;

    isFetching = true;
    try {
      await fetchServers(signal);
    } catch {
      // 错误已由 fetchServers 设置到 error 状态，静默处理
    } finally {
      isFetching = false;
    }
  }

  /**
   * 手动重试函数
   */
  function retry() {
    // 防重入：如果当前正在请求，则跳过
    if (isFetching) return;

    const abortController = abortManager.reset();
    isRetrying.set(true);
    loading.set(true);
    isFetching = true;

    fetchServers(abortController.signal)
      .catch(() => {
        // 错误状态由 fetchServers 负责
      })
      .finally(() => {
        isFetching = false;
        isRetrying.set(false);
        loading.set(false);
      });
  }

  /**
   * 启动轮询
   */
  function startPolling() {
    stopPolling();

    if (!enabled) return;
    if (refreshInterval <= 0) return;
    if (!statsValue) return;
    if (!isPageVisible || !hasFocus) return;

    pollingInterval = setInterval(() => {
      const abortController = abortManager.reset();
      safeFetch(abortController.signal);
    }, refreshInterval);
  }

  /**
   * 停止轮询
   */
  function stopPolling() {
    if (pollingInterval) {
      clearInterval(pollingInterval);
      pollingInterval = null;
    }
  }

  /**
   * 智能恢复：页面可见且获得焦点时，根据距离上次请求的时间决定是否立即刷新
   */
  function handleSmartResume() {
    if (!enabled) return;
    if (!isPageVisible || !hasFocus) return;
    if (!statsValue) return;

    const timeSinceLastFetch = Date.now() - lastFetchTime;
    const threshold = refreshInterval * 2;

    // 如果距离上次请求时间过长，立即请求
    if (timeSinceLastFetch > threshold) {
      const abortController = abortManager.reset();
      safeFetch(abortController.signal);
    }

    // 重启轮询
    startPolling();
  }

  /**
   * 处理可见性变化
   */
  function handleVisibilityChange() {
    isPageVisible = !document.hidden;
    if (isPageVisible && hasFocus) {
      handleSmartResume();
    } else {
      stopPolling();
    }
  }

  /**
   * 处理焦点获得
   */
  function handleFocus() {
    hasFocus = true;
    if (isPageVisible) {
      handleSmartResume();
    }
  }

  /**
   * 处理焦点失去
   */
  function handleBlur() {
    hasFocus = false;
    stopPolling();
  }

  /**
   * 初始化
   */
  function init() {
    // 初始数据加载
    if (enabled && !isFetching) {
      const abortController = abortManager.reset();
      loading.set(true);
      isFetching = true;

      fetchServers(abortController.signal)
        .then(() => {
          loading.set(false);
          // 初始数据加载完成后启动轮询
          startPolling();
        })
        .catch(() => {
          loading.set(false);
        })
        .finally(() => {
          isFetching = false;
        });
    }

    // 设置事件监听器
    if (typeof document !== "undefined") {
      document.addEventListener("visibilitychange", handleVisibilityChange);
      window.addEventListener("focus", handleFocus);
      window.addEventListener("blur", handleBlur);
    }
  }

  /**
   * 清理函数
   */
  function destroy() {
    stopPolling();
    abortManager.abort();

    if (typeof document !== "undefined") {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("blur", handleBlur);
    }
  }

  // 立即初始化
  init();

  return {
    stats,
    loading,
    error,
    isRetrying,
    retry,
    destroy,
  };
}
