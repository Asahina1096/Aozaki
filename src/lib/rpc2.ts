import type {
  JsonRpcRequest,
  JsonRpcResponse,
  NodesResponse,
  NodesStatusResponse,
  PublicInfo,
  MeInfo,
  VersionInfo,
} from "./types/komari";

class RPC2Client {
  private baseUrl: string;
  private requestId: number = 0;

  constructor(baseUrl: string = "/api/rpc2") {
    this.baseUrl = baseUrl;
  }

  private async call<T>(
    method: string,
    params?: any[] | Record<string, any>
  ): Promise<T> {
    const id = ++this.requestId;
    const request: JsonRpcRequest = {
      jsonrpc: "2.0",
      method,
      params,
      id,
    };

    try {
      const response = await fetch(this.baseUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: JsonRpcResponse<T> = await response.json();

      if (data.error) {
        throw new Error(`RPC Error ${data.error.code}: ${data.error.message}`);
      }

      if (data.result === undefined) {
        throw new Error("No result in response");
      }

      return data.result;
    } catch (error) {
      console.error(`RPC call failed for method ${method}:`, error);
      throw error;
    }
  }

  // RPC 内置方法
  async ping(): Promise<string> {
    return this.call("rpc.ping");
  }

  async version(): Promise<string> {
    return this.call("rpc.version");
  }

  async methods(internal: boolean = false): Promise<string[]> {
    return this.call("rpc.methods", { internal });
  }

  // Komari 通用方法
  async getNodes(uuid?: string): Promise<NodesResponse> {
    return this.call("common:getNodes", uuid ? { uuid } : undefined);
  }

  async getNodesLatestStatus(
    uuid?: string,
    uuids?: string[]
  ): Promise<NodesStatusResponse> {
    const params: any = {};
    if (uuid) params.uuid = uuid;
    if (uuids) params.uuids = uuids;
    return this.call(
      "common:getNodesLatestStatus",
      Object.keys(params).length > 0 ? params : undefined
    );
  }

  async getPublicInfo(): Promise<PublicInfo> {
    return this.call("common:getPublicInfo");
  }

  async getMe(): Promise<MeInfo> {
    return this.call("common:getMe");
  }

  async getVersion(): Promise<VersionInfo> {
    return this.call("common:getVersion");
  }
}

// 单例模式
let sharedClient: RPC2Client | null = null;

export function getSharedClient(): RPC2Client {
  if (!sharedClient) {
    sharedClient = new RPC2Client();
  }
  return sharedClient;
}

export { RPC2Client };
