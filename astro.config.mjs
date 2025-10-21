import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";
import fs from "fs";
import path from "path";
import { loadEnv } from "vite";

// 加载环境变量
const env = loadEnv("development", process.cwd(), "");

// https://astro.build/config
export default defineConfig({
  integrations: [
    react({
      babel: {
        plugins: ["babel-plugin-react-compiler"],
      },
    }),
  ],
  publicDir: "./public",
  // 实验性特性：性能优化
  experimental: {
    // 启用客户端预渲染以提升页面导航速度
    clientPrerender: true,
    // 保持脚本和样式的声明顺序
    preserveScriptOrder: true,
  },
  // Prefetch 配置：配合 clientPrerender 使用
  prefetch: {
    prefetchAll: true,
    defaultStrategy: "viewport",
  },
  vite: {
    plugins: [
      tailwindcss(),
      {
        name: "exclude-preview-png",
        writeBundle() {
          // 在构建完成后删除 preview.png
          const previewPath = path.join("./dist", "preview.png");
          try {
            if (fs.existsSync(previewPath)) {
              fs.unlinkSync(previewPath);
              console.log("✅ 已排除 preview.png 文件");
            }
          } catch (error) {
            console.warn("⚠️ 无法删除 preview.png:", error.message);
          }
        },
      },
    ],
    // 开发环境代理配置
    server: {
      proxy: {
        // 将 /api 请求代理到远程后端
        "/api": {
          target: env.VITE_API_BASE_URL || "https://lovejk.cc",
          changeOrigin: true,
          secure: true,
          // 支持 WebSocket 代理
          ws: true,
          // 处理重写路径（如果需要）
          rewrite: (path) => path,
          // 错误处理和调试
          configure: (proxy, _options) => {
            proxy.on("error", (err, _req, _res) => {
              console.log("🔴 代理错误:", err.message);
            });
            proxy.on("proxyReq", (proxyReq, req, _res) => {
              console.log(
                "📤 代理请求:",
                req.method,
                req.url,
                "→",
                proxyReq.getHeader("host")
              );
            });
            proxy.on("proxyRes", (proxyRes, req, _res) => {
              console.log(
                "📥 代理响应:",
                req.method,
                req.url,
                "→",
                proxyRes.statusCode
              );
            });
            // WebSocket 特定事件
            proxy.on(
              "proxyReqWs",
              (_proxyReq, req, _socket, options, _head) => {
                console.log(
                  "🔌 WebSocket 代理请求:",
                  req.url,
                  "→",
                  options.target
                );
              }
            );
            proxy.on("proxyResWs", (proxyRes, req, _socket) => {
              console.log(
                "🔌 WebSocket 代理响应:",
                req.url,
                "→",
                proxyRes.statusCode
              );
            });
            proxy.on("error", (err, req, _res) => {
              if (req.url?.includes("/api/rpc2")) {
                console.log("🔴 WebSocket/代理错误详情:", {
                  url: req.url,
                  method: req.method,
                  headers: req.headers,
                  error: err.message,
                });
              }
            });
          },
        },
      },
    },
    // 性能优化配置
    optimizeDeps: {
      include: ["react", "react-dom"],
      exclude: [],
    },
    build: {
      chunkSizeWarningLimit: 1000,
      // 性能优化：启用代码分割和压缩
      minify: "esbuild",
      cssMinify: true,
      reportCompressedSize: false, // 禁用压缩大小报告以加快构建
      rollupOptions: {
        output: {
          // 手动分块以优化加载性能
          manualChunks: {
            react: ["react", "react-dom"],
          },
          // 优化文件名以便于缓存
          chunkFileNames: "_astro/[name].[hash].js",
          entryFileNames: "_astro/[name].[hash].js",
          assetFileNames: "_astro/[name].[hash][extname]",
        },
      },
    },
    // 性能优化：减少日志输出
    logLevel: "warn",
  },
  output: "static",
  build: {
    format: "file",
    // 性能优化：内联样式以减少请求
    inlineStylesheets: "always",
    // 控制 public 目录文件复制
    copyPublicDir: true,
  },
  outDir: "./dist",
});
