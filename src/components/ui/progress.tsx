import * as React from "react";
import { cn } from "@/lib/utils";

const PROGRESS_FILL_THEMES = {
  success: "bg-gradient-to-r from-emerald-400 via-emerald-500 to-cyan-500",
  warning: "bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500",
  danger: "bg-gradient-to-r from-rose-400 via-rose-500 to-red-500",
  muted:
    "bg-gradient-to-r from-slate-400 via-slate-500 to-slate-600 dark:from-slate-500 dark:via-slate-600 dark:to-slate-700",
} as const;

const getAutoTheme = (percentage: number): keyof typeof PROGRESS_FILL_THEMES => {
  if (percentage >= 90) {
    return "danger";
  }
  if (percentage >= 70) {
    return "warning";
  }
  return "success";
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

  const resolvedTheme =
    variant === "auto" ? getAutoTheme(percentage) : variant === "default" ? "success" : variant;

  return (
    <div
      ref={ref}
      className={cn(
        "relative h-2 w-full overflow-hidden rounded-full border border-border/30 bg-secondary/40 shadow-inner",
        className,
      )}
      {...props}
    >
      <div
        className={cn(
          "relative h-full w-full flex-1 rounded-full shadow-sm transition-transform duration-150 ease-out",
          PROGRESS_FILL_THEMES[resolvedTheme],
        )}
        style={{
          transform: `translateX(-${100 - percentage}%)`,
        }}
      >
        <div className="absolute inset-0 rounded-full bg-white/10" />
      </div>
    </div>
  );
});
Progress.displayName = "Progress";

export { Progress };
