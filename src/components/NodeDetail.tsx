import { useState, useEffect } from "react";
import { Breadcrumb } from "./Breadcrumb";
import { NodeRealtimeCard } from "./NodeRealtimeCard";
import { NodeRealtimeCardSkeleton } from "./NodeRealtimeCardSkeleton";
import { ChartGroups } from "./charts/ChartGroups";
import { ChartGroupsSkeleton } from "./charts/ChartGroupsSkeleton";
import { useNodeData } from "@/hooks/useNodeStore";

interface NodeDetailProps {
  uuid: string;
}

export function NodeDetail({ uuid: propUuid }: NodeDetailProps) {
  // 从 URL 获取 UUID（优先使用 URL 参数）
  const [uuid, setUuid] = useState<string>("");

  // 从 URL 获取 UUID
  useEffect(() => {
    if (typeof window === "undefined") return;

    const urlParams = new URLSearchParams(window.location.search);
    const uuidFromUrl = urlParams.get("uuid") || propUuid;

    if (uuidFromUrl) {
      setUuid(uuidFromUrl);
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
  } = useNodeData(uuid, 1000, 3000);

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
