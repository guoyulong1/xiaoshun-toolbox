import { useState } from 'react'
import PageHeader from '../components/ui/PageHeader'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'

// 地图数据类型
type MapCell = 0 | 1 | 2 | 3 | 4 // 0:空地 1:墙壁 2:门 3:家具 4:地毯
type MapData = MapCell[][]





// 解析上传的地图文件
const parseMapFile = (content: string): { data: MapData; width: number; height: number } | null => {
  try {
    const lines = content.trim().split('\n')
    if (lines.length === 0) return null
    
    // 支持两种格式：
    // 1. JSON格式：{"width": 400, "height": 400, "data": [[0,1,0...], ...]}
    // 2. 简单格式：每行为数字，用空格或逗号分隔
    
    if (content.trim().startsWith('{')) {
      // JSON格式
      const parsed = JSON.parse(content)
      if (parsed.data && parsed.width && parsed.height) {
        return {
          data: parsed.data,
          width: parsed.width,
          height: parsed.height
        }
      }
    } else {
      // 简单格式
      const data: MapData = []
      for (const line of lines) {
        if (line.trim()) {
          const row = line.split(/[,\s]+/).map(n => {
            const num = parseInt(n.trim())
            return isNaN(num) ? 0 : Math.max(0, Math.min(4, num)) as MapCell
          })
          if (row.length > 0) {
            data.push(row)
          }
        }
      }
      
      if (data.length > 0) {
        const height = data.length
        const width = Math.max(...data.map(row => row.length))
        
        // 标准化所有行的长度
        data.forEach(row => {
          while (row.length < width) {
            row.push(0)
          }
        })
        
        return { data, width, height }
      }
    }
  } catch (error) {
    console.error('解析地图文件失败:', error)
  }
  return null
}

export default function MapTool() {
  const [uploadedMap, setUploadedMap] = useState<{ data: MapData; width: number; height: number } | null>(null)
  const [showUploaded, setShowUploaded] = useState(false)
  const [mapText, setMapText] = useState('')
  const [parseError, setParseError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const currentMapData = showUploaded && uploadedMap ? uploadedMap.data 
    : []
  const currentSize = showUploaded && uploadedMap ? { width: uploadedMap.width, height: uploadedMap.height }
    : { width: 0, height: 0 }

  // 解析粘贴的地图文本
  const handleMapTextParse = () => {
    if (!mapText.trim()) {
      setParseError('请输入地图数据')
      return
    }

    setIsLoading(true)
    const parsed = parseMapFile(mapText)
    if (parsed) {
      setUploadedMap(parsed)
      setShowUploaded(true)
      setParseError('')
    } else {
      setParseError('地图数据格式不正确，请检查格式')
    }
    setIsLoading(false)
  }

  // 清空地图文本
  const clearMapText = () => {
    setMapText('')
    setParseError('')
    setShowUploaded(false)
  }

  return (
    <div className="space-y-8">
      <PageHeader 
        icon={<span>🏠</span>} 
        title="地图显示工具" 
        subtitle="大尺寸地图可视化展示，支持粘贴地图数据和自定义编辑" 
        accent="indigo" 
      />



      {/* 地图数据输入区域 */}
      <Card className="p-4" accent="indigo">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">粘贴地图数据</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              地图数据 (支持JSON格式或简单数字格式)
            </label>
            <textarea
              className="w-full h-32 rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-vertical font-mono text-sm"
              placeholder="粘贴地图数据...&#10;&#10;JSON格式示例:&#10;{&quot;width&quot;: 10, &quot;height&quot;: 8, &quot;data&quot;: [[1,1,1...], [1,0,0...], ...]}&#10;&#10;简单格式示例:&#10;1 1 1 1 1 1 1 1 1 1&#10;1 0 0 0 2 0 0 0 0 1&#10;1 0 3 0 0 0 3 4 0 1"
              value={mapText}
              onChange={(e) => setMapText(e.target.value)}
              disabled={isLoading}
            />
          </div>
          
          <div className="flex items-center gap-3">
            <Button 
              variant="primary" 
              size="sm" 
              onClick={handleMapTextParse} 
              disabled={isLoading || !mapText.trim()}
            >
              📊 解析并显示地图
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={clearMapText} 
              disabled={isLoading}
            >
              🗑️ 清空
            </Button>
          </div>

          {parseError && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
              <p className="text-sm text-red-800 dark:text-red-200">错误: {parseError}</p>
            </div>
          )}

          {showUploaded && uploadedMap && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
              <p className="text-sm text-green-800 dark:text-green-200">
                成功: 地图解析成功！尺寸: {uploadedMap.width} x {uploadedMap.height}
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* 图例 */}
      <Card className="p-4" accent="indigo">
        <h3 className="text-sm font-semibold mb-3 text-gray-900 dark:text-gray-100">图例说明</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded"></div>
            <span>空地</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-900 dark:bg-gray-700 rounded"></div>
            <span>墙壁 ⬛</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-400 dark:bg-yellow-600 rounded"></div>
            <span>门 🚪</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-400 dark:bg-blue-600 rounded"></div>
            <span>家具 🪑</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-purple-400 dark:bg-purple-600 rounded"></div>
            <span>地毯 🟣</span>
          </div>
        </div>
        
        {/* 数据格式说明 */}
        <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
          <h4 className="text-xs font-medium mb-2">支持的数据格式：</h4>
          <div className="text-xs text-gray-600 dark:text-gray-300 space-y-1">
            <div><strong>JSON格式：</strong> {"{"}"width": 400, "height": 400, "data": [[0,1,0...], ...]{"}"}</div>
            <div><strong>简单格式：</strong> 每行数字用空格或逗号分隔，0=空地 1=墙壁 2=门 3=家具 4=地毯</div>
          </div>
        </div>
      </Card>

      {/* 地图显示 - 暂时隐藏以优化性能 */}
      <Card className="p-6" accent="indigo">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            地图预览
          </h3>
          <div className="text-sm text-gray-600 dark:text-gray-300">
            尺寸: {currentSize.width} × {currentSize.height}
          </div>
        </div>
        
        {/* 性能优化提示 */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
          <div className="flex items-start gap-3">
            <div className="text-blue-500 text-xl">🚀</div>
            <div>
              <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-1">
                性能优化中
              </h4>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                为了提升应用性能，地图可视化功能正在优化中。您仍可以：
              </p>
              <ul className="text-sm text-blue-700 dark:text-blue-300 mt-2 space-y-1">
                <li>• 粘贴和解析地图数据</li>
                <li>• 下载地图样例文件</li>
                <li>• 创建自定义尺寸的地图</li>
                <li>• 查看地图统计信息</li>
              </ul>
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                💡 未来版本将支持PNG格式预览，敬请期待！
              </p>
            </div>
          </div>
        </div>

        {/* 地图统计信息 */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">地图统计</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {currentSize.width * currentSize.height}
              </div>
              <div className="text-gray-600 dark:text-gray-300">总单元格</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-700 dark:text-gray-300">
                {currentMapData.flat().filter(c => c === 1).length}
              </div>
              <div className="text-gray-600 dark:text-gray-300">墙壁 ⬛</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {currentMapData.flat().filter(c => c === 2).length}
              </div>
              <div className="text-gray-600 dark:text-gray-300">门 🚪</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {currentMapData.flat().filter(c => c === 3).length}
              </div>
              <div className="text-gray-600 dark:text-gray-300">家具 🪑</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {currentMapData.flat().filter(c => c === 4).length}
              </div>
              <div className="text-gray-600 dark:text-gray-300">地毯 🟣</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-400 dark:text-gray-500">
                {currentMapData.flat().filter(c => c === 0).length}
              </div>
              <div className="text-gray-600 dark:text-gray-300">空地 ⬜</div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}