import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";
import fs from "fs";
import path from "path";

// https://astro.build/config
export default defineConfig({
  integrations: [react()],
  publicDir: "./public",
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
    // 性能优化配置
    optimizeDeps: {
      include: ["react", "react-dom", "recharts"],
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
            recharts: ["recharts"],
            radix: [
              "@radix-ui/react-select",
              "@radix-ui/react-dialog",
              "@radix-ui/react-dropdown-menu",
              "@radix-ui/react-switch",
              "@radix-ui/react-slot",
            ],
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
    inlineStylesheets: "auto",
    // 控制 public 目录文件复制
    copyPublicDir: true,
  },
  outDir: "./dist",
});
