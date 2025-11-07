import * as React from "react";
import { css, cx } from "../../../styled-system/css";

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
      return css({
        bgGradient: "to-r",
        gradientFrom: "orange.500",
        gradientVia: "red.500",
        gradientTo: "red.600",
      });
    }
    if (percentage >= 60) {
      // 60-80%: 黄色到橙色渐变
      return css({
        bgGradient: "to-r",
        gradientFrom: "yellow.400",
        gradientVia: "yellow.500",
        gradientTo: "orange.500",
      });
    }
    // 0-60%: 青绿到绿色渐变
    return css({
      bgGradient: "to-r",
      gradientFrom: "emerald.400",
      gradientVia: "green.500",
      gradientTo: "green.600",
    });
  };

  const variantClasses = {
    default: css({
      bgGradient: "to-r",
      gradientFrom: "primary",
      gradientVia: "primary",
      gradientTo: "primary",
    }),
    success: css({
      bgGradient: "to-r",
      gradientFrom: "emerald.400",
      gradientVia: "green.500",
      gradientTo: "green.600",
    }),
    warning: css({
      bgGradient: "to-r",
      gradientFrom: "yellow.400",
      gradientVia: "yellow.500",
      gradientTo: "orange.500",
    }),
    danger: css({
      bgGradient: "to-r",
      gradientFrom: "orange.500",
      gradientVia: "red.500",
      gradientTo: "red.600",
    }),
    muted: css({
      bgGradient: "to-r",
      gradientFrom: "gray.300",
      gradientVia: "gray.400",
      gradientTo: "gray.500",
    }),
    auto: getAutoGradient(),
  };

  const actualVariant = variant === "auto" ? "auto" : variant;

  return (
    <div
      ref={ref}
      className={cx(
        css({
          position: "relative",
          h: "2",
          w: "full",
          overflow: "hidden",
          rounded: "full",
          bg: "secondary",
        }),
        className
      )}
      {...props}
    >
      <div
        className={cx(
          css({
            h: "full",
            w: "full",
            flex: "1",
            transition: "all",
            rounded: "full",
          }),
          variantClasses[actualVariant]
        )}
        style={{ transform: `translateX(-${100 - percentage}%)` }}
      />
    </div>
  );
});
Progress.displayName = "Progress";

export { Progress };
