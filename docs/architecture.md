# DevKit 工具箱 - 技术架构说明

## 前端架构
- 框架：React + TypeScript（Vite 构建）
- UI：Tailwind CSS
- 路由：react-router-dom（轻量级页面导航）
- 工具库：pako（Gzip/Zlib），自研工具函数（CRC、进制转换、A* 等）

## 目录结构
```
src/
  components/        # 通用组件（布局、按钮等）
  pages/             # 功能页面（工具）
  utils/             # 算法与工具函数
  styles/            # 全局样式（Tailwind）
```

## 关键模块
- 时间工具：基于 Date 与 Intl.DateTimeFormat，实现毫秒/秒与本地/UTC互转
- 进制工具：BigInt + 自定义解析/格式化，支持负数与边界校验
- 编码工具：Base64（atob/btoa + polyfill）、URL（encode/decode）、Gzip/Zlib（pako）
- 路径规划：网格模型（二维数组），算法库（BFS/Dijkstra/A*），可视化（CSS Grid）
- 机器人调试：CRC16/CRC32（标准实现），Hex 查看器（字节/ASCII/十进制）

## 状态管理
采用组件内局部状态与 props 传递，避免过度复杂化。后续可引入 Zustand/Redux 视需求扩展。

## 构建与部署
- 开发：`npm run dev`
- 构建：`npm run build`
- 预览：`npm run preview`
部署到静态站点（如 GitHub Pages、Vercel、Netlify）。