import * as React from "react";
import { cn } from "@/lib/utils";

const Progress = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    value?: number;
    max?: number;
    variant?: "default" | "success" | "warning" | "danger" | "muted" | "auto";
  }
>(({ className, value = 0, max = 100, variant = "default", ...props }, ref) => {
  const safeMax = typeof max === "number" && max > 0 ? max : 0;
  const safeValue = typeof value === "number" ? value : 0;
  const percentage =
    safeMax === 0 ? 0 : Math.min(Math.max((safeValue / safeMax) * 100, 0), 100);

  // 使用 useMemo 缓存自动渐变计算，仅在百分比变化时重新计算
  const autoGradient = React.useMemo(() => {
    if (percentage >= 80) {
      // 80-100%: 橙红到红色渐变
      return "bg-gradient-to-r from-orange-500 via-red-500 to-red-600";
    }
    if (percentage >= 60) {
      // 60-80%: 黄色到橙色渐变
      return "bg-gradient-to-r from-yellow-400 via-yellow-500 to-orange-500";
    }
    // 0-60%: 青绿到绿色渐变
    return "bg-gradient-to-r from-emerald-400 via-green-500 to-green-600";
  }, [percentage]);

  const variantClasses = {
    default: "bg-gradient-to-r from-primary/80 via-primary to-primary/80",
    success: "bg-gradient-to-r from-emerald-400 via-green-500 to-green-600",
    warning: "bg-gradient-to-r from-yellow-400 via-yellow-500 to-orange-500",
    danger: "bg-gradient-to-r from-orange-500 via-red-500 to-red-600",
    muted: "bg-gradient-to-r from-gray-300 via-gray-400 to-gray-500",
    auto: autoGradient,
  };

  const actualVariant = variant === "auto" ? "auto" : variant;

  return (
    <div
      ref={ref}
      className={cn(
        "relative h-2 w-full overflow-hidden rounded-full bg-secondary/50 backdrop-blur-sm shadow-inner",
        className
      )}
      {...props}
    >
      <div
        className={cn(
          "h-full w-full flex-1 rounded-full shadow-sm transition-transform duration-300 ease-out",
          variantClasses[actualVariant]
        )}
        style={{ transform: `translateX(-${100 - percentage}%)` }}
      />
    </div>
  );
});
Progress.displayName = "Progress";

export { Progress };
