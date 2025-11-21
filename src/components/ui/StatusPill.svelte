<script lang="ts">
  import { PILL_STYLES } from "@/lib/constants";

  interface Props {
    label: string;
    online: boolean;
  }

  let { label, online }: Props = $props();
</script>

<span class={PILL_STYLES.status}>
  <span
    class={`h-1.5 w-1.5 rounded-full ${
      online ? "bg-status-online" : "bg-status-offline"
    }`}
    role="img"
    aria-hidden="true"
  ></span>
  <span class={`leading-none ${online ? "text-foreground" : "text-muted-foreground"}`}>
    {label}
  </span>
</span>
