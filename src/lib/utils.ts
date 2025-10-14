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
