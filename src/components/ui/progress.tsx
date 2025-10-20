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
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  // 自动根据百分比确定渐变色
  const getAutoGradient = () => {
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
  };

  const variantClasses = {
    default: "bg-gradient-to-r from-primary/80 via-primary to-primary/80",
    success: "bg-gradient-to-r from-emerald-400 via-green-500 to-green-600",
    warning: "bg-gradient-to-r from-yellow-400 via-yellow-500 to-orange-500",
    danger: "bg-gradient-to-r from-orange-500 via-red-500 to-red-600",
    muted: "bg-gradient-to-r from-gray-300 via-gray-400 to-gray-500",
    auto: getAutoGradient(),
  };

  const actualVariant = variant === "auto" ? "auto" : variant;

  return (
    <div
      ref={ref}
      className={cn(
        "relative h-2 w-full overflow-hidden rounded-full bg-secondary",
        className
      )}
      {...props}
    >
      <div
        className={cn(
          "h-full w-full flex-1 transition-all rounded-full",
          variantClasses[actualVariant]
        )}
        style={{ transform: `translateX(-${100 - percentage}%)` }}
      />
    </div>
  );
});
Progress.displayName = "Progress";

export { Progress };
