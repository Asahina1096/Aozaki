import { Suspense } from "react";
import { ErrorBoundary } from "./ErrorBoundary";
import { ServerList } from "./ServerList";
import { ServerListSkeleton } from "./ServerListSkeleton";

interface ServerListWithSuspenseProps {
  refreshInterval?: number;
}

/**
 * ServerList 的包装组件，提供 Suspense 和 ErrorBoundary
 * 使用 React 19 的 use hook 时，需要 Suspense 来处理加载状态
 */
export function ServerListWithSuspense({
  refreshInterval = 5000,
}: ServerListWithSuspenseProps) {
  return (
    <ErrorBoundary>
      <Suspense fallback={<ServerListSkeleton />}>
        <ServerList refreshInterval={refreshInterval} />
      </Suspense>
    </ErrorBoundary>
  );
}
