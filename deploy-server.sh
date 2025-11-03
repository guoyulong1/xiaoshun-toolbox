#!/bin/bash

# 小顺工具箱 - 服务器部署脚本
# Author: DesignDev AI
# Version: 1.0.0

set -e

echo "🚀 小顺工具箱 - 服务器部署脚本"
echo "=================================="

# 检查 Node.js 版本
echo "📋 检查环境..."
if ! command -v node &> /dev/null; then
    echo "❌ 错误: 未找到 Node.js，请先安装 Node.js"
    exit 1
fi

NODE_VERSION=$(node -v)
echo "✅ Node.js 版本: $NODE_VERSION"

# 安装依赖
echo "📦 安装依赖..."
npm install

# 构建项目
echo "🔨 构建项目..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ 构建成功！"
else
    echo "❌ 构建失败！"
    exit 1
fi

# 选择部署方式
echo ""
echo "🎯 请选择部署方式:"
echo "1) Docker 部署 (推荐)"
echo "2) Nginx 静态部署"
echo "3) PM2 + Serve 部署"
echo "4) 仅构建，手动部署"
echo "5) Vercel 部署 (需要登录)"

read -p "请输入选择 (1-5): " choice

case $choice in
    1)
        echo "🐳 开始 Docker 部署..."
        if ! command -v docker &> /dev/null; then
            echo "❌ 错误: 未找到 Docker，请先安装 Docker"
            exit 1
        fi
        
        # 构建 Docker 镜像
        docker build -t xiaoshun-toolbox:latest .
        
        # 停止旧容器（如果存在）
        docker stop xiaoshun-toolbox 2>/dev/null || true
        docker rm xiaoshun-toolbox 2>/dev/null || true
        
        # 运行新容器
        docker run -d -p 80:80 --name xiaoshun-toolbox --restart unless-stopped xiaoshun-toolbox:latest
        
        echo "✅ Docker 部署完成！"
        echo "🌐 访问地址: http://localhost"
        echo "📋 容器状态: docker ps | grep xiaoshun-toolbox"
        ;;
        
    2)
        echo "🌐 开始 Nginx 部署..."
        
        # 检查 nginx
        if ! command -v nginx &> /dev/null; then
            echo "❌ 错误: 未找到 Nginx，请先安装 Nginx"
            exit 1
        fi
        
        # 创建网站目录
        sudo mkdir -p /var/www/xiaoshun-toolbox
        
        # 复制文件
        sudo cp -r dist/* /var/www/xiaoshun-toolbox/
        
        # 复制 nginx 配置
        sudo cp nginx.conf /etc/nginx/sites-available/xiaoshun-toolbox
        
        # 启用站点
        sudo ln -sf /etc/nginx/sites-available/xiaoshun-toolbox /etc/nginx/sites-enabled/
        
        # 测试配置
        sudo nginx -t
        
        # 重载 nginx
        sudo systemctl reload nginx
        
        echo "✅ Nginx 部署完成！"
        echo "🌐 访问地址: http://your-server-ip"
        echo "📋 配置文件: /etc/nginx/sites-available/xiaoshun-toolbox"
        ;;
        
    3)
        echo "⚡ 开始 PM2 部署..."
        
        # 安装 serve 和 pm2
        if ! command -v serve &> /dev/null; then
            echo "📦 安装 serve..."
            npm install -g serve
        fi
        
        if ! command -v pm2 &> /dev/null; then
            echo "📦 安装 PM2..."
            npm install -g pm2
        fi
        
        # 停止旧进程
        pm2 delete xiaoshun-toolbox 2>/dev/null || true
        
        # 启动新进程
        pm2 serve dist 3000 --spa --name xiaoshun-toolbox
        
        # 保存 PM2 配置
        pm2 save
        
        # 设置开机自启
        pm2 startup
        
        echo "✅ PM2 部署完成！"
        echo "🌐 访问地址: http://localhost:3000"
        echo "📋 进程状态: pm2 status"
        ;;
        
    4)
        echo "📁 构建完成，文件位于 dist/ 目录"
        echo "💡 您可以手动将 dist/ 目录内容部署到您的 Web 服务器"
        ;;
        
    5)
        echo "☁️ 开始 Vercel 部署..."
        
        if ! command -v vercel &> /dev/null; then
            echo "📦 安装 Vercel CLI..."
            npm install -g vercel
        fi
        
        echo "🔑 请先登录 Vercel:"
        vercel login
        
        echo "🚀 开始部署..."
        vercel --prod
        
        echo "✅ Vercel 部署完成！"
        ;;
        
    *)
        echo "❌ 无效选择"
        exit 1
        ;;
esac

echo ""
echo "🎉 部署完成！"
echo "📖 更多信息请查看 README.md 文件"