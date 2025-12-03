import type { StatsResponse } from "./types/serverstatus";

const DEFAULT_API_TIMEOUT = 10000;

export class ServerStatusAPI {
  private baseUrl: string;

  constructor(baseUrl?: string) {
    const url = baseUrl || import.meta.env.PUBLIC_API_URL?.replace(/\/+$/, "");

    if (!url) {
      throw new Error("API URL 未配置，请设置 PUBLIC_API_URL 环境变量");
    }

    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      throw new Error("API URL 必须是有效的 HTTP 或 HTTPS 地址");
    }

    this.baseUrl = url;
  }

  async getStats(
    signal?: AbortSignal,
    timeout = DEFAULT_API_TIMEOUT
  ): Promise<StatsResponse> {
    const url = `${this.baseUrl}/json/stats.json`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    let cleanup: (() => void) | undefined;

    if (signal) {
      if (signal.aborted) {
        controller.abort();
      } else {
        const handleAbort = () => controller.abort();
        signal.addEventListener("abort", handleAbort);
        cleanup = () => signal.removeEventListener("abort", handleAbort);
      }
    }

    try {
      const response = await fetch(url, {
        cache: "no-store",
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(
          `获取服务器统计数据失败：${response.status} ${response.statusText}`
        );
      }

      return response.json();
    } finally {
      clearTimeout(timeoutId);
      cleanup?.();
    }
  }
}

const clientCache = new Map<string, ServerStatusAPI>();

export function getAPIClient(baseUrl?: string): ServerStatusAPI {
  const url = baseUrl || import.meta.env.PUBLIC_API_URL?.replace(/\/+$/, "");

  if (!url) {
    throw new Error("API URL 未配置，请设置 PUBLIC_API_URL 环境变量");
  }

  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    throw new Error("API URL 必须是有效的 HTTP 或 HTTPS 地址");
  }

  if (!clientCache.has(url)) {
    clientCache.set(url, new ServerStatusAPI(baseUrl));
  }

  return clientCache.get(url)!;
}

export function getAPIOrigin(): string | null {
  try {
    const raw = import.meta.env.PUBLIC_API_URL?.replace(/\/+$/, "");
    if (!raw) return null;

    return new URL(raw).origin;
  } catch {
    return null;
  }
}
