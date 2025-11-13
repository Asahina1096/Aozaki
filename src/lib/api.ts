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
    // 使用现代 AbortSignal API 简化超时处理
    // 如果浏览器不支持 AbortSignal.timeout，回退到传统方法
    let timeoutSignal: AbortSignal;
    let timeoutId: NodeJS.Timeout | undefined;

    if (typeof AbortSignal.timeout === "function") {
      // 现代浏览器：使用 AbortSignal.timeout (Chrome 103+, Firefox 115+)
      timeoutSignal = AbortSignal.timeout(timeout);
    } else {
      // 回退方案：使用 AbortController + setTimeout
      const controller = new AbortController();
      timeoutSignal = controller.signal;
      timeoutId = setTimeout(() => controller.abort(), timeout);
    }

    // 合并外部信号和超时信号
    let combinedSignal: AbortSignal;
    if (signal) {
      if (typeof AbortSignal.any === "function") {
        // 现代浏览器：使用 AbortSignal.any (Chrome 116+, Firefox 124+)
        combinedSignal = AbortSignal.any([signal, timeoutSignal]);
      } else {
        // 回退方案：手动处理信号合并
        const controller = new AbortController();
        combinedSignal = controller.signal;

        const handleAbort = () => controller.abort();
        if (signal.aborted) {
          controller.abort();
        } else {
          signal.addEventListener("abort", handleAbort, { once: true });
        }
        if (timeoutSignal.aborted) {
          controller.abort();
        } else {
          timeoutSignal.addEventListener("abort", handleAbort, { once: true });
        }
      }
    } else {
      combinedSignal = timeoutSignal;
    }

    try {
      const response = await fetch(this.apiEndpoint, {
        cache: "no-store", // 禁用缓存以获取最新数据
        signal: combinedSignal,
      });

      if (!response.ok) {
        throw new Error(
          `Failed to fetch stats: ${response.status} ${response.statusText}`
        );
      }

      return response.json();
    } finally {
      // 清理回退方案的 timeout
      if (timeoutId !== undefined) {
        clearTimeout(timeoutId);
      }
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
