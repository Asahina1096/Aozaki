// Komari RPC2 类型定义

export interface Client {
  uuid: string;
  token?: string;
  name: string;
  cpu_name: string;
  virtualization: string;
  arch: string;
  cpu_cores: number;
  os: string;
  kernel_version: string;
  gpu_name: string;
  ipv4?: string;
  ipv6?: string;
  region: string;
  remark?: string;
  public_remark: string;
  mem_total: number;
  swap_total: number;
  disk_total: number;
  version?: string;
  weight: number;
  price: number;
  billing_cycle: number;
  auto_renewal: boolean;
  currency: string;
  expired_at: string;
  group: string;
  tags: string;
  hidden: boolean;
  traffic_limit: number;
  traffic_limit_type: string;
  created_at: string;
  updated_at: string;
}

export interface NodeStatus {
  client: string;
  time: string;
  cpu: number;
  gpu: number;
  ram: number;
  ram_total: number;
  swap: number;
  swap_total: number;
  load: number;
  load5: number;
  load15: number;
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
  online: boolean;
}

export interface PublicInfo {
  allow_cors: boolean;
  custom_body: string;
  custom_head: string;
  description: string;
  disable_password_login: boolean;
  oauth_enable: boolean;
  oauth_provider: string;
  ping_record_preserve_time: number;
  private_site: boolean;
  record_enabled: boolean;
  record_preserve_time: number;
  sitename: string;
  theme: string;
  theme_settings: Record<string, any>;
}

export interface MeInfo {
  "2fa_enabled": boolean;
  logged_in: boolean;
  sso_id: string;
  sso_type: string;
  username: string;
  uuid: string;
}

export interface VersionInfo {
  version: string;
  hash: string;
}

// JSON-RPC2 类型
export interface JsonRpcRequest {
  jsonrpc: "2.0";
  method: string;
  params?: any[] | Record<string, any>;
  id?: string | number;
}

export interface JsonRpcResponse<T = any> {
  jsonrpc: "2.0";
  result?: T;
  error?: {
    code: number;
    message: string;
    data?: any;
  };
  id: string | number | null;
}

export type NodesResponse = Record<string, Client> | Client;
export type NodesStatusResponse = Record<string, NodeStatus>;
