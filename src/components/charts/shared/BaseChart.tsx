import { useMemo } from "react";
import { ResponsiveContainer } from "recharts";
import { ChartContainer } from "../ChartContainer";
import { EmptyChart, CHART_CONFIG, type BaseChartProps } from "./chartConfig";

export function BaseChart<T>({
  data,
  timeRange,
  title,
  description,
  onTimeRangeChange,
  transformData,
  renderChart,
  shouldShow = () => true,
  yAxisConfig,
  tooltipFormatter,
}: BaseChartProps<T>) {
  // 检查是否应该显示图表
  const shouldRender = data?.length > 0 && shouldShow(data);

  // 转换数据
  const chartData = useMemo(
    () => (shouldRender ? transformData(data, timeRange) : []),
    [data, timeRange, shouldRender, transformData]
  );

  // 如果不应该渲染，返回 null
  if (!shouldRender) {
    return null;
  }

  // 合并 YAxis 配置
  const yAxisProps = {
    ...CHART_CONFIG.yAxis,
    ...yAxisConfig,
  };

  // 合并 Tooltip 配置
  const tooltipProps = {
    ...CHART_CONFIG.tooltip,
    formatter: tooltipFormatter,
  };

  return (
    <ChartContainer
      title={title}
      description={description}
      timeRange={timeRange}
      onTimeRangeChange={onTimeRangeChange}
    >
      {chartData.length === 0 ? (
        <EmptyChart />
      ) : (
        <ResponsiveContainer width="100%" height={CHART_CONFIG.height}>
          {renderChart(chartData, {
            xAxis: { dataKey: "time", ...CHART_CONFIG.xAxis },
            yAxis: yAxisProps,
            cartesianGrid: CHART_CONFIG.cartesianGrid,
            tooltip: tooltipProps,
          })}
        </ResponsiveContainer>
      )}
    </ChartContainer>
  );
}
