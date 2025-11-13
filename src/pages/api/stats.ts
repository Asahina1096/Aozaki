import type { APIRoute } from "astro";
import type { StatsResponse } from "@/lib/types/serverstatus";

/**
 * 缓存配置
 */
const CACHE_TTL = 5000; // 5秒缓存时间（毫秒）
const UPSTREAM_TIMEOUT = 10000; // 上游请求超时时间（毫秒）

/**
 * 缓存存储
 */
interface CacheEntry {
  data: StatsResponse;
  timestamp: number;
}

let cache: CacheEntry | null = null;

/**
 * 从上游 ServerStatus-Rust 获取数据
 */
async function fetchUpstreamStats(): Promise<StatsResponse> {
  const upstreamUrl = import.meta.env.PUBLIC_API_URL;

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
async function getStats(): Promise<StatsResponse> {
  const now = Date.now();

  // 检查缓存是否有效
  if (cache && now - cache.timestamp < CACHE_TTL) {
    return cache.data;
  }

  // 缓存过期或不存在，从上游获取新数据
  const data = await fetchUpstreamStats();

  // 更新缓存
  cache = {
    data,
    timestamp: now,
  };

  return data;
}

/**
 * API Route Handler
 * GET /api/stats - 获取服务器统计信息
 */
export const GET: APIRoute = async () => {
  try {
    const stats = await getStats();

    return new Response(JSON.stringify(stats), {
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
};

// 配置 Vercel 云函数
export const config = {
  // 使用 Edge Runtime 以获得更快的冷启动和更低的延迟
  runtime: "edge",
};
