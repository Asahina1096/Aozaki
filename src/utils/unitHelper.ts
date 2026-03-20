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

  try {
    const value = new Function(`return ${numericPart}`)();

    if (isNaN(value)) {
      return 0;
    }

    const multiplier = units[unit];
    return Math.round(value * multiplier);
  } catch (error) {
    console.error(`Error parsing string "${str}":`, error);
    return 0;
  }
}

export function formatBytes(bytes: number): string {
  const units = ["B", "KB", "MB", "GB", "TB", "PB"];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  if (unitIndex === 0) {
    return `${Math.round(size)} ${units[unitIndex]}`;
  } else if (unitIndex >= 2 && bytes >= 1024**3) {
    return `${size.toFixed(2)} ${units[unitIndex]}`;
  } else if (size > 99.99) {
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  } else {
    return `${size.toFixed(2)} ${units[unitIndex]}`;
  }
}