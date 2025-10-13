# Komari AstroNext 主题 - 完整文档

> **项目版本**: 1.0.0
> **创建日期**: 2025-10-13
> **作者**: Komari Dev Team
> **许可证**: MIT

---

## 📋 目录

1. [项目概览](#项目概览)
2. [快速开始](#快速开始)
3. [技术架构](#技术架构)
4. [开发指南](#开发指南)
5. [部署指南](#部署指南)
6. [配置说明](#配置说明)
7. [故障排查](#故障排查)

---

### 🎯 技术栈

| 技术          | 版本 | 用途           |
| ------------- | ---- | -------------- |
| Astro         | 4.x  | 静态站点生成器 |
| React         | 18   | 客户端组件库   |
| TailwindCSS   | 3.x  | CSS 框架       |
| shadcn/ui     | -    | UI 组件库      |
| TypeScript    | 5.x  | 类型系统       |
| Lucide React  | -    | 图标库         |
| Iconify React | -    | 发行版系统图标 |

---

## 快速开始

### 环境要求

- Node.js >= 18.0.0
- npm >= 9.0.0
- Komari 服务器 >= 1.0.7

### 安装与开发

```bash
# 1. 安装依赖
npm install

# 2. 开发模式（热重载）
npm run dev
# 访问 http://localhost:4321

# 3. 构建生产版本
npm run build

# 4. 预览生产构建
npm run preview

# 5. 打包主题
npm run package          # Linux/macOS
npm run package:win      # Windows
```

### 部署到 Komari

1. **构建并打包**

   ```bash
   npm run build && npm run package
   ```

2. **上传主题**

   - 登录 Komari 管理后台（`/admin`）
   - 进入主题管理页面
   - 上传生成的 `komari-astronext.zip`
   - 激活主题

3. **配置主题**
   - 在管理后台 → 设置 → 主题设置
   - 调整刷新间隔、视图模式等

---

## 技术架构

### 目录结构

```
src/
├── components/         # React 组件
│   ├── ui/            # shadcn/ui 基础组件（Card, Badge, Progress, Separator）
│   ├── Header.tsx     # 页头（站点标题、主题切换）
│   ├── Footer.tsx     # 页脚（版权信息）
│   ├── NodeCard.tsx   # 节点卡片（展示单个节点）
│   ├── NodesGrid.tsx  # 节点网格（主容器，数据获取）
│   └── OSIcon.tsx     # 操作系统图标（支持主流发行版）
├── layouts/
│   └── BaseLayout.astro   # 基础布局模板
├── lib/
│   ├── rpc2.ts           # RPC2 客户端实现
│   ├── utils.ts          # 工具函数（格式化等）
│   └── types/komari.ts   # TypeScript 类型定义
├── pages/
│   └── index.astro       # 首页
└── styles/
    └── globals.css       # 全局样式 + 主题变量
```

### 核心组件

#### 1. NodesGrid（主容器）

**职责**:

- 获取节点数据（`common:getNodes`）
- 获取节点状态（`common:getNodesLatestStatus`）
- 自动刷新（默认 3 秒）
- 节点过滤和排序

**状态管理**:

```typescript
const [clients, setClients] = useState<Record<string, Client>>({});
const [statuses, setStatuses] = useState<Record<string, NodeStatus>>({});
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);
```

#### 2. NodeCard（节点卡片）

**显示内容**:

- 节点基本信息（名称、地区、系统图标）
- CPU 使用率（带进度条和颜色指示）
- 内存使用率（显示已用/总量）
- 磁盘使用率
- 网络流量（上传/下载速度）
- 系统负载（1m/5m/15m）
- 在线/离线状态

**系统图标支持（Iconify）**:

- Ubuntu（simple-icons:ubuntu）
- Debian（simple-icons:debian）
- CentOS（simple-icons:centos）/ RHEL（simple-icons:redhat）
- Fedora（simple-icons:fedora）
- Arch Linux（simple-icons:archlinux）
- Alpine Linux（simple-icons:alpinelinux）
- openSUSE（simple-icons:opensuse）
- Gentoo（simple-icons:gentoo）
- Windows（simple-icons:windows11）
- macOS/Darwin（simple-icons:apple）
- FreeBSD（simple-icons:freebsd）
- 通用 Linux（simple-icons:linux）
- 通用 BSD 和未识别系统（mdi:server）

#### 3. Header（页头）

**功能**:

- 显示站点名称（从 RPC2 获取）
- 主题切换按钮（明/暗模式）
- 刷新按钮

#### 4. Footer（页脚）

**内容**:

- Powered by Komari Monitor
- 主题信息

### RPC2 客户端

**设计模式**: 单例模式

```typescript
// 使用方法
import { getSharedClient } from "@/lib/rpc2";

const rpc = getSharedClient();
const nodes = await rpc.getNodes();
const statuses = await rpc.getNodesLatestStatus();
```

**支持的方法**:

- `rpc.ping()` - 健康检查
- `rpc.version()` - RPC 版本
- `rpc.methods()` - 可用方法列表
- `getNodes(uuid?)` - 获取节点信息
- `getNodesLatestStatus(uuid?, uuids?)` - 获取节点状态
- `getPublicInfo()` - 获取公开信息
- `getMe()` - 获取当前用户信息
- `getVersion()` - 获取后端版本

**错误处理**:

```typescript
try {
  const result = await rpc.call(method, params);
  return result;
} catch (error) {
  console.error(`RPC call failed:`, error);
  throw error;
}
```

---

## 开发指南

### 快速命令

```bash
# 开发
npm run dev              # 启动开发服务器
npm run build           # 构建生产版本
npm run preview         # 预览构建结果
npm run package         # 打包主题（Linux/macOS）
npm run package:win     # 打包主题（Windows）
```

### 关键文件位置

| 文件        | 路径                           | 说明               |
| ----------- | ------------------------------ | ------------------ |
| 主题配置    | `komari-theme.json`            | 主题元信息和配置项 |
| 页面入口    | `src/pages/index.astro`        | 主页面             |
| 基础布局    | `src/layouts/BaseLayout.astro` | 布局模板           |
| 全局样式    | `src/styles/globals.css`       | CSS 变量和主题     |
| RPC2 客户端 | `src/lib/rpc2.ts`              | 数据获取           |
| 类型定义    | `src/lib/types/komari.ts`      | TypeScript 类型    |
| 工具函数    | `src/lib/utils.ts`             | 格式化等工具       |

### 常用代码片段

#### 显示操作系统图标（OSIcon）

```tsx
import { OSIcon } from "@/components/OSIcon";

// 在组件中
<OSIcon os={client.os} className="h-4 w-4" />;
```

#### 调用 RPC2 接口

```typescript
import { getSharedClient } from "@/lib/rpc2";

// 获取所有节点
const nodes = await getSharedClient().getNodes();

// 获取节点状态
const statuses = await getSharedClient().getNodesLatestStatus();

// 获取公开信息
const info = await getSharedClient().getPublicInfo();
```

#### 创建 React 组件

```tsx
import React from "react";
import { Card } from "./ui/card";

interface MyComponentProps {
  title: string;
}

export function MyComponent({ title }: MyComponentProps) {
  return (
    <Card>
      <h2>{title}</h2>
    </Card>
  );
}
```

#### 在 Astro 页面中使用 React 组件

```astro
---
import BaseLayout from '@/layouts/BaseLayout.astro';
import { MyComponent } from '@/components/MyComponent';
---

<BaseLayout>
  <MyComponent client:load title="Hello" />
</BaseLayout>
```

#### 格式化工具函数

```typescript
import { formatBytes, formatPercent, formatSpeed } from "@/lib/utils";

formatBytes(1024); // "1 KB"
formatBytes(1048576); // "1 MB"
formatPercent(512, 1024); // "50.0%"
formatSpeed(1048576); // "1 MB/s"
```

#### 使用 shadcn/ui 组件

```tsx
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";

<Card>
  <CardHeader>
    <CardTitle>标题</CardTitle>
    <Badge variant="success">在线</Badge>
  </CardHeader>
  <CardContent>
    <Progress value={75} max={100} variant="success" />
  </CardContent>
</Card>;
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

### 添加新页面

```bash
# 1. 创建页面文件
touch src/pages/about.astro

# 2. 使用基础布局
cat > src/pages/about.astro << 'EOF'
---
import BaseLayout from '@/layouts/BaseLayout.astro';
---

<BaseLayout title="关于">
  <div class="container py-8">
    <h1>关于页面</h1>
  </div>
</BaseLayout>
EOF
```

### 修改刷新间隔

在 `src/pages/index.astro`:

```astro
<NodesGrid
  client:load
  refreshInterval={5000}  {/* 改为 5 秒 */}
  showOffline={true}
/>
```

### 代码规范

**命名约定**:

- 组件: `PascalCase` (NodeCard.tsx)
- 函数: `camelCase` (formatBytes)
- 常量: `UPPER_SNAKE_CASE` (API_BASE_URL)

**导入顺序**:

```typescript
// 1. React 和核心库
import React from "react";

// 2. 第三方库
import { Card } from "./ui/card";

// 3. 内部工具
import { formatBytes } from "@/lib/utils";

// 4. 类型定义
import type { Client } from "@/lib/types/komari";
```

---

## 部署指南

### 部署前检查

- ✅ Node.js >= 18.0.0
- ✅ npm >= 9.0.0
- ✅ Komari Server >= 1.0.7
- ✅ 所有源文件已创建
- ✅ 无编译错误

### 部署步骤

#### 步骤 1: 安装依赖

```bash
cd /home/mihari/Server/Aoko
npm install
```

#### 步骤 2: 构建项目

```bash
npm run build
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
npm run package
```

**Windows**:

```bash
npm run package:win
```

预期输出:

```
🚀 开始构建 Komari AstroNext 主题...
🔨 构建项目...
📦 创建主题包...
✅ 打包完成！
📦 主题包: komari-astronext.zip
```

#### 步骤 4: 验证主题包

```bash
unzip -l komari-astronext.zip
```

应包含:

```
komari-astronext.zip
├── komari-theme.json
└── dist/
    ├── index.html
    ├── _astro/
    │   ├── [hash].css
    │   └── [hash].js
    └── favicon.svg
```

#### 步骤 5: 上传到 Komari

1. **登录 Komari 管理后台**

   - 访问: `https://your-komari-server.com/admin`
   - 使用管理员账号登录

2. **进入主题管理**

   - 导航: 设置 → 主题管理

3. **上传主题包**

   - 点击"上传主题"
   - 选择 `komari-astronext.zip`
   - 等待上传完成

4. **激活主题**
   - 在主题列表中找到 "Komari AstroNext"
   - 点击"激活"
   - 访问首页查看效果

---

## 配置说明

### 主题配置项

主题支持以下后台配置（在 `komari-theme.json` 中定义）:

| 配置项             | 类型   | 默认值 | 说明                      |
| ------------------ | ------ | ------ | ------------------------- |
| `view_mode`        | select | 网格   | 默认视图模式（网格/列表） |
| `show_offline`     | switch | true   | 是否显示离线节点          |
| `refresh_interval` | number | 3      | 刷新间隔（秒）            |
| `auto_refresh`     | switch | true   | 是否自动刷新              |
| `compact_mode`     | switch | false  | 紧凑模式                  |

### 本地存储

主题使用以下本地存储字段:

- `appearance` - 明暗主题设置 (light/dark/system)
- `nodeSelectedGroup` - 用户选择的节点分组
- `nodeViewMode` - 展示模式 (grid/table)

### RPC2 接口

主题调用以下 Komari RPC2 接口:

- `common:getNodes` - 获取所有节点信息
- `common:getNodesLatestStatus` - 获取节点最新状态
- `common:getPublicInfo` - 获取公开站点信息

详细的 RPC2 接口文档请查看 `rpc.md`。

---

## 故障排查

### 构建失败

**症状**: `npm run build` 报错

**解决方案**:

1. 检查 Node.js 版本: `node --version` (应 >= 18)
2. 清除缓存: `rm -rf node_modules package-lock.json`
3. 重新安装: `npm install`
4. 再次构建: `npm run build`

### 数据无法加载

**症状**: 页面显示"加载失败"

**解决方案**:

1. 检查浏览器控制台错误
2. 确认 Komari 版本 >= 1.0.7
3. 确认 RPC2 接口已启用
4. 检查 CORS 设置
5. 确认 `/api/rpc2` 可访问

### 主题无法激活

**症状**: 上传成功但激活失败

**解决方案**:

1. 检查 ZIP 包结构
2. 确认 `komari-theme.json` 在包根目录
3. 确认 `dist/index.html` 存在
4. 重新打包: `npm run package`

### 样式显示异常

**症状**: 页面布局混乱

**解决方案**:

1. 清除浏览器缓存 (Ctrl+Shift+R)
2. 检查浏览器控制台错误
3. 确认 CSS 文件已正确加载
4. 尝试其他现代浏览器

### 暗色主题无法切换

**症状**: 点击主题切换按钮无反应

**解决方案**:

1. 清除浏览器 localStorage
2. 刷新页面 (F5)
3. 检查浏览器是否支持 classList API

---

---
