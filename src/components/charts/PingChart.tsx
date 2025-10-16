import { useMemo, useState, useEffect } from "react";
import {
  LineChart,
  Line,
  Legend,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

import { cn, formatChartTimeByRange } from "@/lib/utils";

import { BaseChart } from "@/components/charts/shared/BaseChart";

import type {
  PingRecord,
  PingBasicInfo,
  PingTaskInfo,
} from "@/lib/types/komari";

interface PingChartProps {
  data: {
    records: PingRecord[];
    basicInfo: PingBasicInfo[];
    taskInfo: PingTaskInfo[];
  };
  timeRange: number;
  onTimeRangeChange: (_value: number) => void;
}

export function PingChart({
  data,
  timeRange,
  onTimeRangeChange: _onTimeRangeChange,
}: PingChartProps) {
  const { records, taskInfo } = data;

  // 管理可见线条的状态
  const [visibleLines, setVisibleLines] = useState<Set<number>>(new Set());

  // 初始化可见线条状态
  useEffect(() => {
    const ids = new Set<number>();
    records.forEach((record) => ids.add(record.task_id));
    setVisibleLines(ids);
  }, [records]);

  // 切换线条显示/隐藏
  const toggleLine = (taskId: number) => {
    setVisibleLines((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(taskId)) {
        newSet.delete(taskId);
      } else {
        newSet.add(taskId);
      }
      return newSet;
    });
  };

  // 自定义 Legend 组件
  const CustomLegend = () => {
    return (
      <div className="flex flex-wrap gap-4 justify-center mt-4">
        {taskIds.map((taskId: number, index: number) => {
          const taskInfoForTask = taskInfo.find((task) => task.id === taskId);
          const displayName = taskInfoForTask
            ? `${taskInfoForTask.name} (丢包率 ${taskInfoForTask.loss}%)`
            : `任务 ${taskId}`;
          const color = colors[index % colors.length];
          const isVisible = visibleLines.has(taskId);

          return (
            <button
              key={`legend-${taskId}`}
              onClick={() => toggleLine(taskId)}
              className={cn(
                "flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity",
                !isVisible && "opacity-40"
              )}
            >
              <span
                style={{
                  color: color,
                  opacity: isVisible ? 1 : 0.4,
                }}
              >
                ●
              </span>
              <span
                className={cn("text-sm", !isVisible && "text-muted-foreground")}
              >
                {displayName}
              </span>
            </button>
          );
        })}
      </div>
    );
  };

  // 获取所有唯一的 task_id 用于生成线条
  const taskIds = useMemo(() => {
    const ids = new Set<number>();
    records.forEach((record) => ids.add(record.task_id));
    return Array.from(ids).sort();
  }, [records]);

  // 生成颜色数组
  const colors = [
    "#3b82f6", // blue
    "#8b5cf6", // violet
    "#10b981", // emerald
    "#f59e0b", // amber
    "#ef4444", // red
    "#06b6d4", // cyan
    "#84cc16", // lime
    "#f97316", // orange
  ];

  return (
    <BaseChart
      data={records}
      timeRange={timeRange}
      title="Ping 历史检测"
      description="网络延迟历史数据（毫秒）"
      onTimeRangeChange={_onTimeRangeChange}
      shouldShow={(data) => data.length > 0}
      transformData={(records, timeRange) => {
        // 按 task_id 分组数据
        const groupedData: Record<string, Record<string, number | string>> = {};

        records.forEach((record) => {
          const timeKey = formatChartTimeByRange(record.time, timeRange);
          if (!groupedData[timeKey]) {
            groupedData[timeKey] = { time: timeKey };
          }
          groupedData[timeKey][`task_${record.task_id}`] = record.value;
        });

        // 转换为数组并按时间排序
        return Object.values(groupedData).sort((a, b) => {
          const timeA = a.time as string;
          const timeB = b.time as string;
          return timeA.localeCompare(timeB);
        });
      }}
      tooltipFormatter={(value: unknown) => [`${Number(value)}ms`, "延迟"]}
      renderChart={(chartData, { xAxis, yAxis, cartesianGrid, tooltip }) => (
        <LineChart data={chartData}>
          <CartesianGrid {...cartesianGrid} />
          <XAxis {...xAxis} />
          <YAxis {...yAxis} />
          <Tooltip {...tooltip} />
          <Legend content={<CustomLegend />} />
          {taskIds.map((taskId, index) => {
            // 根据 taskInfo 获取任务信息
            const taskInfoForTask = taskInfo.find((task) => task.id === taskId);
            const displayName = taskInfoForTask
              ? `${taskInfoForTask.name} (丢包率 ${taskInfoForTask.loss}%)`
              : `任务 ${taskId}`;

            return (
              <Line
                key={taskId}
                type="monotone"
                dataKey={`task_${taskId}`}
                stroke={colors[index % colors.length]}
                strokeWidth={2}
                strokeOpacity={visibleLines.has(taskId) ? 1 : 0.2}
                name={displayName}
                dot={false}
                isAnimationActive={false}
              />
            );
          })}
        </LineChart>
      )}
    />
  );
}
