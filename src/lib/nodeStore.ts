import { getSharedWsClient } from "./wsRpc2";
import { getSharedClient } from "./rpc2";
import type { Client, NodeStatus } from "./types/komari";

type Listener = () => void;

class NodeStore {
  private clients: Record<string, Client> = {};
  private statuses: Record<string, NodeStatus> = {};
  private listeners: Set<Listener> = new Set();
  private intervalId: number | null = null;
  private isRunning = false;
  private wsClient = getSharedWsClient();
  private dataSource: "http" | "websocket" = "http";
  private wsConnected = false;
  private wsReconnectTimer: number | null = null;
  private wsReconnectInterval = 30000; // 30秒重试一次

  // 启动 WebSocket 重连定时器
  private startWsReconnectTimer() {
    if (this.wsReconnectTimer !== null) return;

    this.wsReconnectTimer = window.setInterval(() => {
      // 仅在 HTTP 模式下且未连接时尝试重连
      if (this.dataSource === "http" && !this.wsConnected) {
        this.wsClient
          .connect()
          .then(() => {
            this.wsConnected = true;
            this.dataSource = "websocket";
            // WebSocket 连接成功，停止重连定时器
            this.stopWsReconnectTimer();
          })
          .catch(() => {
            // 重连失败，继续使用 HTTP，等待下次重试
          });
      }
    }, this.wsReconnectInterval);
  }

  // 停止 WebSocket 重连定时器
  private stopWsReconnectTimer() {
    if (this.wsReconnectTimer !== null) {
      window.clearInterval(this.wsReconnectTimer);
      this.wsReconnectTimer = null;
    }
  }

  // 启动数据订阅
  async start(refreshInterval: number = 1000) {
    if (this.isRunning) return;

    this.isRunning = true;
    const isDev = import.meta.env.DEV;

    try {
      if (isDev) {
        // 开发环境：跳过 WebSocket 连接，直接使用 HTTP 轮询
      } else {
        // 生产环境：新的混合模式
        this.dataSource = "http";

        // 1. 立即通过 HTTP 获取数据（快速首屏）
        await this.fetchData();

        // 2. 后台连接 WebSocket（不阻塞）
        this.wsClient
          .connect()
          .then(() => {
            this.wsConnected = true;
            this.dataSource = "websocket";
          })
          .catch(() => {
            this.wsConnected = false;
            // 连接失败，启动重连定时器
            this.startWsReconnectTimer();
          });
      }

      // 设置定时刷新（使用当前的 dataSource）
      this.intervalId = window.setInterval(() => {
        this.fetchData();
      }, refreshInterval);
    } catch (error) {
      console.error("Failed to start node store:", error);
      this.isRunning = false;
    }
  }

  // 停止数据订阅
  stop() {
    if (this.intervalId !== null) {
      window.clearInterval(this.intervalId);
      this.intervalId = null;
    }
    // 停止 WebSocket 重连定时器
    this.stopWsReconnectTimer();
    this.isRunning = false;
  }

  // 获取数据
  private async fetchData() {
    const isDev = import.meta.env.DEV;

    try {
      let nodesData, statusData;

      if (isDev || this.dataSource === "http") {
        // 使用 HTTP 模式
        const httpClient = getSharedClient();

        [nodesData, statusData] = await Promise.all([
          httpClient.getNodes(),
          httpClient.getNodesLatestStatus(),
        ]);
      } else {
        // 使用 WebSocket 模式
        [nodesData, statusData] = await Promise.all([
          this.wsClient.call("common:getNodes"),
          this.wsClient.call("common:getNodesLatestStatus"),
        ]);
      }

      // 处理节点数据
      if (
        nodesData &&
        typeof nodesData === "object" &&
        !Array.isArray(nodesData)
      ) {
        if ("uuid" in nodesData) {
          // 单个节点
          const client = nodesData as Client;
          this.clients = { [client.uuid]: client };
        } else {
          // 多个节点
          this.clients = nodesData as Record<string, Client>;
        }
      }

      // 处理状态数据
      if (statusData) {
        this.statuses = statusData as Record<string, NodeStatus>;
      }

      // 通知所有监听器
      this.notifyListeners();
    } catch (err) {
      console.error("Failed to fetch node data:", err);

      // 如果 WebSocket 失败，降级到 HTTP 并启动重连定时器
      if (!isDev && this.dataSource === "websocket") {
        this.dataSource = "http";
        this.wsConnected = false;
        this.startWsReconnectTimer();
      }
    }
  }

  // 订阅数据更新
  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);

    // 返回取消订阅函数
    return () => {
      this.listeners.delete(listener);

      // 如果没有监听器了，停止轮询
      if (this.listeners.size === 0) {
        this.stop();
      }
    };
  }

  // 通知监听器
  private notifyListeners() {
    this.listeners.forEach((listener) => listener());
  }

  // 获取所有客户端
  getClients(): Record<string, Client> {
    return this.clients;
  }

  // 获取单个客户端
  getClient(uuid: string): Client | null {
    return this.clients[uuid] || null;
  }

  // 获取所有状态
  getStatuses(): Record<string, NodeStatus> {
    return this.statuses;
  }

  // 获取单个状态
  getStatus(uuid: string): NodeStatus | null {
    return this.statuses[uuid] || null;
  }

  // 获取监听器数量
  getListenerCount(): number {
    return this.listeners.size;
  }

  // 获取当前数据源
  getDataSource(): "http" | "websocket" {
    return this.dataSource;
  }

  // 获取 WebSocket 连接状态
  isWebSocketConnected(): boolean {
    return this.wsConnected;
  }
}

// 单例实例
const nodeStore = new NodeStore();

export { nodeStore };
