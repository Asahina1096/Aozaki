import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { css, cx } from "../../../styled-system/css";

const buttonVariants = cva(
  css({
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "2",
    whiteSpace: "nowrap",
    rounded: "md",
    fontSize: "sm",
    fontWeight: "medium",
    transition: "all",
    outline: "none",
    flexShrink: "0",
    _disabled: {
      pointerEvents: "none",
      opacity: "0.5",
    },
    _focusVisible: {
      borderColor: "ring",
      ringColor: "ring",
      ringWidth: "3px",
      ringOpacity: "0.5",
    },
    "& svg": {
      pointerEvents: "none",
      flexShrink: "0",
      width: "4",
      height: "4",
    },
  }),
  {
    variants: {
      variant: {
        default: css({
          bg: "primary",
          color: "primary.foreground",
          _hover: { bg: "primary", opacity: "0.9" },
        }),
        destructive: css({
          bg: "destructive",
          color: "white",
          _hover: { bg: "destructive", opacity: "0.9" },
          _focusVisible: {
            ringColor: "destructive",
            ringOpacity: "0.2",
          },
        }),
        outline: css({
          border: "1px solid",
          borderColor: "border",
          bg: "background",
          boxShadow: "xs",
          _hover: {
            bg: "accent",
            color: "accent.foreground",
          },
        }),
        secondary: css({
          bg: "secondary",
          color: "secondary.foreground",
          _hover: { bg: "secondary", opacity: "0.8" },
        }),
        ghost: css({
          _hover: {
            bg: "accent",
            color: "accent.foreground",
          },
        }),
        link: css({
          color: "primary",
          textDecoration: "underline",
          textUnderlineOffset: "4px",
          _hover: { textDecoration: "underline" },
        }),
      },
      size: {
        default: css({ h: "9", px: "4", py: "2" }),
        sm: css({ h: "8", rounded: "md", gap: "1.5", px: "3" }),
        lg: css({ h: "10", rounded: "md", px: "6" }),
        icon: css({ w: "9", h: "9" }),
        "icon-sm": css({ w: "8", h: "8" }),
        "icon-lg": css({ w: "10", h: "10" }),
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cx(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}

export { Button, buttonVariants };
