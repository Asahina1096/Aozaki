import { useWindowVirtualizer } from "@tanstack/react-virtual";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { ServerStats } from "@/lib/types/serverstatus";
import { ServerCard } from "./ServerCard";

const ESTIMATED_ROW_HEIGHT = 420;
const VIRTUALIZER_OVERSCAN = 3;
const RESIZE_DEBOUNCE_MS = 150;

interface VirtualizedServerGridProps {
  servers: ServerStats[];
}

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

  useLayoutEffect(() => {
    const updateOffset = () => {
      parentOffsetRef.current = parentRef.current?.offsetTop ?? 0;
    };

    updateOffset();

    let timeoutId: ReturnType<typeof setTimeout>;
    const debouncedUpdate = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(updateOffset, RESIZE_DEBOUNCE_MS);
    };

    window.addEventListener("resize", debouncedUpdate);
    return () => {
      window.removeEventListener("resize", debouncedUpdate);
      clearTimeout(timeoutId);
    };
  }, []);

  const rows = useMemo(() => {
    const result: ServerStats[][] = [];
    for (let i = 0; i < servers.length; i += columns) {
      result.push(servers.slice(i, i + columns));
    }
    return result;
  }, [servers, columns]);

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
                className="grid gap-4 pb-4 md:gap-6 md:pb-6"
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
