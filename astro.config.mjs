import react from "@astrojs/react";
import vercel from "@astrojs/vercel";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";
import fs from "fs";
import path from "path";

// https://astro.build/config
export default defineConfig({
  output: "server",
  adapter: vercel({
    edgeMiddleware: true,
  }),
  integrations: [
    react({
      babel: {
        plugins: ["babel-plugin-react-compiler"],
      },
    }),
    // 清理未使用文件的集成
    {
      name: "cleanup-unused-files",
      hooks: {
        "astro:build:done": () => {
          // 在整个 Astro 构建流程完成后执行清理
          const filesToRemove = [
            path.join("./dist", "preview.png"),
            path.join("./dist", "_astro", "astro"),
            path.join("./dist", "_astro", "astro.*.js"),
          ];

          for (const pattern of filesToRemove) {
            try {
              // 处理 glob 模式
              if (pattern.includes("*")) {
                const dir = path.dirname(pattern);
                const filePattern = path.basename(pattern);
                if (fs.existsSync(dir)) {
                  const files = fs.readdirSync(dir);
                  const regex = new RegExp(
                    `^${filePattern.replace(/\*/g, ".*")}$`
                  );
                  for (const file of files) {
                    if (regex.test(file)) {
                      const filePath = path.join(dir, file);
                      fs.unlinkSync(filePath);
                      console.log(`✅ 已删除未使用文件: ${file}`);
                    }
                  }
                }
              } else if (fs.existsSync(pattern)) {
                // 处理目录和文件
                const stats = fs.statSync(pattern);
                if (stats.isDirectory()) {
                  fs.rmSync(pattern, { recursive: true });
                  console.log(
                    `✅ 已删除未使用目录: ${path.basename(pattern)}/`
                  );
                } else {
                  fs.unlinkSync(pattern);
                  console.log(`✅ 已删除未使用文件: ${path.basename(pattern)}`);
                }
              }
            } catch (error) {
              console.warn(`⚠️ 无法删除 ${pattern}:`, error.message);
            }
          }
        },
      },
    },
  ],
  publicDir: "./public",
  // 实验性特性：性能优化
  experimental: {
    // 保持脚本和样式的声明顺序
    preserveScriptOrder: true,
  },
  // Prefetch 配置：仅对标记的关键路由进行预取
  prefetch: {
    prefetchAll: false,
    defaultStrategy: "viewport",
  },
  vite: {
    plugins: [tailwindcss()],
    // 性能优化配置
    optimizeDeps: {
      include: ["react", "react-dom"],
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
});
