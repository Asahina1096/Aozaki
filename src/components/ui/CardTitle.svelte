<script lang="ts" module>
  import { cn } from "@/lib/utils";
  import type { HTMLAttributes } from "svelte/elements";
</script>

<script lang="ts">
  interface Props extends HTMLAttributes<HTMLHeadingElement> {}

  let { class: className, children, ...props }: Props = $props();
</script>

<h3
  class={cn("text-2xl font-semibold leading-none tracking-tight", className)}
  {...props}
>
  {@render children?.()}
</h3>
