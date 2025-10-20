# Aozaki

> **版本**: 1.0.0
> **作者**: Asahina1096
> **许可证**: GNU GPLv3

一个现代化的 ServerStatus-Rust 前端监控面板，基于 Astro、React、TailwindCSS 和 shadcn/ui 构建。

---

## ✨ 特性

- 🎨 **现代化 UI**: 基于 shadcn/ui 的精美界面设计
- 🌓 **暗色主题**: 支持明暗主题切换
- 📊 **实时监控**: 自动刷新服务器状态数据
- 📱 **响应式布局**: 完美适配各种设备
- ⚡ **极速加载**: Astro 静态站点生成，部署在 Vercel 边缘网络

---

## 🎯 技术栈

| 技术          | 版本 | 用途                  |
| ------------- | ---- | --------------------- |
| Astro         | 5.x  | 静态站点生成器        |
| React         | 19   | 客户端组件库          |
| TailwindCSS   | 4.x  | CSS 框架              |
| shadcn/ui     | -    | UI 组件库             |
| TypeScript    | 5.x  | 类型系统              |
| Lucide React  | -    | 图标库                |

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

```bash
bun install
# 或
npm install
```

### 3. 配置环境变量

复制 `.env.example` 到 `.env` 并配置你的 ServerStatus-Rust 后端地址：

```bash
cp .env.example .env
```

编辑 `.env` 文件：

```env
PUBLIC_API_URL=https://your-serverstatus-backend.com
```

### 4. 本地开发

```bash
bun run dev
# 或
npm run dev
```

访问 `http://localhost:4321` 查看效果。

### 5. 构建生产版本

```bash
bun run build
# 或
npm run build
```

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
   - 值: 你的 ServerStatus-Rust 后端地址
4. 点击 Deploy

### 方式三: 一键部署

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/aozaki)

---

## ⚙️ 配置说明

### 环境变量

| 变量名          | 说明                           | 必需 | 示例                         |
| --------------- | ------------------------------ | ---- | ---------------------------- |
| PUBLIC_API_URL  | ServerStatus-Rust API 地址     | 是   | https://status.example.com   |

### 刷新间隔

在 `src/pages/index.astro` 中可以修改刷新间隔：

```astro
<ServerList client:load refreshInterval={5000} />
<!-- 5000 = 5秒，单位为毫秒 -->
```

---

## 🔧 开发

### 项目结构

```
aozaki/
├── src/
│   ├── components/        # React 组件
│   │   ├── ServerCard.tsx # 服务器卡片
│   │   ├── ServerList.tsx # 服务器列表
│   │   ├── Header.tsx     # 页头
│   │   ├── Footer.tsx     # 页脚
│   │   └── ui/            # UI 基础组件
│   ├── layouts/           # Astro 布局
│   ├── lib/               # 工具库
│   │   ├── api.ts         # API 客户端
│   │   ├── types/         # TypeScript 类型
│   │   └── utils.ts       # 工具函数
│   ├── pages/             # Astro 页面
│   └── styles/            # 全局样式
├── public/                # 静态资源
├── .env.example           # 环境变量示例
├── astro.config.mjs       # Astro 配置
├── vercel.json            # Vercel 配置
└── package.json           # 项目配置
```

### 可用命令

```bash
bun run dev          # 启动开发服务器
bun run build        # 构建生产版本
bun run preview      # 预览生产构建
bun run check        # 类型检查
bun run lint         # 代码检查
bun run format       # 代码格式化
```

---

## 🔗 相关链接

- [ServerStatus-Rust](https://github.com/zdz/ServerStatus-Rust)
- [Astro 官方文档](https://docs.astro.build/)
- [shadcn/ui 文档](https://ui.shadcn.com/)
- [TailwindCSS 文档](https://tailwindcss.com/)
- [Vercel 文档](https://vercel.com/docs)

---

## 📄 许可证

本项目采用 **GNU GPLv3** 许可证。详见 [LICENSE](./LICENSE) 文件。

---

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！


