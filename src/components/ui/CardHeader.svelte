<script lang="ts" module>
  import { cn } from "@/lib/utils";
  import type { HTMLAttributes } from "svelte/elements";
</script>

<script lang="ts">
  interface Props extends HTMLAttributes<HTMLDivElement> {}

  let { class: className, children, ...props }: Props = $props();
</script>

<div class={cn("flex flex-col space-y-1.5 p-6", className)} {...props}>
  {@render children?.()}
</div>
