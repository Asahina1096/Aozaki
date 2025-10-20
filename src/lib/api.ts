import type { StatsResponse } from "./types/serverstatus";

/**
 * ServerStatus-Rust API 客户端
 */
export class ServerStatusAPI {
  private baseUrl: string;

  constructor(baseUrl?: string) {
    // 支持环境变量配置或直接传入
    this.baseUrl = baseUrl || import.meta.env.PUBLIC_API_URL || "";
  }

  /**
   * 获取服务器统计信息
   */
  async getStats(): Promise<StatsResponse> {
    const url = `${this.baseUrl}/json/stats.json`;
    const response = await fetch(url, {
      cache: "no-store", // 禁用缓存以获取最新数据
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch stats: ${response.status} ${response.statusText}`
      );
    }

    return response.json();
  }
}

/**
 * 获取共享的 API 客户端实例
 */
let sharedClient: ServerStatusAPI | null = null;

export function getAPIClient(baseUrl?: string): ServerStatusAPI {
  if (!sharedClient) {
    sharedClient = new ServerStatusAPI(baseUrl);
  }
  return sharedClient;
}
