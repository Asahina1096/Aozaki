import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { css, cx } from "../../../styled-system/css";

const badgeVariants = cva(
  css({
    display: "inline-flex",
    alignItems: "center",
    rounded: "full",
    border: "1px solid",
    px: "2.5",
    py: "0.5",
    fontSize: "xs",
    fontWeight: "semibold",
    transition: "colors",
    _focus: {
      outline: "none",
      ringWidth: "2",
      ringColor: "ring",
      ringOffsetWidth: "2",
    },
  }),
  {
    variants: {
      variant: {
        default: css({
          borderColor: "transparent",
          bg: "primary",
          color: "primary.foreground",
          _hover: { bg: "primary", opacity: "0.8" },
        }),
        secondary: css({
          borderColor: "transparent",
          bg: "secondary",
          color: "secondary.foreground",
          _hover: { bg: "secondary", opacity: "0.8" },
        }),
        destructive: css({
          borderColor: "transparent",
          bg: "destructive",
          color: "destructive.foreground",
          _hover: { bg: "destructive", opacity: "0.8" },
        }),
        outline: css({
          color: "foreground",
        }),
        success: css({
          borderColor: "transparent",
          bg: "green.500",
          color: "white",
          _hover: { bg: "green.600" },
        }),
        warning: css({
          borderColor: "transparent",
          bg: "yellow.500",
          color: "white",
          _hover: { bg: "yellow.600" },
        }),
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cx(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
