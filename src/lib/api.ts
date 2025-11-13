import type { ProcessedStatsResponse } from "./types/serverstatus";

/**
 * API 默认超时时间（毫秒）
 */
const DEFAULT_API_TIMEOUT = 10000; // 10秒

/**
 * ServerStatus API 客户端（通过 Vercel 云函数）
 * 返回云端处理后的数据（已排序 + 统计信息）
 */
export class ServerStatusAPI {
  private apiEndpoint: string;

  constructor(apiEndpoint?: string) {
    // 默认使用本地 API route，也支持自定义端点
    this.apiEndpoint = apiEndpoint || "/api/stats";
  }

  /**
   * 获取服务器统计信息（云端处理后）
   * @param signal 可选的 AbortSignal，用于取消请求
   * @param timeout 请求超时时间（毫秒），默认 10 秒
   */
  async getStats(
    signal?: AbortSignal,
    timeout = DEFAULT_API_TIMEOUT
  ): Promise<ProcessedStatsResponse> {
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
      const response = await fetch(this.apiEndpoint, {
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
 * 每个 endpoint 对应一个独立的客户端实例
 */
const clientCache = new Map<string, ServerStatusAPI>();

export function getAPIClient(apiEndpoint?: string): ServerStatusAPI {
  const endpoint = apiEndpoint || "/api/stats";

  if (!clientCache.has(endpoint)) {
    clientCache.set(endpoint, new ServerStatusAPI(endpoint));
  }

  return clientCache.get(endpoint)!;
}
