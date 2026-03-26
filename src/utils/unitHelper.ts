import { formatBytes as formatBytesValue } from "@/lib/format/bytes";

export function stringToBytes(str: string): number {
  if (typeof str !== "string" || str.length === 0) {
    return 0;
  }
  const units: { [key: string]: number } = {
    b: 1,
    byte: 1,
    bytes: 1,
    k: 1024,
    kb: 1024,
    kib: 1024,
    kilobyte: 1024,
    m: 1024 ** 2,
    mb: 1024 ** 2,
    mib: 1024 ** 2,
    megabyte: 1024 ** 2,
    g: 1024 ** 3,
    gb: 1024 ** 3,
    gib: 1024 ** 3,
    gigabyte: 1024 ** 3,
    t: 1024 ** 4,
    tb: 1024 ** 4,
    tib: 1024 ** 4,
    terabyte: 1024 ** 4,
    p: 1024 ** 5,
    pb: 1024 ** 5,
    pib: 1024 ** 5,
    petabyte: 1024 ** 5,
  };

  const cleanStr = str.toLowerCase().replace(/,/g, "").replace(/\s/g, "");

  const unitKeys = Object.keys(units).sort((a, b) => b.length - a.length);
  const unitRegex = new RegExp(`(${unitKeys.join("|")})$`);

  let unit = "b";
  let numericPart = cleanStr;

  const match = cleanStr.match(unitRegex);
  if (match) {
    unit = match[1];
    numericPart = cleanStr.substring(0, cleanStr.length - unit.length);
  }

  if (numericPart === "") {
    numericPart = "1";
  }

  const numericPattern = /^[+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?$/i;
  if (!numericPattern.test(numericPart)) {
    return 0;
  }

  const value = Number(numericPart);
  if (!Number.isFinite(value)) {
    return 0;
  }

  const multiplier = units[unit];
  return Math.round(value * multiplier);
}

export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) {
    return "0 B";
  }

  if (bytes < 1024) {
    return formatBytesValue(bytes, { minDecimals: 0, maxDecimals: 0 });
  }

  if (bytes >= 1024 ** 3) {
    return formatBytesValue(bytes, { minDecimals: 2, maxDecimals: 2 });
  }

  return formatBytesValue(bytes, { minDecimals: 1, maxDecimals: 2 });
}
