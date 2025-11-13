# Aozaki

> **版本**: 1.0.0
> **作者**: Asahina1096
> **许可证**: GNU GPLv3

一个现代化的 ServerStatus-Rust 前端监控面板，基于 Astro、React 19、TailwindCSS 4 和 shadcn/ui 构建。

---

## ✨ 特性

- 🎨 **现代化 UI**: 基于 shadcn/ui 的精美界面设计
- 🌓 **暗色主题**: 支持明暗主题切换，状态持久化
- 📊 **实时监控**: 2 秒自动刷新服务器状态数据
- 📱 **响应式布局**: 完美适配各种设备，支持卡片和表格视图
- ⚡ **极速加载**: Astro 静态站点生成 + React 19 编译器优化
- 🔍 **智能视图**: 支持卡片视图和表格视图切换，视图状态持久化

---

## 🎯 技术栈

| 技术        | 版本 | 用途                           |
| ----------- | ---- | ------------------------------ |
| Astro       | 5.x  | 静态站点生成器                 |
| React       | 19   | 客户端组件库                   |
| TailwindCSS | 4.x  | CSS 框架                       |
| shadcn/ui   | -    | UI 组件库                      |
| TypeScript  | 5.x  | 类型系统                       |
| Biome       | 2.x  | 代码检查和格式化               |
| Bun         | 1.x  | 包管理器和运行时               |
| Vercel      | -    | Edge Functions + 部署平台      |

---

## 📋 系统要求

### 后端服务器

- **ServerStatus-Rust**: 需要一个运行中的 ServerStatus-Rust 服务器
- **API 端点**: 需要暴露 `/json/stats.json` 端点

### 客户端

- **浏览器**: Chrome 90+、Firefox 88+、Safari 14+、Edge 90+
- **分辨率**: 建议 1280x720 及以上

---

## 🚀 快速开始

### 1. 克隆项目

```bash
git clone https://github.com/your-username/aozaki.git
cd aozaki
```

### 2. 安装依赖

**推荐使用 Bun** (项目已配置 `packageManager` 为 bun@1.3.2)：

```bash
bun install
```

### 3. 配置环境变量

复制 `.env.example` 到 `.env` 并配置你的 ServerStatus-Rust 后端地址：

```bash
cp .env.example .env
```

编辑 `.env` 文件：

```env
# ServerStatus-Rust 后端 API 地址（必填）
# 在 Vercel 云函数中使用，不会暴露给客户端
# 注意：不要以斜杠结尾
PUBLIC_API_URL=https://your-serverstatus-backend.com
```

### 4. 本地开发

```bash
bun run dev
```

访问 `http://localhost:4321` 查看效果。

### 5. 构建生产版本

```bash
bun run build
```

构建产物会生成在 `dist/` 目录。

---

## 📦 部署到 Vercel

### 方式一: 通过 Vercel CLI

1. 安装 Vercel CLI:

```bash
npm i -g vercel
```

2. 登录并部署:

```bash
vercel login
vercel
```

3. 在 Vercel 项目设置中添加环境变量 `PUBLIC_API_URL`

### 方式二: 通过 Vercel Dashboard

1. 在 [Vercel](https://vercel.com) 创建新项目
2. 连接你的 Git 仓库
3. 配置环境变量:
   - 变量名: `PUBLIC_API_URL`
   - 值: 你的 ServerStatus-Rust 后端地址（不要以斜杠结尾）
   - **说明**: 仅在 Vercel 云函数中使用，不会打包到客户端代码
4. 点击 Deploy

### 方式三: 一键部署

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/aozaki)

---

## ⚙️ 配置说明

### 环境变量

| 变量名         | 说明                           | 必需 | 示例                       |
| -------------- | ------------------------------ | ---- | -------------------------- |
| PUBLIC_API_URL | ServerStatus-Rust API 地址     | 是   | https://status.example.com |

**注意事项**:

- 仅在 Vercel Edge Functions 中使用，不会打包到客户端代码
- 保护后端 API 地址不暴露
- 支持服务端缓存（默认 5 秒），减少后端负载
- URL 不要以斜杠结尾

### 刷新间隔

在 `src/pages/index.astro` 中可以修改刷新间隔：

```astro
<ServerList client:visible refreshInterval={2000} />
<!-- 2000 = 2秒，单位为毫秒 -->
```

默认配置为 2 秒（2000ms）自动刷新。

### 服务端缓存

Edge Function (`api/stats.ts`) 实现了服务端缓存，默认 TTL 为 5 秒。可以修改 `CACHE_TTL` 常量来调整缓存时间：

```typescript
const CACHE_TTL = 5000; // 5秒缓存时间（毫秒）
```

---

## 🔧 开发

### 项目结构

```
aozaki/
├── api/                     # Vercel Edge Functions
│   └── stats.ts             # API 代理 + 缓存
├── src/
│   ├── components/          # React & Astro 组件
│   │   ├── ServerCard.tsx   # 服务器卡片 (React)
│   │   ├── ServerList.tsx   # 服务器列表 (React)
│   │   ├── ServerTable.tsx  # 服务器表格 (React)
│   │   ├── ServerOverview.tsx # 服务器概览 (React)
│   │   ├── Header.astro     # 页头 (Astro 静态组件)
│   │   ├── Footer.astro     # 页脚 (Astro 静态组件)
│   │   └── ui/              # shadcn/ui 基础组件
│   ├── layouts/             # Astro 布局
│   │   └── BaseLayout.astro # 基础布局
│   ├── lib/                 # 工具库
│   │   ├── api.ts           # API 客户端 (单例模式)
│   │   ├── types/           # TypeScript 类型定义
│   │   └── utils.ts         # 工具函数
│   ├── pages/               # Astro 页面
│   │   └── index.astro      # 主页
│   └── styles/              # 全局样式
├── public/                  # 静态资源
├── .env.example             # 环境变量示例
├── astro.config.mjs         # Astro 配置
├── biome.json               # Biome 配置
├── vercel.json              # Vercel 配置
├── CLAUDE.md                # Claude Code 项目指南
└── package.json             # 项目配置
```

### 可用命令

#### 开发命令

```bash
bun run dev              # 启动开发服务器 (http://localhost:4321)
bun run build            # 构建生产版本
bun run preview          # 预览生产构建
```

#### 代码质量

```bash
bun run check            # Astro 类型检查 + 清理缓存
bun run check:all        # 运行所有检查 (类型 + lint + 格式)
bun run biome:check      # Biome lint 和格式检查
bun run biome:fix        # 自动修复 Biome 问题
bun run lint             # 仅 lint 检查
bun run lint:fix         # 自动修复 lint 问题
bun run format           # 代码格式化
bun run format:check     # 检查代码格式
```

#### 清理命令

```bash
bun run clean            # 清理构建文件 (dist、.astro、cache、*.zip)
bun run clean:all        # 清理所有文件 (包括 node_modules)
```

### 架构说明

#### 静态站点 + Edge Functions

- **静态组件** (Astro): Header、Footer、BaseLayout - 构建时渲染为静态 HTML
- **交互组件** (React): ServerList、ServerCard、ServerTable、ServerOverview - 客户端水合
- **API 代理**: `/api/stats` - Vercel Edge Function（原生，位于 `api/` 目录）
- React 组件使用 `client:visible` 指令，视口可见时加载
- React 19 配合 babel-plugin-react-compiler 实现自动优化

#### 数据流

1. `ServerList.tsx` 从 `/api/stats` 端点获取数据（通过 `getAPIClient()`）
2. `/api/stats` (Vercel Edge Function) 代理请求到 ServerStatus-Rust 后端
3. Edge Function 实现 5 秒服务端缓存，减少后端负载
4. API 客户端 (`src/lib/api.ts`) 处理请求，支持超时和中止信号
5. 数据符合 `StatsResponse` 类型 (`src/lib/types/serverstatus.ts`)
6. `ServerList` 将数据传递给 `ServerOverview` (统计信息) 和 `ServerCard` (服务器列表)
7. 自动刷新由 `refreshInterval` 属性控制 (默认: 2000ms)
8. Page Visibility API: 标签页隐藏时暂停刷新，节省资源

#### 性能优化

- **服务端缓存**: Edge Function 5 秒缓存减少后端请求
- **CDN 缓存**: Vercel CDN 额外缓存层
- **Edge Runtime**: 更快的冷启动和更低的延迟
- **静态站点**: 主页面预渲染为静态 HTML，极快加载速度
- React 代码分块 (`astro.config.mjs`)
- 基于视口的预取策略
- 内联样式表优化

---

## 🎨 代码风格

### Biome 配置

- **格式化**: 2 空格缩进，80 字符行宽，LF 换行，双引号
- **Linter**: 严格规则，`noExplicitAny` 为错误级别
- **TypeScript**: `noUnusedVariables` 为错误级别
- **Astro**: 前端脚本中 `noUnusedVariables` 被禁用

### 导入别名

使用 `@/` 作为 src 目录的别名：

```typescript
import { ServerList } from "@/components/ServerList";
import { getAPIClient } from "@/lib/api";
```

---

## 🔗 相关链接

- [ServerStatus-Rust](https://github.com/zdz/ServerStatus-Rust) - 后端服务
- [Astro 官方文档](https://docs.astro.build/) - 静态站点生成器
- [shadcn/ui 文档](https://ui.shadcn.com/) - UI 组件库
- [TailwindCSS 文档](https://tailwindcss.com/) - CSS 框架
- [React 19 文档](https://react.dev/) - React 官方文档
- [Biome 文档](https://biomejs.dev/) - 代码工具
- [Bun 文档](https://bun.sh/docs) - JavaScript 运行时
- [Vercel 文档](https://vercel.com/docs) - 部署平台

---

## 📄 许可证

本项目采用 **GNU GPLv3** 许可证。详见 [LICENSE](./LICENSE) 文件。

---

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

在提交代码前，请确保：

1. 运行 `bun run check:all` 确保代码质量
2. 遵循项目的代码风格 (Biome 配置)
3. 更新相关文档

---

## 💡 致谢

- [ServerStatus-Rust](https://github.com/zdz/ServerStatus-Rust) - 提供后端监控服务
- [shadcn/ui](https://ui.shadcn.com/) - 提供精美的 UI 组件
- [Astro](https://astro.build/) - 提供强大的静态站点生成能力
