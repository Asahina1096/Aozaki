<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import { getAPIOrigin } from "@/lib/api";
  import { createPollingStatsStore } from "@/lib/stores";
  import type { ServerStats } from "@/lib/types/serverstatus";
  import { formatRelativeTime } from "@/lib/utils";
  import ServerListSkeleton from "./ServerListSkeleton.svelte";
  import ServerOverview from "./ServerOverview.svelte";
  import SimpleServerGrid from "./SimpleServerGrid.svelte";

  const DEFAULT_REFRESH_INTERVAL = 2000; // 默认刷新间隔（毫秒）

  interface Props {
    refreshInterval?: number;
  }

  let { refreshInterval = DEFAULT_REFRESH_INTERVAL }: Props = $props();

  // 创建轮询 store
  const pollingStore = createPollingStatsStore({
    refreshInterval,
    enabled: true,
  });

  // 从 store 解构响应式值
  const stats = pollingStore.stats;
  const loading = pollingStore.loading;
  const error = pollingStore.error;
  const isRetrying = pollingStore.isRetrying;

  // 相对时间显示
  let relativeTime = $state("");
  let relativeTimeInterval: ReturnType<typeof setInterval>;

  // 更新相对时间
  $effect(() => {
    const statsValue = $stats;
    if (statsValue) {
      const lastFetchTime = Date.now(); // 简化：使用当前时间
      relativeTime = formatRelativeTime(lastFetchTime);

      // 清除旧的定时器
      if (relativeTimeInterval) {
        clearInterval(relativeTimeInterval);
      }

      // 每秒更新一次相对时间
      relativeTimeInterval = setInterval(() => {
        relativeTime = formatRelativeTime(lastFetchTime);
      }, 1000);
    }
  });

  // 预加载 API 资源（性能优化）
  onMount(() => {
    const apiOrigin = getAPIOrigin();
    if (apiOrigin && typeof document !== "undefined") {
      // 使用原生 link 标签实现 preconnect 和 dns-prefetch
      const prefetchLink = document.createElement("link");
      prefetchLink.rel = "dns-prefetch";
      prefetchLink.href = apiOrigin;
      document.head.appendChild(prefetchLink);

      const preconnectLink = document.createElement("link");
      preconnectLink.rel = "preconnect";
      preconnectLink.href = apiOrigin;
      document.head.appendChild(preconnectLink);
    }
  });

  // 清理
  onDestroy(() => {
    if (relativeTimeInterval) {
      clearInterval(relativeTimeInterval);
    }
    pollingStore.destroy();
  });

  // 当前服务器列表
  const currentServers = $derived($stats?.servers || []);

  // 乐观更新：保持显示当前数据
  let optimisticServers = $state<ServerStats[]>([]);

  $effect(() => {
    if (currentServers.length > 0) {
      optimisticServers = currentServers;
    }
  });

  // 开发环境：验证 name 字段的唯一性
  if (import.meta.env.DEV) {
    $effect(() => {
      if (currentServers.length > 0) {
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
    });
  }

  // 搜索过滤状态
  let searchQuery = $state("");
  let deferredSearchQuery = $state("");

  // 使用 $effect 实现 debounce - 必须在 $effect 主体中读取 searchQuery
  $effect(() => {
    const currentQuery = searchQuery; // 在这里读取，确保被追踪
    const timeoutId = setTimeout(() => {
      deferredSearchQuery = currentQuery;
    }, 150);

    return () => clearTimeout(timeoutId);
  });

  // 排序：在线优先，然后按权重排序
  const sortedServers = $derived.by(() => {
    return [...optimisticServers].sort((a, b) => {
      const aOnline = a.online4 || a.online6 ? 1 : 0;
      const bOnline = b.online4 || b.online6 ? 1 : 0;
      if (aOnline !== bOnline) return bOnline - aOnline;
      return (b.weight || 0) - (a.weight || 0);
    });
  });

  // 按别名或位置过滤服务器
  const filteredServers = $derived.by(() => {
    if (!deferredSearchQuery.trim()) {
      return sortedServers;
    }
    const query = deferredSearchQuery.toLowerCase().trim();
    return sortedServers.filter(
      (server) =>
        server.alias?.toLowerCase().includes(query) ||
        server.location?.toLowerCase().includes(query)
    );
  });

  const hasServers = $derived(currentServers.length > 0);
  const isSearchPending = $derived(searchQuery !== deferredSearchQuery);
</script>

<!-- 初始加载或无数据时显示骨架屏 -->
{#if $loading && !hasServers}
  <ServerListSkeleton />
{:else if !hasServers}
  <div class="flex flex-col items-center justify-center py-12 text-center">
    <p class="text-lg font-semibold text-muted-foreground">
      {$error ? "无法加载节点数据" : "暂无节点数据"}
    </p>
    <p class="mt-2 text-sm text-muted-foreground">
      {$error?.message || "请稍后再试。"}
    </p>
    {#if $error}
      <button
        type="button"
        onclick={pollingStore.retry}
        disabled={$isRetrying}
        aria-busy={$isRetrying}
        aria-label={$isRetrying ? "正在重试连接服务器" : "重试连接服务器"}
        class="mt-4 rounded-lg bg-primary px-4 py-2 text-primary-foreground shadow-sm disabled:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        {$isRetrying ? "重试中..." : "重试"}
      </button>
    {/if}
  </div>
{:else}
  <div class="space-y-6">
    {#if $error}
      <div
        class="rounded-2xl border border-destructive/20 bg-destructive/10 backdrop-blur-sm p-4 text-sm text-destructive shadow-sm"
      >
        <p>数据刷新失败：{$error.message || "请稍后再试。"}</p>
        <button
          type="button"
          onclick={pollingStore.retry}
          disabled={$isRetrying}
          aria-busy={$isRetrying}
          aria-label={$isRetrying ? "正在重新获取数据" : "重新获取服务器数据"}
          class="mt-3 inline-flex items-center rounded-lg border border-destructive/20 backdrop-blur-sm px-3 py-1.5 text-sm font-medium disabled:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          {$isRetrying ? "重试中..." : "重新获取数据"}
        </button>
      </div>
    {/if}
    <ServerOverview servers={optimisticServers} />
    <div
      class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
    >
      <div class="flex items-center gap-3">
        <span class="text-xl md:text-2xl font-bold text-primary">
          节点列表
        </span>
        <div class="relative">
          <input
            type="search"
            placeholder="搜索别名/位置..."
            bind:value={searchQuery}
            aria-label="搜索服务器（按别名或位置）"
            class="h-8 w-40 md:w-48 rounded-md border border-input bg-background px-3 text-sm placeholder:text-muted-foreground focus:outline-none"
          />
          {#if isSearchPending}
            <span
              class="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground"
              aria-label="正在搜索"
            >
              <svg
                class="animate-spin h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                />
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            </span>
          {/if}
        </div>
        {#if searchQuery}
          <span class="text-sm text-muted-foreground">
            {filteredServers.length}/{sortedServers.length}
          </span>
        {/if}
      </div>
      {#if relativeTime}
        <span class="text-sm text-muted-foreground">
          上次更新：{relativeTime}
        </span>
      {/if}
    </div>
    <SimpleServerGrid servers={filteredServers} />
  </div>
{/if}
