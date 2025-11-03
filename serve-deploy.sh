#!/bin/bash

# 小顺工具箱 - Node.js Serve 部署
# 使用 serve 包快速部署

set -e

echo "📦 小顺工具箱 - Node.js Serve 部署"
echo "=================================="

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo "❌ 错误: 未找到 Node.js"
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

# 安装 serve（如果没有）
if ! command -v serve &> /dev/null; then
    echo "📦 安装 serve..."
    npm install -g serve
fi

# 设置端口
PORT=${1:-3000}

# 获取服务器 IP
SERVER_IP=$(curl -s ifconfig.me 2>/dev/null || hostname -I | awk '{print $1}')

echo ""
echo "🚀 启动 Serve 服务器..."
echo "======================="
echo "🌐 访问地址: http://$SERVER_IP:$PORT"
echo "📋 按 Ctrl+C 停止服务器"
echo ""

# 启动 serve
serve -s dist -l $PORT