#!/bin/bash

# 小顺工具箱 - 超简单部署脚本
# 适用于 Debian 服务器（root 用户）

set -e

echo "🚀 小顺工具箱 - 快速部署"
echo "========================"

# 安装 Node.js（如果没有）
if ! command -v node &> /dev/null; then
    echo "📦 安装 Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt-get install -y nodejs
fi

# 安装 Nginx（如果没有）
if ! command -v nginx &> /dev/null; then
    echo "📦 安装 Nginx..."
    apt update
    apt install -y nginx
fi

# 构建项目
echo "🔨 构建项目..."
npm install
npm run build

# 部署到 Nginx
echo "🌐 部署到 Nginx..."
rm -rf /var/www/html/*
cp -r dist/* /var/www/html/

# 创建简单的 Nginx 配置
cat > /etc/nginx/sites-available/default << 'EOF'
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    
    root /var/www/html;
    index index.html;
    
    server_name _;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # 静态资源缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF

# 重启 Nginx
echo "🔄 重启 Nginx..."
systemctl restart nginx
systemctl enable nginx

# 获取服务器 IP
SERVER_IP=$(curl -s ifconfig.me 2>/dev/null || hostname -I | awk '{print $1}')

echo ""
echo "🎉 部署完成！"
echo "========================"
echo "🌐 访问地址: http://$SERVER_IP"
echo ""
echo "如需更新网站，重新运行此脚本即可！"