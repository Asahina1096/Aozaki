# Komari Aozaki 主题打包脚本 (PowerShell)

Write-Host "🚀 开始构建 Komari Aozaki 主题..." -ForegroundColor Green

# 检查 node_modules 是否存在
if (!(Test-Path "node_modules")) {
    Write-Host "📦 安装依赖..." -ForegroundColor Yellow
    bun install
}

# 清理旧的构建文件
Write-Host "🧹 清理旧构建..." -ForegroundColor Yellow
if (Test-Path "dist") {
    Remove-Item -Recurse -Force "dist"
}
if (Test-Path "komari-aozaki.zip") {
    Remove-Item -Force "komari-aozaki.zip"
}

# 构建项目
Write-Host "🔨 构建项目..." -ForegroundColor Yellow
bun run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ 构建失败！" -ForegroundColor Red
    exit 1
}

# 检查 dist 目录是否存在
if (!(Test-Path "dist")) {
    Write-Host "❌ 构建输出目录不存在！" -ForegroundColor Red
    exit 1
}

# 创建打包目录
Write-Host "📁 准备打包..." -ForegroundColor Yellow
New-Item -ItemType Directory -Force -Path ".package-temp" | Out-Null

# 复制必要文件
Copy-Item -Recurse "dist" ".package-temp/"
Copy-Item "komari-theme.json" ".package-temp/"

# 创建 ZIP 包
Write-Host "📦 创建主题包..." -ForegroundColor Yellow
Compress-Archive -Path ".package-temp/*" -DestinationPath "komari-aozaki.zip" -Force

# 清理临时文件
Remove-Item -Recurse -Force ".package-temp"

Write-Host "✅ 打包完成！" -ForegroundColor Green
Write-Host "📦 主题包: komari-aozaki.zip" -ForegroundColor Cyan
Write-Host ""
Write-Host "部署步骤：" -ForegroundColor Yellow
Write-Host "1. 登录 Komari 管理后台"
Write-Host "2. 进入主题管理页面"
Write-Host "3. 上传 komari-aozaki.zip"
Write-Host "4. 激活主题"

