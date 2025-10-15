#!/bin/bash

# Komari Aozaki 主题打包脚本（性能优化版）

set -euo pipefail # 遇到错误立即退出

echo "🚀 开始构建 Komari Aozaki 主题..."

# 检查 node_modules 是否存在
if [ ! -d "node_modules" ]; then
    echo "📦 安装依赖..."
    bun install
fi

# 清理旧的构建文件（并行执行）
echo "🧹 清理旧构建..."
rm -rf dist/ komari-aozaki.zip 2>/dev/null || true

# 构建项目（跳过类型检查以提速，类型检查应在开发时完成）
echo "🔨 构建项目..."
bun run build

# 检查 dist 目录是否存在
if [ ! -d "dist" ]; then
    echo "❌ 构建输出目录不存在！"
    exit 1
fi

# 创建 ZIP 包（使用临时变量避免重复创建目录）
echo "📦 创建主题包..."
TEMP_DIR=".package-temp-$$"
mkdir -p "$TEMP_DIR"

# 使用 cp 的 -a 参数保留属性并加速复制
cp -a dist "$TEMP_DIR/"
cp komari-theme.json "$TEMP_DIR/"

# 复制预览图（如果存在）
[ -f "public/preview.png" ] && cp public/preview.png "$TEMP_DIR/"

# 创建 ZIP 包（使用 -q 静默模式，-9 最高压缩，-r 递归）
# 使用 pigz 如果可用（多线程压缩），否则使用标准 zip
cd "$TEMP_DIR"
if command -v pigz &> /dev/null; then
    # 使用 pigz 进行多线程压缩
    tar cf - * | pigz -9 > ../komari-aozaki.tar.gz 2>/dev/null || \
    zip -q -9 -r ../komari-aozaki.zip *
else
    # 标准 zip 压缩
    zip -q -9 -r ../komari-aozaki.zip *
fi
cd ..

# 清理临时文件
rm -rf "$TEMP_DIR"

# 显示文件大小
SIZE=$(du -h komari-aozaki.* 2>/dev/null | cut -f1)
echo "✅ 打包完成！"
echo "📦 主题包: komari-aozaki.* (${SIZE})"
echo ""
echo "部署步骤："
echo "1. 登录 Komari 管理后台"
echo "2. 进入主题管理页面"
echo "3. 上传主题包"
echo "4. 激活主题"

