<script lang="ts">
  const OVERVIEW_SKELETON_COUNT = 4;
  const SERVER_SKELETON_COUNT = 8;
</script>

<div class="space-y-6">
  <!-- ServerOverview 骨架屏 -->
  <div class="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
    {#each Array.from({ length: OVERVIEW_SKELETON_COUNT }) as _, i (i)}
      <div
        class="h-24 rounded-2xl border border-border/20 bg-muted/60 backdrop-blur-sm shadow-sm"
      ></div>
    {/each}
  </div>
  <!-- 标题 -->
  <div class="flex items-center">
    <span class="text-xl md:text-2xl font-bold text-primary"> 节点列表 </span>
  </div>
  <!-- 服务器列表骨架屏 -->
  <div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
    {#each Array.from({ length: SERVER_SKELETON_COUNT }) as _, i (i)}
      <div
        class="h-[420px] rounded-2xl border border-border/20 bg-muted/60 backdrop-blur-sm shadow-sm"
      ></div>
    {/each}
  </div>
</div>
