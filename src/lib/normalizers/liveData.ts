import type { Record as LiveRecord } from "@/types/LiveData";
import { toFiniteNumber, toStringOr } from "@/lib/normalizers/primitives";

export type LatestStatusRecord = {
  cpu?: number;
  ram?: number;
  swap?: number;
  load?: number;
  load5?: number;
  load15?: number;
  disk?: number;
  net_out?: number;
  net_in?: number;
  net_total_out?: number;
  net_total_up?: number;
  net_total_in?: number;
  net_total_down?: number;
  connections?: number;
  connections_udp?: number;
  gpu?: number;
  uptime?: number;
  process?: number;
  time?: string | number;
};

export type RecentStatusRecord = {
  cpu?: number;
  ram?: number;
  swap?: number;
  load?: number;
  disk?: number;
  net_out?: number;
  net_in?: number;
  net_total_up?: number;
  net_total_down?: number;
  connections?: number;
  connections_udp?: number;
  process?: number;
  time?: string;
};

function createLiveRecord(input: {
  cpu?: unknown;
  ram?: unknown;
  swap?: unknown;
  load1?: unknown;
  load5?: unknown;
  load15?: unknown;
  disk?: unknown;
  netUp?: unknown;
  netDown?: unknown;
  netTotalUp?: unknown;
  netTotalDown?: unknown;
  connectionsTcp?: unknown;
  connectionsUdp?: unknown;
  gpuUsage?: unknown;
  uptime?: unknown;
  process?: unknown;
  updatedAt?: unknown;
}): LiveRecord {
  const gpuUsage = toFiniteNumber(input.gpuUsage, -1);

  return {
    cpu: { usage: toFiniteNumber(input.cpu) },
    ram: { used: toFiniteNumber(input.ram) },
    swap: { used: toFiniteNumber(input.swap) },
    load: {
      load1: toFiniteNumber(input.load1),
      load5: toFiniteNumber(input.load5),
      load15: toFiniteNumber(input.load15),
    },
    disk: { used: toFiniteNumber(input.disk) },
    network: {
      up: toFiniteNumber(input.netUp),
      down: toFiniteNumber(input.netDown),
      totalUp: toFiniteNumber(input.netTotalUp),
      totalDown: toFiniteNumber(input.netTotalDown),
    },
    connections: {
      tcp: toFiniteNumber(input.connectionsTcp),
      udp: toFiniteNumber(input.connectionsUdp),
    },
    gpu:
      gpuUsage >= 0
        ? {
            count: 0,
            average_usage: gpuUsage,
            detailed_info: [],
          }
        : undefined,
    uptime: toFiniteNumber(input.uptime),
    process: toFiniteNumber(input.process),
    message: "",
    updated_at: toStringOr(input.updatedAt),
  };
}

export function normalizeLatestStatusRecord(record: LatestStatusRecord): LiveRecord {
  return createLiveRecord({
    cpu: record.cpu,
    ram: record.ram,
    swap: record.swap,
    load1: record.load,
    load5: record.load5,
    load15: record.load15,
    disk: record.disk,
    netUp: record.net_out,
    netDown: record.net_in,
    netTotalUp: record.net_total_out ?? record.net_total_up,
    netTotalDown: record.net_total_in ?? record.net_total_down,
    connectionsTcp: record.connections,
    connectionsUdp: record.connections_udp,
    gpuUsage: record.gpu,
    uptime: record.uptime,
    process: record.process,
    updatedAt: record.time,
  });
}

export function normalizeRecentStatusRecord(record: RecentStatusRecord): LiveRecord {
  return createLiveRecord({
    cpu: record.cpu,
    ram: record.ram,
    swap: record.swap,
    load1: record.load,
    load5: 0,
    load15: 0,
    disk: record.disk,
    netUp: record.net_out,
    netDown: record.net_in,
    netTotalUp: record.net_total_up,
    netTotalDown: record.net_total_down,
    connectionsTcp: record.connections,
    connectionsUdp: record.connections_udp,
    process: record.process,
    updatedAt: record.time,
  });
}
