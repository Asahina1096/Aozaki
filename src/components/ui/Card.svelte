<script lang="ts" module>
  import { cn } from "@/lib/utils";
  import type { HTMLAttributes } from "svelte/elements";
</script>

<script lang="ts">
  interface Props extends HTMLAttributes<HTMLDivElement> {}

  let { class: className, children, ...props }: Props = $props();
</script>

<div
  class={cn(
    "rounded-2xl border border-border/20 bg-card/95 text-card-foreground shadow-sm",
    className
  )}
  {...props}
>
  {@render children?.()}
</div>
