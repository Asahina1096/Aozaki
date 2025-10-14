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
import { ChartGroupsSkeleton } from "./ChartGroupsSkeleton";
import { useAllChartsData } from "@/hooks/useAllChartsData";

interface ChartGroupsProps {
  uuid: string;
}

export function ChartGroups({ uuid }: ChartGroupsProps) {
  const { chartsData, loading, timeRanges, setChartTimeRange } =
    useAllChartsData(uuid);

  // 初始加载时显示骨架屏
  if (loading) {
    return <ChartGroupsSkeleton />;
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
            loading={loading}
            timeRange={timeRanges.cpu}
            onTimeRangeChange={(hours) => setChartTimeRange("cpu", hours)}
          />
          <MemoryChart
            data={chartsData.ram}
            loading={loading}
            timeRange={timeRanges.ram}
            onTimeRangeChange={(hours) => setChartTimeRange("ram", hours)}
          />
          <SwapChart
            data={chartsData.swap}
            loading={loading}
            timeRange={timeRanges.swap}
            onTimeRangeChange={(hours) => setChartTimeRange("swap", hours)}
          />
          <DiskChart
            data={chartsData.disk}
            loading={loading}
            timeRange={timeRanges.disk}
            onTimeRangeChange={(hours) => setChartTimeRange("disk", hours)}
          />
          <GpuChart
            data={chartsData.gpu}
            loading={loading}
            timeRange={timeRanges.gpu}
            onTimeRangeChange={(hours) => setChartTimeRange("gpu", hours)}
          />
          <TempChart
            data={chartsData.temp}
            loading={loading}
            timeRange={timeRanges.temp}
            onTimeRangeChange={(hours) => setChartTimeRange("temp", hours)}
          />
        </div>
      </div>

      {/* 网络组 */}
      <div className="space-y-4">
        <div className="mb-6">
          <h2 className="text-xl font-bold">网络状态</h2>
          <p className="text-sm text-muted-foreground">网络速度和连接数变化</p>
        </div>
        <div className="grid grid-cols-1 gap-6">
          <NetworkChart
            data={chartsData.network}
            loading={loading}
            timeRange={timeRanges.network}
            onTimeRangeChange={(hours) => setChartTimeRange("network", hours)}
          />
          <ConnectionsChart
            data={chartsData.connections}
            loading={loading}
            timeRange={timeRanges.connections}
            onTimeRangeChange={(hours) =>
              setChartTimeRange("connections", hours)
            }
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
            loading={loading}
            timeRange={timeRanges.load}
            onTimeRangeChange={(hours) => setChartTimeRange("load", hours)}
          />
          <ProcessChart
            data={chartsData.process}
            loading={loading}
            timeRange={timeRanges.process}
            onTimeRangeChange={(hours) => setChartTimeRange("process", hours)}
          />
        </div>
      </div>
    </div>
  );
}
