const BYTE_UNITS = ["B", "KB", "MB", "GB", "TB", "PB"] as const;
const SPEED_UNITS = ["B/s", "KB/s", "MB/s", "GB/s", "TB/s"] as const;
const COMPACT_UNITS = ["B", "K", "M", "G", "T", "P"] as const;

type FormatBytesOptions = {
  decimals?: number;
  minDecimals?: number;
  maxDecimals?: number;
};

function toPositiveFinite(value: number): number {
  if (!Number.isFinite(value) || value <= 0) {
    return 0;
  }
  return value;
}

function resolveUnitIndex(value: number, unitsLength: number): number {
  if (value <= 0) {
    return 0;
  }
  return Math.min(Math.floor(Math.log(value) / Math.log(1024)), unitsLength - 1);
}

export function roundTo(value: number, decimals: number): number {
  const precision = Math.max(0, decimals);
  const factor = 10 ** precision;
  return Math.round(value * factor) / factor;
}

export function formatBytes(value: number, options: FormatBytesOptions = {}): string {
  const bytes = toPositiveFinite(value);
  if (bytes === 0) {
    return "0 B";
  }

  const unitIndex = resolveUnitIndex(bytes, BYTE_UNITS.length);
  const size = bytes / 1024 ** unitIndex;

  const maxDecimals = Math.max(0, options.maxDecimals ?? options.decimals ?? 2);
  const minDecimals = Math.min(maxDecimals, Math.max(0, options.minDecimals ?? 0));
  const rounded = roundTo(size, maxDecimals);

  const text =
    minDecimals === maxDecimals
      ? rounded.toFixed(maxDecimals)
      : rounded.toLocaleString("en-US", {
          minimumFractionDigits: minDecimals,
          maximumFractionDigits: maxDecimals,
          useGrouping: false,
        });

  return `${text} ${BYTE_UNITS[unitIndex]}`;
}

export function formatSpeed(value: number, decimals?: number): string {
  const bytesPerSecond = toPositiveFinite(value);
  if (bytesPerSecond === 0) {
    return "0 B/s";
  }

  const unitIndex = resolveUnitIndex(bytesPerSecond, SPEED_UNITS.length);
  const size = bytesPerSecond / 1024 ** unitIndex;
  const precision = decimals !== undefined ? Math.max(0, decimals) : size < 10 ? 1 : 0;

  return `${roundTo(size, precision)} ${SPEED_UNITS[unitIndex]}`;
}

export function formatBytesCompact(value: number, withPerSecond = false): string {
  const bytes = toPositiveFinite(value);
  if (bytes === 0) {
    return withPerSecond ? "0B/s" : "0B";
  }

  const unitIndex = resolveUnitIndex(bytes, COMPACT_UNITS.length);
  const size = bytes / 1024 ** unitIndex;
  const precision = size >= 100 ? 0 : size >= 10 ? 1 : 2;

  if (unitIndex === 0) {
    const base = `${Math.round(size)}${COMPACT_UNITS[unitIndex]}`;
    return withPerSecond ? `${base}/s` : base;
  }

  const base = `${size.toFixed(precision)}${COMPACT_UNITS[unitIndex]}`;
  return withPerSecond ? `${base}/s` : base;
}
