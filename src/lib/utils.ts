import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { ServerStats } from "./types/serverstatus";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function isServerOnline(server: ServerStats): boolean {
  return server.online4 || server.online6;
}

export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return "0 B";
  if (bytes < 0) return "0 B";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["B", "KB", "MB", "GB", "TB", "PB"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const multiplier = Math.pow(10, dm);
  const size = Math.round((bytes / Math.pow(k, i)) * multiplier) / multiplier;

  return `${size} ${sizes[i]}`;
}

export function formatPercent(value: number, total: number, decimals: number = 1): string {
  if (total === 0) return "0%";
  const percent = (value / total) * 100;
  const multiplier = Math.pow(10, decimals);
  const rounded = Math.round(percent * multiplier) / multiplier;
  return `${rounded}%`;
}

export function formatSpeed(bytesPerSecond: number, decimals?: number): string {
  if (bytesPerSecond === 0) return "0 B/s";
  if (bytesPerSecond < 0) return "0 B/s";

  const k = 1024;
  const sizes = ["B/s", "KB/s", "MB/s", "GB/s", "TB/s"];

  const i = Math.floor(Math.log(bytesPerSecond) / Math.log(k));
  const value = bytesPerSecond / Math.pow(k, i);

  let dm: number;
  if (decimals !== undefined) {
    dm = decimals < 0 ? 0 : decimals;
  } else {
    dm = value < 10 ? 1 : 0;
  }

  const multiplier = Math.pow(10, dm);
  const speed = Math.round(value * multiplier) / multiplier;

  return `${speed} ${sizes[i]}`;
}

export function formatLoad(value: number): number {
  return Math.round(value * 100) / 100;
}

export function formatUptime(uptime: string): string {
  if (!uptime || uptime === "--") return "--";

  if (uptime.includes("天")) {
    const days = parseInt(uptime.replace(/[^\d]/g, ""), 10);
    if (Number.isFinite(days) && days > 0) {
      return `${days}天`;
    }
    return uptime;
  }

  const parts = uptime.split(":");
  if (parts.length === 3) {
    const hours = parseInt(parts[0], 10);
    const minutes = parseInt(parts[1], 10);
    const seconds = parseInt(parts[2], 10);

    const totalSeconds = hours * 3600 + minutes * 60 + seconds;
    const days = Math.floor(totalSeconds / (24 * 3600));

    if (days >= 1) {
      return `${days}天`;
    }

    const hrs = Math.floor((totalSeconds % (24 * 3600)) / 3600);
    if (hrs > 0) {
      return `${hrs}小时`;
    }

    const mins = Math.floor((totalSeconds % 3600) / 60);
    if (mins > 0) {
      return `${mins}分钟`;
    }

    return "1分钟";
  }

  return uptime;
}

export function formatRelativeTime(timestamp: number): string {
  if (!timestamp || timestamp <= 0) return "从未";

  const now = Date.now();
  const diff = now - timestamp;

  if (diff < 0) return "刚刚";
  if (diff < 10000) return "刚刚";

  if (diff < 60000) {
    const seconds = Math.floor(diff / 1000);
    return `${seconds}秒前`;
  }

  if (diff < 3600000) {
    const minutes = Math.floor(diff / 60000);
    return `${minutes}分钟前`;
  }

  if (diff < 86400000) {
    const hours = Math.floor(diff / 3600000);
    return `${hours}小时前`;
  }

  const days = Math.floor(diff / 86400000);
  return `${days}天前`;
}
