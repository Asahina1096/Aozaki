import { CpuChart } from "./CpuChart";
import { MemoryChart } from "./MemoryChart";
import { SwapChart } from "./SwapChart";
import { DiskChart } from "./DiskChart";
import { NetworkChart } from "./NetworkChart";
import { LoadChart } from "./LoadChart";
import { GpuChart } from "./GpuChart";
import { TempChart } from "./TempChart";
import { ProcessChart } from "./ProcessChart";
import { ConnectionsChart } from "./ConnectionsChart";
import { PingChart } from "./PingChart";
import { ChartGroupsSkeleton } from "./ChartGroupsSkeleton";
import { useAllChartsData } from "@/hooks/useAllChartsData";

interface ChartGroupsProps {
  uuid: string;
}

export function ChartGroups({ uuid }: ChartGroupsProps) {
  const { chartsData, loading, timeRanges, setChartTimeRange, error, refresh } =
    useAllChartsData(uuid);

  // 初始加载时显示骨架屏
  if (loading) {
    return <ChartGroupsSkeleton />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-border bg-card px-6 py-12 text-center shadow-sm">
        <p className="text-lg font-semibold text-destructive">
          无法获取历史图表数据
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          {error.message || "请稍后再试。"}
        </p>
        <button
          type="button"
          onClick={() => {
            void refresh();
          }}
          className="mt-4 inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          重试
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* 系统资源组 */}
      <div className="space-y-4">
        <div className="mb-6">
          <h2 className="text-xl font-bold">系统资源</h2>
          <p className="text-sm text-muted-foreground">
            CPU、内存、磁盘等资源使用情况
          </p>
        </div>
        <div className="grid grid-cols-1 gap-6">
          <CpuChart
            data={chartsData.cpu}
            timeRange={timeRanges.cpu}
            onTimeRangeChange={(hours) => setChartTimeRange("cpu", hours)}
          />
          <MemoryChart
            data={chartsData.ram}
            timeRange={timeRanges.ram}
            onTimeRangeChange={(hours) => setChartTimeRange("ram", hours)}
          />
          <SwapChart
            data={chartsData.swap}
            timeRange={timeRanges.swap}
            onTimeRangeChange={(hours) => setChartTimeRange("swap", hours)}
          />
          <DiskChart
            data={chartsData.disk}
            timeRange={timeRanges.disk}
            onTimeRangeChange={(hours) => setChartTimeRange("disk", hours)}
          />
          <GpuChart
            data={chartsData.gpu}
            timeRange={timeRanges.gpu}
            onTimeRangeChange={(hours) => setChartTimeRange("gpu", hours)}
          />
          <TempChart
            data={chartsData.temp}
            timeRange={timeRanges.temp}
            onTimeRangeChange={(hours) => setChartTimeRange("temp", hours)}
          />
        </div>
      </div>

      {/* 网络组 */}
      <div className="space-y-4">
        <div className="mb-6">
          <h2 className="text-xl font-bold">网络状态</h2>
          <p className="text-sm text-muted-foreground">
            网络速度、连接数变化和 Ping 历史检测
          </p>
        </div>
        <div className="grid grid-cols-1 gap-6">
          <NetworkChart
            data={chartsData.network}
            timeRange={timeRanges.network}
            onTimeRangeChange={(hours) => setChartTimeRange("network", hours)}
          />
          <ConnectionsChart
            data={chartsData.connections}
            timeRange={timeRanges.connections}
            onTimeRangeChange={(hours) =>
              setChartTimeRange("connections", hours)
            }
          />
          <PingChart
            data={chartsData.ping}
            timeRange={timeRanges.ping}
            onTimeRangeChange={(hours) => setChartTimeRange("ping", hours)}
          />
        </div>
      </div>

      {/* 系统负载组 */}
      <div className="space-y-4">
        <div className="mb-6">
          <h2 className="text-xl font-bold">系统负载</h2>
          <p className="text-sm text-muted-foreground">系统负载和进程信息</p>
        </div>
        <div className="grid grid-cols-1 gap-6">
          <LoadChart
            data={chartsData.load}
            timeRange={timeRanges.load}
            onTimeRangeChange={(hours) => setChartTimeRange("load", hours)}
          />
          <ProcessChart
            data={chartsData.process}
            timeRange={timeRanges.process}
            onTimeRangeChange={(hours) => setChartTimeRange("process", hours)}
          />
        </div>
      </div>
    </div>
  );
}
