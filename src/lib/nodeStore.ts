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

  // 启动数据订阅
  async start(refreshInterval: number = 1000) {
    if (this.isRunning) return;

    this.isRunning = true;
    const isDev = import.meta.env.DEV;

    try {
      if (isDev) {
        // 开发环境：跳过 WebSocket 连接，直接使用 HTTP 轮询
        console.log("🚀 开发环境：启动 HTTP 轮询模式");
      } else {
        // 生产环境：连接 WebSocket
        await this.wsClient.connect();
      }

      // 首次获取数据
      await this.fetchData();

      // 设置定时刷新
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
    this.isRunning = false;
  }

  // 获取数据
  private async fetchData() {
    try {
      // 检查是否为开发环境
      const isDev = import.meta.env.DEV;

      let nodesData, statusData;

      if (isDev) {
        // 开发环境：使用 HTTP RPC2 客户端
        console.log("🔄 开发环境：使用 HTTP 轮询获取数据");
        const httpClient = getSharedClient();

        [nodesData, statusData] = await Promise.all([
          httpClient.getNodes(),
          httpClient.getNodesLatestStatus(),
        ]);
      } else {
        // 生产环境：使用 WebSocket 客户端
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
}

// 单例实例
const nodeStore = new NodeStore();

export { nodeStore };
