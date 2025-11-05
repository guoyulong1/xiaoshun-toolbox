#!/bin/bash

# 后台服务部署脚本 - 使应用持续在后台运行
# 作者: DesignDev AI
# 版本: 1.0

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # 无颜色

# 打印带颜色的消息
print_message() {
  echo -e "${2}${1}${NC}"
}

# 检查命令是否存在
check_command() {
  if ! command -v $1 &> /dev/null; then
    print_message "❌ $1 未安装，正在安装..." "$YELLOW"
    return 1
  else
    print_message "✅ $1 已安装" "$GREEN"
    return 0
  fi
}

# 检查Node.js环境
check_node() {
  print_message "🔍 检查 Node.js 环境..." "$BLUE"
  
  if ! check_command node; then
    print_message "正在安装 Node.js..." "$YELLOW"
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt-get install -y nodejs
  fi
  
  print_message "Node.js 版本: $(node -v)" "$GREEN"
  print_message "NPM 版本: $(npm -v)" "$GREEN"
}

# 检查PM2是否安装
check_pm2() {
  print_message "🔍 检查 PM2..." "$BLUE"
  
  if ! check_command pm2; then
    print_message "正在全局安装 PM2..." "$YELLOW"
    npm install -g pm2
  fi
}

# 检查serve是否安装
check_serve() {
  print_message "🔍 检查 serve..." "$BLUE"
  
  if ! npm list -g serve &> /dev/null; then
    print_message "正在全局安装 serve..." "$YELLOW"
    npm install -g serve
  else
    print_message "✅ serve 已安装" "$GREEN"
  fi
}

# 主函数
main() {
  print_message "🚀 开始配置后台服务..." "$BLUE"
  
  # 检查必要环境
  check_node
  check_pm2
  check_serve
  
  # 获取应用目录
  APP_DIR=$(pwd)
  print_message "📂 应用目录: $APP_DIR" "$BLUE"
  
  # 检查dist目录是否存在
  if [ ! -d "$APP_DIR/dist" ]; then
    print_message "❌ dist目录不存在，请先构建项目" "$RED"
    print_message "运行: npm run build" "$YELLOW"
    exit 1
  fi
  
  # 设置端口
  DEFAULT_PORT=3000
  read -p "请输入服务端口 (默认: $DEFAULT_PORT): " PORT
  PORT=${PORT:-$DEFAULT_PORT}
  
  # 设置应用名称
  DEFAULT_NAME="xiaoshun-toolbox"
  read -p "请输入应用名称 (默认: $DEFAULT_NAME): " APP_NAME
  APP_NAME=${APP_NAME:-$DEFAULT_NAME}
  
  # 停止已存在的PM2进程
  print_message "🛑 停止已存在的PM2进程..." "$BLUE"
  pm2 delete $APP_NAME &>/dev/null
  
  # 使用PM2启动serve
  print_message "🚀 使用PM2启动应用..." "$BLUE"
  cd $APP_DIR
  pm2 serve dist $PORT --spa --name $APP_NAME
  
  # 保存PM2配置
  print_message "💾 保存PM2配置..." "$BLUE"
  pm2 save
  
  # 设置开机自启
  print_message "⚙️ 设置开机自启..." "$BLUE"
  pm2 startup
  
  # 显示PM2状态
  print_message "📊 PM2状态:" "$BLUE"
  pm2 status
  
  # 显示访问信息
  SERVER_IP=$(hostname -I | awk '{print $1}')
  print_message "🎉 部署完成!" "$GREEN"
  print_message "📡 应用已在后台运行，可通过以下地址访问:" "$GREEN"
  print_message "🔗 http://$SERVER_IP:$PORT" "$BLUE"
  print_message "🔗 http://localhost:$PORT (本地访问)" "$BLUE"
  
  # 显示常用命令
  print_message "\n📝 常用命令:" "$YELLOW"
  print_message "  查看应用状态: pm2 status" "$NC"
  print_message "  查看应用日志: pm2 logs $APP_NAME" "$NC"
  print_message "  重启应用: pm2 restart $APP_NAME" "$NC"
  print_message "  停止应用: pm2 stop $APP_NAME" "$NC"
  print_message "  删除应用: pm2 delete $APP_NAME" "$NC"
}

# 执行主函数
main