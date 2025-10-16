import { useState, useRef, useEffect } from "react";
import { ChartSkeleton } from "./ChartSkeleton";

interface LazyChartProps {
  children: React.ReactNode;
  className?: string;
  rootMargin?: string;
  threshold?: number;
}

export function LazyChart({
  children,
  className = "",
  rootMargin = "50px",
  threshold = 0.1,
}: LazyChartProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [hasBeenVisible, setHasBeenVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !hasBeenVisible) {
          setIsVisible(true);
          setHasBeenVisible(true);
        }
      },
      {
        rootMargin,
        threshold,
      }
    );

    observer.observe(container);

    return () => {
      observer.unobserve(container);
    };
  }, [rootMargin, threshold, hasBeenVisible]);

  return (
    <div ref={containerRef} className={className}>
      {isVisible ? children : <ChartSkeleton />}
    </div>
  );
}
