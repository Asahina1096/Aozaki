<script lang="ts">
  import {
    Clock4,
    Cpu,
    HardDrive,
    Layers,
    MapPin,
    MemoryStick,
    Network,
    Server,
  } from "lucide-svelte";
  import { CARD_CONTAINMENT_STYLE, PILL_STYLES } from "@/lib/constants";
  import type { ServerStats } from "@/lib/types/serverstatus";
  import {
    formatBytes,
    formatLoad,
    formatPercent,
    formatSpeed,
    formatUptime,
    isServerOnline,
  } from "@/lib/utils";
  import Card from "./ui/Card.svelte";
  import CardContent from "./ui/CardContent.svelte";
  import CardDescription from "./ui/CardDescription.svelte";
  import CardHeader from "./ui/CardHeader.svelte";
  import CardTitle from "./ui/CardTitle.svelte";
  import Progress from "./ui/Progress.svelte";
  import Separator from "./ui/Separator.svelte";
  import StatusPill from "./ui/StatusPill.svelte";

  interface Props {
    server: ServerStats;
  }

  let { server }: Props = $props();

  const isOnline = $derived(isServerOnline(server));
  const cpuUsage = $derived(server.cpu);
  const memUsage = $derived(server.memory_used);
  const memTotal = $derived(server.memory_total);
  const diskUsage = $derived(server.hdd_used);
  const diskTotal = $derived(server.hdd_total);

  const memPercent = $derived(formatPercent(memUsage, memTotal));
  const diskPercent = $derived(formatPercent(diskUsage, diskTotal));
  const cpuDisplay = $derived(Math.round(cpuUsage * 10) / 10);
  const load1 = $derived(formatLoad(server.load_1));
  const load5 = $derived(formatLoad(server.load_5));
  const load15 = $derived(formatLoad(server.load_15));
</script>

<Card class="overflow-hidden" style={CARD_CONTAINMENT_STYLE}>
  <CardHeader class="p-5 pb-3 md:p-4 md:pb-2 space-y-0.5">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2 ml-1">
        <Server class="h-5 w-5" />
        <CardTitle class="text-xl md:text-lg">
          {server.alias || server.name}
        </CardTitle>
      </div>
      <span
        class={`h-2.5 w-2.5 rounded-full mr-1 ${
          isOnline
            ? "bg-status-online text-status-online animate-pulse-glow"
            : "bg-status-offline"
        }`}
        aria-label={isOnline ? "在线" : "离线"}
        role="status"
      ></span>
    </div>
    <CardDescription class="flex flex-col gap-1 text-xs text-muted-foreground">
      <!-- 第一行：运行时间 + 地区 + IPV4 + IPV6 + 类型 -->
      <div class="flex flex-nowrap items-center gap-1 overflow-x-auto whitespace-nowrap">
        <span class={PILL_STYLES.info}>
          <Clock4 class="h-3 w-3" />
          <span class="leading-none">
            {server.uptime ? formatUptime(server.uptime) : "--"}
          </span>
        </span>
        {#if server.location}
          <span class={PILL_STYLES.info}>
            <MapPin class="h-3 w-3" />
            <span class="leading-none">{server.location}</span>
          </span>
        {/if}
        <StatusPill label="v4" online={server.online4} />
        <StatusPill label="v6" online={server.online6} />
        {#if server.type}
          <span class={PILL_STYLES.info}>
            <Layers class="h-3 w-3" />
            <span class="leading-none">{server.type}</span>
          </span>
        {/if}
      </div>
    </CardDescription>
  </CardHeader>
  <CardContent class="p-5 pt-3 md:p-4 md:pt-2 space-y-2">
    <!-- CPU -->
    <div class="space-y-1">
      <div class="flex items-center justify-between text-sm ml-1">
        <div class="flex items-center gap-2">
          <Cpu class="h-4 w-4" />
          <span>CPU</span>
        </div>
        <span>{cpuDisplay}%</span>
      </div>
      <Progress value={cpuUsage} max={100} variant={isOnline ? "auto" : "muted"} />
      <p class="text-xs text-muted-foreground">
        负载: {load1} / {load5} / {load15}
      </p>
    </div>

    <Separator class="my-1" />

    <!-- 内存 -->
    <div class="space-y-1">
      <div class="flex items-center justify-between text-sm ml-1">
        <div class="flex items-center gap-2">
          <MemoryStick class="h-4 w-4" />
          <span>内存</span>
        </div>
        <span>{memPercent}</span>
      </div>
      <Progress value={memUsage} max={memTotal} variant={isOnline ? "auto" : "muted"} />
      <p class="text-xs text-muted-foreground">
        {formatBytes(memUsage * 1024)} / {formatBytes(memTotal * 1024)}
      </p>
    </div>

    <Separator class="my-1" />

    <!-- 磁盘 -->
    <div class="space-y-1">
      <div class="flex items-center justify-between text-sm ml-1">
        <div class="flex items-center gap-2">
          <HardDrive class="h-4 w-4" />
          <span>磁盘</span>
        </div>
        <span>{diskPercent}</span>
      </div>
      <Progress value={diskUsage} max={diskTotal} variant={isOnline ? "auto" : "muted"} />
      <p class="text-xs text-muted-foreground">
        {formatBytes(diskUsage * 1024 * 1024)} /
        {formatBytes(diskTotal * 1024 * 1024)}
      </p>
    </div>

    <Separator class="my-1" />

    <!-- 网络 -->
    <div class="space-y-1">
      <div class="flex items-center gap-2 text-sm ml-1">
        <Network class="h-4 w-4" />
        <span>网络</span>
      </div>
      <div class="grid grid-cols-2 gap-2 text-xs">
        <div class={`${PILL_STYLES.network} justify-between`}>
          <span class="text-muted-foreground">↑ 上传</span>
          <span class="font-medium">
            {formatSpeed(server.network_tx)}
          </span>
        </div>
        <div class={`${PILL_STYLES.network} justify-between`}>
          <span class="text-muted-foreground">↓ 下载</span>
          <span class="font-medium">
            {formatSpeed(server.network_rx)}
          </span>
        </div>
      </div>
      <div class="grid grid-cols-2 gap-2 text-xs">
        <div class={`${PILL_STYLES.network} justify-between`}>
          <span class="text-muted-foreground">↑ 总上传</span>
          <span class="font-medium">
            {formatBytes(server.network_out)}
          </span>
        </div>
        <div class={`${PILL_STYLES.network} justify-between`}>
          <span class="text-muted-foreground">↓ 总下载</span>
          <span class="font-medium">
            {formatBytes(server.network_in)}
          </span>
        </div>
      </div>
    </div>
  </CardContent>
</Card>
