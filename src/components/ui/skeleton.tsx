import * as React from "react";
import { css, cx } from "../../../styled-system/css";

export type SkeletonProps = React.HTMLAttributes<HTMLDivElement>;

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cx(
        css({
          animation: "pulse",
          rounded: "md",
          bg: "muted",
        }),
        className
      )}
      {...props}
    />
  );
}
