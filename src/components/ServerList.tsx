import {
  useCallback,
  useEffect,
  useMemo,
  useOptimistic,
  useRef,
  useState,
  useTransition,
} from "react";
import { getAPIClient } from "@/lib/api";
import type {
  ProcessedStatsResponse,
  ServerStats,
  StatsOverview,
} from "@/lib/types/serverstatus";
import { ServerCard } from "./ServerCard";
import { ServerListSkeleton } from "./ServerListSkeleton";
import { ServerOverview } from "./ServerOverview";

const DEFAULT_REFRESH_INTERVAL = 2000; // 默认刷新间隔（毫秒）

interface ServerListProps {
  refreshInterval?: number; // 刷新间隔（毫秒）
}

export function ServerList({
  refreshInterval = DEFAULT_REFRESH_INTERVAL,
}: ServerListProps) {
  const abortControllerRef = useRef<AbortController | null>(null);
  const [, startTransition] = useTransition();

  // 使用 useState 存储数据
  const [stats, setStats] = useState<ProcessedStatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const [isPageVisible, setIsPageVisible] = useState(
    typeof document !== "undefined" ? !document.hidden : true
  );
  const [isMounted, setIsMounted] = useState(false);
  // 跟踪哪些服务器卡片已经可见过（用于动画）
  const [visibleCards, setVisibleCards] = useState<Set<string>>(new Set());
  const observerRef = useRef<IntersectionObserver | null>(null);
  // 跟踪已观察的元素，用于清理
  const observedElements = useRef<Map<string, HTMLDivElement>>(new Map());

  // 使用 ref 跟踪最新的 stats，避免闭包陷阱
  const statsRef = useRef<ProcessedStatsResponse | null>(stats);
  useEffect(() => {
    statsRef.current = stats;
  }, [stats]);

  // 组件挂载时触发淡入动画
  useEffect(() => {
    // 使用 requestAnimationFrame 确保 DOM 已渲染
    requestAnimationFrame(() => {
      setIsMounted(true);
    });
  }, []);

  // Intersection Observer 回调函数
  // 使用函数式更新避免依赖 visibleCards 状态，防止观察器重复创建
  const handleIntersection = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      setVisibleCards((prevVisibleCards) => {
        const newVisibleCards = new Set(prevVisibleCards);
        let hasChanges = false;

        for (const entry of entries) {
          if (entry.isIntersecting) {
            const cardName = entry.target.getAttribute("data-server-name");
            if (cardName && !newVisibleCards.has(cardName)) {
              newVisibleCards.add(cardName);
              hasChanges = true;
            }
          }
        }

        return hasChanges ? newVisibleCards : prevVisibleCards;
      });
    },
    [] // 无依赖，回调函数永不重建
  );

  // 设置 Intersection Observer
  useEffect(() => {
    // 使用较宽松的阈值，提前触发动画
    observerRef.current = new IntersectionObserver(handleIntersection, {
      rootMargin: "50px", // 提前50px触发
      threshold: 0.1, // 10% 可见即触发
    });

    return () => {
      observerRef.current?.disconnect();
    };
  }, [handleIntersection]);

  // 观察所有卡片元素
  const cardRef = useCallback((element: HTMLDivElement | null) => {
    if (element) {
      const serverName = element.getAttribute("data-server-name");
      if (serverName && observerRef.current) {
        // 如果该服务器已有观察的元素且不是同一个，先取消观察旧元素
        const existingElement = observedElements.current.get(serverName);
        if (existingElement && existingElement !== element) {
          observerRef.current.unobserve(existingElement);
        }
        // 观察新元素
        observerRef.current.observe(element);
        observedElements.current.set(serverName, element);
      }
    }
  }, []);

  // 获取服务器数据的函数
  // React Compiler 会自动优化函数引用，无需手动 useCallback
  async function fetchServers(signal?: AbortSignal) {
    try {
      const client = getAPIClient();
      const data = await client.getStats(signal);
      setStats(data);
      setError(null);
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
  }

  // 初始数据加载
  useEffect(() => {
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    setLoading(true);
    fetchServers(abortController.signal)
      .then(() => {
        setLoading(false);
      })
      .catch(() => {
        // 只有非 AbortError 才会到达这里
        setLoading(false);
        // 错误已经通过 fetchServers 设置到 error 状态
      });

    return () => {
      abortController.abort();
    };
  }, []);

  // 监听页面可见性变化
  useEffect(() => {
    const handleVisibilityChange = () => {
      const visible = !document.hidden;
      setIsPageVisible(visible);

      // 页面重新可见时平滑刷新数据
      if (visible && stats) {
        // 使用 transition 实现平滑过渡
        startTransition(() => {
          // 取消之前的请求
          if (abortControllerRef.current) {
            abortControllerRef.current.abort();
          }

          // 创建新的 AbortController
          const abortController = new AbortController();
          abortControllerRef.current = abortController;

          // 设置乐观状态为当前数据（使用 ref 访问最新值）
          const currentStats = statsRef.current;
          if (currentStats?.servers) {
            setOptimisticServers(currentStats.servers);
          }
          if (currentStats?.overview) {
            setOptimisticOverview(currentStats.overview);
          }

          // 获取新数据
          fetchServers(abortController.signal).catch(() => {
            // 错误已由 fetchServers 处理
          });
        });
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [stats]);

  // useOptimistic: 提供乐观更新的 UI 反馈
  // 在数据刷新期间保持显示当前数据，避免闪烁
  // 使用 useMemo 保持引用相等性，防止 useOptimistic 意外重置
  const currentServers = useMemo(() => stats?.servers || [], [stats?.servers]);

  const currentOverview = useMemo(
    () =>
      stats?.overview || {
        totalServers: 0,
        onlineServers: 0,
        offlineServers: 0,
        avgCpu: 0,
        totalRealtimeUpload: 0,
        totalRealtimeDownload: 0,
        totalDataUploaded: 0,
        totalDataDownloaded: 0,
      },
    [stats?.overview]
  );

  const [optimisticServers, setOptimisticServers] = useOptimistic(
    currentServers,
    (_currentServers, optimisticValue: ServerStats[]) => optimisticValue
  );

  const [optimisticOverview, setOptimisticOverview] = useOptimistic(
    currentOverview,
    (_currentOverview, optimisticValue: StatsOverview) => optimisticValue
  );

  // 清理不再存在的服务器的观察（防止内存泄漏）
  useEffect(() => {
    const currentServerNames = new Set(optimisticServers.map((s) => s.name));

    for (const [serverName, element] of observedElements.current.entries()) {
      if (!currentServerNames.has(serverName) && observerRef.current) {
        observerRef.current.unobserve(element);
        observedElements.current.delete(serverName);
      }
    }
  }, [optimisticServers]);

  // 定时刷新（仅在初始数据加载完成后启动，且页面可见时才刷新）
  useEffect(() => {
    if (refreshInterval <= 0) return;
    if (loading) return; // 如果还在初始加载，不启动定时刷新
    if (!isPageVisible) return; // 页面不可见时不刷新

    const interval = setInterval(() => {
      startTransition(() => {
        // 取消之前的请求
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }

        // 创建新的 AbortController
        const abortController = new AbortController();
        abortControllerRef.current = abortController;

        // 设置乐观状态为当前数据（使用 ref 访问最新值，避免闭包陷阱）
        const currentStats = statsRef.current;
        if (currentStats?.servers) {
          setOptimisticServers(currentStats.servers);
        }
        if (currentStats?.overview) {
          setOptimisticOverview(currentStats.overview);
        }

        // 获取新数据
        fetchServers(abortController.signal).catch(() => {
          // 只有非 AbortError 才会到达这里
          // 错误已经通过 fetchServers 设置到 error 状态
        });
      });
    }, refreshInterval);

    return () => {
      clearInterval(interval);
      // 清理定时器时，如果还有正在进行的请求，也一并取消
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
    };
  }, [refreshInterval, loading, isPageVisible]);

  // 开发环境：验证 name 字段的唯一性
  if (import.meta.env.DEV && currentServers.length > 0) {
    const names = currentServers.map((s) => s.name);
    const duplicates = names.filter(
      (name, index) => names.indexOf(name) !== index
    );
    if (duplicates.length > 0) {
      console.error(
        "⚠️ ServerList: 检测到重复的 server.name 值，这会导致 React key 警告:",
        [...new Set(duplicates)]
      );
      console.error(
        "受影响的服务器:",
        currentServers.filter((s) => duplicates.includes(s.name))
      );
    }
  }

  const hasServers = currentServers.length > 0;

  function handleRetry() {
    const abortController = new AbortController();
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = abortController;

    setIsRetrying(true);
    setLoading(true);

    fetchServers(abortController.signal)
      .catch(() => {
        // 错误状态由 fetchServers 负责
      })
      .finally(() => {
        setIsRetrying(false);
        setLoading(false);
      });
  }

  // 初始加载或无数据时显示骨架屏
  if (loading && !hasServers) {
    return <ServerListSkeleton />;
  }

  if (!hasServers) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-lg font-semibold text-muted-foreground">
          {error ? "无法加载节点数据" : "暂无节点数据"}
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          {error?.message || "请稍后再试。"}
        </p>
        {error && (
          <button
            type="button"
            onClick={handleRetry}
            disabled={isRetrying}
            className="mt-4 rounded-lg bg-primary px-4 py-2 text-primary-foreground shadow-sm disabled:opacity-70"
          >
            {isRetrying ? "重试中..." : "重试"}
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      className={`space-y-6 transition-opacity duration-700 ease-out ${
        isMounted ? "opacity-100" : "opacity-0"
      }`}
    >
      {error && (
        <div className="rounded-2xl border border-destructive/20 bg-destructive/10 backdrop-blur-sm p-4 text-sm text-destructive shadow-sm">
          <p>数据刷新失败：{error.message || "请稍后再试。"}</p>
          <button
            type="button"
            onClick={handleRetry}
            disabled={isRetrying}
            className="mt-3 inline-flex items-center rounded-lg border border-destructive/20 backdrop-blur-sm px-3 py-1.5 text-sm font-medium disabled:opacity-70"
          >
            {isRetrying ? "重试中..." : "重新获取数据"}
          </button>
        </div>
      )}
      <ServerOverview overview={optimisticOverview} />
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <span className="text-xl md:text-2xl font-bold text-primary">
          节点列表
        </span>
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {optimisticServers.map((server, index) => {
          const isVisible = visibleCards.has(server.name);
          // 前8个卡片（大约两行）使用固定延迟以展示初始加载效果
          // 其他卡片在滚动进入视口时立即显示
          const isInitialBatch = index < 8;
          const animationDelay = isInitialBatch ? `${index * 50}ms` : "0ms";

          return (
            <div
              key={server.name}
              ref={cardRef}
              data-server-name={server.name}
              className={`transition-all duration-500 ${
                isVisible ? "animate-fade-in-up" : "opacity-0"
              }`}
              style={{
                animationDelay: isVisible ? animationDelay : "0ms",
                animationFillMode: "forwards",
              }}
            >
              <ServerCard server={server} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
