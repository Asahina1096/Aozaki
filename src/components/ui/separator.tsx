import * as React from "react";
import { css, cx } from "../../../styled-system/css";

const Separator = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    orientation?: "horizontal" | "vertical";
  }
>(({ className, orientation = "horizontal", ...props }, ref) => (
  <div
    ref={ref}
    className={cx(
      css({
        flexShrink: "0",
        bg: "border",
      }),
      orientation === "horizontal"
        ? css({ h: "1px", w: "full" })
        : css({ h: "full", w: "1px" }),
      className
    )}
    {...props}
  />
));
Separator.displayName = "Separator";

export { Separator };
