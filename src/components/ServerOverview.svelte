<script lang="ts">
  import { ArrowUpDown, Cpu, Network, Server } from "lucide-svelte";
  import { CARD_CONTAINMENT_STYLE, PILL_STYLES } from "@/lib/constants";
  import type { ServerStats } from "@/lib/types/serverstatus";
  import { formatBytes, formatSpeed, isServerOnline } from "@/lib/utils";
  import Card from "./ui/Card.svelte";
  import CardContent from "./ui/CardContent.svelte";
  import CardHeader from "./ui/CardHeader.svelte";
  import CardTitle from "./ui/CardTitle.svelte";

  interface Props {
    servers: ServerStats[];
  }

  let { servers }: Props = $props();

  // 单次遍历计算所有统计数据
  const stats = $derived(
    servers.reduce(
      (acc, s) => {
        if (isServerOnline(s)) {
          acc.onlineCount++;
          acc.totalCpu += s.cpu;
        }
        acc.totalRealtimeDownload += s.network_rx;
        acc.totalRealtimeUpload += s.network_tx;
        acc.totalDataDownloaded += s.network_in;
        acc.totalDataUploaded += s.network_out;
        return acc;
      },
      {
        onlineCount: 0,
        totalCpu: 0,
        totalRealtimeDownload: 0,
        totalRealtimeUpload: 0,
        totalDataDownloaded: 0,
        totalDataUploaded: 0,
      }
    )
  );

  const totalServers = $derived(servers.length);
  const onlineServers = $derived(stats.onlineCount);
  const offlineServers = $derived(totalServers - onlineServers);

  // 计算平均CPU使用率（仅在线节点）
  const avgCpu = $derived(
    stats.onlineCount > 0
      ? Math.round((stats.totalCpu / stats.onlineCount) * 10) / 10
      : 0
  );
</script>

<div class="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
  <!-- 总节点数 -->
  <Card style={CARD_CONTAINMENT_STYLE}>
    <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle class="text-sm font-medium">节点总数</CardTitle>
      <Server class="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div class="text-2xl font-bold">{totalServers}</div>
      <div class="mt-2 flex flex-wrap gap-2">
        <span class={PILL_STYLES.capsule}>在线 {onlineServers}</span>
        <span class={PILL_STYLES.capsule}>离线 {offlineServers}</span>
      </div>
    </CardContent>
  </Card>

  <!-- 平均CPU使用率 -->
  <Card style={CARD_CONTAINMENT_STYLE}>
    <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle class="text-sm font-medium">平均CPU使用率</CardTitle>
      <Cpu class="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div class="text-2xl font-bold">{avgCpu}%</div>
    </CardContent>
  </Card>

  <!-- 实时网络速率 -->
  <Card style={CARD_CONTAINMENT_STYLE}>
    <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle class="text-sm font-medium">实时网络速率</CardTitle>
      <Network class="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div class="text-2xl font-bold">
        {formatSpeed(stats.totalRealtimeUpload + stats.totalRealtimeDownload)}
      </div>
      <div class="mt-2 flex flex-wrap gap-2">
        <span class={PILL_STYLES.capsule}>
          ↑ 上传 {formatSpeed(stats.totalRealtimeUpload)}
        </span>
        <span class={PILL_STYLES.capsule}>
          ↓ 下载 {formatSpeed(stats.totalRealtimeDownload)}
        </span>
      </div>
    </CardContent>
  </Card>

  <!-- 流量统计 -->
  <Card style={CARD_CONTAINMENT_STYLE}>
    <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle class="text-sm font-medium">流量统计</CardTitle>
      <ArrowUpDown class="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div class="text-2xl font-bold">
        {formatBytes(stats.totalDataUploaded + stats.totalDataDownloaded)}
      </div>
      <div class="mt-2 flex flex-wrap gap-2">
        <span class={PILL_STYLES.capsule}>
          ↑ 上传 {formatBytes(stats.totalDataUploaded)}
        </span>
        <span class={PILL_STYLES.capsule}>
          ↓ 下载 {formatBytes(stats.totalDataDownloaded)}
        </span>
      </div>
    </CardContent>
  </Card>
</div>
