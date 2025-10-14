import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// 格式化字节大小
export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return "0 B";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["B", "KB", "MB", "GB", "TB", "PB"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

// 格式化百分比
export function formatPercent(value: number, total: number): string {
  if (total === 0) return "0%";
  return ((value / total) * 100).toFixed(1) + "%";
}

// 格式化网络速度
export function formatSpeed(bytesPerSecond: number): string {
  return formatBytes(bytesPerSecond) + "/s";
}

// 将秒格式化为人类可读的时长
export function formatDuration(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds <= 0) {
    return "0天";
  }

  const totalSeconds = Math.floor(seconds);
  const dayInSeconds = 86400;
  const hourInSeconds = 3600;
  const minuteInSeconds = 60;

  if (totalSeconds >= dayInSeconds) {
    const days = Math.floor(totalSeconds / dayInSeconds);
    return `${days}天`;
  }

  if (totalSeconds >= hourInSeconds) {
    const hours = Math.floor(totalSeconds / hourInSeconds);
    return `${hours}小时`;
  }

  if (totalSeconds >= minuteInSeconds) {
    const minutes = Math.floor(totalSeconds / minuteInSeconds);
    return `${minutes}分钟`;
  }

  return "0天";
}

// 格式化平均负载
export function formatLoad(value: number): string {
  return value.toFixed(2);
}

// 获取状态颜色类
export function getStatusColor(online: boolean): string {
  return online ? "text-green-500" : "text-red-500";
}

// 获取 CPU 使用率颜色类
export function getCpuColor(usage: number): string {
  if (usage >= 80) return "text-red-500";
  if (usage >= 60) return "text-yellow-500";
  return "text-green-500";
}

// 获取内存使用率颜色类
export function getMemoryColor(usage: number, total: number): string {
  const percent = (usage / total) * 100;
  if (percent >= 90) return "text-red-500";
  if (percent >= 75) return "text-yellow-500";
  return "text-green-500";
}

// 格式化时间戳为可读格式
export function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `${days}天前`;
  } else if (hours > 0) {
    return `${hours}小时前`;
  } else if (minutes > 0) {
    return `${minutes}分钟前`;
  } else {
    return `${seconds}秒前`;
  }
}

// 格式化图表时间轴（保留向后兼容）
export function formatChartTime(timestamp: string): string {
  const date = new Date(timestamp);
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes}`;
}

// 根据时间范围格式化图表时间轴
export function formatChartTimeByRange(
  timestamp: string,
  hours: number
): string {
  const date = new Date(timestamp);

  // 超过 24 小时，显示月-日 时:分
  if (hours > 24) {
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    const hour = date.getHours().toString().padStart(2, "0");
    const minute = date.getMinutes().toString().padStart(2, "0");
    return `${month}-${day} ${hour}:${minute}`;
  }

  // 24 小时内，只显示 时:分
  const hour = date.getHours().toString().padStart(2, "0");
  const minute = date.getMinutes().toString().padStart(2, "0");
  return `${hour}:${minute}`;
}
