#!/bin/bash

# 小顺工具箱 - Nginx 静态部署脚本
# 适用于没有 Docker 的服务器环境

set -e

echo "🌐 小顺工具箱 - Nginx 静态部署"
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

# 检查并安装 Nginx
if ! command -v nginx &> /dev/null; then
    echo "📦 安装 Nginx..."
    
    # 检测系统类型
    if [ -f /etc/debian_version ]; then
        # Debian/Ubuntu
        apt update
        apt install -y nginx
    elif [ -f /etc/redhat-release ]; then
        # CentOS/RHEL
        yum install -y epel-release
        yum install -y nginx
    else
        echo "❌ 不支持的系统类型，请手动安装 Nginx"
        exit 1
    fi
fi

echo "✅ Nginx 已安装"

# 创建网站目录
SITE_DIR="/var/www/xiaoshun-toolbox"
echo "📁 创建网站目录: $SITE_DIR"
mkdir -p $SITE_DIR

# 复制构建文件
echo "📋 复制构建文件..."
cp -r dist/* $SITE_DIR/

# 设置权限
chown -R www-data:www-data $SITE_DIR
chmod -R 755 $SITE_DIR

# 创建 Nginx 配置
NGINX_CONFIG="/etc/nginx/sites-available/xiaoshun-toolbox"
echo "⚙️ 创建 Nginx 配置..."

tee $NGINX_CONFIG > /dev/null << 'EOF'
server {
    listen 80;
    listen [::]:80;
    
    # 替换为您的域名，或者使用 _ 表示默认站点
    server_name _;
    
    root /var/www/xiaoshun-toolbox;
    index index.html;
    
    # 启用 Gzip 压缩
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
    
    # 静态资源缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        add_header Vary Accept-Encoding;
    }
    
    # SPA 路由支持
    location / {
        try_files $uri $uri/ /index.html;
        
        # 安全头
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    }
    
    # 禁止访问隐藏文件
    location ~ /\. {
        deny all;
    }
    
    # 日志
    access_log /var/log/nginx/xiaoshun-toolbox.access.log;
    error_log /var/log/nginx/xiaoshun-toolbox.error.log;
}
EOF

# 启用站点
echo "🔗 启用站点..."
ln -sf $NGINX_CONFIG /etc/nginx/sites-enabled/

# 删除默认站点（可选）
if [ -f /etc/nginx/sites-enabled/default ]; then
    echo "🗑️ 删除默认站点..."
    rm /etc/nginx/sites-enabled/default
fi

# 测试 Nginx 配置
echo "🧪 测试 Nginx 配置..."
nginx -t

if [ $? -ne 0 ]; then
    echo "❌ Nginx 配置错误！"
    exit 1
fi

# 重启 Nginx
echo "🔄 重启 Nginx..."
systemctl restart nginx
systemctl enable nginx

# 检查防火墙
if command -v ufw &> /dev/null; then
    echo "🔥 配置防火墙..."
    ufw allow 'Nginx Full'
fi

echo ""
echo "🎉 部署完成！"
echo "================================"
echo "🌐 访问地址: http://$(curl -s ifconfig.me 2>/dev/null || echo 'your-server-ip')"
echo "📁 网站目录: $SITE_DIR"
echo "⚙️ 配置文件: $NGINX_CONFIG"
echo ""
echo "📋 常用命令:"
echo "  查看状态: systemctl status nginx"
echo "  重启服务: systemctl restart nginx"
echo "  查看日志: tail -f /var/log/nginx/xiaoshun-toolbox.access.log"
echo "  更新网站: 重新运行此脚本即可"