import { useEffect, useMemo, useState } from "react";
import type { ServerStats } from "@/lib/types/serverstatus";
import { ServerCard } from "./ServerCard";

interface VirtualizedServerGridProps {
  servers: ServerStats[];
}

// 计算当前视口下的列数
function useResponsiveColumns() {
  const [columns, setColumns] = useState(() => {
    if (typeof window === "undefined") return 1;
    const width = window.innerWidth;
    if (width >= 1280) return 4;
    if (width >= 1024) return 3;
    if (width >= 768) return 2;
    return 1;
  });

  useEffect(() => {
    function updateColumns() {
      const width = window.innerWidth;
      if (width >= 1280) {
        setColumns(4);
      } else if (width >= 1024) {
        setColumns(3);
      } else if (width >= 768) {
        setColumns(2);
      } else {
        setColumns(1);
      }
    }

    // 使用防抖优化 resize 事件
    let timeoutId: number;
    const debouncedUpdate = () => {
      clearTimeout(timeoutId);
      timeoutId = window.setTimeout(updateColumns, 150);
    };

    window.addEventListener("resize", debouncedUpdate);
    return () => {
      window.removeEventListener("resize", debouncedUpdate);
      clearTimeout(timeoutId);
    };
  }, []);

  return columns;
}

export function VirtualizedServerGrid({ servers }: VirtualizedServerGridProps) {
  const columns = useResponsiveColumns();

  // 将服务器按行分组
  const rows = useMemo(() => {
    const result: ServerStats[][] = [];
    for (let i = 0; i < servers.length; i += columns) {
      result.push(servers.slice(i, i + columns));
    }
    return result;
  }, [servers, columns]);

  // 直接渲染所有行，无虚拟化
  return (
    <div className="space-y-6">
      {rows.map((row, rowIndex) => (
        <div
          key={rowIndex}
          className="grid gap-6"
          style={{
            gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
            contain: "layout style paint",
            contentVisibility: "auto",
          }}
        >
          {row.map((server) => (
            <ServerCard key={server.name} server={server} />
          ))}
        </div>
      ))}
    </div>
  );
}
