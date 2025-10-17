import { useState, useEffect, useCallback } from "react";

import { Breadcrumb } from "@/components/Breadcrumb";
import { NodeRealtimeCard } from "@/components/NodeRealtimeCard";
import { NodeRealtimeCardSkeleton } from "@/components/NodeRealtimeCardSkeleton";
import { ChartGroups } from "@/components/charts/ChartGroups";
import { ChartGroupsSkeleton } from "@/components/charts/ChartGroupsSkeleton";

import { useNodeData } from "@/hooks/useNodeStore";

interface NodeDetailProps {
  uuid?: string;
}

export function NodeDetail({ uuid: propUuid = "" }: NodeDetailProps) {
  // 从 URL 获取 UUID（优先使用 URL 参数）
  const [uuid, setUuid] = useState<string>(propUuid);

  // 从 URL 获取 UUID
  useEffect(() => {
    if (typeof window === "undefined") return;

    const urlParams = new URLSearchParams(window.location.search);
    const pathSegments = window.location.pathname.split("/").filter(Boolean);
    const uuidFromPath =
      pathSegments.length > 1 ? pathSegments[pathSegments.length - 1] : "";

    const rawUuid = urlParams.get("uuid") || uuidFromPath || propUuid || "";
    const normalizedUuid = rawUuid.trim();

    if (normalizedUuid && normalizedUuid !== "node") {
      setUuid((prev) => (prev === normalizedUuid ? prev : normalizedUuid));
    } else {
      // 如果没有 UUID，重定向到首页
      window.location.href = "/";
    }
  }, [propUuid]);

  // 使用全局数据管理器获取实时数据（3秒超时）
  const {
    client,
    status,
    loading: dataLoading,
    notFound,
    error,
    refresh,
  } = useNodeData(uuid, 1000, 3000);

  const handleRefresh = useCallback(() => {
    void refresh();
  }, [refresh]);

  // 加载中状态
  if (dataLoading || !uuid) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Breadcrumb nodeName="加载中..." />
        <NodeRealtimeCardSkeleton />
        <ChartGroupsSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Breadcrumb />
        <div className="rounded-lg border border-border bg-card px-6 py-12 text-center shadow-sm">
          <p className="text-lg font-semibold text-destructive">
            无法获取节点详情
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            {error.message || "请检查网络连接后重试。"}
          </p>
          <button
            type="button"
            onClick={handleRefresh}
            className="mt-4 inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            重试
          </button>
        </div>
      </div>
    );
  }

  // 节点不存在（超时后仍未找到）
  if (notFound || !client) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Breadcrumb />
        <div className="text-center py-12">
          <p className="text-destructive text-lg">节点不存在</p>
          <a
            href="/"
            className="mt-4 inline-block text-primary hover:underline"
          >
            返回首页
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* 面包屑导航 */}
      <Breadcrumb nodeName={client.name} />

      {/* 实时信息卡片 */}
      <NodeRealtimeCard client={client} status={status} />

      {/* 历史图表 - 每个图表独立控制时间范围 */}
      <ChartGroups uuid={uuid} />
    </div>
  );
}
