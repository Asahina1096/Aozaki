import { useWindowVirtualizer } from "@tanstack/react-virtual";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { ServerStats } from "@/lib/types/serverstatus";
import { ServerCard } from "./ServerCard";

interface VirtualizedServerGridProps {
  servers: ServerStats[];
}

// 每个卡片的估计高度（包含 gap）
const CARD_HEIGHT = 380;
const GAP = 24; // gap-6 = 1.5rem = 24px

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
  const listRef = useRef<HTMLDivElement | null>(null);
  const columns = useResponsiveColumns();

  // 将服务器按行分组
  const rows = useMemo(() => {
    const result: ServerStats[][] = [];
    for (let i = 0; i < servers.length; i += columns) {
      result.push(servers.slice(i, i + columns));
    }
    return result;
  }, [servers, columns]);

  // 使用 window 虚拟化器
  const rowVirtualizer = useWindowVirtualizer({
    count: rows.length,
    estimateSize: () => CARD_HEIGHT + GAP,
    overscan: 3,
    scrollMargin: 0, // 初始为 0，会在 useEffect 中动态更新
    // 性能优化：使用 RAF 包装 ResizeObserver，减少布局抖动
    useAnimationFrameWithResizeObserver: true,
    // 性能优化：调整 isScrolling 重置延迟
    isScrollingResetDelay: 100,
    // 性能优化：使用原生 scrollend 事件（现代浏览器支持）
    useScrollendEvent: typeof window !== "undefined" && "onscrollend" in window,
  });

  // 动态更新 scrollMargin，确保在组件挂载后正确计算偏移量
  // 使用 useLayoutEffect 避免视觉闪烁，且仅在挂载时执行一次
  useLayoutEffect(() => {
    if (listRef.current) {
      const scrollMargin = listRef.current.offsetTop;
      rowVirtualizer.options.scrollMargin = scrollMargin;
      rowVirtualizer.measure();
    }
    // 仅在挂载时运行一次，避免重复测量导致的性能问题
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div ref={listRef}>
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: "100%",
          position: "relative",
        }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
          const row = rows[virtualRow.index];
          if (!row) return null;

          return (
            <div
              key={virtualRow.key}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start - rowVirtualizer.options.scrollMargin}px)`,
              }}
            >
              <div
                className="grid gap-6"
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
