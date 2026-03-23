import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";
import fs from "fs";
import path from "path";

// https://astro.build/config
export default defineConfig({
  integrations: [
    react({
      babel: {
        plugins: ["babel-plugin-react-compiler"],
      },
    }),
    {
      name: "cleanup-unused-files",
      hooks: {
        "astro:build:done": () => {
          const filesToRemove = [
            path.join("./dist", "preview.png"),
            path.join("./dist", "_astro", "astro"),
            path.join("./dist", "_astro", "astro.*.js"),
          ];

          for (const pattern of filesToRemove) {
            try {
              if (pattern.includes("*")) {
                const dir = path.dirname(pattern);
                const filePattern = path.basename(pattern);
                if (fs.existsSync(dir)) {
                  const files = fs.readdirSync(dir);
                  const regex = new RegExp(`^${filePattern.replace(/\*/g, ".*")}$`);
                  for (const file of files) {
                    if (regex.test(file)) {
                      const filePath = path.join(dir, file);
                      fs.unlinkSync(filePath);
                      console.log(`✅ Removed: ${file}`);
                    }
                  }
                }
              } else if (fs.existsSync(pattern)) {
                const stats = fs.statSync(pattern);
                if (stats.isDirectory()) {
                  fs.rmSync(pattern, { recursive: true });
                  console.log(`✅ Removed dir: ${path.basename(pattern)}/`);
                } else {
                  fs.unlinkSync(pattern);
                  console.log(`✅ Removed: ${path.basename(pattern)}`);
                }
              }
            } catch (error) {
              console.warn(`⚠️ Cannot remove ${pattern}:`, error.message);
            }
          }
        },
      },
    },
  ],
  publicDir: "./public",
  experimental: {
    svgo: true,
  },
  prefetch: {
    prefetchAll: false,
    defaultStrategy: "viewport",
  },
  vite: {
    plugins: [tailwindcss()],
    server: {
      proxy: {
        "/api": {
          target: process.env.VITE_API_TARGET || "http://127.0.0.1:25774",
          changeOrigin: true,
          ws: true,
        },
        "/themes": {
          target: process.env.VITE_API_TARGET || "http://127.0.0.1:25774",
          changeOrigin: true,
        },
      },
    },
    optimizeDeps: {
      include: ["react", "react-dom"],
    },
    build: {
      chunkSizeWarningLimit: 1000,
      minify: "esbuild",
      cssMinify: true,
      reportCompressedSize: false,
      rollupOptions: {
        output: {
          chunkFileNames: "_astro/[name].[hash].js",
          entryFileNames: "_astro/[name].[hash].js",
          assetFileNames: "_astro/[name].[hash][extname]",
        },
      },
    },
    logLevel: "warn",
  },
  output: "static",
  build: {
    format: "file",
    inlineStylesheets: "auto",
    copyPublicDir: true,
  },
  outDir: "./dist",
});
