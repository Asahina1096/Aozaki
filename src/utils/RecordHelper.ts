import type { Record as LiveRecord } from "@/types/LiveData";
import { toFiniteNumber } from "@/lib/normalizers/primitives";

export interface RecordFormat {
  client: string;
  time: string;
  cpu: number | null;
  gpu: number | null;
  gpu_usage: number | null;
  gpu_memory: number | null;
  gpu_detailed?: {
    [index: number]: {
      usage: number | null;
      memory: number | null;
      temperature: number | null;
      device_index?: number;
      device_name?: string;
      mem_total?: number;
      mem_used?: number;
    };
  };
  ram: number | null;
  ram_total: number | null;
  swap: number | null;
  swap_total: number | null;
  load: number | null;
  temp: number | null;
  disk: number | null;
  disk_total: number | null;
  net_in: number | null;
  net_out: number | null;
  net_total_up: number | null;
  net_total_down: number | null;
  process: number | null;
  connections: number | null;
  connections_udp: number | null;
}

export type LoadRecordAPI = {
  client: string;
  time: string;
  cpu: number;
  gpu: number;
  ram: number;
  ram_total: number;
  swap: number;
  swap_total: number;
  load: number;
  temp: number;
  disk: number;
  disk_total: number;
  net_in: number;
  net_out: number;
  net_total_up: number;
  net_total_down: number;
  process: number;
  connections: number;
  connections_udp: number;
};

function usageToBytes(usage: unknown, total: unknown): number {
  const usageValue = toFiniteNumber(usage);
  const totalValue = toFiniteNumber(total);

  if (usageValue <= 0) {
    return 0;
  }

  if (totalValue > 0 && usageValue <= 100) {
    return (usageValue / 100) * totalValue;
  }

  return usageValue;
}

export function normalizeLoadRecordFromAPI(record: LoadRecordAPI): RecordFormat {
  const ramTotal = toFiniteNumber(record.ram_total);
  const swapTotal = toFiniteNumber(record.swap_total);
  const diskTotal = toFiniteNumber(record.disk_total);

  return {
    client: record.client,
    time: record.time,
    cpu: toFiniteNumber(record.cpu),
    gpu: toFiniteNumber(record.gpu),
    gpu_usage: toFiniteNumber(record.gpu),
    gpu_memory: null,
    ram: usageToBytes(record.ram, ramTotal),
    ram_total: ramTotal,
    swap: usageToBytes(record.swap, swapTotal),
    swap_total: swapTotal,
    load: toFiniteNumber(record.load),
    temp: toFiniteNumber(record.temp),
    disk: usageToBytes(record.disk, diskTotal),
    disk_total: diskTotal,
    net_in: toFiniteNumber(record.net_in),
    net_out: toFiniteNumber(record.net_out),
    net_total_up: toFiniteNumber(record.net_total_up),
    net_total_down: toFiniteNumber(record.net_total_down),
    process: toFiniteNumber(record.process),
    connections: toFiniteNumber(record.connections),
    connections_udp: toFiniteNumber(record.connections_udp),
  };
}

export function normalizeLiveRecordToRecordFormat(client: string, data: LiveRecord): RecordFormat {
  let gpuMemorySum = 0;
  let gpuCount = 0;
  const gpuDetailed: {
    [index: number]: {
      usage: number | null;
      memory: number | null;
      temperature: number | null;
    };
  } = {};

  if (data.gpu?.detailed_info) {
    for (const gpu of data.gpu.detailed_info) {
      const memPercent = gpu.memory_total > 0 ? (gpu.memory_used / gpu.memory_total) * 100 : 0;
      gpuMemorySum += memPercent;
      gpuCount++;
      gpuDetailed[gpuCount - 1] = {
        usage: gpu.utilization ?? null,
        memory: memPercent,
        temperature: gpu.temperature ?? null,
      };
    }
  }

  return {
    client,
    time: data.updated_at || "",
    cpu: toFiniteNumber(data.cpu.usage),
    gpu: 0,
    gpu_usage: toFiniteNumber(data.gpu?.average_usage),
    gpu_memory: gpuCount > 0 ? gpuMemorySum / gpuCount : 0,
    gpu_detailed: gpuCount > 0 ? gpuDetailed : undefined,
    ram: toFiniteNumber(data.ram.used),
    ram_total: 0,
    swap: toFiniteNumber(data.swap.used),
    swap_total: 0,
    load: toFiniteNumber(data.load.load1),
    temp: 0,
    disk: toFiniteNumber(data.disk.used),
    disk_total: 0,
    net_in: toFiniteNumber(data.network?.down),
    net_out: toFiniteNumber(data.network?.up),
    net_total_up: toFiniteNumber(data.network?.totalUp),
    net_total_down: toFiniteNumber(data.network?.totalDown),
    process: toFiniteNumber(data.process),
    connections: toFiniteNumber(data.connections.tcp),
    connections_udp: toFiniteNumber(data.connections.udp),
  };
}

export function liveDataToRecords(client: string, liveData: LiveRecord[]): RecordFormat[] {
  if (!liveData) return [];
  return liveData.map((data) => normalizeLiveRecordToRecordFormat(client, data));
}

function createNullTemplate(obj: unknown): unknown {
  if (obj === null || obj === undefined) return null;
  if (typeof obj === "number") return null;
  if (typeof obj === "string" || typeof obj === "boolean") return obj;
  if (Array.isArray(obj)) return obj.map(createNullTemplate);
  if (typeof obj === "object") {
    const res: Record<string, unknown> = {};
    for (const k in obj) {
      if (k === "updated_at" || k === "time") continue;
      res[k] = createNullTemplate((obj as Record<string, unknown>)[k]);
    }
    return res;
  }
  return null;
}

export default function fillMissingTimePoints<T extends { time?: string; updated_at?: string }>(
  data: T[],
  intervalSec: number = 10,
  totalSeconds: number | null = 180,
  matchToleranceSec?: number,
): T[] {
  if (!data.length) return [];

  const getTime = (item: T) => new Date(item.time ?? item.updated_at ?? "").getTime();

  const timedData = data.map((item) => ({ item, timeMs: getTime(item) }));
  timedData.sort((a, b) => a.timeMs - b.timeMs);

  const firstItem = timedData[0];
  const lastItem = timedData[timedData.length - 1];
  const end = lastItem.timeMs;
  const interval = intervalSec * 1000;

  const start =
    totalSeconds !== null && totalSeconds > 0
      ? end - totalSeconds * 1000 + interval
      : firstItem.timeMs;

  const timePoints: number[] = [];
  for (let t = start; t <= end; t += interval) {
    timePoints.push(t);
  }

  const nullTemplate = createNullTemplate(lastItem.item) as Record<string, unknown>;
  let dataIdx = 0;
  const matchToleranceMs = (matchToleranceSec ?? intervalSec) * 1000;

  return timePoints.map((t) => {
    let found: T | undefined;

    while (dataIdx < timedData.length && timedData[dataIdx].timeMs < t - matchToleranceMs) {
      dataIdx++;
    }

    if (dataIdx < timedData.length && Math.abs(timedData[dataIdx].timeMs - t) <= matchToleranceMs) {
      found = timedData[dataIdx].item;
    }

    if (found) {
      return { ...found, time: new Date(t).toISOString() };
    }

    return { ...nullTemplate, time: new Date(t).toISOString() } as T;
  });
}

export function interpolateNullsLinear<
  T extends Record<string, unknown> & { time?: string; updated_at?: string },
>(
  rows: T[],
  keys: string[],
  options?:
    | number
    | {
        maxGapMs?: number;
        maxGapMultiplier?: number;
        minCapMs?: number;
        maxCapMs?: number;
      },
): T[] {
  if (!rows || rows.length === 0 || !keys.length) return rows;

  const times = rows.map((r) => new Date(r.time ?? r.updated_at ?? "").getTime());
  const out = rows.map((r) => ({ ...r }));

  const opts = typeof options === "number" ? { maxGapMs: options } : options || {};
  const maxGapMsUnified = opts.maxGapMs;
  const multiplier = opts.maxGapMultiplier ?? 6;
  const minCap = opts.minCapMs ?? 2 * 60_000;
  const maxCap = opts.maxCapMs ?? 30 * 60_000;

  const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

  for (const key of keys) {
    const validIdx: number[] = [];
    for (let i = 0; i < rows.length; i++) {
      const v = rows[i][key];
      if (typeof v === "number" && Number.isFinite(v)) validIdx.push(i);
    }

    if (validIdx.length < 2) continue;

    let perKeyMaxGap = maxGapMsUnified;
    if (perKeyMaxGap === undefined) {
      const gaps: number[] = [];
      for (let s = 0; s < validIdx.length - 1; s++) {
        const i0 = validIdx[s];
        const i1 = validIdx[s + 1];
        const t0 = times[i0];
        const t1 = times[i1];
        if (Number.isFinite(t0) && Number.isFinite(t1) && t1 > t0) {
          gaps.push(t1 - t0);
        }
      }
      if (gaps.length === 0) continue;
      gaps.sort((a, b) => a - b);
      const median = gaps[(gaps.length / 2) | 0];
      perKeyMaxGap = clamp(median * multiplier, minCap, maxCap);
    }

    for (let s = 0; s < validIdx.length - 1; s++) {
      const i0 = validIdx[s];
      const i1 = validIdx[s + 1];
      const t0 = times[i0];
      const t1 = times[i1];
      const v0 = rows[i0][key];
      const v1 = rows[i1][key];

      if (!Number.isFinite(t0) || !Number.isFinite(t1) || t1 <= t0) continue;
      if (typeof v0 !== "number" || typeof v1 !== "number") continue;
      if (perKeyMaxGap && t1 - t0 > perKeyMaxGap) continue;

      for (let j = i0 + 1; j < i1; j++) {
        const tj = times[j];
        const ratio = (tj - t0) / (t1 - t0);
        (out[j] as Record<string, unknown>)[key] = v0 + (v1 - v0) * ratio;
      }
    }
  }

  return out;
}

export function cutPeakValues<T extends Record<string, unknown>>(
  data: T[],
  keys: string[],
  alpha: number = 0.3,
  windowSize: number = 15,
  spikeThreshold: number = 0.3,
): T[] {
  if (!data || data.length === 0) return data;

  const result = [...data];
  const halfWindow = Math.floor(windowSize / 2);

  for (const key of keys) {
    for (let i = 0; i < result.length; i++) {
      const currentValue = result[i][key];

      if (currentValue != null && typeof currentValue === "number") {
        const neighborValues: number[] = [];
        for (
          let j = Math.max(0, i - halfWindow);
          j <= Math.min(result.length - 1, i + halfWindow);
          j++
        ) {
          if (j === i) continue;
          const neighbor = result[j][key];
          if (neighbor != null && typeof neighbor === "number") {
            neighborValues.push(neighbor);
          }
        }

        if (neighborValues.length >= 2) {
          const neighborSum = neighborValues.reduce((sum, val) => sum + val, 0);
          const neighborMean = neighborValues.length > 0 ? neighborSum / neighborValues.length : 0;

          if (neighborMean > 0) {
            const relativeChange = Math.abs(currentValue - neighborMean) / neighborMean;
            if (relativeChange > spikeThreshold) {
              result[i] = { ...result[i], [key]: null };
            }
          } else if (Math.abs(currentValue) > 10) {
            result[i] = { ...result[i], [key]: null };
          }
        }
      }
    }

    let ewma: number | null = null;
    for (let i = 0; i < result.length; i++) {
      const currentValue = result[i][key];
      if (currentValue != null && typeof currentValue === "number") {
        if (ewma === null) {
          ewma = currentValue;
        } else {
          ewma = alpha * currentValue + (1 - alpha) * ewma;
        }
        result[i] = { ...result[i], [key]: ewma };
      } else if (ewma !== null) {
        result[i] = { ...result[i], [key]: ewma };
      }
    }
  }

  return result;
}
