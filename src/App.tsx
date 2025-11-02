import { NavLink, Outlet } from 'react-router-dom'
import { useEffect, useState } from 'react'

function Sidebar() {
  const [dark, setDark] = useState<boolean>(() => {
    // 初始化时就检查主题
    const saved = localStorage.getItem('theme')
    if (saved) {
      return saved === 'dark'
    }
    // 如果没有保存的主题，检查系统偏好
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
  })
  
  useEffect(() => {
    // 应用主题到DOM
    document.documentElement.classList.toggle('dark', dark)
  }, [dark])
  
  const toggleTheme = () => {
    const next = !dark
    setDark(next)
    localStorage.setItem('theme', next ? 'dark' : 'light')
  }
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
      isActive 
        ? 'bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 shadow-sm' 
        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-brand-700 dark:hover:text-brand-300'
    }`
  
  const navItems = [
    { to: '/', label: '概览', icon: '🏠', end: true },
    { to: '/time', label: '时间转换', icon: '🕒' },
    { to: '/base', label: '进制转换', icon: '🔢' },
    { to: '/encoding', label: '编码/解码', icon: '🔐' },
    { to: '/path', label: '路径规划', icon: '🗺️' },
    { to: '/robot', label: 'CRC 校验', icon: '🛡️' },
    { to: '/map', label: '地图显示', icon: '🏠' },
    { to: '/json', label: 'JSON 解析', icon: '🔍' }
  ]
  
  return (
    <aside className="bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col">
      {/* 头部 */}
      <div className="p-4 border-b border-gray-100 dark:border-gray-800">
        {/* 标题区域 */}
        <div className="flex items-center space-x-2 mb-3">
          <div className="w-8 h-8 bg-gradient-to-br from-brand-500 to-brand-600 rounded-lg flex items-center justify-center">
            <span className="text-white text-sm font-bold">DK</span>
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-base font-semibold text-gray-900 dark:text-gray-100 truncate">XiaoShun ToolBox</h1>
          </div>
        </div>
        {/* 主题切换按钮 */}
        <div className="flex justify-center">
          <button onClick={toggleTheme} className="px-3 py-1.5 rounded-lg text-sm font-medium bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 transition-colors">
            {dark ? '🌙 深色' : '☀️ 浅色'}
          </button>
        </div>
      </div>
      
      {/* 导航菜单 */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => (
          <NavLink 
            key={item.to}
            to={item.to} 
            className={linkClass} 
            end={item.end}
          >
            <span className="text-base mr-3">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>
      
      {/* 底部信息 */}
      <div className="p-4 border-t border-gray-100 dark:border-gray-800">
        <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
          v1.0.0 • 本地运行
        </div>
      </div>
    </aside>
  )
}

function Layout() {
  return (
    <div className="h-full bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 grid md:grid-cols-[280px_1fr] grid-cols-1 app-bg">
      <Sidebar />
      <main className="p-4 md:p-8 overflow-auto flex flex-col">
        <div className="flex-1">
          <Outlet />
        </div>
        <footer className="mt-8 pt-4 border-t border-gray-200 dark:border-gray-800">
          <div className="text-center text-sm text-gray-500 dark:text-gray-400">
            <p>© 2024 小顺工具箱 (XiaoShun Toolbox)</p>
            <p className="mt-1">Designed & Developed by <span className="font-medium text-brand-600 dark:text-brand-400">Eric(GuoYuLong)</span></p>
          </div>
        </footer>
      </main>
    </div>
  )
}

export default Layout
