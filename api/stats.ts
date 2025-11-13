/**
 * Vercel Edge Function for proxying ServerStatus-Rust API
 * This function caches responses server-side and protects the backend URL
 * It also processes data (sorting, statistics) to reduce client-side computation
 */

/**
 * 缓存配置
 */
const CACHE_TTL = 5000; // 5秒缓存时间（毫秒）
const UPSTREAM_TIMEOUT = 10000; // 上游请求超时时间（毫秒）

/**
 * ServerStatus-Rust 类型定义
 */
interface ServerStats {
  name: string;
  alias?: string;
  type?: string;
  location?: string;
  online4: boolean;
  online6: boolean;
  uptime: string;
  load_1: number;
  load_5: number;
  load_15: number;
  cpu: number;
  memory_total: number;
  memory_used: number;
  swap_total: number;
  swap_used: number;
  hdd_total: number;
  hdd_used: number;
  network_rx: number;
  network_tx: number;
  network_in: number;
  network_out: number;
  last_network_in?: number;
  last_network_out?: number;
  monthstart?: number;
  labels?: string;
  custom?: string;
  gid?: string;
  weight?: number;
  disabled?: boolean;
  latest_ts?: number;
  si?: boolean;
  notify?: boolean;
  vnstat?: boolean;
  ping_10010?: number;
  ping_189?: number;
  ping_10086?: number;
  time_10010?: number;
  time_189?: number;
  time_10086?: number;
  tcp_count?: number;
  udp_count?: number;
  process_count?: number;
  thread_count?: number;
}

interface StatsResponse {
  updated: number;
  servers: ServerStats[];
}

interface StatsOverview {
  totalServers: number;
  onlineServers: number;
  offlineServers: number;
  avgCpu: number;
  totalRealtimeUpload: number;
  totalRealtimeDownload: number;
  totalDataUploaded: number;
  totalDataDownloaded: number;
}

interface ProcessedStatsResponse {
  updated: number;
  servers: ServerStats[];
  overview: StatsOverview;
}

/**
 * 缓存存储
 */
interface CacheEntry {
  data: string; // JSON string of ProcessedStatsResponse
  timestamp: number;
}

let cache: CacheEntry | null = null;

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
 * 获取缓存的数据（如果未过期）或从上游获取新数据
 */
async function getStats(): Promise<string> {
  const now = Date.now();

  // 检查缓存是否有效
  if (cache && now - cache.timestamp < CACHE_TTL) {
    return cache.data;
  }

  // 缓存过期或不存在，从上游获取新数据
  const rawData = await fetchUpstreamStats();

  // 处理数据：排序 + 计算统计
  const processedData = processStatsData(rawData);

  // 序列化为 JSON 字符串
  const dataString = JSON.stringify(processedData);

  // 更新缓存
  cache = {
    data: dataString,
    timestamp: now,
  };

  return dataString;
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
    const stats = await getStats();

    return new Response(stats, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        // 告诉浏览器可以缓存，但必须重新验证
        "Cache-Control": "public, max-age=0, must-revalidate",
        // Vercel Edge Cache: 缓存 5 秒
        "CDN-Cache-Control": `public, s-maxage=${Math.floor(CACHE_TTL / 1000)}`,
      },
    });
  } catch (error) {
    console.error("Failed to fetch stats:", error);

    return new Response(
      JSON.stringify({
        error: "Failed to fetch server statistics",
        message: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 502,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-store",
        },
      }
    );
  }
}

// 配置为 Edge Runtime
export const config = {
  runtime: "edge",
};
