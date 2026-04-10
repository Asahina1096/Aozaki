import { useWindowVirtualizer } from "@tanstack/react-virtual";
import { memo, useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import type { NodeBasicInfo } from "@/contexts/NodeListContext";
import { useLiveData } from "../contexts/LiveDataContext";
import { useNodeList } from "../contexts/NodeListContext";
import type { ServerStats } from "@/lib/types/serverstatus";
import type { Record as LiveRecord } from "@/types/LiveData";
import { ServerCard } from "./ServerCard";
import { ServerOverview } from "./ServerOverview";
import { ServerListSkeleton } from "./ServerListSkeleton";

const DEFAULT_REFRESH_INTERVAL = 2000;
const VIRTUALIZATION_THRESHOLD = 48;
const GRID_GAP_PX = 16;
const ESTIMATED_ROW_HEIGHT = 576;
const CARD_ITEM_STYLE = {
  contentVisibility: "auto",
  containIntrinsicSize: "560px",
} as const;
const CARD_VISIBILITY_ROOT_MARGIN = "240px 0px";

let cardVisibilityObserver: IntersectionObserver | null = null;
const cardVisibilityListeners = new WeakMap<Element, (visible: boolean) => void>();

function getCardVisibilityObserver() {
  if (cardVisibilityObserver) {
    return cardVisibilityObserver;
  }

  cardVisibilityObserver = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        cardVisibilityListeners.get(entry.target)?.(entry.isIntersecting);
      }
    },
    {
      root: null,
      threshold: 0,
      rootMargin: CARD_VISIBILITY_ROOT_MARGIN,
    },
  );

  return cardVisibilityObserver;
}

interface ServerListProps {
  refreshInterval?: number;
}

interface ServerListControlsProps {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  filteredCount: number;
  totalCount: number;
}

interface ServerCardGridProps {
  nodes: NodeBasicInfo[];
  onlineSet: ReadonlySet<string>;
  liveDataMap?: Record<string, LiveRecord>;
}

interface VirtualizedServerCardGridProps extends ServerCardGridProps {
  columnCount: number;
}

interface ServerCardItemProps {
  node: NodeBasicInfo;
  isOnline: boolean;
  liveData?: LiveRecord;
}

const ServerCardItem = memo(function ServerCardItem({
  node,
  isOnline,
  liveData,
}: ServerCardItemProps) {
  const linkRef = useRef<HTMLAnchorElement | null>(null);
  const [isBlurVisible, setIsBlurVisible] = useState(true);

  useEffect(() => {
    const link = linkRef.current;
    if (!link) {
      return;
    }

    const observer = getCardVisibilityObserver();
    if (!observer) {
      return;
    }

    const onVisibilityChange = (visible: boolean) => {
      setIsBlurVisible(visible);
    };

    cardVisibilityListeners.set(link, onVisibilityChange);

    observer.observe(link);

    return () => {
      cardVisibilityListeners.delete(link);
      observer.unobserve(link);
    };
  }, []);

  return (
    <Link
      ref={linkRef}
      className="w-full border-0 bg-transparent p-0 text-left"
      to={`/instance/${node.uuid}`}
      style={CARD_ITEM_STYLE}
    >
      <ServerCard
        node={node}
        liveData={liveData}
        isOnline={isOnline}
        isBlurViewportActive={isBlurVisible}
      />
    </Link>
  );
});

function getColumnCountByWidth(width: number): number {
  if (width >= 1280) {
    return 4;
  }
  if (width >= 1024) {
    return 3;
  }
  if (width >= 768) {
    return 2;
  }
  return 1;
}

function useResponsiveColumnCount() {
  const [columnCount, setColumnCount] = useState(() => getColumnCountByWidth(window.innerWidth));

  useEffect(() => {
    const updateColumnCount = () => {
      const next = getColumnCountByWidth(window.innerWidth);
      setColumnCount(next);
    };

    updateColumnCount();
    window.addEventListener("resize", updateColumnCount);

    return () => {
      window.removeEventListener("resize", updateColumnCount);
    };
  }, []);

  return columnCount;
}

const VirtualizedServerCardGrid = memo(function VirtualizedServerCardGrid({
  nodes,
  onlineSet,
  liveDataMap,
  columnCount,
}: VirtualizedServerCardGridProps) {
  const listRef = useRef<HTMLDivElement | null>(null);
  const listOffsetRef = useRef(0);

  const rows = useMemo(() => {
    const chunkedRows: NodeBasicInfo[][] = [];
    for (let index = 0; index < nodes.length; index += columnCount) {
      chunkedRows.push(nodes.slice(index, index + columnCount));
    }
    return chunkedRows;
  }, [nodes, columnCount]);

  useEffect(() => {
    listOffsetRef.current = listRef.current?.offsetTop ?? 0;
  }, [columnCount]);

  const rowVirtualizer = useWindowVirtualizer({
    count: rows.length,
    estimateSize: () => ESTIMATED_ROW_HEIGHT,
    overscan: 4,
    scrollMargin: listOffsetRef.current,
  });

  return (
    <div ref={listRef} className="relative w-full">
      <div
        className="relative w-full"
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
        }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
          const rowNodes = rows[virtualRow.index] ?? [];
          const isLastRow = virtualRow.index === rows.length - 1;

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
                paddingBottom: isLastRow ? 0 : `${GRID_GAP_PX}px`,
              }}
            >
              <div
                className="grid gap-4"
                style={{
                  gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))`,
                }}
              >
                {rowNodes.map((node) => {
                  const isOnline = onlineSet.has(node.uuid);
                  const liveData = liveDataMap?.[node.uuid];

                  return (
                    <ServerCardItem
                      key={node.uuid}
                      node={node}
                      isOnline={isOnline}
                      liveData={liveData}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});

const ServerListControls = memo(function ServerListControls({
  searchQuery,
  setSearchQuery,
  filteredCount,
  totalCount,
}: ServerListControlsProps) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div className="flex items-center gap-3">
        <span className="text-xl md:text-2xl font-bold text-primary">节点列表</span>
        <div className="relative">
          <input
            type="search"
            placeholder="搜索名称/地区..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            aria-label="搜索节点"
            className="control-surface-target h-8 w-40 rounded-md px-3 text-sm text-black placeholder:text-black/45 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 dark:text-foreground/75 dark:placeholder:text-foreground/45 md:w-48"
          />
        </div>
        {searchQuery && (
          <span className="text-sm text-muted-foreground">
            {filteredCount}/{totalCount}
          </span>
        )}
      </div>
    </div>
  );
});

const ServerCardGrid = memo(function ServerCardGrid({
  nodes,
  onlineSet,
  liveDataMap,
}: ServerCardGridProps) {
  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {nodes.map((node) => {
        const isOnline = onlineSet.has(node.uuid);
        const liveData = liveDataMap?.[node.uuid];

        return (
          <ServerCardItem key={node.uuid} node={node} isOnline={isOnline} liveData={liveData} />
        );
      })}
    </div>
  );
});

export default function ServerList({
  refreshInterval = DEFAULT_REFRESH_INTERVAL,
}: ServerListProps) {
  const { nodeList, isLoading, error, refresh } = useNodeList();
  const { live_data } = useLiveData();
  const onlineUuids = live_data?.data?.online ?? [];
  const liveDataMap = live_data?.data?.data;

  useEffect(() => {
    const interval = setInterval(() => {
      refresh();
    }, refreshInterval);
    return () => clearInterval(interval);
  }, [refresh, refreshInterval]);

  const [searchQuery, setSearchQuery] = useState("");
  const columnCount = useResponsiveColumnCount();
  const deferredSearchQuery = useDeferredValue(searchQuery);
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
  };

  const onlineSet = useMemo(() => {
    return new Set(onlineUuids);
  }, [onlineUuids]);

  const sortedNodes = useMemo(() => {
    if (!nodeList) return [];
    return [...nodeList].sort((a, b) => {
      const aOnline = onlineSet.has(a.uuid);
      const bOnline = onlineSet.has(b.uuid);
      if (aOnline !== bOnline) return bOnline ? 1 : -1;
      return (a.weight || 0) - (b.weight || 0);
    });
  }, [nodeList, onlineSet]);

  const filteredNodes = useMemo(() => {
    if (!deferredSearchQuery.trim()) {
      return sortedNodes;
    }
    const query = deferredSearchQuery.toLowerCase().trim();
    return sortedNodes.filter(
      (node) =>
        node.name?.toLowerCase().includes(query) ||
        node.region?.toLowerCase().includes(query) ||
        node.group?.toLowerCase().includes(query),
    );
  }, [sortedNodes, deferredSearchQuery]);

  const serverStats = useMemo((): ServerStats[] => {
    return (nodeList || []).map((node) => {
      const data = liveDataMap?.[node.uuid];
      const isOnline = onlineSet.has(node.uuid);
      return {
        name: node.uuid,
        online4: isOnline,
        online6: false,
        uptime: "",
        load_1: 0,
        load_5: 0,
        load_15: 0,
        cpu: data?.cpu?.usage ?? 0,
        memory_total: 0,
        memory_used: 0,
        swap_total: 0,
        swap_used: 0,
        hdd_total: 0,
        hdd_used: 0,
        network_rx: data?.network?.down ?? 0,
        network_tx: data?.network?.up ?? 0,
        network_in: data?.network?.totalDown ?? 0,
        network_out: data?.network?.totalUp ?? 0,
      };
    });
  }, [nodeList, liveDataMap, onlineSet]);

  const hasNodes = nodeList && nodeList.length > 0;
  const shouldVirtualize = filteredNodes.length >= VIRTUALIZATION_THRESHOLD;

  if (isLoading && !hasNodes) {
    return <ServerListSkeleton />;
  }

  if (!hasNodes) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-lg font-semibold text-muted-foreground">
          {error ? "无法加载节点数据" : "暂无节点数据"}
        </p>
        <p className="mt-2 text-sm text-muted-foreground">{error || "请稍后再试。"}</p>
        {error && (
          <button
            type="button"
            onClick={refresh}
            className="control-surface-target mt-4 rounded-lg border border-primary/25 px-4 py-2 text-primary shadow-sm hover:bg-primary/10"
          >
            重试
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="card-opacity-target card-blur-target rounded-2xl border border-destructive/20 p-4 text-sm text-destructive shadow-sm">
          <p>数据刷新失败：{error || "请稍后再试。"}</p>
          <button
            type="button"
            onClick={refresh}
            className="control-surface-target mt-3 inline-flex items-center rounded-lg border border-destructive/25 px-3 py-1.5 text-sm font-medium text-destructive hover:bg-destructive/10"
          >
            重新获取数据
          </button>
        </div>
      )}

      <ServerOverview servers={serverStats} />

      <ServerListControls
        searchQuery={searchQuery}
        setSearchQuery={handleSearchChange}
        filteredCount={filteredNodes.length}
        totalCount={sortedNodes.length}
      />

      {shouldVirtualize ? (
        <VirtualizedServerCardGrid
          nodes={filteredNodes}
          onlineSet={onlineSet}
          liveDataMap={liveDataMap}
          columnCount={columnCount}
        />
      ) : (
        <ServerCardGrid nodes={filteredNodes} onlineSet={onlineSet} liveDataMap={liveDataMap} />
      )}
    </div>
  );
}
