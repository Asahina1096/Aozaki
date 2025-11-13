/**
 * Vercel Edge Function for proxying ServerStatus-Rust API
 * This function caches responses server-side and protects the backend URL
 * It also processes data (sorting, statistics) to reduce client-side computation
 */

import type {
  ProcessedStatsResponse,
  ServerStats,
  StatsOverview,
  StatsResponse,
} from "../src/lib/types/serverstatus.js";

/**
 * 缓存配置
 */
const CACHE_TTL = 2000; // 2秒缓存时间（毫秒）
const UPSTREAM_TIMEOUT = 10000; // 上游请求超时时间（毫秒）

/**
 * 从上游 ServerStatus-Rust 获取并处理数据
 * 注意：HTTP 级别的缓存通过 Cache-Control 响应头实现
 * Vercel CDN 和浏览器会缓存响应，无需模块级缓存
 */
async function fetchAndProcessStats(): Promise<string> {
  // 从上游获取数据
  const rawData = await fetchUpstreamStats();

  // 处理数据：排序 + 计算统计
  const processedData = processStatsData(rawData);

  // 序列化为 JSON 字符串
  return JSON.stringify(processedData);
}

/**
 * 排序服务器：在线优先，然后按权重排序
 */
function sortServers(servers: ServerStats[]): ServerStats[] {
  return [...servers].sort((a, b) => {
    const aOnline = a.online4 || a.online6 ? 1 : 0;
    const bOnline = b.online4 || b.online6 ? 1 : 0;
    if (aOnline !== bOnline) return bOnline - aOnline;
    return (b.weight || 0) - (a.weight || 0);
  });
}

/**
 * 计算统计概览数据
 */
function calculateOverview(servers: ServerStats[]): StatsOverview {
  const stats = servers.reduce(
    (acc, s) => {
      const isOnline = s.online4 || s.online6;
      if (isOnline) {
        acc.onlineCount++;
        acc.totalCpu += s.cpu;
      }
      // 保持与原 ServerOverview 相同的映射关系，确保向后兼容
      acc.totalRealtimeDownload += s.network_rx;
      acc.totalRealtimeUpload += s.network_tx;
      acc.totalDataDownloaded += s.network_in;
      acc.totalDataUploaded += s.network_out;
      return acc;
    },
    {
      onlineCount: 0,
      totalCpu: 0,
      totalRealtimeDownload: 0,
      totalRealtimeUpload: 0,
      totalDataDownloaded: 0,
      totalDataUploaded: 0,
    }
  );

  const totalServers = servers.length;
  const onlineServers = stats.onlineCount;
  const offlineServers = totalServers - onlineServers;

  // 计算平均CPU使用率（仅在线节点）
  const avgCpu =
    stats.onlineCount > 0
      ? Math.round((stats.totalCpu / stats.onlineCount) * 10) / 10
      : 0;

  return {
    totalServers,
    onlineServers,
    offlineServers,
    avgCpu,
    totalRealtimeUpload: stats.totalRealtimeUpload,
    totalRealtimeDownload: stats.totalRealtimeDownload,
    totalDataUploaded: stats.totalDataUploaded,
    totalDataDownloaded: stats.totalDataDownloaded,
  };
}

/**
 * 处理原始数据：排序 + 计算统计
 */
function processStatsData(rawData: StatsResponse): ProcessedStatsResponse {
  const sortedServers = sortServers(rawData.servers);
  const overview = calculateOverview(rawData.servers);

  return {
    updated: rawData.updated,
    servers: sortedServers,
    overview,
  };
}

/**
 * 从上游 ServerStatus-Rust 获取数据
 */
async function fetchUpstreamStats(): Promise<StatsResponse> {
  const upstreamUrl = process.env.PUBLIC_API_URL;

  if (!upstreamUrl) {
    throw new Error(
      "PUBLIC_API_URL is not configured in environment variables"
    );
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), UPSTREAM_TIMEOUT);

  try {
    const response = await fetch(`${upstreamUrl}/json/stats.json`, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Aozaki/1.0",
      },
    });

    if (!response.ok) {
      throw new Error(
        `Upstream API error: ${response.status} ${response.statusText}`
      );
    }

    return await response.json();
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Vercel Edge Function Handler
 * GET /api/stats - 获取服务器统计信息
 */
export default async function handler(request: Request): Promise<Response> {
  // 只允许 GET 请求
  if (request.method !== "GET") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
      },
    });
  }

  try {
    const stats = await fetchAndProcessStats();

    return new Response(stats, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        // 禁用浏览器缓存，确保始终从 CDN 获取最新数据
        "Cache-Control": "no-store",
        // Vercel CDN 缓存：所有 Edge 节点共享，缓存 2 秒
        // 这是唯一的缓存层，保护上游服务器
        "CDN-Cache-Control": `public, s-maxage=${Math.floor(CACHE_TTL / 1000)}`,
      },
    });
  } catch (error) {
    console.error("Failed to fetch stats:", error);

    return new Response(
      JSON.stringify({
        error: "Failed to fetch server statistics",
        message: error instanceof Error ? error.message : "Unknown error",
        code: "UPSTREAM_ERROR",
        retryAfter: 5, // 建议客户端 5 秒后重试
        timestamp: Date.now(),
      }),
      {
        status: 502,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-store",
          "Retry-After": "5", // 标准 HTTP 重试头
        },
      }
    );
  }
}

// 配置为 Edge Runtime
export const config = {
  runtime: "edge",
};
