#!/bin/bash

# 小顺工具箱 - PM2 轻量级部署脚本
# 适用于没有 Docker 的服务器环境

set -e

echo "⚡ 小顺工具箱 - PM2 轻量级部署"
echo "================================"

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo "❌ 错误: 未找到 Node.js"
    echo "请先安装 Node.js:"
    echo "curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -"
    echo "sudo apt-get install -y nodejs"
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

# 安装 PM2 和 serve
if ! command -v pm2 &> /dev/null; then
    echo "📦 安装 PM2..."
    npm install -g pm2
fi

if ! command -v serve &> /dev/null; then
    echo "📦 安装 serve..."
    npm install -g serve
fi

echo "✅ PM2 和 serve 已安装"

# 停止旧进程（如果存在）
pm2 delete xiaoshun-toolbox 2>/dev/null || true

# 设置端口
read -p "请输入要使用的端口号 [默认: 3000]: " PORT
PORT=${PORT:-3000}

# 启动服务
echo "🚀 启动服务..."
pm2 serve dist $PORT --spa --name xiaoshun-toolbox

# 保存 PM2 配置
echo "💾 保存 PM2 配置..."
pm2 save

# 设置开机自启
echo "⚙️ 设置开机自启..."
pm2 startup

# 检查防火墙
if command -v ufw &> /dev/null; then
    echo "🔥 配置防火墙..."
    sudo ufw allow $PORT/tcp
fi

echo ""
echo "🎉 部署完成！"
echo "================================"
echo "🌐 访问地址: http://$(curl -s ifconfig.me 2>/dev/null || echo 'your-server-ip'):$PORT"
echo ""
echo "📋 常用命令:"
echo "  查看状态: pm2 status"
echo "  重启服务: pm2 restart xiaoshun-toolbox"
echo "  查看日志: pm2 logs xiaoshun-toolbox"
echo "  停止服务: pm2 stop xiaoshun-toolbox"
echo "  更新网站: 重新运行此脚本即可"