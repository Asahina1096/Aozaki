import { useCallback, useEffect, useRef, useState } from "react";
import { getAPIClient } from "./api";
import type { StatsResponse } from "./types/serverstatus";

export function useAbortController() {
  const controllerRef = useRef<AbortController | null>(null);

  const reset = useCallback(() => {
    if (controllerRef.current) {
      controllerRef.current.abort();
    }
    const newController = new AbortController();
    controllerRef.current = newController;
    return newController;
  }, []);

  useEffect(() => {
    return () => {
      if (controllerRef.current) {
        controllerRef.current.abort();
      }
    };
  }, []);

  return { controllerRef, reset };
}

export function usePollingStats(options: {
  refreshInterval?: number;
  enabled?: boolean;
}) {
  const { refreshInterval = 2000, enabled = true } = options;
  const { reset: resetAbortController } = useAbortController();
  const statsRef = useRef<StatsResponse | null>(null);
  const lastFetchTimeRef = useRef<number>(0);
  const isFetchingRef = useRef<boolean>(false);

  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const [isPageVisible, setIsPageVisible] = useState(
    typeof document !== "undefined" ? !document.hidden : true
  );
  const [hasFocus, setHasFocus] = useState(
    typeof document !== "undefined" ? document.hasFocus() : true
  );

  const fetchServers = useCallback(
    async (signal?: AbortSignal): Promise<StatsResponse | null> => {
      try {
        const client = getAPIClient();
        const data = await client.getStats(signal);
        setStats(data);
        setError(null);
        lastFetchTimeRef.current = Date.now();
        return data;
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          return null;
        }
        setError(err instanceof Error ? err : new Error("未知错误"));
        throw err;
      }
    },
    []
  );

  const safeFetch = useCallback(
    async (signal?: AbortSignal): Promise<void> => {
      if (isFetchingRef.current) return;

      isFetchingRef.current = true;
      try {
        await fetchServers(signal);
      } catch {
        // Error handled by fetchServers
      } finally {
        isFetchingRef.current = false;
      }
    },
    [fetchServers]
  );

  const retry = useCallback(() => {
    if (isFetchingRef.current) return;

    const abortController = resetAbortController();
    setIsRetrying(true);
    setLoading(true);
    isFetchingRef.current = true;

    fetchServers(abortController.signal)
      .catch(() => {
        // Error handled by fetchServers
      })
      .finally(() => {
        isFetchingRef.current = false;
        setIsRetrying(false);
        setLoading(false);
      });
  }, [fetchServers, resetAbortController]);

  useEffect(() => {
    statsRef.current = stats;
  }, [stats]);

  useEffect(() => {
    if (!enabled) return;
    if (isFetchingRef.current) return;

    const abortController = resetAbortController();
    setLoading(true);
    isFetchingRef.current = true;

    fetchServers(abortController.signal)
      .catch(() => {
        // Error handled by fetchServers
      })
      .finally(() => {
        isFetchingRef.current = false;
        setLoading(false);
      });
  }, [enabled, fetchServers, resetAbortController]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsPageVisible(!document.hidden);
    };

    const handleFocus = () => {
      setHasFocus(true);
    };

    const handleBlur = () => {
      setHasFocus(false);
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleFocus);
    window.addEventListener("blur", handleBlur);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("blur", handleBlur);
    };
  }, []);

  useEffect(() => {
    if (!enabled) return;
    if (!isPageVisible || !hasFocus) return;
    if (!statsRef.current) return;

    const timeSinceLastFetch = Date.now() - lastFetchTimeRef.current;
    const threshold = refreshInterval * 2;

    if (timeSinceLastFetch > threshold) {
      const abortController = resetAbortController();
      safeFetch(abortController.signal);
    }
  }, [
    enabled,
    isPageVisible,
    hasFocus,
    refreshInterval,
    safeFetch,
    resetAbortController,
  ]);

  useEffect(() => {
    if (!enabled) return;
    if (refreshInterval <= 0) return;
    if (!stats) return;
    if (!isPageVisible || !hasFocus) return;

    const interval = setInterval(() => {
      const abortController = resetAbortController();
      safeFetch(abortController.signal);
    }, refreshInterval);

    return () => {
      clearInterval(interval);
    };
  }, [
    enabled,
    refreshInterval,
    stats,
    isPageVisible,
    hasFocus,
    safeFetch,
    resetAbortController,
  ]);

  return {
    stats,
    loading,
    error,
    isRetrying,
    retry,
    lastFetchTime: lastFetchTimeRef.current,
  };
}
