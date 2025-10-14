import type { JsonRpcRequest, JsonRpcResponse } from "./types/komari";

type MessageHandler = (data: JsonRpcResponse) => void;
type ErrorHandler = (error: Error) => void;

class WebSocketRPC2Client {
  private ws: WebSocket | null = null;
  private wsUrl: string;
  private requestId: number = 0;
  private pendingRequests: Map<
    number,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    { resolve: (value: any) => void; reject: (error: Error) => void }
  > = new Map();
  private messageHandlers: Set<MessageHandler> = new Set();
  private errorHandlers: Set<ErrorHandler> = new Set();
  private reconnectTimer: number | null = null;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 10;
  private reconnectDelay: number = 3000; // 3秒
  private isConnecting: boolean = false;
  private isManualClose: boolean = false;

  constructor() {
    // 只在浏览器环境中初始化
    if (typeof window === "undefined") {
      this.wsUrl = "";
      return;
    }

    // 构建 WebSocket URL
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const host = window.location.host;
    this.wsUrl = `${protocol}//${host}/api/rpc2`;
  }

  // 连接 WebSocket
  connect(): Promise<void> {
    // 服务端渲染时不执行
    if (typeof window === "undefined") {
      return Promise.resolve();
    }

    if (this.ws?.readyState === WebSocket.OPEN) {
      return Promise.resolve();
    }

    if (this.isConnecting) {
      return new Promise((resolve) => {
        const checkConnection = setInterval(() => {
          if (this.ws?.readyState === WebSocket.OPEN) {
            clearInterval(checkConnection);
            resolve();
          }
        }, 100);
      });
    }

    this.isConnecting = true;
    this.isManualClose = false;

    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.wsUrl);

        this.ws.onopen = () => {
          this.isConnecting = false;
          this.reconnectAttempts = 0;
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            this.handleMessage(data);
          } catch {
            // 消息解析失败，静默处理
          }
        };

        this.ws.onerror = () => {
          this.isConnecting = false;
          this.notifyError(new Error("WebSocket connection error"));
        };

        this.ws.onclose = () => {
          this.isConnecting = false;

          // 拒绝所有待处理的请求
          this.pendingRequests.forEach(({ reject }) => {
            reject(new Error("WebSocket connection closed"));
          });
          this.pendingRequests.clear();

          // 自动重连（如果不是手动关闭）
          if (!this.isManualClose) {
            this.scheduleReconnect();
          }
        };
      } catch (error) {
        this.isConnecting = false;
        reject(error);
      }
    });
  }

  // 计划重连
  private scheduleReconnect() {
    if (this.reconnectTimer !== null) return;
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      this.notifyError(new Error("WebSocket max reconnect attempts reached"));
      return;
    }

    const delay = this.reconnectDelay * Math.pow(1.5, this.reconnectAttempts);

    this.reconnectTimer = window.setTimeout(() => {
      this.reconnectTimer = null;
      this.reconnectAttempts++;
      this.connect().catch(() => {
        // 重连失败，静默处理
      });
    }, delay);
  }

  // 处理消息
  private handleMessage(data: JsonRpcResponse) {
    // 处理 RPC 响应
    if (data.id !== undefined && data.id !== null) {
      const pending = this.pendingRequests.get(data.id as number);
      if (pending) {
        if (data.error) {
          pending.reject(
            new Error(`RPC Error ${data.error.code}: ${data.error.message}`)
          );
        } else {
          pending.resolve(data.result);
        }
        this.pendingRequests.delete(data.id as number);
      }
    }

    // 通知所有消息处理器
    this.messageHandlers.forEach((handler) => {
      try {
        handler(data);
      } catch {
        // 消息处理器错误，静默处理
      }
    });
  }

  // 通知错误
  private notifyError(error: Error) {
    this.errorHandlers.forEach((handler) => {
      try {
        handler(error);
      } catch {
        // 错误处理器错误，静默处理
      }
    });
  }

  // 调用 RPC 方法
  async call<T>(
    method: string,
    params?: unknown[] | Record<string, unknown>
  ): Promise<T> {
    // 确保已连接
    if (this.ws?.readyState !== WebSocket.OPEN) {
      await this.connect();
    }

    const id = ++this.requestId;
    const request: JsonRpcRequest = {
      jsonrpc: "2.0",
      method,
      params,
      id,
    };

    return new Promise((resolve, reject) => {
      this.pendingRequests.set(id, { resolve, reject });

      try {
        this.ws!.send(JSON.stringify(request));

        // 设置超时
        setTimeout(() => {
          if (this.pendingRequests.has(id)) {
            this.pendingRequests.delete(id);
            reject(new Error(`Request timeout for method ${method}`));
          }
        }, 30000); // 30秒超时
      } catch (error) {
        this.pendingRequests.delete(id);
        reject(error);
      }
    });
  }

  // 订阅消息
  onMessage(handler: MessageHandler): () => void {
    this.messageHandlers.add(handler);
    return () => {
      this.messageHandlers.delete(handler);
    };
  }

  // 订阅错误
  onError(handler: ErrorHandler): () => void {
    this.errorHandlers.add(handler);
    return () => {
      this.errorHandlers.delete(handler);
    };
  }

  // 关闭连接
  close() {
    this.isManualClose = true;
    if (this.reconnectTimer !== null) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  // 获取连接状态
  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

// 单例实例
let sharedWsClient: WebSocketRPC2Client | null = null;

export function getSharedWsClient(): WebSocketRPC2Client {
  if (!sharedWsClient) {
    sharedWsClient = new WebSocketRPC2Client();
  }
  return sharedWsClient;
}

export { WebSocketRPC2Client };
