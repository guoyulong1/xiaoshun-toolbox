#!/bin/bash

# 小顺工具箱 - 超简单部署（Python 服务器）
# 适用于快速测试和小型部署

set -e

echo "🐍 小顺工具箱 - Python 服务器部署"
echo "================================="

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo "❌ 错误: 未找到 Node.js"
    echo "请先安装 Node.js"
    exit 1
fi

echo "✅ Node.js 版本: $(node -v)"

# 安装依赖
echo "📦 安装依赖..."
npm install

# 构建项目
echo "🔨 构建项目..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ 构建失败！"
    exit 1
fi

echo "✅ 构建成功！"

# 检查 Python
if command -v python3 &> /dev/null; then
    PYTHON_CMD="python3"
elif command -v python &> /dev/null; then
    PYTHON_CMD="python"
else
    echo "❌ 错误: 未找到 Python"
    echo "请先安装 Python"
    exit 1
fi

echo "✅ Python 版本: $($PYTHON_CMD --version)"

# 设置端口
PORT=${1:-8000}

# 进入构建目录
cd dist

# 获取服务器 IP
SERVER_IP=$(curl -s ifconfig.me 2>/dev/null || hostname -I | awk '{print $1}')

echo ""
echo "🚀 启动 Python 服务器..."
echo "========================="
echo "🌐 访问地址: http://$SERVER_IP:$PORT"
echo "📋 按 Ctrl+C 停止服务器"
echo ""

# 启动 Python 服务器
$PYTHON_CMD -m http.server $PORT