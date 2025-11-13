import type { StatsResponse } from "./types/serverstatus";

/**
 * API 默认超时时间（毫秒）
 */
const DEFAULT_API_TIMEOUT = 10000; // 10秒

/**
 * ServerStatus-Rust API 客户端
 */
export class ServerStatusAPI {
  private baseUrl: string;

  constructor(baseUrl?: string) {
    // 优先使用传入的 baseUrl，否则使用环境变量
    const url = baseUrl || import.meta.env.PUBLIC_API_URL?.replace(/\/+$/, "");

    if (!url) {
      throw new Error(
        "API URL is not configured. Please set PUBLIC_API_URL environment variable."
      );
    }

    this.baseUrl = url;
  }

  /**
   * 获取服务器统计信息
   * @param signal 可选的 AbortSignal，用于取消请求
   * @param timeout 请求超时时间（毫秒），默认 10 秒
   */
  async getStats(
    signal?: AbortSignal,
    timeout = DEFAULT_API_TIMEOUT
  ): Promise<StatsResponse> {
    const url = `${this.baseUrl}/json/stats.json`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    let detachParentAbort: (() => void) | undefined;

    if (signal) {
      if (signal.aborted) {
        controller.abort();
      } else {
        const handleAbort = () => {
          controller.abort();
        };
        signal.addEventListener("abort", handleAbort);
        detachParentAbort = () => {
          signal.removeEventListener("abort", handleAbort);
        };
      }
    }

    try {
      const response = await fetch(url, {
        cache: "no-store", // 禁用缓存以获取最新数据
        signal: controller.signal, // 同时支持外部取消与内部超时
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(
          `Failed to fetch stats: ${response.status} ${response.statusText}`
        );
      }

      return response.json();
    } catch (err) {
      clearTimeout(timeoutId);
      throw err;
    } finally {
      detachParentAbort?.();
    }
  }
}

/**
 * 获取共享的 API 客户端实例
 * 每个 baseUrl 对应一个独立的客户端实例
 */
const clientCache = new Map<string, ServerStatusAPI>();

export function getAPIClient(baseUrl?: string): ServerStatusAPI {
  const url = baseUrl || import.meta.env.PUBLIC_API_URL?.replace(/\/+$/, "");

  if (!url) {
    throw new Error(
      "API URL is not configured. Please set PUBLIC_API_URL environment variable."
    );
  }

  if (!clientCache.has(url)) {
    clientCache.set(url, new ServerStatusAPI(baseUrl));
  }

  return clientCache.get(url)!;
}
