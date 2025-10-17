import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * 格式化字节大小
 * @param bytes - 字节数
 * @param decimals - 小数位数，默认 2
 * @returns 格式化后的字符串，如 "1.23 MB"
 */
export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return "0 B";
  if (bytes < 0) return "0 B";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["B", "KB", "MB", "GB", "TB", "PB"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const size = parseFloat((bytes / Math.pow(k, i)).toFixed(dm));

  return `${size} ${sizes[i]}`;
}

/**
 * 格式化时长
 * @param seconds - 秒数
 * @returns 格式化后的字符串，如 "1天2小时" 或 "3小时30分钟"
 */
export function formatDuration(seconds: number): string {
  if (seconds < 0) return "0秒";
  if (seconds === 0) return "0秒";

  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  const parts: string[] = [];

  if (days > 0) {
    parts.push(`${days}天`);
  }
  if (hours > 0) {
    parts.push(`${hours}小时`);
  }
  if (minutes > 0 && days === 0) {
    // 如果有天数，不显示分钟
    parts.push(`${minutes}分钟`);
  }
  if (secs > 0 && days === 0 && hours === 0) {
    // 如果有天数或小时，不显示秒
    parts.push(`${secs}秒`);
  }

  return parts.length > 0 ? parts.slice(0, 2).join("") : "0秒";
}

/**
 * 格式化百分比
 * @param value - 当前值
 * @param total - 总值
 * @param decimals - 小数位数，默认 1
 * @returns 格式化后的百分比字符串，如 "50.0%"
 */
export function formatPercent(
  value: number,
  total: number,
  decimals: number = 1
): string {
  if (total === 0) return "0%";
  const percent = (value / total) * 100;
  return `${percent.toFixed(decimals)}%`;
}

/**
 * 格式化网络速度（智能小数位）
 * @param bytesPerSecond - 每秒字节数
 * @param decimals - 小数位数，可选。不提供时自动根据数值大小决定
 * @returns 格式化后的速度字符串，如 "1.5 MB/s" 或 "15 MB/s"
 */
export function formatSpeed(bytesPerSecond: number, decimals?: number): string {
  if (bytesPerSecond === 0) return "0 B/s";
  if (bytesPerSecond < 0) return "0 B/s";

  const k = 1024;
  const sizes = ["B/s", "KB/s", "MB/s", "GB/s", "TB/s"];

  const i = Math.floor(Math.log(bytesPerSecond) / Math.log(k));
  const value = bytesPerSecond / Math.pow(k, i);

  // 智能小数位：未指定时根据数值大小自动决定
  let dm: number;
  if (decimals !== undefined) {
    dm = decimals < 0 ? 0 : decimals;
  } else {
    // 小于 10 用 1 位小数，大于等于 10 用整数
    dm = value < 10 ? 1 : 0;
  }

  const speed = parseFloat(value.toFixed(dm));

  return `${speed} ${sizes[i]}`;
}

/**
 * 格式化系统负载
 * @param load - 负载值
 * @param decimals - 小数位数，默认 2
 * @returns 格式化后的负载字符串，如 "1.23"
 */
export function formatLoad(load: number, decimals: number = 2): string {
  return load.toFixed(decimals);
}

/**
 * 根据时间范围格式化图表时间轴
 * @param timestamp - Unix 时间戳（秒）或 ISO 日期字符串
 * @param rangeHours - 时间范围（小时）
 * @returns 格式化后的时间字符串
 */
export function formatChartTimeByRange(
  timestamp: string | number,
  rangeHours: number
): string {
  const date =
    typeof timestamp === "string"
      ? new Date(timestamp)
      : new Date(timestamp * 1000);

  // 1小时内：显示分:秒
  if (rangeHours <= 1) {
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const seconds = date.getSeconds().toString().padStart(2, "0");
    return `${minutes}:${seconds}`;
  }

  // 6小时内：显示时:分
  if (rangeHours <= 6) {
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  }

  // 24小时内：显示时:分
  if (rangeHours <= 24) {
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  }

  // 7天内：显示月/日 时:分
  if (rangeHours <= 24 * 7) {
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${month}/${day} ${hours}:${minutes}`;
  }

  // 30天内：显示月/日
  if (rangeHours <= 24 * 30) {
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    return `${month}/${day}`;
  }

  // 更长时间：显示年/月/日
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  return `${year}/${month}/${day}`;
}

/**
 * 根据时间范围获取合适的数据点间隔（毫秒）
 * @param hours - 时间范围（小时）
 * @returns 间隔时间（毫秒）
 */
function getTimeInterval(hours: number): number {
  if (hours <= 1) return 2 * 60 * 1000; // 2分钟
  if (hours <= 6) return 15 * 60 * 1000; // 15分钟
  if (hours <= 24) return 60 * 60 * 1000; // 1小时
  if (hours <= 24 * 7) return 6 * 60 * 60 * 1000; // 6小时
  return 24 * 60 * 60 * 1000; // 1天
}

/**
 * 生成完整的时间轴数据点
 * @param data - 原始数据数组（需包含 time 字段）
 * @param timeRangeHours - 时间范围（小时）
 * @returns 时间轴数据点数组
 */
export function generateTimeAxis(
  data: Array<{ time: string | number }>,
  timeRangeHours: number
): Array<{ timestamp: number; timeLabel: string }> {
  if (data.length === 0) return [];

  const now = Date.now();
  const rangeMs = timeRangeHours * 60 * 60 * 1000;
  const startTime = now - rangeMs;

  // 根据时间范围决定间隔
  const interval = getTimeInterval(timeRangeHours);

  const points: Array<{ timestamp: number; timeLabel: string }> = [];
  for (let t = startTime; t <= now; t += interval) {
    points.push({
      timestamp: t,
      timeLabel: formatChartTimeByRange(t / 1000, timeRangeHours),
    });
  }

  return points;
}
