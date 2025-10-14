import { useState, useEffect } from "react";
import { Breadcrumb } from "./Breadcrumb";
import { NodeRealtimeCard } from "./NodeRealtimeCard";
import { ChartGroups } from "./charts/ChartGroups";
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

  // 使用全局数据管理器获取实时数据
  const { client, status, loading: dataLoading } = useNodeData(uuid);

  if (dataLoading || !uuid) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent motion-reduce:animate-[spin_1.5s_linear_infinite]" />
          <p className="mt-4 text-muted-foreground">加载中...</p>
        </div>
      </div>
    );
  }

  if (!client) {
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
