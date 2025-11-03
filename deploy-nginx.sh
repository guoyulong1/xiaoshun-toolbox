#!/bin/bash

# 小顺工具箱 - Nginx 静态部署脚本（修复版）

set -e

echo "🌐 小顺工具箱 - Nginx 静态部署"
echo "================================"

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo "❌ 错误: 未找到 Node.js"
    exit 1
fi

echo "✅ Node.js 版本: $(node -v)"

# 安装依赖和构建（这部分应该没问题，因为已经成功了）
echo "📦 安装依赖..."
npm install

echo "🔨 构建项目..."
npm run build

echo "✅ 构建成功！"

# 检查 Nginx
if ! command -v nginx &> /dev/null; then
    echo "📦 安装 Nginx..."
    apt update
    apt install -y nginx
fi

echo "✅ Nginx 已安装"

# 停止 Nginx 服务以避免冲突
echo "🛑 停止 Nginx 服务..."
systemctl stop nginx || true

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

# 备份原有配置
echo "📦 备份原有配置..."
cp /etc/nginx/nginx.conf /etc/nginx/nginx.conf.backup.$(date +%Y%m%d%H%M%S)

# 创建简化的 Nginx 配置
NGINX_CONFIG="/etc/nginx/sites-available/xiaoshun-toolbox"
echo "⚙️ 创建 Nginx 配置..."

cat > $NGINX_CONFIG << 'EOF'
server {
    listen 8080;  # 改用 8080 端口避免冲突
    server_name _;
    
    root /var/www/xiaoshun-toolbox;
    index index.html;
    
    # SPA 路由支持
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # 静态资源缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF

# 清理并启用站点
echo "🔧 清理配置..."
rm -f /etc/nginx/sites-enabled/*
ln -sf $NGINX_CONFIG /etc/nginx/sites-enabled/

# 测试配置
echo "🧪 测试 Nginx 配置..."
if nginx -t; then
    echo "✅ Nginx 配置测试通过"
    
    # 启动 Nginx
    echo "🔄 启动 Nginx..."
    systemctl start nginx
    systemctl enable nginx
    
    # 检查状态
    if systemctl is-active --quiet nginx; then
        echo "✅ Nginx 启动成功"
        
        # 获取服务器IP
        SERVER_IP=$(curl -s ifconfig.me 2>/dev/null || hostname -I | awk '{print $1}')
        
        echo ""
        echo "🎉 部署完成！"
        echo "================================"
        echo "🌐 访问地址: http://${SERVER_IP}:8080"
        echo "📁 网站目录: $SITE_DIR"
        echo ""
        echo "⚠️  注意: 使用 8080 端口访问"
        echo "   如果无法访问，请检查防火墙: ufw allow 8080"
    else
        echo "❌ Nginx 启动失败"
        systemctl status nginx
    fi
else
    echo "❌ Nginx 配置测试失败"
    echo "请手动检查: nginx -t"
    exit 1
fi