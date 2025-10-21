/**
 * ServerStatus-Rust API 类型定义
 * 基于 /json/stats.json 端点
 */

/**
 * 节点统计信息
 */
export interface ServerStats {
  /**
   * 节点名称（唯一标识符）
   *
   * 在 ServerStatus-Rust 配置中，name 字段是主机的唯一标识符，不可重复。
   * 用于客户端认证和服务器识别。
   *
   * @example "h1", "server-beijing", "node-us-01"
   * @see https://github.com/zdz/ServerStatus-Rust
   */
  name: string;
  /** 节点别名 */
  alias?: string;
  /** 虚拟化类型 (如 "kvm", "docker", "lxc") */
  type?: string;
  /** 位置标识 */
  location?: string;
  /** IPv4 在线状态 */
  online4: boolean;
  /** IPv6 在线状态 */
  online6: boolean;
  /** 运行时长 (字符串格式，如 "05:45:24" 或 "28 天") */
  uptime: string;
  /** 1分钟系统负载 */
  load_1: number;
  /** 5分钟系统负载 */
  load_5: number;
  /** 15分钟系统负载 */
  load_15: number;
  /** CPU 使用率 (百分比) */
  cpu: number;
  /** 总内存 (KB) */
  memory_total: number;
  /** 已使用内存 (KB) */
  memory_used: number;
  /** 总交换分区 (KB) */
  swap_total: number;
  /** 已使用交换分区 (KB) */
  swap_used: number;
  /** 总硬盘空间 (MB) */
  hdd_total: number;
  /** 已使用硬盘空间 (MB) */
  hdd_used: number;
  /** 当前网络接收速率 (字节/秒) */
  network_rx: number;
  /** 当前网络发送速率 (字节/秒) */
  network_tx: number;
  /** 累计网络接收字节数 */
  network_in: number;
  /** 累计网络发送字节数 */
  network_out: number;
  /** 上次网络接收总量 */
  last_network_in?: number;
  /** 上次网络发送总量 */
  last_network_out?: number;
  /** 月流量起始日 */
  monthstart?: number;
  /** 自定义标签 */
  labels?: string;
  /** 自定义数据 */
  custom?: string;
  /** 组 ID */
  gid?: string;
  /** 权重 (用于排序) */
  weight?: number;
  /** 是否禁用 */
  disabled?: boolean;
  /** 最新时间戳 */
  latest_ts?: number;
  /** SI 单位 */
  si?: boolean;
  /** 是否通知 */
  notify?: boolean;
  /** 是否启用 vnstat */
  vnstat?: boolean;
  /** Ping 延迟 (自定义端点) */
  ping_10010?: number;
  ping_189?: number;
  ping_10086?: number;
  /** Ping 时间 */
  time_10010?: number;
  time_189?: number;
  time_10086?: number;
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
  /** 节点列表 */
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
 * 详细节点统计信息 (Admin API)
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
  /** 节点列表 */
  servers: DetailedServerStats[];
}
