# Komari Aozaki 主题 - 完整文档

> **项目版本**: 1.0.0
> **创建日期**: 2025-10-13
> **更新日期**: 2025-10-14
> **作者**: Asahina1096
> **许可证**: GNU GPLv3

---

## 📋 目录

1. [项目概览](#项目概览)
2. [快速开始](#快速开始)
3. [技术架构](#技术架构)
4. [核心功能](#核心功能)
5. [开发指南](#开发指南)
6. [部署指南](#部署指南)
7. [配置说明](#配置说明)
8. [故障排查](#故障排查)

---

## 项目概览

### 🎯 技术栈

| 技术          | 版本 | 用途                  |
| ------------- | ---- | --------------------- |
| Astro         | 4.x  | 静态站点生成器        |
| React         | 18   | 客户端组件库          |
| TailwindCSS   | 4.x  | CSS 框架              |
| shadcn/ui     | -    | UI 组件库             |
| TypeScript    | 5.x  | 类型系统              |
| Recharts      | 3.x  | 数据可视化图表库      |
| Lucide React  | -    | 图标库                |
| Iconify React | -    | 发行版系统图标        |

### ✨ 主要特性

- 🎨 **现代化 UI**: 基于 shadcn/ui 设计系统，支持明暗主题切换
- 📊 **节点详情页**: 完整的历史数据可视化，10 种图表实时同步更新
- 🔄 **WebSocket 实时通信**: 1秒刷新间隔，低延迟数据更新
- 📈 **独立时间范围**: 每个图表可独立调整时间范围（1h-30d）
- 🎯 **智能数据管理**: 全局单例数据存储，优化性能
- 📱 **响应式设计**: 完美适配移动端和桌面端
- ⚡ **静态站点生成**: 快速加载，SEO 友好

---

## 快速开始

### 环境要求

- Node.js >= 18.0.0
- Bun >= 1.3.0
- Komari 服务器 >= 1.0.7

### 安装与开发

```bash
# 1. 安装依赖
bun install

# 2. 开发模式（热重载）
bun run dev
# 访问 http://localhost:4321

# 3. 构建生产版本
bun run build

# 4. 预览生产构建
bun run preview

# 5. 打包主题
bun run package          # Linux/macOS
bun run package:win      # Windows
```

### 部署到 Komari

1. **构建并打包**

   ```bash
   bun run build && bun run package
   ```

2. **上传主题**
   - 登录 Komari 管理后台（`/admin`）
   - 进入主题管理页面
   - 上传生成的 `komari-aozaki.zip`
   - 激活主题

---

## 技术架构

### 目录结构

```
src/
├── components/              # React 组件
│   ├── ui/                 # shadcn/ui 基础组件
│   │   ├── card.tsx       # Card 组件
│   │   ├── badge.tsx      # Badge 组件
│   │   ├── progress.tsx   # Progress 组件
│   │   ├── select.tsx     # Select 组件
│   │   └── separator.tsx  # Separator 组件
│   ├── charts/            # 图表组件
│   │   ├── ChartContainer.tsx    # 图表容器
│   │   ├── ChartGroups.tsx       # 图表分组
│   │   ├── CpuChart.tsx          # CPU 使用率图表
│   │   ├── MemoryChart.tsx       # 内存使用率图表
│   │   ├── GpuChart.tsx          # GPU 使用率图表
│   │   ├── SwapChart.tsx         # 交换分区图表
│   │   ├── DiskChart.tsx         # 磁盘使用率图表
│   │   ├── NetworkChart.tsx      # 网络速度图表
│   │   ├── LoadChart.tsx         # 系统负载图表
│   │   ├── TempChart.tsx         # 温度图表
│   │   ├── ProcessChart.tsx      # 进程数图表
│   │   └── ConnectionsChart.tsx  # 连接数图表
│   ├── Header.tsx              # 页头
│   ├── Footer.tsx              # 页脚
│   ├── Breadcrumb.tsx          # 面包屑导航
│   ├── TimeRangeSelector.tsx   # 时间范围选择器
│   ├── NodeCard.tsx            # 节点卡片
│   ├── NodeCardSkeleton.tsx    # 节点卡片骨架
│   ├── NodeDetail.tsx          # 节点详情页
│   ├── NodeRealtimeCard.tsx    # 实时信息卡片
│   ├── NodesOverview.tsx       # 节点概览
│   ├── NodesGrid.tsx           # 节点网格
│   ├── NodesGridSkeleton.tsx   # 节点网格骨架
│   └── OSIcon.tsx              # 操作系统图标
├── hooks/                   # React Hooks
│   ├── useNodeStore.ts     # 节点数据管理 Hook
│   ├── useChartData.ts     # 单图表数据 Hook（已废弃）
│   └── useAllChartsData.ts # 统一图表数据管理 Hook
├── layouts/
│   └── BaseLayout.astro    # 基础布局模板
├── lib/
│   ├── rpc2.ts            # HTTP RPC2 客户端
│   ├── wsRpc2.ts          # WebSocket RPC2 客户端
│   ├── nodeStore.ts       # 全局节点数据存储
│   ├── utils.ts           # 工具函数
│   └── types/komari.ts    # TypeScript 类型定义
├── pages/
│   ├── index.astro        # 首页（节点列表）
│   └── node.astro         # 节点详情页
└── styles/
    └── globals.css        # 全局样式 + 主题变量
```

---

## 核心功能

### 1. 节点列表页（主页）

#### NodesGrid（主容器）

**职责**:

- 使用 WebSocket 获取实时节点数据（1秒刷新）
- 节点过滤和排序
- 汇总统计并渲染四大总览卡片
- 加载骨架占位，降低 CLS

**状态管理**:

```typescript
const { clients, statuses, loading } = useNodesData(1000); // 1秒刷新
```

#### NodesOverview（节点概览）

**展示内容**:

- 节点总数 / 在线节点 / 离线节点
- 所有服务器平均负载（1m/5m/15m）
- 所有服务器实时网络流量（总速率、上下行拆分）
- 所有服务器网络流量统计（累计上传/下载总量）

#### NodeCard（节点卡片）

**显示内容**:

- 节点基本信息（名称、地区、系统图标）
- 节点在线时长
- CPU 使用率（带进度条和颜色指示）
- 内存使用率（显示已用/总量）
- 磁盘使用率
- 网络流量（上传/下载速度）
- 系统负载（1m/5m/15m）
- 在线/离线状态

**点击跳转**:

```typescript
<a href={`/node.html?uuid=${client.uuid}`}>
  {/* 节点卡片内容 */}
</a>
```

### 2. 节点详情页

#### URL 路由

- 主页：`/` 或 `/index.html`
- 详情页：`/node.html?uuid={uuid}`

#### 页面布局

1. **面包屑导航** - 返回主页链接
2. **实时信息卡片** - 显示所有实时指标
3. **历史图表区域** - 10 种图表，分为 3 组

#### 实时信息卡片（NodeRealtimeCard）

**显示所有实时指标**:

- CPU 使用率
- 内存使用率
- GPU 使用率（如有）
- 交换分区使用率
- 磁盘使用率
- 网络速度（上传/下载）
- 系统负载（1分钟）
- 温度（如有）
- 进程数
- 连接数（TCP/UDP）

**布局特点**:

- 网格布局，响应式设计
- 进程数和连接数并排显示
- 带图标和进度条
- 实时更新（1秒刷新）

#### 历史图表系统

**图表分组**:

1. **系统资源组**:
   - CPU 使用率（面积图）
   - 内存使用率（面积图）
   - 交换分区使用率（面积图）
   - 磁盘使用率（面积图）
   - GPU 使用率（面积图，有 GPU 时显示）
   - 温度（折线图，有温度传感器时显示）

2. **网络组**:
   - 网络速度（折线图，上传/下载双线）
   - 连接数（折线图，TCP/UDP 双线）

3. **系统负载组**:
   - 系统负载（折线图，仅显示 1 分钟负载）
   - 进程数（折线图）

**图表特性**:

- ✅ **同步更新**: 所有图表统一刷新（默认 30 秒）
- ✅ **独立时间范围**: 每个图表可选择 1h/6h/12h/24h/7d/30d
- ✅ **动态 X 轴**: >24h 显示月-日 时:分，≤24h 显示 时:分
- ✅ **无闪烁**: 使用 `useMemo` 和 `isAnimationActive={false}` 优化
- ✅ **智能加载**: 首次加载显示 loading，后续静默更新
- ✅ **响应式**: 移动端和桌面端完美适配

### 3. 数据管理架构

#### 全局节点数据存储（NodeStore）

**设计模式**: 单例模式 + 发布订阅

```typescript
// 使用方法
import { useNodesData, useNodeData } from "@/hooks/useNodeStore";

// 主页：获取所有节点
const { clients, statuses, loading } = useNodesData(1000);

// 详情页：获取单个节点
const { client, status, loading } = useNodeData(uuid, 1000);
```

**特性**:

- ✅ WebSocket 实时通信
- ✅ 自动重连机制
- ✅ 全局共享数据，避免重复请求
- ✅ React Hooks 集成

#### 统一图表数据管理（useAllChartsData）

```typescript
// 使用方法
import { useAllChartsData } from "@/hooks/useAllChartsData";

const { chartsData, loading, timeRanges, setChartTimeRange } = useAllChartsData(uuid);
```

**优势**:

- ✅ 所有图表同步刷新
- ✅ 单一定时器，性能优化
- ✅ 并发请求所有数据
- ✅ 每个图表保持独立时间范围

### 4. RPC2 客户端

#### HTTP RPC2 客户端（rpc2.ts）

**用途**: 获取历史数据

```typescript
import { getSharedClient } from "@/lib/rpc2";

const rpc = getSharedClient();
const records = await rpc.getRecords({
  type: "load",
  uuid: "xxx",
  hours: 24,
  load_type: "cpu",
  maxCount: 4000,
});
```

**支持的方法**:

- `ping()` - 健康检查
- `version()` - RPC 版本
- `methods()` - 可用方法列表
- `getNodes(uuid?)` - 获取节点信息
- `getNodesLatestStatus(uuid?, uuids?)` - 获取节点状态
- `getRecords(params)` - 获取历史记录
- `getPublicInfo()` - 获取公开信息
- `getMe()` - 获取当前用户信息
- `getVersion()` - 获取后端版本

#### WebSocket RPC2 客户端（wsRpc2.ts）

**用途**: 实时数据通信

```typescript
import { getSharedWsClient } from "@/lib/wsRpc2";

const wsClient = getSharedWsClient();
await wsClient.connect();

// 调用 RPC 方法
const result = await wsClient.call("common:getNodes");
```

**特性**:

- ✅ 自动重连（最多 10 次）
- ✅ 指数退避重连策略
- ✅ 请求超时处理（30 秒）
- ✅ 消息订阅机制
- ✅ 错误处理
- ✅ 静默日志（不输出到控制台）

---

## 开发指南

### 快速命令

```bash
# 开发
bun run dev              # 启动开发服务器
bun run build           # 构建生产版本
bun run preview         # 预览构建结果
bun run package         # 打包主题（Linux/macOS）
bun run package:win     # 打包主题（Windows）
```

### 关键文件位置

| 文件                 | 路径                                | 说明                   |
| -------------------- | ----------------------------------- | ---------------------- |
| 主题配置             | `komari-theme.json`                 | 主题元信息和配置项     |
| 主页                 | `src/pages/index.astro`             | 节点列表页             |
| 详情页               | `src/pages/node.astro`              | 节点详情页             |
| 基础布局             | `src/layouts/BaseLayout.astro`      | 布局模板               |
| 全局样式             | `src/styles/globals.css`            | CSS 变量和主题         |
| HTTP RPC2 客户端     | `src/lib/rpc2.ts`                   | 历史数据获取           |
| WebSocket RPC2 客户端 | `src/lib/wsRpc2.ts`                 | 实时数据通信           |
| 全局数据存储         | `src/lib/nodeStore.ts`              | 节点数据管理           |
| 类型定义             | `src/lib/types/komari.ts`           | TypeScript 类型        |
| 工具函数             | `src/lib/utils.ts`                  | 格式化等工具           |
| 节点数据 Hook        | `src/hooks/useNodeStore.ts`         | React 数据管理 Hook    |
| 图表数据 Hook        | `src/hooks/useAllChartsData.ts`     | 统一图表数据管理       |

### 常用代码片段

#### 显示操作系统图标

```tsx
import { OSIcon } from "@/components/OSIcon";

<OSIcon os={client.os} className="h-4 w-4" />;
```

#### 调用 RPC2 接口

```typescript
import { getSharedClient } from "@/lib/rpc2";
import { getSharedWsClient } from "@/lib/wsRpc2";

// HTTP 客户端（历史数据）
const rpc = getSharedClient();
const records = await rpc.getRecords({ /* ... */ });

// WebSocket 客户端（实时数据）
const wsClient = getSharedWsClient();
await wsClient.connect();
const nodes = await wsClient.call("common:getNodes");
```

#### 使用节点数据 Hook

```typescript
import { useNodesData, useNodeData } from "@/hooks/useNodeStore";

// 获取所有节点（主页）
function HomePage() {
  const { clients, statuses, loading } = useNodesData(1000);

  return (
    <div>
      {Object.values(clients).map(client => (
        <NodeCard key={client.uuid} client={client} status={statuses[client.uuid]} />
      ))}
    </div>
  );
}

// 获取单个节点（详情页）
function NodeDetailPage({ uuid }: { uuid: string }) {
  const { client, status, loading } = useNodeData(uuid, 1000);

  return <NodeRealtimeCard client={client} status={status} />;
}
```

#### 使用图表数据 Hook

```typescript
import { useAllChartsData } from "@/hooks/useAllChartsData";

function ChartsPage({ uuid }: { uuid: string }) {
  const { chartsData, loading, timeRanges, setChartTimeRange } = useAllChartsData(uuid);

  return (
    <>
      <CpuChart
        data={chartsData.cpu}
        loading={loading}
        timeRange={timeRanges.cpu}
        onTimeRangeChange={(hours) => setChartTimeRange("cpu", hours)}
      />
      {/* 其他图表... */}
    </>
  );
}
```

#### 格式化工具函数

```typescript
import {
  formatBytes,
  formatPercent,
  formatSpeed,
  formatTimestamp,
  formatChartTime,
  formatChartTimeByRange
} from "@/lib/utils";

formatBytes(1024);                      // "1 KB"
formatBytes(1048576);                   // "1 MB"
formatPercent(512, 1024);               // "50.0%"
formatSpeed(1048576);                   // "1 MB/s"
formatTimestamp("2025-10-14T10:30:00"); // "2025-10-14 10:30:00"
formatChartTime("2025-10-14T10:30:00"); // "10:30"
formatChartTimeByRange("2025-10-14T10:30:00", 48); // "10-14 10:30"
```

#### 使用 shadcn/ui 组件

```tsx
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "./ui/select";

<Card>
  <CardHeader>
    <CardTitle>标题</CardTitle>
    <Badge variant="success">在线</Badge>
  </CardHeader>
  <CardContent>
    <Progress value={75} max={100} variant="success" />

    <Select value="1" onValueChange={setValue}>
      <SelectTrigger>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="1">选项 1</SelectItem>
        <SelectItem value="2">选项 2</SelectItem>
      </SelectContent>
    </Select>
  </CardContent>
</Card>;
```

#### 创建新的图表组件

```tsx
import { useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { formatChartTimeByRange } from "@/lib/utils";
import { ChartContainer } from "./ChartContainer";
import type { StatusRecord } from "@/lib/types/komari";

interface MyChartProps {
  data: StatusRecord[];
  loading: boolean;
  timeRange: number;
  onTimeRangeChange: (hours: number) => void;
}

export function MyChart({ data, loading, timeRange, onTimeRangeChange }: MyChartProps) {
  const chartData = useMemo(
    () => data.map(record => ({
      time: formatChartTimeByRange(record.time, timeRange),
      value: record.cpu, // 替换为你需要的字段
    })),
    [data, timeRange]
  );

  if (!data || data.length === 0) {
    return null;
  }

  return (
    <ChartContainer
      title="图表标题"
      description="图表描述"
      timeRange={timeRange}
      onTimeRangeChange={onTimeRangeChange}
    >
      {loading ? (
        <div className="flex items-center justify-center h-[300px]">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent" />
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="time" className="text-xs" />
            <YAxis className="text-xs" />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </ChartContainer>
  );
}
```

### 自定义主题颜色

编辑 `src/styles/globals.css`:

```css
:root {
  --primary: 221.2 83.2% 53.3%; /* 主色调 */
  --secondary: 210 40% 96.1%; /* 次要色 */
  --background: 0 0% 100%; /* 背景色 */
  --foreground: 222.2 84% 4.9%; /* 前景色 */
}

.dark {
  --primary: 217.2 91.2% 59.8%;
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
}
```

### 修改刷新间隔

```tsx
// 主页刷新间隔（默认 1000ms = 1秒）
<NodesGrid client:load refreshInterval={2000} />

// 详情页实时数据刷新间隔（默认 1000ms）
const { client, status } = useNodeData(uuid, 2000);

// 详情页历史图表刷新间隔（默认 30000ms = 30秒）
const { chartsData } = useAllChartsData(uuid, 60000); // 改为 60 秒
```

### 代码规范

**命名约定**:

- 组件: `PascalCase` (NodeCard.tsx)
- 函数: `camelCase` (formatBytes)
- 常量: `UPPER_SNAKE_CASE` (API_BASE_URL)
- Hook: `use` 前缀 (useNodeData)

**导入顺序**:

```typescript
// 1. React 和核心库
import { useState, useEffect, useMemo } from "react";

// 2. 第三方库
import { Card } from "./ui/card";
import { LineChart } from "recharts";

// 3. 内部工具
import { formatBytes } from "@/lib/utils";
import { getSharedClient } from "@/lib/rpc2";

// 4. 类型定义
import type { Client, NodeStatus } from "@/lib/types/komari";
```

---

## 部署指南

### 部署前检查

- ✅ Node.js >= 18.0.0
- ✅ Bun >= 1.3.0
- ✅ Komari Server >= 1.0.7
- ✅ 所有源文件已创建
- ✅ 无编译错误

### 部署步骤

#### 步骤 1: 安装依赖

```bash
cd /home/mihari/Server/Aozaki
bun install
```

#### 步骤 2: 构建项目

```bash
bun run build
```

预期输出:

```
✓ Astro check passed
✓ Building...
✓ Build complete!
```

构建后会生成 `dist/` 目录。

#### 步骤 3: 打包主题

**Linux/macOS**:

```bash
bun run package
```

**Windows**:

```bash
bun run package:win
```

预期输出:

```
🚀 开始构建 Komari Aozaki 主题...
🔨 构建项目...
📦 创建主题包...
✅ 打包完成！
📦 主题包: komari-aozaki.zip
```

#### 步骤 4: 验证主题包

```bash
unzip -l komari-aozaki.zip
```

应包含:

```
komari-aozaki.zip
├── komari-theme.json
├── preview.png
└── dist/
    ├── index.html
    ├── node.html
    └── _astro/
        ├── [hash].css
        └── [hash].js
```

#### 步骤 5: 上传到 Komari

1. **登录 Komari 管理后台**
   - 访问: `https://your-komari-server.com/admin`
   - 使用管理员账号登录

2. **进入主题管理**
   - 导航: 设置 → 主题管理

3. **上传主题包**
   - 点击"上传主题"
   - 选择 `komari-aozaki.zip`
   - 等待上传完成

4. **激活主题**
   - 在主题列表中找到 "Aozaki"
   - 点击"激活"按钮

---

## 配置说明

### 主题配置文件（komari-theme.json）

```json
{
  "name": "aozaki",
  "display_name": "Aozaki",
  "version": "1.1.0",
  "author": "Komari Dev Team",
  "description": "现代化监控主题，支持详细的历史数据可视化",
  "preview": "preview.png",
  "settings": {}
}
```

### 环境变量

主题会自动适配以下环境:

- **开发环境**: `http://localhost:4321`
- **生产环境**: 使用当前域名自动构建 WebSocket URL

### 自定义配置

```typescript
// src/lib/nodeStore.ts
// 修改默认刷新间隔
async start(refreshInterval: number = 1000) { // 默认 1 秒

// src/hooks/useAllChartsData.ts
// 修改图表刷新间隔
export function useAllChartsData(
  uuid: string,
  refreshInterval: number = 30000  // 默认 30 秒
)
```

---

## 故障排查

### 常见问题

#### 1. 构建失败

**问题**: `bun run build` 失败

**解决方案**:
```bash
# 清理缓存
rm -rf node_modules .astro dist
bun install
bun run build
```

#### 2. WebSocket 连接失败

**问题**: 实时数据不更新

**检查项**:
- 确认 Komari 服务器版本 >= 1.0.7
- 检查 WebSocket 路径: `wss://your-domain.com/api/rpc2`
- 查看浏览器控制台是否有错误（注意：正常情况下不会有 WebSocket 日志）

#### 3. 图表不显示

**问题**: 详情页图表为空

**可能原因**:
- 节点没有历史数据
- 时间范围内没有数据
- UUID 不正确

**解决方案**:
```typescript
// 检查浏览器控制台
// 正常情况下应该有 API 请求
// 检查返回的数据是否为空数组
```

#### 4. 图表闪烁

**问题**: 图表更新时闪烁

**解决方案**: 已在代码中修复
```typescript
// 确保使用了以下优化
const chartData = useMemo(() => { /* ... */ }, [data, timeRange]);
<Line isAnimationActive={false} />
```

#### 5. URL 显示 /index.html

**问题**: 主页 URL 显示为 `/index.html`

**解决方案**: 已修复，所有链接使用 `/`
```typescript
// 检查代码中所有链接
href="/"           // ✅ 正确
href="/index.html" // ❌ 错误
```

### 调试技巧

#### 开启详细日志

```typescript
// 临时添加日志（开发时）
console.log("Data:", data);
console.log("Loading:", loading);
```

#### 检查 RPC 调用

```typescript
// 在浏览器控制台
const rpc = await import("./lib/rpc2");
const client = rpc.getSharedClient();
const result = await client.getNodes();
console.log(result);
```

#### 检查 WebSocket 状态

```typescript
// 在浏览器控制台
const ws = await import("./lib/wsRpc2");
const wsClient = ws.getSharedWsClient();
console.log("Connected:", wsClient.isConnected());
```

---

## 更新日志

### v1.1.0 (2025-10-14)

**新功能**:
- ✨ 添加节点详情页，支持历史数据可视化
- ✨ 10 种图表类型（CPU、内存、GPU、磁盘、网络等）
- ✨ 每个图表独立时间范围选择（1h-30d）
- ✨ WebSocket 实时通信，1秒刷新间隔
- ✨ 统一图表数据管理，所有图表同步更新
- ✨ 动态 X 轴格式化（根据时间范围自动调整）

**优化**:
- ⚡ 全局数据存储，避免重复请求
- ⚡ 图表无闪烁更新（useMemo + 禁用动画）
- ⚡ 智能加载状态（首次显示 loading，后续静默更新）
- ⚡ 并发请求所有图表数据，提升性能

**修复**:
- 🐛 修复静态构建路由问题（改用 query 参数）
- 🐛 修复图表闪烁问题
- 🐛 修复系统负载图表显示 5 分钟和 15 分钟负载
- 🐛 简化主页 URL（去除 /index.html）

**其他**:
- 📝 完善文档和代码注释
- 🔇 移除 WebSocket 控制台日志

### v1.0.0 (2025-10-13)

**初始版本**:
- ✨ 节点列表页
- ✨ 节点概览统计
- ✨ 实时数据展示
- ✨ 明暗主题切换
- ✨ 响应式设计

---

## 许可证

MIT License

Copyright (c) 2025 Komari Dev Team

---

**需要帮助？** 请访问 [Komari 官方文档](https://komari.dev) 或提交 Issue。
