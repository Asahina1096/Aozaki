import { useMemo, useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { formatChartTimeByRange } from "@/lib/utils";
import { ChartContainer } from "./ChartContainer";
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
  loading: boolean;
  timeRange: number;
  onTimeRangeChange: (value: number) => void;
}

export function PingChart({
  data,
  timeRange,
  onTimeRangeChange,
}: PingChartProps) {
  const { records, basicInfo, taskInfo } = data;

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
  const CustomLegend = ({ payload }: any) => {
    return (
      <div className="flex flex-wrap gap-4 justify-center mt-4">
        {payload.map((entry: any, index: number) => {
          const taskId = taskIds[index];
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
                  color: entry.color,
                  opacity: isVisible ? 1 : 0.4,
                }}
              >
                ●
              </span>
              <span
                className={cn("text-sm", !isVisible && "text-muted-foreground")}
              >
                {entry.value}
              </span>
            </button>
          );
        })}
      </div>
    );
  };
  const chartData = useMemo(() => {
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
  }, [records, timeRange]);

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

  const hasData = records && records.length > 0;

  if (!hasData) {
    return null;
  }

  return (
    <ChartContainer
      title="Ping 历史检测"
      description="网络延迟历史数据（毫秒）"
      timeRange={timeRange}
      onTimeRangeChange={onTimeRangeChange}
    >
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis
            dataKey="time"
            className="text-xs"
            tick={{ fill: "hsl(var(--muted-foreground))" }}
          />
          <YAxis
            className="text-xs"
            tick={{ fill: "hsl(var(--muted-foreground))" }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--background))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "6px",
            }}
            labelStyle={{ color: "hsl(var(--foreground))" }}
            formatter={(value: number) => [`${value}ms`, "延迟"]}
          />
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
      </ResponsiveContainer>
    </ChartContainer>
  );
}
