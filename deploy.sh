#!/bin/bash

# 小顺工具箱一键部署脚本
# XiaoShun Toolbox One-Click Deployment Script

echo "🚀 开始部署小顺工具箱..."
echo "🚀 Starting XiaoShun Toolbox deployment..."

# 检查 Node.js 版本
echo "📋 检查环境..."
node_version=$(node -v)
echo "Node.js 版本: $node_version"

# 安装依赖
echo "📦 安装依赖..."
npm ci

# 构建项目
echo "🔨 构建项目..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ 构建成功！"
    
    # 询问部署方式
    echo "🌐 请选择部署方式:"
    echo "1) Vercel"
    echo "2) Netlify" 
    echo "3) GitHub Pages"
    echo "4) Docker"
    echo "5) 仅构建，不部署"
    
    read -p "请输入选项 (1-5): " choice
    
    case $choice in
        1)
            echo "🚀 部署到 Vercel..."
            npm run deploy:vercel
            ;;
        2)
            echo "🚀 部署到 Netlify..."
            npm run deploy:netlify
            ;;
        3)
            echo "🚀 部署到 GitHub Pages..."
            npm run deploy:gh
            ;;
        4)
            echo "🐳 构建 Docker 镜像..."
            npm run docker:build
            echo "🐳 启动 Docker 容器..."
            npm run docker:run
            ;;
        5)
            echo "📁 构建完成，文件位于 dist/ 目录"
            echo "📁 Build completed, files are in dist/ directory"
            ;;
        *)
            echo "❌ 无效选项"
            exit 1
            ;;
    esac
    
    echo "🎉 部署完成！"
    echo "🎉 Deployment completed!"
    
else
    echo "❌ 构建失败！"
    echo "❌ Build failed!"
    exit 1
fi