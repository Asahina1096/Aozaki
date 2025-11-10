import { ErrorBoundary } from "./ErrorBoundary";
import { ServerList } from "./ServerList";

interface ServerListWithSuspenseProps {
  refreshInterval?: number;
}

/**
 * ServerList 的包装组件，提供 ErrorBoundary 用于错误处理
 *
 * 注意：由于 ServerList 现在使用传统的 useState + useEffect 方式，
 * 不再需要 Suspense（因为不再使用 use hook）。
 * ErrorBoundary 用于捕获渲染时抛出的错误。
 */
export function ServerListWithSuspense({
  refreshInterval = 5000,
}: ServerListWithSuspenseProps) {
  return (
    <ErrorBoundary>
      <ServerList refreshInterval={refreshInterval} />
    </ErrorBoundary>
  );
}
