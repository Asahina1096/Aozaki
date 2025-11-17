import { useCallback, useEffect, useRef } from "react";

/**
 * 自定义 Hook: 管理 AbortController 实例
 *
 * 提供创建、重置和自动清理 AbortController 的功能
 * 常用于取消 fetch 请求或其他异步操作
 *
 * @returns {Object} 包含 controllerRef 和 reset 函数
 * @example
 * const { controllerRef, reset } = useAbortController();
 *
 * // 发起新请求前重置
 * const controller = reset();
 * fetch(url, { signal: controller.signal });
 */
export function useAbortController() {
  const controllerRef = useRef<AbortController | null>(null);

  /**
   * 重置 AbortController：中止旧请求并创建新实例
   * @returns {AbortController} 新的 AbortController 实例
   */
  const reset = useCallback(() => {
    // 如果存在旧的 controller，先中止它
    if (controllerRef.current) {
      controllerRef.current.abort();
    }
    // 创建新的 controller
    const newController = new AbortController();
    controllerRef.current = newController;
    return newController;
  }, []);

  // 组件卸载时自动清理
  useEffect(() => {
    return () => {
      if (controllerRef.current) {
        controllerRef.current.abort();
      }
    };
  }, []);

  return { controllerRef, reset };
}
