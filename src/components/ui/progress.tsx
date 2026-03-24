import * as React from "react";
import { cn } from "@/lib/utils";

const getAutoGradient = (percentage: number) => {
  if (percentage >= 90) {
    return "bg-gradient-to-r from-rose-400 via-rose-500 to-red-500";
  }
  if (percentage >= 70) {
    return "bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500";
  }
  return "bg-gradient-to-r from-emerald-400 via-emerald-500 to-cyan-500";
};

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
  const percentage = safeMax === 0 ? 0 : Math.min(Math.max((safeValue / safeMax) * 100, 0), 100);

  const variantClasses = {
    default: "bg-gradient-to-r from-emerald-400 via-emerald-500 to-cyan-500",
    success: "bg-gradient-to-r from-emerald-400 via-emerald-500 to-cyan-500",
    warning: "bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500",
    danger: "bg-gradient-to-r from-rose-400 via-rose-500 to-red-500",
    muted:
      "bg-gradient-to-r from-slate-400 via-slate-500 to-slate-600 dark:from-slate-500 dark:via-slate-600 dark:to-slate-700",
    auto: getAutoGradient(percentage),
  };

  const actualVariant = variant === "auto" ? "auto" : variant;

  return (
    <div
      ref={ref}
      className={cn(
        "relative h-2 w-full overflow-hidden rounded-full bg-secondary/50 shadow-inner",
        className,
      )}
      {...props}
    >
      <div
        className={cn(
          "h-full w-full flex-1 rounded-full shadow-sm transition-transform duration-150 ease-out",
          variantClasses[actualVariant],
        )}
        style={{
          transform: `translateX(-${100 - percentage}%)`,
        }}
      />
    </div>
  );
});
Progress.displayName = "Progress";

export { Progress };
