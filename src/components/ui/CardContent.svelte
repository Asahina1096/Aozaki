<script lang="ts" module>
  import { cn } from "@/lib/utils";
  import type { HTMLAttributes } from "svelte/elements";
</script>

<script lang="ts">
  interface Props extends HTMLAttributes<HTMLDivElement> {}

  let { class: className, children, ...props }: Props = $props();
</script>

<div class={cn("p-6 pt-0", className)} {...props}>
  {@render children?.()}
</div>
