#!/bin/bash

# Nginx 修复脚本
# 用于解决 Nginx 启动失败问题

echo "🔧 Nginx 修复脚本"
echo "================="

# 检查 Nginx 状态
echo "📋 检查 Nginx 状态..."
systemctl status nginx.service

# 检查 Nginx 错误日志
echo ""
echo "📋 检查 Nginx 错误日志..."
tail -n 20 /var/log/nginx/error.log

# 检查端口占用
echo ""
echo "📋 检查端口占用..."
netstat -tulpn | grep :80

# 尝试修复常见问题
echo ""
echo "🔧 尝试修复常见问题..."

# 1. 检查配置文件
echo "1. 检查配置文件..."
nginx -t

# 2. 检查网站目录权限
echo ""
echo "2. 检查网站目录权限..."
ls -la /var/www/xiaoshun-toolbox

# 3. 修复网站目录权限
echo ""
echo "3. 修复网站目录权限..."
chown -R www-data:www-data /var/www/xiaoshun-toolbox
chmod -R 755 /var/www/xiaoshun-toolbox

# 4. 检查 Nginx 配置目录
echo ""
echo "4. 检查 Nginx 配置目录..."
ls -la /etc/nginx/sites-enabled/

# 5. 尝试使用默认配置
echo ""
echo "5. 尝试使用默认配置..."
cat > /etc/nginx/sites-available/xiaoshun-toolbox << 'EOF'
server {
    listen 80;
    listen [::]:80;
    
    server_name _;
    
    root /var/www/xiaoshun-toolbox;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
}
EOF

# 6. 重新链接配置
echo ""
echo "6. 重新链接配置..."
ln -sf /etc/nginx/sites-available/xiaoshun-toolbox /etc/nginx/sites-enabled/

# 7. 检查 Nginx 用户
echo ""
echo "7. 检查 Nginx 用户..."
grep -i user /etc/nginx/nginx.conf

# 8. 尝试重启 Nginx
echo ""
echo "8. 尝试重启 Nginx..."
systemctl restart nginx

# 9. 检查 Nginx 状态
echo ""
echo "9. 检查 Nginx 状态..."
systemctl status nginx

echo ""
echo "🔍 如果 Nginx 仍然无法启动，请尝试以下命令查看更详细的错误信息："
echo "   journalctl -xe"
echo "   journalctl -u nginx.service"
echo ""
echo "🌐 如果一切正常，您应该可以通过服务器 IP 访问您的网站了"