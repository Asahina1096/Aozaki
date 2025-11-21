<script lang="ts" module>
  import { cn } from "@/lib/utils";
  import type { HTMLAttributes } from "svelte/elements";
</script>

<script lang="ts">
  interface Props extends HTMLAttributes<HTMLDivElement> {}

  let { class: className, children, ...props }: Props = $props();
</script>

<div class={cn("text-sm text-muted-foreground", className)} {...props}>
  {@render children?.()}
</div>
