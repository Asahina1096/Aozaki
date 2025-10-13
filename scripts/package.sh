#!/bin/bash

# Komari AstroNext 主题打包脚本

echo "🚀 开始构建 Komari AstroNext 主题..."

# 检查 node_modules 是否存在
if [ ! -d "node_modules" ]; then
    echo "📦 安装依赖..."
    npm install
fi

# 清理旧的构建文件
echo "🧹 清理旧构建..."
rm -rf dist/
rm -f komari-astronext.zip

# 构建项目
echo "🔨 构建项目..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ 构建失败！"
    exit 1
fi

# 检查 dist 目录是否存在
if [ ! -d "dist" ]; then
    echo "❌ 构建输出目录不存在！"
    exit 1
fi

# 创建打包目录
echo "📁 准备打包..."
mkdir -p .package-temp

# 复制必要文件
cp -r dist .package-temp/
cp komari-theme.json .package-temp/

# 创建 ZIP 包
echo "📦 创建主题包..."
cd .package-temp
zip -r ../komari-astronext.zip *
cd ..

# 清理临时文件
rm -rf .package-temp

echo "✅ 打包完成！"
echo "📦 主题包: komari-astronext.zip"
echo ""
echo "部署步骤："
echo "1. 登录 Komari 管理后台"
echo "2. 进入主题管理页面"
echo "3. 上传 komari-astronext.zip"
echo "4. 激活主题"

