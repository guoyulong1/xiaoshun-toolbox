@echo off
chcp 65001 >nul
echo 🚀 开始部署小顺工具箱...
echo 🚀 Starting XiaoShun Toolbox deployment...

REM 检查 Node.js 版本
echo 📋 检查环境...
node -v
if %errorlevel% neq 0 (
    echo ❌ 请先安装 Node.js
    pause
    exit /b 1
)

REM 安装依赖
echo 📦 安装依赖...
call npm ci
if %errorlevel% neq 0 (
    echo ❌ 依赖安装失败
    pause
    exit /b 1
)

REM 构建项目
echo 🔨 构建项目...
call npm run build
if %errorlevel% neq 0 (
    echo ❌ 构建失败！
    pause
    exit /b 1
)

echo ✅ 构建成功！

REM 询问部署方式
echo 🌐 请选择部署方式:
echo 1) Vercel
echo 2) Netlify
echo 3) GitHub Pages
echo 4) Docker
echo 5) 仅构建，不部署

set /p choice=请输入选项 (1-5): 

if "%choice%"=="1" (
    echo 🚀 部署到 Vercel...
    call npm run deploy:vercel
) else if "%choice%"=="2" (
    echo 🚀 部署到 Netlify...
    call npm run deploy:netlify
) else if "%choice%"=="3" (
    echo 🚀 部署到 GitHub Pages...
    call npm run deploy:gh
) else if "%choice%"=="4" (
    echo 🐳 构建 Docker 镜像...
    call npm run docker:build
    echo 🐳 启动 Docker 容器...
    call npm run docker:run
) else if "%choice%"=="5" (
    echo 📁 构建完成，文件位于 dist/ 目录
    echo 📁 Build completed, files are in dist/ directory
) else (
    echo ❌ 无效选项
    pause
    exit /b 1
)

echo 🎉 部署完成！
echo 🎉 Deployment completed!
pause