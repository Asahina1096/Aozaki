<script lang="ts">
  import { cn } from "@/lib/utils";
  import type { HTMLAttributes } from "svelte/elements";

  interface Props extends HTMLAttributes<HTMLDivElement> {
    orientation?: "horizontal" | "vertical";
  }

  let { orientation = "horizontal", class: className, ...props }: Props = $props();
</script>

<div
  class={cn(
    "shrink-0 bg-border/30",
    orientation === "horizontal" ? "h-px w-full" : "h-full w-px",
    className
  )}
  {...props}
></div>
