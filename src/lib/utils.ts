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
 * @returns 格式化后的字符串，如 "1天"、"2小时"、"30分钟" 或 "45秒"
 */
export function formatDuration(seconds: number): string {
  if (seconds < 0) return "0秒";
  if (seconds === 0) return "0秒";

  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  // 大于等于1天：只显示天数
  if (days > 0) {
    return `${days}天`;
  }

  // 大于等于1小时：只显示小时数
  if (hours > 0) {
    return `${hours}小时`;
  }

  // 大于等于1分钟：只显示分钟数
  if (minutes > 0) {
    return `${minutes}分钟`;
  }

  // 小于1分钟：只显示秒数
  return `${secs}秒`;
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
 * 美化 uptime 显示
 * @param uptime - uptime 字符串（如 "05:45:24" 或 "28 天"）
 * @returns 格式化后的 uptime 字符串（如 "5h45m" 或 "28d"）
 */
export function formatUptime(uptime: string): string {
  if (!uptime || uptime === "--") return "--";

  // 处理中文格式（如 "28 天"）
  if (uptime.includes("天")) {
    const days = parseInt(uptime.replace(/[^\d]/g, ""), 10);
    return days > 0 ? `${days}d` : uptime;
  }

  // 解析 HH:MM:SS 格式
  const parts = uptime.split(":");
  if (parts.length === 3) {
    const hours = parseInt(parts[0], 10);
    const minutes = parseInt(parts[1], 10);
    const seconds = parseInt(parts[2], 10);

    // 计算年、天、小时
    const totalSeconds = hours * 3600 + minutes * 60 + seconds;
    const years = Math.floor(totalSeconds / (365 * 24 * 3600));
    const days = Math.floor((totalSeconds % (365 * 24 * 3600)) / (24 * 3600));
    const hrs = Math.floor((totalSeconds % (24 * 3600)) / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;

    // 构建结果，只显示有值的单位
    const result: string[] = [];
    if (years > 0) result.push(`${years}y`);
    if (days > 0) result.push(`${days}d`);
    if (hrs > 0) result.push(`${hrs}h`);
    if (mins > 0) result.push(`${mins}m`);
    if (secs > 0) result.push(`${secs}s`);

    // 如果所有值都是0，返回 0s
    return result.length > 0 ? result.join("") : "0s";
  }

  // 无法解析，返回原始字符串
  return uptime;
}
