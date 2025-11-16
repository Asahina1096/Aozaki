import { useWindowVirtualizer } from "@tanstack/react-virtual";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { ServerStats } from "@/lib/types/serverstatus";
import { ServerCard } from "./ServerCard";

const ESTIMATED_ROW_HEIGHT = 420; // ServerCard ~400px + gap 24px
const VIRTUALIZER_OVERSCAN = 3; // Extra rows for smooth scrolling
const RESIZE_DEBOUNCE_MS = 150; // Debounce delay for resize events

interface VirtualizedServerGridProps {
  servers: ServerStats[];
}

// 计算当前视口下的列数
function useResponsiveColumns(): number {
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
    let timeoutId: ReturnType<typeof setTimeout>;
    const debouncedUpdate = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(updateColumns, RESIZE_DEBOUNCE_MS);
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
  const parentRef = useRef<HTMLDivElement>(null);
  const parentOffsetRef = useRef(0);

  // 计算容器相对于页面顶部的偏移量
  useLayoutEffect(() => {
    parentOffsetRef.current = parentRef.current?.offsetTop ?? 0;
  }, []);

  // 将服务器按行分组
  const rows = useMemo(() => {
    const result: ServerStats[][] = [];
    for (let i = 0; i < servers.length; i += columns) {
      result.push(servers.slice(i, i + columns));
    }
    return result;
  }, [servers, columns]);

  // 配置窗口虚拟化器
  const rowVirtualizer = useWindowVirtualizer({
    count: rows.length,
    estimateSize: () => ESTIMATED_ROW_HEIGHT,
    overscan: VIRTUALIZER_OVERSCAN,
    scrollMargin: parentOffsetRef.current,
    measureElement:
      typeof window !== "undefined" &&
      navigator.userAgent.indexOf("Firefox") === -1
        ? (element) => element?.getBoundingClientRect().height
        : undefined,
  });

  const virtualItems = rowVirtualizer.getVirtualItems();

  return (
    <div ref={parentRef} className="w-full">
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: "100%",
          position: "relative",
        }}
      >
        {virtualItems.map((virtualRow) => {
          const row = rows[virtualRow.index];
          return (
            <div
              key={virtualRow.key}
              data-index={virtualRow.index}
              ref={rowVirtualizer.measureElement}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                transform: `translateY(${virtualRow.start - rowVirtualizer.options.scrollMargin}px)`,
              }}
            >
              <div
                className="grid gap-6 pb-6"
                style={{
                  gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
                }}
              >
                {row.map((server) => (
                  <ServerCard key={server.name} server={server} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
