/**
 * ServerStatus-Rust API 类型定义
 * 基于 /json/stats.json 端点
 */

/**
 * 服务器统计信息
 */
export interface ServerStats {
  /** 服务器名称 */
  name: string;
  /** 服务器别名 */
  alias?: string;
  /** 虚拟化类型 (如 "kvm", "docker", "lxc") */
  type?: string;
  /** 位置标识 */
  location?: string;
  /** IPv4 在线状态 */
  online4: boolean;
  /** IPv6 在线状态 */
  online6: boolean;
  /** 运行时长 */
  uptime: number;
  /** 1分钟系统负载 */
  load_1: number;
  /** 5分钟系统负载 */
  load_5: number;
  /** 15分钟系统负载 */
  load_15: number;
  /** CPU 使用率 (百分比) */
  cpu: number;
  /** 总内存 (字节) */
  memory_total: number;
  /** 已使用内存 (字节) */
  memory_used: number;
  /** 总交换分区 (字节) */
  swap_total: number;
  /** 已使用交换分区 (字节) */
  swap_used: number;
  /** 总硬盘空间 (字节) */
  hdd_total: number;
  /** 已使用硬盘空间 (字节) */
  hdd_used: number;
  /** 总接收字节数 */
  network_rx: number;
  /** 总发送字节数 */
  network_tx: number;
  /** 当前网络接收速率 (字节/秒) */
  network_in: number;
  /** 当前网络发送速率 (字节/秒) */
  network_out: number;
  /** 月流量起始日 */
  monthstart?: number;
  /** 自定义标签 */
  labels?: string;
  /** 权重 (用于排序) */
  weight?: number;
  /** 是否禁用 */
  disabled?: boolean;
  /** 区域 */
  region?: string;
  /** Ping 延迟 (自定义端点) */
  ping_10010?: number;
  ping_189?: number;
  ping_10086?: number;
  /** TCP/UDP/进程数 */
  tcp_count?: number;
  udp_count?: number;
  process_count?: number;
  /** 线程数 */
  thread_count?: number;
}

/**
 * 统计数据响应
 */
export interface StatsResponse {
  /** 更新时间戳 */
  updated: number;
  /** 服务器列表 */
  servers: ServerStats[];
}

/**
 * IP 信息
 */
export interface IpInfo {
  /** IP 地址 */
  query: string;
  /** 国家 */
  country: string;
  /** 城市 */
  city: string;
  /** ISP */
  isp: string;
}

/**
 * 系统信息
 */
export interface SysInfo {
  /** 主机名 */
  host_name: string;
  /** 操作系统名称 */
  os_name: string;
  /** 操作系统版本 */
  os_release: string;
  /** 内核版本 */
  kernel_version: string;
  /** CPU 核心数 */
  cpu_num: number;
  /** CPU 型号 */
  cpu_brand: string;
}

/**
 * 详细服务器统计信息 (Admin API)
 */
export interface DetailedServerStats extends ServerStats {
  /** IP 信息 */
  ip_info?: IpInfo;
  /** 系统信息 */
  sys_info?: SysInfo;
}

/**
 * 详细统计数据响应 (Admin API)
 */
export interface DetailedStatsResponse {
  /** 更新时间戳 */
  updated: number;
  /** 服务器列表 */
  servers: DetailedServerStats[];
}
