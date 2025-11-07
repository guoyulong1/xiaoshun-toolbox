import { Link } from 'react-router-dom'
import PageHeader from '../components/ui/PageHeader'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'

export default function Home() {
  const tools = [
    {
      title: '时间转换',
      description: '毫秒/秒时间戳与人类可读格式互转，支持本地时间和UTC时间',
      icon: '🕒',
      path: '/time',
      accent: 'blue'
    },
    {
      title: '进制转换',
      description: '二进制、八进制、十进制、十六进制互转，支持大数和负数',
      icon: '🔢',
      path: '/base',
      accent: 'green'
    },
    {
      title: '编码/解码',
      description: 'Base64、URL编码解码，Gzip/Zlib压缩解压缩',
      icon: '🔐',
      path: '/encoding',
      accent: 'purple'
    },
    {
      title: '路径规划',
      description: '可视化网格路径规划，支持BFS、Dijkstra、A*、RRT、RRT* 等算法',
      icon: '🗺️',
      path: '/path',
      accent: 'orange'
    },
    {
      title: 'CRC 校验',
      description: 'CRC16/CRC32校验计算，十六进制数据查看器，数据完整性验证工具',
      icon: '🛡️',
      path: '/robot',
      accent: 'red'
    },
    {
      title: '地图显示',
      description: '可视化地图数据展示，支持自定义大小和家庭地图模拟，数据可视化工具',
      icon: '🏠',
      path: '/map',
      accent: 'indigo'
    },
    {
      title: 'JSON 解析',
      description: 'JSON格式化、验证和美化工具，支持语法高亮、错误检测和统计分析',
      icon: '🔍',
      path: '/json',
      accent: 'teal'
    },
    {
      title: 'YAML 转换',
      description: 'YAML与JSON、XML、CSV格式互转，支持实时转换、语法验证和数据统计',
      icon: '📄',
      path: '/yaml',
      accent: 'cyan'
    },
    {
      title: '代码格式化',
      description: '支持16+种编程语言的代码格式化，智能检测语言类型，多种格式化方案',
      icon: '🎨',
      path: '/formatter',
      accent: 'pink'
    }
    ,
    {
      title: '图表/流程图',
      description: 'PlantUML(puml) 转图片、Mermaid(graph TD) 本地渲染，左侧输入右侧预览',
      icon: '📊',
      path: '/diagram',
      accent: 'indigo'
    }
  ]

  return (
    <div className="min-h-screen flex flex-col">
      <div className="max-w-6xl mx-auto flex-1 flex flex-col justify-center py-8">
        {/* 统一页面头部 */}
        <div className="mb-12">
          <PageHeader
            icon={<span>🧰</span>}
            title="小顺工具箱"
            subtitle="为开发者打造的实用工具集合，提供时间转换、进制转换、编码解码、路径规划和机器人调试等功能"
            accent="blue"
          />
        </div>

        {/* 工具卡片网格 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6 mb-12">
          {tools.map((tool) => (
            <Link key={tool.path} to={tool.path} className="group">
              <Card variant="solid" accent={tool.accent as any} className="p-6 transition-all hover:-translate-y-0.5">
                <div className="text-3xl mb-4">{tool.icon}</div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  {tool.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                  {tool.description}
                </p>
                <div className="mt-5">
                  <Button size="sm" variant="secondary">开始使用</Button>
                </div>
              </Card>
            </Link>
          ))}
        </div>

        {/* 底部信息 */}
        <div className="text-center">
          <div className="inline-flex items-center px-4 py-2 bg-gray-50 dark:bg-gray-800 rounded-full text-sm text-gray-600 dark:text-gray-300">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
            所有工具均在本地运行，保护您的数据隐私
          </div>
        </div>
      </div>
    </div>
  )
}