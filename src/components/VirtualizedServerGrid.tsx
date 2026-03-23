import { useWindowVirtualizer } from "@tanstack/react-virtual";
import { useCallback, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useDebouncedCallback } from "@/lib/hooks";
import type { ServerStats } from "@/lib/types/serverstatus";

const ESTIMATED_ROW_HEIGHT = 420;
const VIRTUALIZER_OVERSCAN = 3;
const RESIZE_DEBOUNCE_MS = 150;

interface VirtualizedServerGridProps {
  servers: ServerStats[];
}

function useResponsiveColumns(): number {
  const getColumns = useCallback((width: number): number => {
    if (width >= 1280) return 4;
    if (width >= 1024) return 3;
    if (width >= 768) return 2;
    return 1;
  }, []);

  const [columns, setColumns] = useState(() => {
    if (typeof window === "undefined") return 1;
    return getColumns(window.innerWidth);
  });

  const updateColumns = useCallback(() => {
    setColumns(getColumns(window.innerWidth));
  }, [getColumns]);

  const debouncedUpdate = useDebouncedCallback(updateColumns, RESIZE_DEBOUNCE_MS);

  useLayoutEffect(() => {
    window.addEventListener("resize", debouncedUpdate);
    return () => {
      window.removeEventListener("resize", debouncedUpdate);
    };
  }, [debouncedUpdate]);

  return columns;
}

export function VirtualizedServerGrid({ servers }: VirtualizedServerGridProps) {
  const columns = useResponsiveColumns();
  const parentRef = useRef<HTMLDivElement>(null);
  const parentOffsetRef = useRef(0);

  const updateOffset = useCallback(() => {
    parentOffsetRef.current = parentRef.current?.offsetTop ?? 0;
  }, []);

  const debouncedUpdateOffset = useDebouncedCallback(updateOffset, RESIZE_DEBOUNCE_MS);

  useLayoutEffect(() => {
    updateOffset();

    window.addEventListener("resize", debouncedUpdateOffset);
    return () => {
      window.removeEventListener("resize", debouncedUpdateOffset);
    };
  }, [updateOffset, debouncedUpdateOffset]);

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
      typeof window !== "undefined" && navigator.userAgent.indexOf("Firefox") === -1
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
                  <div
                    key={server.name}
                    className="rounded-2xl border border-border/20 bg-card/95 p-4"
                  >
                    <div className="text-sm font-semibold">{server.name}</div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      {server.location || server.alias || "Unknown"}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
