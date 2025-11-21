<script lang="ts">
  import { onMount } from "svelte";
  import type { ServerStats } from "@/lib/types/serverstatus";
  import ServerCard from "./ServerCard.svelte";

  const RESIZE_DEBOUNCE_MS = 150;

  interface Props {
    servers: ServerStats[];
  }

  let { servers }: Props = $props();

  let columns = $state(1);

  function updateColumns() {
    if (typeof window === "undefined") return;
    const width = window.innerWidth;
    if (width >= 1280) {
      columns = 4;
    } else if (width >= 1024) {
      columns = 3;
    } else if (width >= 768) {
      columns = 2;
    } else {
      columns = 1;
    }
  }

  if (typeof window !== "undefined") {
    updateColumns();
  }

  const rows = $derived.by(() => {
    const result: ServerStats[][] = [];
    for (let i = 0; i < servers.length; i += columns) {
      result.push(servers.slice(i, i + columns));
    }
    return result;
  });

  let resizeTimeout: ReturnType<typeof setTimeout>;

  function handleResize() {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      updateColumns();
    }, RESIZE_DEBOUNCE_MS);
  }

  onMount(() => {
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(resizeTimeout);
    };
  });
</script>

<div class="w-full space-y-4 md:space-y-6">
  {#each rows as row}
    <div
      class="grid gap-4 md:gap-6"
      style:grid-template-columns={`repeat(${columns}, minmax(0, 1fr))`}
    >
      {#each row as server (server.name)}
        <ServerCard {server} />
      {/each}
    </div>
  {/each}
</div>
